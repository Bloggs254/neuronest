# Milestone 4 deployment foundation — draft only

This directory is intentionally non-deployable. It does not authorize or perform provisioning, checkout, DNS, TLS issuance, inquiry delivery or OpenDuka exposure.

Safeguards:

- `example.invalid` prevents accidental domain use.
- The placeholder image digest must be replaced with a verified immutable digest.
- The only published port is loopback-only.
- The Docker network is internal; no privileged mode, host secrets or Docker socket is used.
- Inquiry, API and OpenDuka routes fail closed.
- Staging remains noindex.

Owner approval is required after provider checkout, domain, encrypted off-instance backup destination, monitored inbox and OpenDuka source/OD definitions are verified. Follow `docs/m4/RUNBOOK.md`; do not run this template against a public host.

Run `npm run m4:readiness` for the current local gate report. The expected state is `blocked`; do not change a gate merely to make the report say `ready`. Each true value must correspond to a recorded owner approval or verified external fact listed in `docs/m4/OWNER-CHECKLIST.md`.
