# Hosting cost research — 28 November 2026

This is research, not a quote or purchase approval.

- Controlling provisional assumption: Vultr Johannesburg AMD, 1 vCPU / 2 GB / 50 GB at USD 12 monthly.
- Vultr's official backup documentation confirms automatic backups add 20% to the base compute charge and do not include attached Block Storage. At the provisional base, compute plus provider backup would be USD 14.40 before tax, FX and any separate off-instance storage.
- Vultr documentation also says automatic backups cover the active instance filesystem and are not a substitute for the required independently restorable off-instance application backup.
- Let's Encrypt certificates are free; its official documentation recommends an automated ACME client such as Certbot and automated renewal.

The exact Johannesburg plan availability, checkout tax, Kenyan card/FX result and encrypted off-instance storage price were not verifiable without an owner-controlled checkout and storage choice. Therefore the KES 2,000 cap is not proven and provisioning remains blocked.

Sources:

- https://docs.vultr.com/products/storage/backups/faq
- https://docs.vultr.com/support/platform/billing/how-much-does-it-cost-to-enable-automatic-backups
- https://letsencrypt.org/docs/faq/
- https://letsencrypt.org/docs/client-options/
