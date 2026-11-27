/**
 * Scripted end-to-end test of the voice agent with no Twilio and no microphone.
 *
 * Pretends to be Twilio on the server's /media WebSocket: it streams μ-law 8 kHz audio in real
 * time (user lines synthesized with ElevenLabs TTS, silence in between), plays back the agent's
 * audio on a simulated clock, echoes marks / handles `clear` like Twilio, and records the call.
 *
 *   npm run test:call                                  # spawns the server, default script
 *   npm run test:call -- "Hello there" "Bye now"       # your own user lines
 *   npm run test:call -- --url ws://localhost:8080/media   # use an already-running server
 *
 * Writes recordings/call-<timestamp>.wav (left = user, right = agent). Exits 1 on failure.
 */
import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { WebSocket } from "ws";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const RATE = 8000;
const FRAME = 160; // 20 ms of μ-law 8 kHz, what Twilio sends
const IDLE_SECS = 2.0; // agent counts as done after this much quiet with no marks outstanding
const REPLY_TIMEOUT_MS = 20_000;
const TURN_TIMEOUT_MS = 90_000;
const USER_VOICE_ID = process.env.TEST_USER_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL"; // "Sarah"
const DEFAULT_LINES = ["Hi! Can you tell me one fun fact about Warsaw?", "Thank you, goodbye!"];

// ---------- args ----------
const argv = process.argv.slice(2);
let url: string | undefined;
const lines: string[] = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--url") url = argv[++i];
  else lines.push(argv[i]);
}
if (!lines.length) lines.push(...DEFAULT_LINES);

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("Missing ELEVENLABS_API_KEY (see .env.example)");
  process.exit(1);
}
const eleven = new ElevenLabsClient({ apiKey });

// ---------- audio helpers ----------
function ulawToLinear(u: number): number {
  u = ~u & 0xff;
  const sign = u & 0x80;
  const exponent = (u >> 4) & 0x07;
  const mantissa = u & 0x0f;
  const s = (((mantissa << 3) + 0x84) << exponent) - 0x84;
  return sign ? -s : s;
}

/** A mono 16-bit track that grows as audio is written at arbitrary sample offsets. */
class Track {
  data = new Int16Array(RATE * 30);
  length = 0;
  write(at: number, ulaw: Uint8Array) {
    const end = at + ulaw.length;
    if (end > this.data.length) {
      const bigger = new Int16Array(Math.max(end, this.data.length * 2));
      bigger.set(this.data);
      this.data = bigger;
    }
    for (let i = 0; i < ulaw.length; i++) this.data[at + i] = ulawToLinear(ulaw[i]);
    this.length = Math.max(this.length, end);
  }
  /** Drop audio at/after `at` (it was cleared before being played). */
  truncate(at: number) {
    if (at >= this.length) return;
    this.data.fill(0, at, this.length);
    this.length = at;
  }
}

function writeStereoWav(file: string, left: Track, right: Track) {
  const n = Math.max(left.length, right.length);
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(2, 22); // channels
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28); // byte rate
  buf.writeUInt16LE(4, 32); // block align
  buf.writeUInt16LE(16, 34); // bits per sample
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(i < left.length ? left.data[i] : 0, 44 + i * 4);
    buf.writeInt16LE(i < right.length ? right.data[i] : 0, 46 + i * 4);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

async function synthesize(text: string): Promise<Uint8Array> {
  const stream = await eleven.textToSpeech.convert(USER_VOICE_ID, {
    text,
    modelId: "eleven_flash_v2_5",
    outputFormat: "ulaw_8000",
  });
  const parts: Uint8Array[] = [];
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) parts.push(chunk);
  return Buffer.concat(parts);
}

// ---------- server (spawned unless --url is given) ----------
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once("error", reject);
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
  });
}

async function startServer(): Promise<{ child: ChildProcess; url: string }> {
  const port = await freePort();
  const child = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("server did not start within 20 s")), 20_000);
    const onLine = (line: string) => {
      console.log(`  [server] ${line}`);
      if (line.startsWith("Listening on")) {
        clearTimeout(timer);
        resolve();
      }
    };
    readline.createInterface({ input: child.stdout! }).on("line", onLine);
    readline.createInterface({ input: child.stderr! }).on("line", onLine);
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`server exited early (code ${code})`));
    });
  });
  return { child, url: `ws://localhost:${port}/media` };
}

// ---------- fake Twilio call ----------
interface Turn {
  label: string;
  userText?: string;
  userEnd: number; // sample at which the user finished speaking
  firstAgent?: number; // sample at which the first agent audio arrived
  agentSamples: number;
}

async function runCall(wsUrl: string): Promise<{ turns: Turn[]; user: Track; agent: Track; failure?: string }> {
  const ws = new WebSocket(wsUrl);
  await new Promise<void>((resolve, reject) => {
    ws.once("open", () => resolve());
    ws.once("error", reject);
  });

  const streamSid = `MZtest-${Date.now()}`;
  const send = (msg: object) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(msg));
  const user = new Track();
  const agent = new Track();
  const silence = new Uint8Array(FRAME).fill(0xff);
  let userQueue: Uint8Array = new Uint8Array(0);
  let framesSent = 0;
  let playEnd = 0; // sample where the agent's buffered audio finishes playing
  let marks: { name: string; at: number }[] = [];
  const now = () => framesSent * FRAME;
  const turns: Turn[] = [{ label: "greeting", userEnd: 0, agentSamples: 0 }];
  let current = turns[0];

  ws.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg.event === "media") {
      const bytes = Buffer.from(msg.media.payload, "base64");
      const at = Math.max(now(), playEnd);
      agent.write(at, bytes);
      playEnd = at + bytes.length;
      current.firstAgent ??= now();
      current.agentSamples += bytes.length;
    } else if (msg.event === "mark") {
      marks.push({ name: msg.mark.name, at: Math.max(now(), playEnd) });
    } else if (msg.event === "clear") {
      console.log(`  [client] clear received at ${(now() / RATE).toFixed(2)} s (barge-in)`);
      agent.truncate(now());
      playEnd = now();
      for (const m of marks) send({ event: "mark", streamSid, mark: { name: m.name } });
      marks = [];
    }
  });

  send({ event: "connected", protocol: "Call", version: "1.0.0" });
  send({
    event: "start",
    sequenceNumber: "1",
    start: {
      streamSid,
      callSid: `CAtest-${Date.now()}`,
      accountSid: "ACTEST",
      tracks: ["inbound"],
      customParameters: {},
      mediaFormat: { encoding: "audio/x-mulaw", sampleRate: RATE, channels: 1 },
    },
    streamSid,
  });

  // Real-time clock: send however many 20 ms frames are due, like Twilio does.
  const t0 = performance.now();
  const clock = setInterval(() => {
    const due = Math.floor((performance.now() - t0) / 20);
    while (framesSent < due) {
      let frame = silence;
      if (userQueue.length) {
        frame = new Uint8Array(FRAME).fill(0xff);
        frame.set(userQueue.subarray(0, FRAME));
        userQueue = userQueue.subarray(FRAME);
      }
      user.write(now(), frame);
      framesSent++;
      send({
        event: "media",
        streamSid,
        media: {
          track: "inbound",
          chunk: String(framesSent),
          timestamp: String(framesSent * 20),
          payload: Buffer.from(frame).toString("base64"),
        },
      });
    }
    while (marks.length && marks[0].at <= now()) {
      send({ event: "mark", streamSid, mark: { name: marks.shift()!.name } });
    }
  }, 20);

  const waitFor = (what: string, cond: () => boolean, timeoutMs: number) =>
    new Promise<void>((resolve, reject) => {
      const start = Date.now();
      const poll = setInterval(() => {
        if (cond()) {
          clearInterval(poll);
          resolve();
        } else if (ws.readyState !== WebSocket.OPEN) {
          clearInterval(poll);
          reject(new Error(`connection closed while waiting for ${what}`));
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(poll);
          reject(new Error(`timed out after ${timeoutMs / 1000} s waiting for ${what}`));
        }
      }, 20);
    });
  const agentIdle = () => !marks.length && now() > playEnd + IDLE_SECS * RATE;

  let failure: string | undefined;
  try {
    await waitFor("greeting audio", () => current.firstAgent !== undefined, REPLY_TIMEOUT_MS);
    await waitFor("greeting to finish", agentIdle, TURN_TIMEOUT_MS);

    for (const [i, text] of lines.entries()) {
      console.log(`  [client] user says: ${text}`);
      const audio = await synthesize(text);
      const turn: Turn = { label: `turn ${i + 1}`, userText: text, userEnd: 0, agentSamples: 0 };
      userQueue = audio;
      turns.push(turn);
      current = turn;
      await waitFor("user audio to be sent", () => userQueue.length === 0, TURN_TIMEOUT_MS);
      turn.userEnd = now();
      await waitFor(`reply to "${text}"`, () => turn.firstAgent !== undefined, REPLY_TIMEOUT_MS);
      await waitFor(`reply to "${text}" to finish`, agentIdle, TURN_TIMEOUT_MS);
    }
  } catch (err: any) {
    failure = err.message;
  }

  clearInterval(clock);
  send({ event: "stop", streamSid, stop: { callSid: "test" } });
  ws.close();
  return { turns, user, agent, failure };
}

// ---------- main ----------
let server: ChildProcess | undefined;
const killServer = () => server?.kill("SIGTERM");
process.on("SIGINT", () => {
  killServer();
  process.exit(130);
});

let exitCode = 0;
try {
  let wsUrl = url;
  if (!wsUrl) {
    console.log("Starting server…");
    const started = await startServer();
    server = started.child;
    wsUrl = started.url;
  }
  console.log(`Calling ${wsUrl}`);
  const { turns, user, agent, failure } = await runCall(wsUrl);
  // Give the server a moment to log the last transcript lines.
  await new Promise((r) => setTimeout(r, 500));

  const file = path.join(ROOT, "recordings", `call-${new Date().toISOString().replace(/[:.]/g, "-")}.wav`);
  writeStereoWav(file, user, agent);

  const problems: string[] = [];
  console.log("\nTurn       Agent audio   Latency*   User said");
  for (const t of turns) {
    const secs = t.agentSamples / RATE;
    const latency = t.userText && t.firstAgent !== undefined ? `${((t.firstAgent - t.userEnd) / RATE).toFixed(2)} s` : "-";
    console.log(`${t.label.padEnd(10)} ${`${secs.toFixed(2)} s`.padStart(11)}   ${latency.padStart(8)}   ${t.userText ?? ""}`);
    const min = t.userText ? 0.3 : 0.5;
    if (secs < min) problems.push(`${t.label}: only ${secs.toFixed(2)} s of agent audio (expected ≥ ${min} s)`);
  }
  console.log("* from end of user audio to first agent audio; includes the VAD silence window.");
  console.log(`\nRecording (left = user, right = agent): ${path.relative(process.cwd(), file)}`);

  if (failure) problems.unshift(failure);
  if (turns.length < lines.length + 1) problems.push(`only ${turns.length - 1} of ${lines.length} user turns ran`);
  if (problems.length) {
    exitCode = 1;
    console.error(`\nFAIL\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  } else {
    console.log("\nPASS");
  }
} catch (err: any) {
  exitCode = 1;
  console.error(`\nFAIL: ${err.message}`);
} finally {
  killServer();
}
process.exit(exitCode);
