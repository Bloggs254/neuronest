# NeuroNest interaction state model

This is a buildless static site. `dist/app.js` owns the custom interaction state; DOM attributes, classes, hidden panels, and generated links reflect that state. Browser-native controls keep their own state where they already provide accessible behavior.

## Custom state machines

| Flow | States | Events and transitions | Visitor-visible behavior |
| --- | --- | --- | --- |
| Mobile navigation | `closed`, `open` | Menu button toggles; selecting a link, clicking outside, Escape, or widening the viewport closes it. | `aria-expanded` and `.open` are updated together. Escape returns focus to the menu button. |
| Project guide panel | `closed`, `open` | Launcher toggles; close button or Escape closes. | Closing preserves the conversation; reopening resumes it. Focus moves into the panel and returns to its launcher when closed with the close button or Escape. |
| Project guide conversation | `service` → `business` → `challenge` → `timeline` → `handoff` → `contact` | A chosen service and each submitted answer advances one allowed transition. “Talk to a person” moves from handoff to contact. “Start again” returns to service and clears the conversation. | Invalid transitions are ignored. The guide prepares a draft; it does not claim to be live AI or send owner alerts. |
| Inquiry | `editing` → `prepared` → `editing` | A valid submit prepares the message. Any input, selection change, service shortcut, or guide-prefill invalidates it. | Editing hides the old result, removes stale channel URLs, and clears copy feedback. WhatsApp/email are opened only after a valid draft is prepared. |
| Copy feedback | `idle`, `copied`, `unavailable` | Copy is allowed only for a prepared inquiry; the browser clipboard operation resolves or fails. Editing returns it to idle. | A polite status message reports the result. Clipboard failure leaves WhatsApp and email options available. |

## Browser-native state

- **Privacy dialog:** native `<dialog>` open/closed state supplies modal focus handling and Escape dismissal.
- **FAQs:** each native `<details>` disclosure independently tracks open/closed state; visitors may open more than one.
- **Reduced motion and section reveals:** when reduced motion is not requested and `IntersectionObserver` exists, observed sections progress from pending to visible. Without that capability, content remains visible.
- **External handoff:** WhatsApp and email drafts leave the site only when a visitor activates their link. The site does not persist or transmit inquiry data itself.

## Integration boundary

The guide is deterministic copy and form-prefill logic, not an AI service. There is no server, database, analytics pipeline, email sender, WhatsApp webhook, authentication, or automated owner alert in this static build. Add those as explicit new states with failure, retry, consent, and handoff behavior before connecting live services. Never put provider credentials in `dist/` or other public files.
