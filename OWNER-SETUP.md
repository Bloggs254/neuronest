# Owner steps still needed

Status: prepared instructions, not completed account configuration. Computer Use could not verify the active browser URL, so no GitHub security settings were changed. No analytics account or site token was supplied.

## GitHub account

Open [Password and authentication](https://github.com/settings/security) yourself. Verify that two-factor authentication is enabled, add a passkey or security key where available, and keep recovery codes in a private offline location. Never paste a setup secret, QR code, one-time code or recovery code into the repository, website or chat. Review existing account sessions and repository collaborators.

[GitHub's official setup instructions](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication)

## Protect main

Open [NeuroNest rules](https://github.com/Bloggs254/neuronest/settings/rules) and create an active branch ruleset targeting `main`:

1. Require a pull request before merging. For a solo owner, leave required approvals at zero unless another reviewer is available; an author cannot approve their own pull request.
2. Require the GitHub Actions check **Validate public site**. Require the branch to be up to date before merging. Select the check produced by this repository's Pages workflow.
3. Block force pushes and deletion of `main`. Avoid adding broad bypass permissions.
4. Save, then verify the rule is active. Run a small pull request through the check and merge it to verify the publishing path.

Once enabled, website changes should go through branches and pull requests rather than direct writes to main. The existing workflow validates pull requests without deployment credentials and publishes only after main passes validation. This document does not claim a rule is enabled; the most recent API check reported main as unprotected.

## Visitor analytics

Recommendation: start with free Cloudflare Web Analytics for aggregate page views and popular service pages. It can be used without moving the website or changing DNS, but the owner must create an account and add the site. No analytics script, token, external connection permission or tracking cookie has been added here.

Open [Cloudflare's setup guide](https://developers.cloudflare.com/web-analytics/get-started/), add the actual website hostname and obtain the public Web Analytics beacon token. A Web Analytics token is different from a secret Cloudflare API token; do not share account credentials or API tokens. GitHub project sites share a hostname, so confirm that reports can be filtered to `/neuronest/`; a dedicated NeuroNest domain will make attribution clearer.

Before activation, review the provider's current data collection and terms. The manually embedded Cloudflare beacon cannot be version-pinned or protected with a fixed integrity hash. Activation requires a reviewed CSP exception for the documented script and collector hosts, plus updated privacy text. Keep analytics off inventory workspaces, feedback form answers and enquiries. Do not attach form contents, product records, email addresses or customer identifiers to events.

[Cloudflare's privacy and CSP FAQ](https://developers.cloudflare.com/web-analytics/faq/), [data collection documentation](https://developers.cloudflare.com/web-analytics/data-metrics/data-origin-and-collection/)

Use analytics to understand page visits and interest, not to claim a visitor bought or sent a message. A WhatsApp click is an intention; only an enquiry actually received can count as an enquiry. The feedback plan in `research/website-feedback.md` works without analytics.
