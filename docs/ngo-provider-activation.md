# External activation still required

## Database

The production API currently cannot establish an Atlas TLS session. Safe logs contain `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR` for every replica. Local integration tests connect successfully. Check Atlas project network access, cluster TLS/security configuration and Vercel outbound connectivity. Do not disable TLS certificate validation or publish credentials. A successful public categories API response, a protected authenticated Admin read/write and a fresh registration/approval cycle are required before launch acceptance.

## Payments

Admin > NGO operations > Payment gateway selection can activate a configured Razorpay, PhonePe or PayU provider for new one-time contributions and registration fees. Existing fee orders retain their provider. Sandbox checkout is blocked on the production website. Server secrets are set through deployment environment variables; the admin form exposes only provider selection and mode. No code changes are needed to switch configured providers.

- Razorpay: existing `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` and signed webhook registration.
- PhonePe: `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`.
- PayU: `PAYU_KEY`, `PAYU_SALT`; payer phone is required.
- Sandbox credentials use `TEST_` prefixes for hosted providers, on a non-production test environment.
- Set a random `HOSTED_WEBHOOK_SECRET` of at least 32 characters. Configure the merchant notification URL as `https://www.skymeredianfoundation.org/api/webhooks/hosted/phonepe?token=<secret>` or `/payu?token=<secret>`. Treat the URL as private. Incoming notifications trigger authoritative server-to-server status queries; a browser return or callback payload never marks a payment paid on its own.
- Set `DONATIONS_ENABLED=true` only after the selected provider is approved and tested. The current production flag remains false.

Recurring mandates continue through Razorpay. Admin can pause/resume/stop from its recurring-donations workspace. Provider acceptance must cover successful, failed, abandoned, duplicate notification and wrong-amount cases before live activation. Mocked adapter tests are not a replacement for merchant sandbox acceptance.

References: [PhonePe standard checkout](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/create-payment), [PhonePe status](https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status), [PayU hosted checkout](https://docs.payu.in/docs/prebuilt-checkout-page-integration), [PayU hashing](https://docs.payu.in/docs/hashing-request-and-response).

## Email

Verify the organization's sending domain with Resend and configure a genuine `RESEND_FROM_EMAIL`. A resend.dev sender is rejected for production sending. Queues and broadcast batching work without pretending messages were delivered. Merchant/webhook callbacks process a bounded number of queued messages; large queues need a frequent authenticated worker or repeated Admin queue processing.

## Official documents and tax

Enter the genuine registered address and signatory in the organization profile. Provisional categories remain free tests. No official profile or tax approval is invented. To add organization approval details to qualifying monetary donation acknowledgements, configure the real PAN, approval number, effective dates and private approval evidence in 80G organization approvals.

Approval details on an acknowledgement do not replace statutory filing or a Form 10BE downloaded from the tax portal. Actual eligibility, filing and official certificate issuance belong to the organization's tax workflow. See the [Income Tax Department manual](https://www.incometax.gov.in/iec/foportal/help/statutory-forms/popular-form/form10bd-10be).
