# Security boundaries

NeuroNest is a static public website, not a production inventory system or live customer assistant. Enquiries are prepared locally and handed to WhatsApp or the visitor's email application only when they choose. No account credentials belong in the public bundle.

## Browser protections

All 14 pages declare a Content Security Policy immediately after the character encoding. Scripts, fonts and images load from the same origin. Inline scripts, string evaluation, inline event handlers, fetch/WebSocket connections, native form submissions, embedded frames, plugins and workers are blocked. Normal links, reviewed WhatsApp/email drafts and locally generated text downloads still work.

Inline CSS remains permitted because GSAP updates element styles, and the static previews and no-JavaScript fallbacks use inline styles. This is a deliberate compatibility allowance, not permission for inline JavaScript. Referrer metadata is suppressed on outgoing requests. First-party UI code uses text nodes and SVG DOM methods rather than HTML-string insertion.

This is a restrictive host-based CSP, not a nonce-based strict CSP. Same-origin scripts remain trusted. GitHub Pages project sites share their account's origin; a dedicated domain would provide better origin isolation.

## Publishing

Validation runs with read-only repository permissions. Only a successful main-branch push or manual main-branch run can publish. The separate deployment job gets Pages/OIDC permissions and does not check out or execute project scripts. Checkout does not retain Git credentials. Every action is pinned to a full commit SHA resolved from its official actions repository. Packaging uses a directly pinned upload action rather than a composite action with a mutable nested dependency.

Weekly Dependabot pull requests propose action updates; they are not automatically merged. Review them before merging. CI checks the public bundle for symlinks, hidden files, unexpected file types/data files and several high-confidence credential patterns. This limited check is not a complete secret scan or an audit of historical commits. The regression suite also checks the CSP, safe script sources and workflow restrictions.

## Remaining account and hosting controls

- The branch API reported main as unprotected on 17 November 2026. The connected GitHub tools cannot change repository rules or inspect account authentication. The owner should enable two-factor authentication/passkeys, retain recovery codes offline, review collaborators and require the validation check for main. Review how branch rules affect existing publishing access before enabling them.
- A meta CSP cannot enforce frame-ancestors, and it cannot set HTTP-only headers such as X-Frame-Options or Permissions-Policy. Do not claim these are configured. Header-level anti-framing controls need a hosting layer that supports custom response headers. The current frame-src restriction controls frames inside this site, not sites embedding NeuroNest.
- HTTPS is provided by GitHub Pages; no custom WAF, attack monitoring, backup service or penetration test is claimed. Git history preserves source revisions, but is not a complete operational recovery plan.
- Before connecting live AI, payments, email or WhatsApp APIs: design server-side secret storage, authentication/authorisation, validated webhooks, rate limits, server-side validation, safe tool permissions, abuse handling, retention and recovery. The current connect-src policy deliberately blocks those connections until reviewed.

## Reporting an issue

Send a private description to neuronest@gmail.com. Do not include passwords, personal customer records or working credentials in public issues. If a credential is exposed, revoke or rotate it promptly; removing it from a later commit is insufficient.

References: [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [OWASP CSP guidance](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html), [MDN frame-ancestors limitations](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors).
