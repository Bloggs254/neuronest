# NeuroNest VPS staging and rollback runbook — draft v0.1

Status: local planning document only. No provisioning, purchase, DNS, TLS or live message is authorized.

## Stop gates

Do not provision until the owner records approval for all of: provider and exact checkout total; domain; DNS access; encrypted off-instance backup destination; monitored security/contact inbox; live-work window; OpenDuka source and OD-1/2/3/6 definitions; processor/privacy decisions.

## Proposed architecture

1. Preserve GitHub Pages as the tested fallback.
2. Stage a least-privilege Linux VPS in Johannesburg if the verified checkout remains within the KES 2,000 monthly cap.
3. Permit SSH keys only, disable password and root login, allow 22 from an approved administration address, and expose only 80/443 after the live-work gate.
4. Serve the static `dist/` bundle through nginx. Keep inquiry, `/api/` and OpenDuka unavailable until their separate verification gates pass.
5. Run any future OpenDuka demo as a non-privileged, independently rebuildable container on a private network, with fictional data and no route to an owner device.
6. Issue TLS only after domain control and DNS are verified. Test automated renewal and alerting before relying on it.

## Staging sequence (proposed, not executed)

Record the Git commit, image digests, OS image, checkout invoice, public IP and firewall state. Create a non-root deployment user with key-only access. Apply updates. Install only reviewed packages. Copy the exact tested artifact. Validate nginx configuration locally, then bind staging to loopback or a separately approved restricted hostname. Run headers, 404, indexing and link checks. Do not enable HSTS until HTTPS is stable and rollback has been tested.

## Backup and restore gate

Take a consistent SQLite backup plus site artifacts daily. Transfer it encrypted to an approved destination outside the VPS. Provider snapshots are supplemental only. The local `backup-core.mjs` creates a candidate and verifies checksum, integrity and row counts, but it is not compliant until encrypted off-instance transfer and retention are approved. Run restore drills only into an empty scratch destination; refuse corrupt input and non-empty overwrite.

## Cutover gate

Observe clean staging operation for at least one week. Re-run automated/browser tests, HTTPS headers, TLS renewal dry-run, uptime alerts, approved inquiry delivery and `/api/catalogue/<business>` with synthetic data. Record old DNS and TTL. Only after separate cutover approval may canonical, Open Graph, sitemap and robots change.

## Rollback

Restore the previous DNS values and verify the Pages fallback and its certificate actually serve the custom domain; do not assume DNS alone is sufficient. Disable the inquiry route to a verified handoff and restore restrictive CSP. Export and reconcile any queued inquiries securely before teardown. Preserve the VPS and data for investigation. Never destroy them without explicit approval.

## Current blockers

- No provider checkout, tax/FX total or separate backup-storage price has been approved.
- No domain, DNS access or verified contact/security inbox.
- No approved encrypted off-instance backup destination or retention decision.
- OpenDuka source is not in this workspace, and OD-1/2/3/6 are undefined in the controlling brief.
- No live-work, live inquiry or DNS cutover approval.
