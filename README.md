# NeuroNest

Responsive, buildless technology-studio website with a homepage, five service pages, an inventory-project page and a privacy page. Serve `dist` over HTTP using `node serve.mjs` and open http://127.0.0.1:4173.

## Working features
- Responsive navigation, service selection, FAQs, privacy dialog.
- Structured inquiry form with explicit consent, WhatsApp message generation, email drafts, and clipboard copy.
- Guided service finder that gathers business/location, challenge and timeline, then transfers a draft into the inquiry form. This is explicitly labeled as a guided experience, not live AI.
- No client inquiry is stored or sent automatically. Manrope and Space Grotesk fonts are served locally, with their SIL Open Font Licenses in `dist/fonts/`.
- The local capability explorer updates service details and a link to the relevant service page. Service pages return to the enquiry form with an allowlisted public service slug; no customer details are placed in URLs.
- The hero artwork has a one-time 1.55-second desktop arrival: a small lift, restrained turn and soft settle and a cursor-responsive tilt capped at 3 degrees. The entrance runs on the wrapper so pointer response is available immediately; reused 200ms tweens follow the mouse without an additional animation-frame queue. Mobile, coarse-touch and reduced-motion visitors see a still image. Motion resets on pointer leave, scroll, blur or a hidden tab; no animation loop runs while idle.
- A short, one-time hero text entrance uses the locally served GSAP 3.15.0 bundle. The rest of the page remains still. Content and actions remain usable without GSAP, and reduced-motion settings are respected. The guide's optional 170ms open/close transition reverses safely on rapid toggles.

## Interaction model
See [STATE-MODEL.md](STATE-MODEL.md) for the user-interface state inventory, transition rules, accessibility behavior, and integration boundaries. Keep that document aligned with `dist/app.js` when interaction flows change.

## Development and publication

Edit files in `dist/`, then run `node scripts/sync-public.mjs` to update the repository-root mirrors, including fonts, studio artwork, service pages and project pages. GitHub Pages publishes the `dist/` bundle on pushes to `main`; the root copies are retained for compatibility with the existing repository layout. `DESIGN.md` records the current visual direction.

Run `node --test tests/*.test.mjs` for interaction regressions. These Node DOM/GSAP-adapter tests verify lifecycle and state behavior; they do not replace real-browser layout and visual checks.

GSAP's original license notice and package-integrity record live in `dist/vendor/`. The optional `scripts/vendor-gsap.py` refreshes that exact pinned package without installing dependencies or running package scripts. Review any version change before updating it.

## Integrations still required
- Server-side AI provider and approved business knowledge for live chat.
- WhatsApp Business Platform account, webhook verification, messaging credentials and approved templates where applicable.
- Email delivery provider and verified sender, plus a private lead database / shared inbox.
- Human escalation with delivery tracking, retry handling, access controls, and owner notifications.
- Booking provider / calendar availability.

Do not place API keys in public files. Custom prices, project claims, promises and timelines must be approved by the owner. Inventory preview uses sample data; actual project is in progress. Budget bands are inquiry preferences, not advertised prices. This version does not claim live messaging or completed client results.
