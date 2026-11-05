# NGO requirements audit and operator guide

Audit date: 2026-11-05. The supplied specification contains 191 numbered requirements across 24 functional modules plus security requirements. Its marketing references to 300+ features are not a testable item count. Before this implementation, eight modules had partial coverage and sixteen had no dedicated operational module. This is a baseline, not a claim that all 191 requirements are complete.

## Implemented operational workflows

- Membership: verified-email registration, designation selection, fee/term snapshots, admin review, payment reconciliation, approval, validity, member block/unblock, renewal with payment then approval, expiration scheduling, referrals and birthday messages.
- Designations: create/edit/deactivate fee, validity and provisional designation from Admin. Three free, one-month provisional categories are seeded idempotently by scripts/seed-provisional-memberships.mjs. They are explicitly test categories, not official positions. Real gateway collection is blocked for provisional registrations.
- Documents: QR verification, separate private download credentials, PDF ID cards, membership certificates, appointment letters, receipts, six certificate layouts, draft letters, archive and revocation. Hindi/Latin font is bundled with its license. Official identity is never invented. Membership documents stay provisional until the real organization name, registered address and signatory are configured. Manual official certificate/letter issuance requires that profile.
- Finance: cash/bank/UPI entries, approval, immutable confirmed records and documented reversals, in-kind donation quantities, fee receipts, project funds and expenses with bill uploads, custom receipts, online donation ledger and unified document register.
- Razorpay: server-priced registration checkout; authenticated webhook reconciliation; idempotent fee capture; recurring monthly mandate setup, pause, resume and cancellation; signed charge tracking. Requires real live credentials and enabled donation flag before collection.
- Coordinators: named Clerk account assignment, blocking, own field dashboard, assigned/own records and exports. Coordinators cannot approve their own financial records or assign other login accounts.
- People and publishing: confidential beneficiaries and assistance history; management team, achievements/visitor certificates, activities, campaigns, projects, events with capacity checks, internships and applications, completion certificate eligibility, news and member messages.
- Support: tracked complaints, private case replies, existing enquiry replies, durable email outbox with delivery status/retry.
- Reports: filtered PDF and real XLSX exports, aggregate ledger/monthly/project/coordinator summaries, audit history, protected per-module JSON record export with checksum.
- Security: server-side admin and coordinator checks, verified member ownership, origin checks, rate limits, strict module-specific validation, optimistic revisions, private GridFS uploads, transaction-bound financial effects and minimal public QR status.

## Entry points

- /admin/manage: all operational modules; /admin/reports: totals and exports.
- /admin/manage/designations: configure categories, fees, term and test flag.
- /admin/manage/organization: enter only genuine organization identity and signatory details.
- /admin/manage/members, /admin/manage/membership-payments and /admin/manage/renewals: member review, fee confirmation and renewal approval.
- /admin/settings: delivery queue and existing workspace settings.
- /membership: member registration; /dashboard/membership: private applications, fees, documents, giving history and recurring donations.
- /dashboard/coordinator: assigned staff workspace.
- /community/team, /community/news, /community/activities, /community/projects, /community/campaigns, /community/events and /community/internships: admin-published database content. Existing editorial pages remain available.

## External activation and remaining scope

This release must not be represented as all 191 requirements completed or fully production-certified.

- Live Razorpay keys, enabled collection flag and end-to-end live payment acceptance remain operator prerequisites. Current production collection stays disabled. No real charge was created in QA.
- PhonePe and PayU hosted adapters and admin gateway switching now have implementations for new donations and registration fees. Existing checkouts retain their provider. Actual merchant sandbox/live acceptance and provider webhook registration remain pending; recurring mandates use Razorpay.
- Automatic email delivery awaits a verified sending domain/address. Queueing is functional; a resend.dev sender is rejected for production sending. No test email was sent to real recipients.
- Official registered address and authorized signatory await the organization. No official identity has been seeded. Provisional PDFs cannot verify as official documents.
- Encrypted full MongoDB + GridFS snapshot export and isolated restore tooling are implemented in `scripts/ngo-backup.mjs`, including BSON types, collection options and indexes. Restore refuses non-empty databases and only permits `ngo_restore_*` targets. Offsite storage, recurring scheduling and operational recovery drills still require hosting setup. The existing per-module JSON export remains separate.
- Genuine 80G approval configuration, private evidence upload, validity checks and approval snapshots on monetary donation acknowledgements are implemented. No approval is seeded or invented. Statutory Form 10BD filing and portal-issued Form 10BE remain the organization’s external tax workflow; the application does not fabricate them.
- Public project pages now display confirmed funding, approved spending and category totals, with PDF/XLSX accountability reports that exclude donor contacts, beneficiary information and private bills.
- In-kind records implement the six supplied item-donation requirements. Lot-level partial distribution is an optional expansion, not one of the 191 numbered requirements.
- Member broadcasts now use resumable, idempotent database batches with no 2,000-recipient rejection. Membership expiry is a bulk operation and birthday matching no longer truncates at 10,000 members. Delivery processing remains bounded per invocation; frequent offsite workers or repeated admin processing are needed for large queues.
- Only existing admin IDs and configured coordinator roles grant staff access. New authentication provider production keys remain an operator setup item.

## Validation

119 automated regression/unit tests pass. An additional isolated MongoDB integration test passes 21 workflow checks including unpaid approval rejection, incorrect fee rollback, paid approval/documents, blocking QR validity, paid renewal extension, coordinator isolation, publication visibility, PDF/XLSX exports, six Unicode PDF layouts, duplicate webhook idempotency and refund verification. The disposable QA database is deleted afterward. Production build succeeds. Mobile public pages were checked for overflow. Authenticated production admin browser interaction and actual external payment/email delivery are not included in that evidence.

Dependency audit still reports transitive vulnerabilities; Next.js was updated to 15.5.29. No forced major dependency upgrades were applied. Review the package audit before a claim of security certification.

## Completion follow-up

The earlier module-level audit was too broad to establish acceptance of all 191 items. See [the item-by-item register](ngo-requirements-checklist.md). Code presence, provider activation and production acceptance are tracked separately.

Production database diagnostic: the deployed API returns 503 and all Atlas replicas reject its TLS handshake with `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`. The same database is reachable from the local test environment. Matching production credentials, pinning Node 24 and forcing IPv4 did not resolve it. Atlas network/security settings and the deployed server's outbound access need checking with account access. TLS verification has not been disabled. This is not yet a confirmed root-cause diagnosis.

New operator commands:

```
node scripts/ngo-backup.mjs backup .ngo-backups/foundation.ngobackup
node scripts/ngo-backup.mjs restore .ngo-backups/foundation.ngobackup ngo_restore_review
```

Set `BACKUP_ENCRYPTION_KEY` to a securely stored random 32-byte hex key. Losing that key makes the archive unrecoverable. Restore never overwrites the live database. For merchant integrations, see [provider activation](ngo-provider-activation.md).
