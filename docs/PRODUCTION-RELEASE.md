# NeuroNest production release evidence

Prepared: 28 November 2026 (Africa/Nairobi)

## Release scope

- Approved NeuroNest overhaul with 15 public routes.
- Responsive service, package, portfolio, privacy and interactive studio pages.
- OpenDuka is presented as a flagship product in development using genuine existing screenshots and fictional sample data.
- Contact channels remain disabled until ownership, monitoring, delivery and privacy handling are verified.
- Unreviewed business-guide drafts are excluded from the production package and sitemap.

## Verification

- Automated tests: 77 passed, 0 failed.
- Browser regression: 15 routes at 390 px and 1440 px, plus the missing-page response; 31 checks, 0 failures.
- Browser console and page errors: 0.
- Horizontal overflow: 0 across checked routes and viewports.
- Mobile menu: opens, reports its state and closes with Escape.
- Screenshots: `release-evidence/home-mobile.png` and `release-evidence/home-desktop.png`.

## Lighthouse

| Profile | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Mobile | 95 | 100 | 100 | 92 |
| Desktop | 100 | 100 | 100 | 92 |

The sole SEO audit failure is Lighthouse reporting that it could not download `robots.txt` from the loopback preview. Direct HTTP verification returns `200 text/plain` and the production test verifies `Allow: /`, the canonical sitemap URL and all 15 approved sitemap routes. Recheck the live GitHub Pages URL after deployment.

## Security and privacy controls

- Restrictive per-page content security policy.
- No third-party analytics, advertising, contact submission or external script dependency.
- No verified email, WhatsApp or phone address is published.
- No unreviewed guides, credential files or private local data are in the public package.
- Public pages use unique canonical and social metadata; only the 404 page is `noindex`.

## Rollback

The pre-overhaul production baseline is remote `main` commit `32b57a867f4ac53266bc69fdca25d32919ae51d3`. If the production merge must be reversed, revert the eventual squash-merge commit through a reviewed pull request and allow the existing Pages workflow to redeploy. Do not rewrite shared `main` history.
