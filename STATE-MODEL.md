# NeuroNest interaction state model

This is a buildless static site. `dist/app.js` owns the custom interaction state; DOM attributes, classes, hidden panels, and generated links reflect that state. Browser-native controls keep their own state where they already provide accessible behavior.

## Custom state machines

| Flow | States | Events and transitions | Visitor-visible behavior |
| --- | --- | --- | --- |
| Mobile navigation | `closed`, `open` | Menu button toggles; selecting a link, clicking outside, Escape, or widening the viewport closes it. | `aria-expanded` and `.open` are updated together. Escape returns focus to the menu button. |
| Project guide panel | `closed`, `open` | Launcher toggles; close button or Escape closes. | Closing preserves the conversation; reopening resumes it. Focus moves into the panel and returns to its launcher when closed with the close button or Escape. |
| Guide presentation | opening, open, closing, closed | Optional GSAP timeline plays/reverses with the latest panel intent. Reduced motion or a hidden tab settles it immediately. | App code owns `aria-expanded`, `inert`, focus, and conversation state. Motion code delays only the visual hide until exit completes; a stale close callback cannot hide a reopened panel. |
| Project guide conversation | `service` → `business` → `challenge` → `timeline` → `handoff` → `contact` | A chosen service and each submitted answer advances one allowed transition. “Talk to a person” moves from handoff to contact. “Start again” returns to service and clears the conversation. | Invalid transitions are ignored. The guide prepares a draft; it does not claim to be live AI or send owner alerts. |
| Inquiry | `editing` → `prepared` → `editing` | A valid submit prepares the message. Any input, selection change, service shortcut, or guide-prefill invalidates it. | Editing hides the old result, removes stale channel URLs, and clears copy feedback. WhatsApp/email are opened only after a valid draft is prepared. |
| Copy feedback | `idle`, `copied`, `unavailable` | Copy is allowed only for a prepared inquiry; the browser clipboard operation resolves or fails. Editing returns it to idle. | A revision guard ignores stale clipboard success/failure after editing or preparing a newer inquiry. Clipboard failure leaves WhatsApp and email options available. |

## Browser-native state

- **Privacy dialog:** native `<dialog>` open/closed state supplies modal focus handling and Escape dismissal.
- **FAQs:** each native `<details>` disclosure independently tracks open/closed state; visitors may open more than one.
- **Reduced motion and entrances:** `motion.js` is optional. GSAP matchMedia reverts animation styles when viewport/preference conditions change. Headings and the inventory concept animate once on intersection; their content remains readable throughout. Cards, forms, buttons and FAQs are never hidden by entrance animation. Without GSAP or IntersectionObserver, the page remains visible and usable.
- **External handoff:** WhatsApp and email drafts leave the site only when a visitor activates their link. The site does not persist or transmit inquiry data itself.

## Integration boundary

The guide is deterministic copy and form-prefill logic, not an AI service. There is no server, database, analytics pipeline, email sender, WhatsApp webhook, authentication, or automated owner alert in this static build. Add those as explicit new states with failure, retry, consent, and handoff behavior before connecting live services. Never put provider credentials in `dist/` or other public files.

## Motion ownership

- `app.js`: user intent, semantic state, keyboard/focus behavior and inquiry data.
- `motion.js`: finite hero/heading/bar timelines plus the reversible panel timeline; no form submission, network or inquiry persistence.
- `styles.css`: static layout and simple hover/focus feedback, with one final reduced-motion override.
- `vendor/gsap-3.15.0.min.js`: pinned locally served GSAP core/CSSPlugin bundle. Package integrity and license notice are retained in the vendor folder.
