# MVP improvement notes

The visual changes use section dividers and flatter editorial surfaces in place of repeated elevated cards. Admin tables now support searching loaded records and paging in groups of ten; this does not fetch additional records beyond the server query limit.

Admin mutations, the field desk, attendee lookup, check-in, and CSV export require an administrator account. Donation receipts require the owning account, a verified matching email on an unassigned guest gift, or administrator access. Configure authorized staff in ADMIN_USER_IDS.

The enquiry inbox now shows full messages and opens the operator's email client for replies. Sending that reply remains a manual email action. Integration settings probe database connectivity and report other providers' configuration without claiming provider delivery has been tested.

Run npm run build before npm run test:e2e. PLAYWRIGHT_PORT selects an isolated test port; tests launch the production server and refuse to reuse an arbitrary running app. Browser checks cover both published content and the production publication safeguard, and both active checkout and its unavailable state.

Production acceptance still requires authenticated supporter/admin walkthroughs against the deployed database, payment-provider sandbox and webhook verification, email delivery verification, approved editorial publication, and tax-receipt review. Public production approval and payment launch gates are preserved.
