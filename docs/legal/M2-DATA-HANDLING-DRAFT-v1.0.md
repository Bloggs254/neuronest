# NeuroNest inquiry data handling draft v1.0

Status: local review only, 26 November 2026. This records the implemented M2 test behavior and decisions required before real collection. It is not legal advice or approval to launch.

## Current local behavior

The public static bundle cannot submit an inquiry. The separate loopback server accepts synthetic test details only and uses a fake delivery adapter. It makes no email, WhatsApp or other external delivery. It stores the test fields, a unique request ID, state, attempts and timestamps in a local SQLite queue outside `dist/`. Server logs contain request ID and status only. Analytics are disabled.

## Draft customer notice

If real collection is approved later, the inquiry notice should name NeuroNest's legal operator and verified contact channel; state which name, business, reply contact, service, message, optional budget and timeline fields are collected; explain that the information is used to review and reply to the inquiry; identify the approved hosting and delivery processors and any international transfers; state the approved retention period; explain access, correction and erasure requests; and warn visitors not to submit passwords, payment details or sensitive records.

Consent for a reply must be specific and recorded. It does not by itself settle processor, security or international-transfer obligations. Marketing consent, if ever required, must be separate from a project inquiry.

## Draft retention schedule

- M2 synthetic records: retain only through owner review and evidence reconciliation, then delete the local SQLite files and scratch exports. The sanitized request-ID/status evidence may remain with the milestone report.
- Rejected validation and rate-limit events: do not store submitted content.
- Production inquiries: no period is approved. The owner must select and document an operational retention period before activation, including deletion from the queue, monitored inbox and backups.
- Backups: deletion timing must match the approved backup lifecycle and be explained accurately; immediate removal from immutable backups must not be promised if it cannot be performed.

## Draft access and erasure procedure

1. Receive the request through a verified privacy contact and record it without copying sensitive content into logs.
2. Verify the requester's identity proportionately using the reply channel already associated with the inquiry.
3. Locate records by request ID and the verified contact across the queue, delivery system and approved operational copies.
4. Provide, correct or delete the live records as approved; record the action and any lawful limitation.
5. Explain backup treatment and the date on which remaining backup copies expire.
6. Do not expose a public deletion endpoint in the first production phase.

## Processor and transfer decisions

The local implementation has no external processor or transfer. Before real collection, the owner must approve the hosting provider, delivery/inbox provider, their contractual data terms, storage regions, subprocessors, transfer safeguards, breach contacts and deletion capabilities. ODPC registration and any exemption analysis remain owner/legal-review decisions. No provider is approved by this draft.
