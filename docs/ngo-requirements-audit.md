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
- PhonePe and PayU adapters and gateway switching are not implemented. Existing supported gateways are preserved; NGO fee/recurring flows use Razorpay.
- Automatic email delivery awaits a verified sending domain/address. Queueing is functional; a resend.dev sender is rejected for production sending. No test email was sent to real recipients.
- Official registered address and authorized signatory await the organization. No official identity has been seeded. Provisional PDFs cannot verify as official documents.
- Automated full database/file backups and restore orchestration are not implemented. JSON exports are bounded per-module records, not a disaster recovery backup and do not contain uploaded binaries. Use managed database backups separately.
- 80G statutory eligibility/certificate activation is not implemented. PDFs expressly do not imply tax exemption.
- Public projects display progress; detailed public project income/expense transparency reports remain future scope. Admin project accounting is available.
- In-kind records track received/distributed states and quantities; lot-level partial distribution/stock movement accounting is not implemented.
- Audience email fan-out is limited to 2,000 members per publication; larger broadcasts need a batching service. Daily jobs currently process up to 10,000 approved members and 20 queued deliveries; scale scheduling requires batching.
- Only existing admin IDs and configured coordinator roles grant staff access. New authentication provider production keys remain an operator setup item.

## Validation

115 automated regression/unit tests pass. An additional isolated MongoDB integration test passes 12 workflow checks including unpaid approval rejection, incorrect fee rollback, paid approval/documents, blocking QR validity, paid renewal extension, coordinator isolation, publication visibility, PDF/XLSX exports, six Unicode PDF layouts, duplicate webhook idempotency and refund verification. The disposable QA database is deleted afterward. Production build succeeds. Mobile public pages were checked for overflow. Authenticated production admin browser interaction and actual external payment/email delivery are not included in that evidence.

Dependency audit still reports transitive vulnerabilities; Next.js was updated to 15.5.29. No forced major dependency upgrades were applied. Review the package audit before a claim of security certification.
