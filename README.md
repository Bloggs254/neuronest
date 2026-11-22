# NeuroNest

Responsive, buildless technology-studio website with a homepage, five service pages, a studio-demo hub, five working demo pages, an inventory-project page and a privacy page. Serve `dist` over HTTP using `node serve.mjs` and open http://127.0.0.1:4173.

## Working features
- Responsive navigation, service selection, FAQs, privacy dialog.
- Structured inquiry form with explicit consent, WhatsApp message generation, email drafts, and clipboard copy.
- Guided service finder that gathers business/location, challenge and timeline, then transfers a draft into the inquiry form. This is explicitly labeled as a guided experience, not live AI.
- No client inquiry is stored or sent automatically. Manrope and Space Grotesk fonts are served locally, with their SIL Open Font Licenses in `dist/fonts/`.
- The local capability explorer updates service details and a link to the relevant service page. Service pages return to the enquiry form with an allowlisted public service slug; no customer details are placed in URLs.
- The hero artwork has a one-time arrival when it enters view: a small lift, restrained turn and soft settle (1.2 seconds on phones; 1.55 seconds on desktop) and a cursor-responsive tilt capped at 3 degrees. The entrance runs on the wrapper so pointer response is available immediately; reused 200ms tweens follow the mouse without an additional animation-frame queue. Phones and touch devices receive the arrival without cursor tracking. Reduced-motion visitors see a still image. Motion resets on pointer leave, scroll, blur or a hidden tab; no animation loop runs while idle.
- A short, one-time hero text entrance uses the locally served GSAP 3.15.0 bundle. The rest of the page remains still. Content and actions remain usable without GSAP, and reduced-motion settings are respected. The guide's optional 170ms open/close transition reverses safely on rapid toggles.

## Optional studio explorations

- Shopfront: sample catalogue, search, basket and reviewable order enquiry.
- Frontdesk: scripted approved answers and human-handover summary; not live AI.
- Flowboard: local enquiry-to-task-and-draft workflow with approval and invalidation.
- Stockroom: browser inventory edition 1.0 with optional locally saved records, dated movements, product editing, JSON backup/restore and CSV exports.
- Campaign Kit: template-based campaign brief, tracking URL and text export.

All start with sample data. Stockroom additionally offers an explicitly selected My saved records workspace stored only in that browser; other demos reset on reload. Nothing is purchased, sent or published automatically. For production, backend services, real accounts, privacy and operations must be scoped separately. These are original studio demos rather than customer case studies. They are intentionally kept separate from the main presentation: the homepage shows two compact previews: the OpenDuka project and a storefront concept, and service pages have no demo blocks.

## Interaction model
See [STATE-MODEL.md](STATE-MODEL.md) for the user-interface state inventory, transition rules, accessibility behavior, and integration boundaries. Keep that document aligned with `dist/app.js` when interaction flows change.

## Development and publication

Edit files in `dist/`, then run `node scripts/sync-public.mjs` to update the repository-root mirrors, including fonts, studio artwork, service pages and project pages. GitHub Pages publishes the `dist/` bundle on pushes to `main`; the root copies are retained for compatibility with the existing repository layout. `DESIGN.md` records the current visual direction.

Run `node --test tests/*.test.mjs` for interaction regressions. These Node DOM/GSAP-adapter tests verify lifecycle and state behavior; they do not replace real-browser layout and visual checks.

GSAP's original license notice and package-integrity record live in `dist/vendor/`. The optional `scripts/vendor-gsap.py` refreshes that exact pinned package without installing dependencies or running package scripts. Review any version change before updating it.

## Integrations still required

See [SECURITY.md](SECURITY.md) for the browser policy, deployment restrictions, owner account actions and hosting limitations. CI also checks public bundle boundaries and the recorded vendored GSAP hash. Review policy changes before connecting any external API; the current site deliberately permits no background network connections.

- Server-side AI provider and approved business knowledge for live chat.
- WhatsApp Business Platform account, webhook verification, messaging credentials and approved templates where applicable.
- Email delivery provider and verified sender, plus a private lead database / shared inbox.
- Human escalation with delivery tracking, retry handling, access controls, and owner notifications.
- Booking provider / calendar availability.

Do not place API keys in public files. Custom prices, project claims, promises and timelines must be approved by the owner. Inventory screenshots use sample data; Stockroom browser edition has explicit local-storage limits. Budget bands are inquiry preferences, not advertised prices. This version does not claim live messaging or completed client results.

## Stockroom browser edition

The saved workspace supports up to 1,000 products and 10,000 movements within a 2 MB JSON backup. Records are not encrypted or synced. Use one active workspace tab and keep downloaded backups; clearing browser data can remove local records. JSON restoration is validated and requires review before replacing saved records. CSV exports are for spreadsheets, with formula-like text neutralised; they are not restore files. Stock quantity changes have dated movement history. This is a single-browser tool, not shared production inventory or accounting software.

## Owner actions and feedback

See OWNER-SETUP.md for GitHub protection and analytics steps that still require the owner. No GitHub authentication settings, branch rules or analytics account have been configured. The optional homepage footer feedback form prepares a reviewable email draft without storing or sending answers. research/website-feedback.md and the empty CSV templates provide a first review round and weekly measurement process; no participant results have been fabricated.

## OpenDuka showcase

`work/openduka.html` describes the working OpenDuka project without exposing its private repository, access credentials or database. Published screenshots were captured from a fresh fictional local demo, not an existing customer workspace. The project is presented as active work with deployment boundaries, not a finished client case study.
