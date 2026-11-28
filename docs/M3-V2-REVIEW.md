# NeuroNest Milestone 3 review

Status: complete locally on `milestone3-v2`; awaiting owner approval. Nothing was pushed, merged or deployed.

## Implemented

- Header amber node: two-bounce load drop, one-bounce hover response, scroll catch hand-over and still reduced-motion fallback.
- SEO generated from `config/site.json`: canonicals, Open Graph, Twitter cards, robots, sitemap and restricted Organization/Service JSON-LD.
- Brand-only social preview, favicon, 180/192/512 PNG icons and web manifest.
- Self-hosted Latin WOFF2 fonts with `font-display: swap`, above-fold preload and retained OFL files.
- Guides index and five clean guide routes. Each unfinished guide contains only `[TODO: Nora's reviewed copy]`, is `noindex, follow` and is omitted from the sitemap.
- Mobile targets raised to at least 44 px, with inherited demo controls included.
- All stale `?service=` links removed.

## Verification

- Automated tests: 84 passed, 0 failed.
- Browser matrix: 23 routes at 320, 390, 768, 1280 and 1920 px in Chromium/Edge; 0 failures.
- Browser checks covered status, one H1, language, duplicate IDs, heading order, skip link, horizontal overflow, phone target size and console errors/warnings.
- Header evidence: 0.3, 0.6, 1.0, 1.4 and 2.0 second frames, hover, scroll catch and reduced motion.
- Inquiry endpoint tests remain passing; GitHub Pages remains in the honest disabled state.
- CSP, `connect-src 'none'` and `form-action 'none'` remain unchanged.

## Lighthouse mobile scores

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|---:|
| Home | 93 | 100 | 100 | 92 |
| 404 | 99 | 100 | 100 | 61* |
| Privacy | 99 | 100 | 100 | 92 |
| Terms | 99 | 100 | 100 | 92 |
| Guides index | 99 | 100 | 100 | 92 |
| Stock going missing | 95 | 100 | 100 | 61* |
| Profitable but no cash | 96 | 100 | 100 | 61* |
| Run your shop remotely | 99 | 100 | 100 | 61* |
| Stock count mismatch | 99 | 100 | 100 | 61* |
| AI for supermarkets | 99 | 100 | 100 | 61* |
| Websites | 99 | 100 | 100 | 92 |
| AI assistants | 94 | 100 | 100 | 92 |
| Automation | 99 | 100 | 100 | 92 |
| Business systems | 94 | 100 | 100 | 92 |
| Marketing | 95 | 100 | 100 | 92 |
| Work index | 95 | 100 | 100 | 92 |
| OpenDuka | 94 | 100 | 100 | 92 |
| Inventory concept | 100 | 95 | 100 | 92 |
| Stockroom | 97 | 97 | 100 | 92 |
| Shopfront | 99 | 96 | 100 | 92 |
| Frontdesk | 99 | 96 | 100 | 92 |
| Flowboard | 99 | 96 | 100 | 92 |
| Campaign Kit | 99 | 96 | 100 | 92 |

`*` The 404 and unfinished guide pages intentionally fail Lighthouse's crawlability audit because the approved requirement is to keep them out of search. Removing `noindex` would make the score higher while violating scope.

## Evidence

- Homepage screenshots: `docs/m3-v2-evidence/home-phone-390.png`, `home-tablet-768.png`, `home-desktop-1280.png`.
- Animation frames and computed states: `docs/m3-v2-evidence/header-animation/`.
- Browser matrices: `docs/m3-v2-evidence/browser-results-chromium.json`.
- Lighthouse reports and summary: `docs/m3-v2-evidence/lighthouse/`.

## Carry-over markers

- `[TODO: approved About copy]`
- `[TODO: approved wording]`
- `[TODO: VPS inquiry endpoint URL]`
- `[TODO: verified notification email]`
- `[TODO: verified phone]`
- `[TODO: verified email]`
- `[TODO: verified security reporting channel]`
- `[TODO: production domain]`
- `[TODO: verification token]`
- `[TODO: address for LocalBusiness schema]`
- `[TODO: Nora's reviewed copy]`

## Limitations

- Native Firefox rendered the local homepage successfully and its 1280 px capture is preserved. The installed Firefox build could not attach to Playwright's automation protocol because its graphics compositor timed out, so the full scripted matrix is Chromium/Edge. The Firefox-safe fallback remains structural: all scroll-driven rules are inside `@supports (animation-timeline:view())`, and reduced-motion/load states were separately verified.
- The intentional `noindex` pages remain below 90 for SEO, as explained above.
- Contact and security channels remain unpublished, Guides body copy remains placeholder-only, and LocalBusiness schema remains absent until the relevant markers are approved.
