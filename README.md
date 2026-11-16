# NeuroNest

Responsive, buildless marketing website. Serve `dist` over HTTP using `node serve.mjs` and open http://127.0.0.1:4173.

## Working features
- Responsive navigation, service selection, FAQs, privacy dialog.
- Structured inquiry form with explicit consent, WhatsApp message generation, email drafts, and clipboard copy.
- Guided service finder that gathers business/location, challenge and timeline, then transfers a draft into the inquiry form. This is explicitly labeled as a guided experience, not live AI.
- No client inquiry is stored or sent automatically. Third-party fonts load from Google Fonts; system fonts provide a fallback.
- Short, one-time hero and inventory animations use a locally served GSAP 3.15.0 bundle. Content and actions remain usable without GSAP, and reduced-motion settings are respected. The guide's optional 170ms open/close transition reverses safely on rapid toggles.

## Interaction model
See [STATE-MODEL.md](STATE-MODEL.md) for the user-interface state inventory, transition rules, accessibility behavior, and integration boundaries. Keep that document aligned with `dist/app.js` when interaction flows change.

## Development and publication

Edit files in `dist/`, then run `node scripts/sync-public.mjs` to update the repository-root mirrors. GitHub Pages publishes the `dist/` bundle on pushes to `main`; the root copies are retained for compatibility with the existing repository layout.

Run `node --test tests/*.test.mjs` for interaction regressions. These Node DOM/GSAP-adapter tests verify lifecycle and state behavior; they do not replace real-browser layout and visual checks.

GSAP's original license notice and package-integrity record live in `dist/vendor/`. The optional `scripts/vendor-gsap.py` refreshes that exact pinned package without installing dependencies or running package scripts. Review any version change before updating it.

## Integrations still required
- Server-side AI provider and approved business knowledge for live chat.
- WhatsApp Business Platform account, webhook verification, messaging credentials and approved templates where applicable.
- Email delivery provider and verified sender, plus a private lead database / shared inbox.
- Human escalation with delivery tracking, retry handling, access controls, and owner notifications.
- Booking provider / calendar availability.

Do not place API keys in public files. Custom prices, project claims, promises and timelines must be approved by the owner. Inventory preview uses sample data; actual project is in progress. Budget bands are inquiry preferences, not advertised prices. This version does not claim live messaging or completed client results.
