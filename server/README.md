# NeuroNest inquiry endpoint

`POST /api/inquiry` is the future VPS endpoint. It is disabled by default in `config/inquiry.json`, and the GitHub Pages site does not call it.

## Activation prerequisites

1. Replace the `[TODO]` values in `config/inquiry.json` only after Joe verifies the channel.
2. Set `NOTIFY_EMAIL` on the VPS to the verified notification address. Never commit the real address; `.env.example` contains the only repository placeholder.
3. Configure a sendmail-compatible mail transfer agent, or set `NEURONEST_SENDMAIL_PATH`.
4. Set `enabled` to `true` only on the VPS after privacy, delivery, monitoring and rollback checks.
5. Put the service behind the approved HTTPS reverse proxy. Do not expose the SQLite file or `.inquiry-data` directory.

The endpoint validates and length-limits every field, rejects angle brackets/HTML, checks a honeypot and minimum completion time, rate-limits per IP, stores records in SQLite and logs only status plus inquiry IDs. Message bodies and contact details are never logged.

Run locally with `npm run inquiry:server`. Tests use an in-memory notification adapter and never send email.
