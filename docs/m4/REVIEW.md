# Milestone 4 foundation review

Date: 28 November 2026

Branch: `m4-vps-openduka-foundations`

Base / rollback checkpoint: `c8cd6a6`

## Outcome

The locally possible Milestone 4 foundations are prepared and tested. No provider account, server, domain, DNS, TLS certificate, external backup, live inquiry transport or OpenDuka service was accessed or changed.

## Implemented

- Fail-closed staging Compose and nginx templates with an invalid image digest, `example.invalid`, loopback-only port, internal network, read-only filesystem, least capabilities and no Docker socket.
- Inquiry and API routes return 503; OpenDuka returns 404; staging remains noindex.
- Staging, security, one-week observation, cutover and non-destructive rollback runbook.
- Local SQLite backup candidate using `VACUUM INTO`, SHA-256, integrity checks, required-table row counts, site-artifact copy and scratch-only restore.
- Restore refusal for checksum mismatch and non-empty destination.
- Four versioned, visibly unapproved data-protection drafts: inquiry notice, retention, access/erasure and processor/transfer assessment.
- Hosting/backup/TLS research and an explicit unverified-cost gate.
- Corrected `SECURITY.md` so it no longer advertises an unverified Gmail reporting channel.

## Tests

- Full automated suite: 76/76 passed.
- New M4 tests: fail-closed configuration, four draft gates, successful synthetic SQLite restore, corrupt/checksum refusal and non-empty overwrite refusal.
- All 72 prior M1–M3 tests remain passing.
- The public website output is unchanged apart from reproducible line-ending restoration; no new visual/browser regression was introduced.

## OpenDuka blocker

The controlling brief names OD-1, OD-2, OD-3 and OD-6 but does not define them. The OpenDuka source repository is not present in the website workspace. No mapping, container, catalogue endpoint, seed or feature was invented. This portion requires the authoritative OD definitions, approved source location and separate source review.

## Cost status

The brief's provisional USD 12 instance plus Vultr's documented 20% backup surcharge is USD 14.40 before tax, FX and separately required off-instance storage. Exact Johannesburg availability and owner checkout were not performed. The KES 2,000 cap is therefore not proven.

## Security and privacy

- No secret values or real contact details are present in the templates.
- No privileged container, host network, Docker socket, public bind or owner-machine route.
- HSTS is not claimed or activated before stable HTTPS.
- Provider backups are treated as supplemental, not proof of application restore.
- The local backup candidate explicitly states that it is not encrypted or off-instance.
- The four data-protection files are drafts and do not claim a lawful basis or approved retention period.

## Remaining blockers

- Provider plan availability, exact checkout/tax/FX and separate encrypted backup cost.
- Approved domain, DNS control, monitored security/contact inbox and live-work window.
- Approved encrypted off-instance destination and retention policy.
- OpenDuka source and authoritative OD-1/2/3/6 definitions.
- Processor/DPA/transfer and Kenyan data-protection decisions.
- Separate approval for any live inquiry test, provisioning, TLS, uptime monitoring, demo exposure or DNS cutover.

## Rollback

Nothing was deployed. Checkpoint `c8cd6a6` is the accepted pre-M4 state. After the M4 commit is recorded, use `git revert <M4-checkpoint>` on this branch for a non-destructive rollback.
