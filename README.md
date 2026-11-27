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

## Tuning

- `CLAUDE_MODEL`: the default is `claude-opus-5-5` at low effort. `claude-haiku-5-5` responds faster.
- `VAD_SILENCE_SECS`: how long a pause ends the caller's turn (default 0.8).
- `SYSTEM_PROMPT`, `GREETING`, `ELEVENLABS_VOICE_ID`.

## Docs

- [Market analysis](docs/market-analysis.md): Poland → CEE/EU, competitors, US lessons, unit economics, risks.
