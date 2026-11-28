# NeuroNest candidate corrections register

Controlling brief: master implementation brief v1.0. M1 accepted by owner and locally closed; fresh 59 automated tests and 86 browser checks pass. Lighthouse repeat 100/100/100/61 (first run 92/100/100/61), both preserved in m1-closure. M2 now authorized locally. Owner approved exact SVG icons plus plain-text name despite missing PNG lockups. These are candidate statuses, not Orion's register and not launch approval. No global item is marked closed.

| ID | Priority | Current evidence / status | Next authorized milestone |
|---|---|---|---|
| WC-01 | P0 | Local candidate implemented: durable SQLite states, idempotency, fake delivery and failure/retry evidence. Still open because no monitored real inbox or transport is approved. Static site remains no-send. | Owner verification, then separately approved live test |
| WC-02 | P0 | Blocked on owner evidence. Existing email, phone and WhatsApp are unverified; ownership/receipt/reply not tested. | Owner verification with separate approval |
| WC-03 | P1 | M4 local draft prepared: fail-closed nginx/container template, staging/cutover/rollback runbook and Pages fallback requirement. Still open: no provider, domain, DNS, TLS, uptime observation or live rollback evidence. | Owner gates and separately approved live work |
| WC-04 | P1 | Owner authorized the GitHub Pages overhaul launch. Production now has a tested 15-route sitemap, `Allow: /`, unique canonical metadata and indexable public pages; only the 404 is noindex. Live verification remains required after Pages deploys. | Verify live Pages response and indexing files |
| WC-05 | P1 | Local M3 candidate: Organization, Service and Article markup use only verified name, region, service and author facts. LocalBusiness and contact properties remain omitted. | Owner review; add facts only after verification |
| WC-06 | P2 | M1 SVG/ICO/touch/192/512/manifest retained. M3 adds a tested 1200×630 social preview generated from approved logo geometry and live lockup text. Supplied full PNG lockups remain unavailable. | Owner review |
| WC-07 | P2 | Licensed Latin WOFF2 and licenses are used by the M1 homepage and M2 shared pages. Hash/signature tests pass. | Candidate complete; retain regression checks |
| WC-08 | P2 | M1 null guards and motion behavior preserved. M2 actual browser checks report zero console/page errors across 30 route loads. | Candidate complete; ongoing regression |
| WC-09 | P2 | Verified inactive: no homepage external requests or browser storage; connect-src none. No provider activated. | Remains disabled |
| WC-10 | P1 | Local candidate implemented: server validation/limits, honeypot, moderation, body cap, rate limit, idempotency and fake failure alert. Still open for production hardening and live evidence. | Later production review; no activation |
| WC-11 | P1 | M4 adds versioned inquiry notice, retention, access/erasure and processor/transfer drafts. Still open pending owner/legal approval of lawful basis, periods, processors, transfers and monitored request channel. | Owner/legal decision before real collection |
