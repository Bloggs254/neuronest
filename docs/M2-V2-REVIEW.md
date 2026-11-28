# NeuroNest Milestone 2 review

Date: 2026-11-28

Branch: `milestone2-v2`

Base: live `main` at `2603644`

Deployment status: not deployed, pushed or merged

## Implemented

- Added Pricing and Guides to the homepage navigation.
- Confirmed and linked the Guides, How we work, Why NeuroNest and FAQ sections.
- Removed all obsolete `?service=` links and query handling.
- Replaced the unapproved founder biography with the exact company-only fallback `[TODO: approved About copy]`; no personal details are published.
- Added one private inquiry configuration file with disabled status and explicit verification TODOs.
- Added the short inquiry form in an honest, disabled GitHub Pages state: “Enquiries are not open yet.”
- Kept the existing Pages CSP unchanged: `connect-src 'none'` and `form-action 'none'`.
- Added a minimal VPS inquiry server with server-side validation, HTML rejection, trimming and length limits, per-IP rate limiting, a honeypot, a minimum-time check, private SQLite storage and sendmail-compatible notification delivery.
- Added endpoint tests for valid storage and notification, invalid input, rate limiting, honeypot rejection and disabled-state handling.
- Added and linked Privacy and Terms pages. The existing branded 404 page was retained.
- Verified the Website, AI assistants and Business systems service pages and removed obsolete service-query links from them.
- Left security contact information unpublished pending verification.
- Implemented the supplied CSS-only hero N sequence: stroke draw, node pop, amber drop and bounce, N jolt, repeating hop/travel, hover response and scroll hand-over to the sticky header.
- Preserved visible, still fallbacks for reduced motion, JavaScript-off, CSS-animation-off and browsers without scroll-timeline support.
- Changed notification delivery to read only `NOTIFY_EMAIL` from the VPS environment. The repository contains no real notification address.

## Logo animation evidence

- `docs/m2-v2-evidence/logo-animation/01-draw-in.png`
- `docs/m2-v2-evidence/logo-animation/02-node-pop.png`
- `docs/m2-v2-evidence/logo-animation/03-ball-drop.png`
- `docs/m2-v2-evidence/logo-animation/04-ball-bounce.png`
- `docs/m2-v2-evidence/logo-animation/05-hop-with-dot.png`
- `docs/m2-v2-evidence/logo-animation/06-hover.png`
- `docs/m2-v2-evidence/logo-animation/07-scroll-handover.png`
- `docs/m2-v2-evidence/logo-animation/08-reduced-motion.png`
- `docs/m2-v2-evidence/logo-animation/frame-states.json` records computed animation, transform and opacity states.

## Founder-copy blocker

`marketing/ws3b-founder-content.md` is not present. The homepage therefore uses `[TODO: approved About copy]` and nothing else in the About copy area.

## Automated results

- Node test suite: 83 passed, 0 failed.
- Chromium/Edge browser regression: 16 routes at 390, 768 and 1280 px, 48 route/viewport checks, 0 failures.
- JavaScript-off check at 390 px: passed; the page remains readable and the form remains disabled.
- Reduced-motion check at 390 px: passed; the media preference is detected and the page remains readable without overflow.
- CSS-animation-off check at 390 px: passed; the hero, nodes and travelling dot remain visible and still.
- Console and page errors: none in the Chromium run.
- Horizontal overflow: none in the Chromium run.
- Firefox: the installed Firefox build did not complete the Playwright automation within 90 seconds, so Firefox is not claimed as passed. No site failure was reported before the runner stalled.

Detailed machine-readable results: `docs/m2-v2-evidence/browser-results-chromium.json`.

## Screenshots

- `docs/m2-v2-evidence/home-phone-390.png`
- `docs/m2-v2-evidence/home-tablet-768.png`
- `docs/m2-v2-evidence/home-desktop-1280.png`

## Outstanding TODO markers

- `[TODO: VPS inquiry endpoint URL]`
- `[TODO: verified notification email]`
- `[TODO: verified phone]`
- `[TODO: verified email]`
- `[TODO: approved About copy]`
- `[TODO: approved wording]` on the privacy and terms pages
- `[TODO: verified security reporting channel]`

## Safety and privacy

- Public inquiry delivery remains disabled.
- No real customer message was sent.
- No unverified contact address or phone number was published.
- Inquiry records are stored outside the public site directory.
- Message bodies are not written to server logs.
- Retention is not invented; it remains an explicit owner/legal decision.
- The live site, `main`, Hermes, Mission Control and unrelated systems were not changed.

## Rollback

The work is isolated in the `milestone2-v2` worktree and branch. The live site remains at `2603644`. To discard this review safely, remove the worktree from the parent repository and delete the local branch only after confirming no review changes are needed.
