# Milestone 3 review

Date: 28 November 2026

Branch: `m3-seo-content`

Base / rollback checkpoint: `894e2b5`

## Outcome

Milestone 3 is implemented locally and remains unpublished. The approved M2 design, prices, service positioning and OpenDuka presentation are preserved. The original `main` worktree was not modified.

## Implemented

- Unique title, description, canonical, Open Graph and Twitter metadata for all 22 HTML routes.
- A 1200×630, 47,220-byte social preview using the approved N geometry and live NeuroNest name.
- A 15-route sitemap covering the currently approved public pages.
- Staging `robots.txt` with `Disallow: /`; every page also retains `noindex, nofollow`.
- Verified-fact-only Organization markup on the homepage and Service markup on five service pages. No LocalBusiness, phone or email properties were invented.
- A branded, responsive 404 page and correct 404 response from the local preview server.
- Five practical guide drafts of 742–881 words plus a draft index. Each is visibly marked unapproved and excluded from the homepage, sitemap and indexing.
- Reproducible generators for the metadata/content package and social preview.

## Editorial blocker

No Nora-reviewed guide source files were found in the supplied material or repository. The five guide pages are therefore independent local drafts, not publishable copy. They require independent editorial review and owner approval before any link, sitemap inclusion or indexing change. Their author is truthfully shown as NeuroNest; Joe was not named as author without approval.

## Verification

- Automated: 72/72 pass. See `automated-tests.txt`.
- Browser: 318/318 pass across 88 route loads at 390 px and 1280 px, under both `/` and `/neuronest/` hosting shapes.
- Browser checks include one H1, horizontal overflow, primary tap targets, mobile menu/Escape, no-JavaScript guide readability, 404 handling, staging robots, sitemap membership, console/page errors and external requests.
- Browser result: zero console/page errors and zero external requests. See `browser-results.json`.
- Lighthouse protected staging: 99 performance, 100 accessibility, 100 best practices, 61 SEO. The SEO limitation is expected because indexing is deliberately blocked.
- Lighthouse readiness simulation: homepage 100/100/100/92 and guide 99/100/100/92. The missing eight SEO points are solely Lighthouse's inability to download local `robots.txt`; both local endpoints returned 200 and the static robots test passed.
- Social image: 1200×630, PNG, 47,220 bytes, SHA-256 `657F3FE0EAEA646C92DA0BEAC839FA9E19E5FC93EF2163891D85AA4B8B17977A`.

## Security and privacy

- Existing restrictive CSP, no-referrer policy, no external requests and form-action restrictions remain intact.
- Contact channels remain disabled and absent from static output.
- `security.txt` is intentionally omitted because no monitored security contact has been verified.
- Guide examples are labelled and contain no claimed customer results or private data.
- The SEO readiness server changes no files; it removes noindex only in memory for local measurement.

## Limitations and deviations

- Guide copy cannot be accepted or published until editorial review is supplied.
- Production robots/indexing behaviour was not activated.
- Lighthouse local robots retrieval failed during the readiness audit despite direct HTTP 200 responses; the audit and the passing static validation are both preserved.
- No full supplied PNG wordmark lockup was available; the approved SVG geometry and live text lockup were used.
- No verified security email exists, so `security.txt` was not created.

## Rollback

No deployment, push or merge occurred. To review the accepted pre-M3 state, use checkpoint `894e2b5`. On this branch after the M3 checkpoint is recorded, `git revert <M3-checkpoint>` provides a non-destructive rollback.
