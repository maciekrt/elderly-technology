/**
 * Phone voice agent: Twilio Media Streams <-> ElevenLabs Scribe v2 Realtime (STT)
 * -> Claude (streamed) -> ElevenLabs Flash v2.5 (TTS) -> back to the caller.
 *
 * Based on https://elevenlabs.io/blog/build-voice-agent-twilio-elevenlabs
 * Audio is mu-law 8 kHz end to end, so no transcoding is needed.
 */
import http from "node:http";
import express from "express";
import twilio from "twilio";
import { WebSocket, WebSocketServer } from "ws";
import Anthropic from "@anthropic-ai/sdk";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// ---------- config ----------
const PORT = Number(process.env.PORT ?? 8080);
// e.g. abcd-1234.ngrok-free.app. A pasted "https://…/" is tolerated and stripped.
const PUBLIC_HOST = required("PUBLIC_HOST")
  .trim()
  .replace(/^[a-z]+:\/\//i, "")
  .replace(/\/+$/, "");
const ELEVENLABS_API_KEY = required("ELEVENLABS_API_KEY");
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN; // if unset, signature check is skipped
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb"; // "George"
const CLAUDE_MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
const GREETING = process.env.GREETING ?? "Hi! How can I help you today?";
const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ??
  "You are a friendly, concise phone assistant. Keep replies to one or two short sentences. " +
    "Your words are spoken aloud: no markdown, lists, emoji, or URLs.";

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var ${name} (see .env.example)`);
    process.exit(1);
  }
  return v;
}

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY (or an `ant auth login` profile)
const eleven = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

// ---------- HTTP: Twilio voice webhook ----------
const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => {
  res.send("Voice agent is running. Point your Twilio number at POST /incoming-call.");
});

app.post("/incoming-call", (req, res) => {
  if (TWILIO_AUTH_TOKEN) {
    const signature = req.header("X-Twilio-Signature") ?? "";
    const url = `https://${PUBLIC_HOST}/incoming-call`;
    if (!twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, req.body ?? {})) {
      console.warn("Rejected /incoming-call: bad Twilio signature");
      res.status(403).send("Forbidden");
      return;
    }
  }
  console.log(`Incoming call from ${req.body?.From ?? "unknown"}`);
  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${PUBLIC_HOST}/media" />
  </Connect>
</Response>`,
  );
});

const server = http.createServer(app);

// ---------- per-call state ----------
interface Call {
  twilio: WebSocket;
  streamSid: string;
  stt?: WebSocket;
  sttQueue: string[]; // audio buffered until STT socket is open
  history: Anthropic.MessageParam[];
  turnId: number; // bumped on every new turn / barge-in; stale work checks it and stops
  abort?: AbortController; // aborts the in-flight LLM + TTS requests
  generating: boolean; // LLM/TTS still producing audio for the current turn
  pendingMarks: number; // audio chunks sent to Twilio but not yet played
  markSeq: number;
}

const isAgentSpeaking = (c: Call) => c.generating || c.pendingMarks > 0;

// ---------- WebSocket: Twilio Media Stream ----------
const wss = new WebSocketServer({ server, path: "/media" });

wss.on("connection", (ws) => {
  const call: Call = {
    twilio: ws,
    streamSid: "",
    sttQueue: [],
    history: [],
    turnId: 0,
    generating: false,
    pendingMarks: 0,
    markSeq: 0,
  };

  ws.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    switch (msg.event) {
      case "start":
        call.streamSid = msg.start.streamSid;
        console.log(`[${call.streamSid}] stream started (call ${msg.start.callSid})`);
        startStt(call);
        void greet(call);
        break;
      case "media":
        if (msg.media.track === undefined || msg.media.track === "inbound") {
          forwardToStt(call, msg.media.payload); // already base64 mu-law 8k
        }
        break;
      case "mark":
        call.pendingMarks = Math.max(0, call.pendingMarks - 1);
        break;
      case "stop":
        console.log(`[${call.streamSid}] stream stopped`);
        teardown(call);
        break;
    }
  });

  ws.on("close", () => teardown(call));
  ws.on("error", (err) => console.error("Twilio WS error:", err));
});

function teardown(call: Call) {
  call.turnId++;
  call.abort?.abort();
  if (call.stt && call.stt.readyState <= WebSocket.OPEN) call.stt.close();
  if (call.twilio.readyState === WebSocket.OPEN) call.twilio.close();
}

// ---------- STT: ElevenLabs Scribe v2 Realtime ----------
function startStt(call: Call) {
  const params = new URLSearchParams({
    model_id: "scribe_v2_realtime",
    audio_format: "ulaw_8000",
    commit_strategy: "vad", // server finalizes a turn after a pause
    vad_silence_threshold_secs: process.env.VAD_SILENCE_SECS ?? "0.8",
  });
  const stt = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`, {
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
  });
  call.stt = stt;

  stt.on("open", () => {
    for (const chunk of call.sttQueue) sendAudio(stt, chunk);
    call.sttQueue = [];
  });

  stt.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    switch (msg.message_type) {
      case "session_started":
        console.log(`[${call.streamSid}] STT session ${msg.session_id}`);
        break;
      case "partial_transcript":
        // Caller started talking over the agent -> barge-in.
        if (msg.text?.trim() && isAgentSpeaking(call)) interrupt(call);
        break;
      case "committed_transcript": {
        const text = msg.text?.trim();
        if (text) void handleTurn(call, text);
        break;
      }
      default:
        if (msg.error) console.error(`[${call.streamSid}] STT ${msg.message_type}: ${msg.error}`);
        else if (msg.warning) console.warn(`[${call.streamSid}] STT warning: ${msg.warning}`);
    }
  });

  stt.on("error", (err) => console.error(`[${call.streamSid}] STT socket error:`, err.message));
  stt.on("close", (code, reason) => {
    console.log(`[${call.streamSid}] STT closed (${code}) ${reason.toString()}`);
  });
}

function forwardToStt(call: Call, payloadB64: string) {
  const stt = call.stt;
  if (stt?.readyState === WebSocket.OPEN) sendAudio(stt, payloadB64);
  else if (stt?.readyState === WebSocket.CONNECTING) call.sttQueue.push(payloadB64);
}

function sendAudio(stt: WebSocket, payloadB64: string) {
  stt.send(
    JSON.stringify({
      message_type: "input_audio_chunk",
      audio_base_64: payloadB64,
      commit: false,
      sample_rate: 8000,
    }),
  );
}

// ---------- conversation turn ----------
async function greet(call: Call) {
  const turn = beginTurn(call);
  call.history.push({ role: "user", content: "(The phone call has just connected.)" });
  call.history.push({ role: "assistant", content: GREETING });
  try {
    await speak(call, turn, GREETING);
  } finally {
    endTurn(call, turn);
  }
}

async function handleTurn(call: Call, userText: string) {
  console.log(`[${call.streamSid}] caller: ${userText}`);
  if (isAgentSpeaking(call)) interrupt(call);
  const turn = beginTurn(call);
  call.history.push({ role: "user", content: userText });

  let spoken = ""; // what we actually got to say (kept even if interrupted)
  try {
    // Speak sentence-by-sentence as soon as each one is complete. Sentences go through a
    // promise chain so TTS for sentence N+1 can't overtake sentence N.
    let ttsChain = Promise.resolve();
    const enqueue = (sentence: string) => {
      spoken += (spoken ? " " : "") + sentence;
      ttsChain = ttsChain.then(() => speak(call, turn, sentence));
    };

    let buf = "";
    for await (const delta of llmReply(call, turn)) {
      buf += delta;
      let m: RegExpMatchArray | null;
      while ((m = buf.match(/^(.+?[.!?…])(\s+|$)/s)) && m[0].length < buf.length) {
        enqueue(m[1].trim());
        buf = buf.slice(m[0].length);
      }
    }
    if (buf.trim() && turn === call.turnId) enqueue(buf.trim());
    await ttsChain;
  } catch (err: any) {
    if (err?.name !== "AbortError" && !(err instanceof Anthropic.APIUserAbortError)) {
      console.error(`[${call.streamSid}] turn failed:`, err);
      if (turn === call.turnId) await speak(call, turn, "Sorry, I had a problem there. Could you say that again?").catch(() => {});
    }
  } finally {
    // Keep history well-formed (user/assistant alternation) even after a barge-in.
    call.history.push({ role: "assistant", content: spoken || "…" });
    if (spoken) console.log(`[${call.streamSid}] agent: ${spoken}`);
    endTurn(call, turn);
  }
}

function beginTurn(call: Call): number {
  call.turnId++;
  call.abort = new AbortController();
  call.generating = true;
  return call.turnId;
}

function endTurn(call: Call, turn: number) {
  if (turn === call.turnId) call.generating = false;
}

/** Barge-in: stop generating and flush audio Twilio has buffered for playback. */
function interrupt(call: Call) {
  console.log(`[${call.streamSid}] barge-in`);
  call.turnId++;
  call.abort?.abort();
  call.generating = false;
  call.pendingMarks = 0; // Twilio returns outstanding marks on clear; we just reset.
  if (call.twilio.readyState === WebSocket.OPEN) {
    call.twilio.send(JSON.stringify({ event: "clear", streamSid: call.streamSid }));
  }
}

// ---------- LLM: Claude, streamed ----------
async function* llmReply(call: Call, turn: number): AsyncGenerator<string> {
  const useFallbacks = !CLAUDE_MODEL.startsWith("claude-haiku");
  const stream = anthropic.beta.messages.stream(
    {
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: call.history,
      // Phone latency matters more than deep reasoning here.
      output_config: { effort: "low" },
      ...(useFallbacks
        ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
        : {}),
    },
    { signal: call.abort!.signal },
  );

  for await (const event of stream) {
    if (turn !== call.turnId) {
      stream.abort();
      return;
    }
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield " Sorry, I can't help with that one.";
  }
}

// ---------- TTS: ElevenLabs Flash v2.5 -> Twilio ----------
async function speak(call: Call, turn: number, text: string) {
  if (turn !== call.turnId || !text) return;
  const audio = await eleven.textToSpeech.stream(
    VOICE_ID,
    { text, modelId: "eleven_flash_v2_5", outputFormat: "ulaw_8000" },
    { abortSignal: call.abort?.signal },
  );
  for await (const chunk of audio as unknown as AsyncIterable<Uint8Array>) {
    if (turn !== call.turnId || call.twilio.readyState !== WebSocket.OPEN) return;
    call.twilio.send(
      JSON.stringify({
        event: "media",
        streamSid: call.streamSid,
        media: { payload: Buffer.from(chunk).toString("base64") },
      }),
    );
  }
  // Twilio echoes a mark once the audio before it has actually been played to the caller,
  // which tells us when the agent has really stopped talking.
  if (turn === call.turnId && call.twilio.readyState === WebSocket.OPEN) {
    call.pendingMarks++;
    call.twilio.send(
      JSON.stringify({ event: "mark", streamSid: call.streamSid, mark: { name: `m${++call.markSeq}` } }),
    );
  }
}

server.listen(PORT, () => {
  console.log(`Listening on :${PORT}`);
  console.log(`Twilio webhook: https://${PUBLIC_HOST}/incoming-call (HTTP POST)`);
  console.log(`LLM: ${CLAUDE_MODEL}`);
});
