# Phone voice agent (Twilio + ElevenLabs + Claude)

Built from the ElevenLabs guide at https://elevenlabs.io/blog/build-voice-agent-twilio-elevenlabs.

```
caller ──PSTN──▶ Twilio ──POST /incoming-call──▶ server (returns TwiML <Connect><Stream>)
                 Twilio ◀══ wss /media (mu-law 8 kHz) ══▶ server
                                                       ├─▶ ElevenLabs Scribe v2 Realtime (STT, VAD turn-taking)
                                                       ├─▶ Claude (streamed reply)
                                                       └─▶ ElevenLabs Flash v2.5 (TTS, ulaw_8000) ─▶ back to Twilio
```

Features: sentence-by-sentence TTS while Claude is still writing, barge-in (talking over the
agent stops it and clears Twilio's audio buffer), a greeting, and Twilio webhook signature checks.

## Run

1. `cp .env.example .env` and fill in `ELEVENLABS_API_KEY`, `ANTHROPIC_API_KEY`, `TWILIO_AUTH_TOKEN`.
2. `npm install`
3. In one terminal: `ngrok http 8080`. Copy the host (no `https://`) into `PUBLIC_HOST` in `.env`.
4. In another terminal: `npm run dev`
5. Twilio Console → Phone Numbers → your number → Voice configuration → "A call comes in":
   Webhook `https://<PUBLIC_HOST>/incoming-call`, HTTP POST. Save, then call the number.

Node lives in `~/.local/node/bin`. Add `export PATH="$HOME/.local/node/bin:$PATH"` to `~/.zshrc`.

## Local testing (no Twilio)

Both tools below act as a fake Twilio client on `/media`, so the real pipeline runs: STT, VAD
turn-taking, Claude, TTS, marks, and barge-in. Only `ELEVENLABS_API_KEY` and `ANTHROPIC_API_KEY`
are needed. `PUBLIC_HOST`, `TWILIO_AUTH_TOKEN`, and ngrok are not.

**Talk to it live:** run `npm run dev` and open <http://localhost:8080/local> in Chrome. Click
*Start call* and allow the mic. The page plays the greeting, and you can talk over the agent to
test barge-in. Transcripts (`caller:` / `agent:`) appear in the server terminal. If the agent
keeps interrupting itself because it hears its own voice through your speakers, use headphones
or tick *Mute mic while the agent is speaking*. That option turns off barge-in.

**Scripted end-to-end test:** `npm run test:call`. This starts the server on a free port and
synthesizes the caller's lines with ElevenLabs TTS. It streams those lines in real time, waits
for each reply, and prints the reply length and latency for each turn. It exits 1 if the greeting
or any reply is missing. It also saves `recordings/call-<time>.wav`, with the user on the left
channel and the agent on the right (`afplay recordings/call-*.wav`).

```
npm run test:call -- "Hello, who am I talking to?" "Okay, bye!"   # your own lines
npm run test:call -- --url ws://localhost:8080/media             # use a server that's already running
```

Every test call costs real API credits. While ngrok is running, anyone with the URL can reach
`/local` and `/media`.

## Tuning

- `CLAUDE_MODEL`: the default is `claude-opus-5-5` at low effort. `claude-haiku-5-5` responds faster.
- `VAD_SILENCE_SECS`: how long a pause ends the caller's turn (default 0.8).
- `SYSTEM_PROMPT`, `GREETING`, `ELEVENLABS_VOICE_ID`.

## Docs

- [Market analysis](docs/market-analysis.md): Poland → CEE/EU, competitors, US lessons, unit economics, risks.
