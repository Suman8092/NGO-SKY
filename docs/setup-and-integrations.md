# Setup and provider integrations

This guide covers a safe local start and the deliberate transition to connected services. Configure one environment per deployment tier. Never reuse production keys in local development or preview deployments.

## Local setup

1. Install Node.js 22.12 or newer.
2. Run `npm install` from the repository root.
3. Copy `.env.example` to `.env.local`.
4. Keep `DEMO_MODE=true`, `PUBLIC_SUBMISSIONS_ENABLED=false`, and `DONATIONS_ENABLED=false` for the first run.
5. Run `npm run dev` and open `http://localhost:3000`.
6. Run `npm run typecheck`, `npm run lint`, and `npm test` before connecting providers.

The environment parser treats empty optional values as absent. An invalid non-empty value is excluded from the parsed configuration and is reported by `/api/health`; it is not silently used.

## Environment reference

| Variable                            | Exposure                        | Required when                         | Meaning                                                                                    |
| ----------------------------------- | ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `NODE_ENV`                          | Server                          | Set by runtime                        | `development`, `test`, or `production`; normally managed by Next.js/Vercel                 |
| `VERCEL_ENV`                        | Server                          | Set by Vercel                         | `production`, `preview`, or `development`; live-only checks use this before `NODE_ENV`     |
| `DEMO_MODE`                         | Server                          | Always recommended                    | When true, explicitly disables MongoDB, payment, Resend, and Sanity integration readiness  |
| `DONATIONS_ENABLED`                 | Server                          | Online donation launch                | Explicit master gate; keep false until the complete live payment workflow is approved      |
| `PUBLIC_SUBMISSIONS_ENABLED`        | Server                          | Public form launch                    | Explicit master gate for contact, newsletter, and volunteer submissions                    |
| `NEXT_PUBLIC_SITE_URL`              | Browser and server              | All environments                      | Absolute origin used for canonical metadata and Stripe return URLs; no trailing path       |
| `NEXT_PUBLIC_CONTENT_VERIFIED`      | Browser and server              | Production publication                | Set true only after bundled editorial claims and records are approved                      |
| `NEXT_PUBLIC_CONTACT_EMAIL`         | Browser                         | Optional                              | Verified public mailbox; when absent the site shows only the contact form                  |
| `MONGODB_URI`                       | Secret                          | Live persistence                      | MongoDB or Atlas connection URI                                                            |
| `MONGODB_DB_NAME`                   | Server                          | Live persistence                      | Database name; defaults to `skymeredian-foundation`                                            |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Browser                         | Clerk UI/session provider             | Public Clerk instance key; Production requires a `pk_live_` key                            |
| `CLERK_SECRET_KEY`                  | Secret                          | Protected dashboard/admin routes      | Clerk backend key; Production requires the matching `sk_live_` key                         |
| `ADMIN_USER_IDS`                    | Server                          | Administrator access                  | Comma-separated Clerk user IDs; empty denies all `/admin` access                           |
| `STRIPE_SECRET_KEY`                 | Secret                          | Stripe Checkout                       | Stripe secret key; Production accepts only `sk_live_`                                      |
| `STRIPE_WEBHOOK_SECRET`             | Secret                          | Stripe status updates                 | Signing secret beginning with `whsec_` for the exact deployed webhook endpoint             |
| `RAZORPAY_KEY_ID`                   | Server response-safe identifier | Razorpay checkout                     | Razorpay key ID; Production accepts only `rzp_live_`                                       |
| `RAZORPAY_KEY_SECRET`               | Secret                          | Razorpay checkout                     | Secret paired with the key ID; used for order creation and checkout signature verification |
| `RAZORPAY_WEBHOOK_SECRET`           | Secret                          | Razorpay status updates               | Independently chosen webhook signing secret                                                |
| `RESEND_API_KEY`                    | Secret                          | Transactional mail                    | Resend API key beginning with `re_`                                                        |
| `RESEND_FROM_EMAIL`                 | Server                          | Transactional mail                    | Verified sender, such as `Skymeredian Foundation <giving@example.org>`                         |
| `CONTACT_NOTIFICATION_EMAIL`        | Server                          | Internal contact/volunteer alerts     | Valid monitored recipient address                                                          |
| `SANITY_PROJECT_ID`                 | Server identifier               | Server-side Sanity reads              | Preferred project identifier                                                               |
| `SANITY_DATASET`                    | Server identifier               | Server-side Sanity reads              | Preferred dataset name, commonly `production`                                              |
| `SANITY_STUDIO_API_PROJECT_ID`      | Public identifier               | Marketplace/Studio compatibility      | Project identifier provisioned by the Vercel Marketplace integration                       |
| `SANITY_STUDIO_API_DATASET`         | Public identifier               | Marketplace/Studio compatibility      | Dataset provisioned by the Vercel Marketplace integration                                  |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`     | Browser identifier              | Studio/browser clients                | Public project identifier; never place a token in a public variable                        |
| `NEXT_PUBLIC_SANITY_DATASET`        | Browser identifier              | Studio/browser clients                | Public dataset name                                                                        |
| `SANITY_API_VERSION`                | Server                          | Sanity reads                          | Pinned API date in `YYYY-MM-DD` format                                                     |
| `SANITY_API_READ_TOKEN`             | Secret                          | Private dataset or authenticated read | Preferred least-privilege read token provisioned by the Marketplace integration            |
| `SANITY_API_TOKEN`                  | Secret                          | Legacy authenticated read fallback    | Legacy variable accepted only when it contains a least-privilege read token                |
| `SANITY_REVALIDATE_SECRET`          | Secret                          | Sanity webhook                        | Random value of at least 16 characters used to validate signed revalidation requests       |
| `SANITY_STUDIO_PROJECT_ID`          | Studio identifier               | Local/deployed Studio                 | Project identifier read by the Studio configuration                                        |
| `SANITY_STUDIO_DATASET`             | Studio identifier               | Local/deployed Studio                 | Dataset read by the Studio configuration                                                   |
| `PORT`                              | Server                          | Optional Express process              | Listener port, default `4000`                                                              |

Values prefixed with `NEXT_PUBLIC_` are shipped to the browser. They must never contain credentials, tokens, webhook secrets, connection strings, personal data, or internal-only endpoints.

## MongoDB

1. Create separate Atlas projects or clusters for development/staging and production.
2. Create a database user scoped to the Skymeredian database. Do not use an Atlas owner credential in the application.
3. Restrict network access using Vercel's supported connectivity pattern, private networking, or the narrowest practical access list. Avoid a permanent unrestricted IP rule.
4. Set `MONGODB_URI` and `MONGODB_DB_NAME` in the target environment.
5. Keep TLS enabled and require authentication. Configure automated backups, point-in-time recovery where available, and a tested restore procedure.
6. Start the application and request `/api/health?deep=true`. The database integration should report `connected`.
7. Verify the declared indexes for donations, contacts, subscriptions, and volunteer applications in production. Index creation should be an explicit release step rather than an unobserved first-request side effect.

The persistence layer hashes client IP addresses before storage. The current donation repository does not store a donor tax identifier. This still requires documented privacy, retention, access-control, export, deletion, and breach-response procedures for every field that is retained.

## Sanity CMS

The repository includes Studio configuration and schemas in `sanity/`. The runtime read adapter supports `campaign`, `program`, `successStory`, `post`, and `event` documents.

1. Create or select a Sanity project and create distinct datasets for non-production and production content.
2. With the Vercel Marketplace integration, use `SANITY_STUDIO_API_PROJECT_ID`, `SANITY_STUDIO_API_DATASET`, and `SANITY_API_READ_TOKEN`. Existing installations may retain `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and a read-only `SANITY_API_TOKEN` as fallbacks. Make the Studio identifiers available through the deployment environment, current shell, or a gitignored `sanity/.env.local`; do not assume that the root `.env.local` is loaded after changing directories.
3. From `sanity/`, run `npx sanity dev`. Review validation rules and editorial roles before inviting editors.
4. For a public dataset, omit the read token unless authenticated reads are required. For a private dataset, use `SANITY_API_READ_TOKEN` with a least-privilege Viewer/read credential stored only server-side. `SANITY_API_WRITE_TOKEN` may be provisioned by Marketplace, but the website runtime intentionally never reads it.
5. Add local and deployed Studio/application origins to Sanity CORS. Allow credentials only for Studio origins that need authenticated editing.
6. Create a signed Sanity webhook targeting `https://<site>/api/webhooks/sanity`, use the same value as `SANITY_REVALIDATE_SECRET`, and trigger it for create/update/delete events on the supported document types. The Next.js content reader attaches a type-specific cache tag; successful signed delivery invalidates that tag, with a five-minute time-based refresh as fallback.
7. Publish sample documents, then verify `/api/content?type=campaigns&limit=3` returns `meta.source: "sanity"`.

Publishing in Sanity does not automatically prove that content is accurate or safe. Use the approval and dignity checks in [content and Sanity](content-and-sanity.md).

## Clerk

Clerk is optional in the public presentation layer. Providing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` wraps the application in `ClerkProvider`; providing both matching keys activates authentication for `/dashboard` and `/admin`. Vercel Production and a local production server require `pk_live_` and `sk_live_` keys. Missing or development keys fail closed in live production, and production never permits the demo dashboard bypass. `/admin` also requires the signed-in Clerk user ID to be present in `ADMIN_USER_IDS`; an empty allowlist denies everyone.

1. Create separate Clerk applications for development and production.
2. Add the exact local, preview, and production origins and redirect URLs in Clerk.
3. Set both keys from the same Clerk instance. Use development keys for Local/Preview and matching live keys only in Production.
4. Add only approved operator IDs to `ADMIN_USER_IDS`. For a larger team, replace the allowlist with authoritative server-side roles in Clerk metadata or the application database.
5. Keep middleware authentication and enforce authorization inside every protected Server Component, Route Handler, server action, and Express endpoint. A hidden button, authenticated session, or client redirect is not proof of an administrator role.
6. Require stronger controls for finance and administration: MFA, short sessions, audit records, least privilege, and immediate offboarding.
7. Prefer email/password signup. Leave phone signup disabled unless the Clerk plan, SMS provider, and every intended country are enabled and tested. For Indian numbers, confirm India is supported in the production Clerk instance before making phone number required.
8. After changing identifier requirements, delete or clear abandoned signup attempts where applicable, clear the browser's site data (or use a fresh private window), and start a new signup. An incomplete attempt can continue asking for fields from the previous configuration.

If Clerk shows “Phone numbers from this country (India) are currently not supported,” that is an instance/plan/SMS-country configuration issue, not a field-format error. Keep email/password as the production path until India phone delivery is explicitly supported and verified.

The dashboards intentionally show truthful empty states until authenticated production read adapters exist. Do not expose donation history, receipts, certificates, volunteer records, or operational metrics until ownership, role, and data-isolation tests pass.

## Stripe

1. Complete account, charity, tax, settlement, statement-descriptor, and refund configuration with the organisation's finance owner.
2. Start with Stripe test keys. Set `STRIPE_SECRET_KEY`, a test `NEXT_PUBLIC_SITE_URL`, and live MongoDB-style persistence in a non-production database. Checkout is intentionally unavailable with memory persistence.
3. Register `POST /api/webhooks/stripe` and subscribe to the events handled by the adapter: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, and `charge.refunded`.
4. Put the endpoint-specific signing secret in `STRIPE_WEBHOOK_SECRET`. Preserve the raw body through any proxy; signature verification depends on exact bytes.
5. Exercise one-time and recurring Checkout, success/cancel returns, delayed payment, failure, duplicate delivery, out-of-order delivery, and refund paths.
6. Treat the signed webhook—not the browser redirect—as the source of payment truth. Reconcile provider settlements against MongoDB and accounting records.
7. Replace test keys with live keys only in Production and repeat a low-value controlled transaction with finance approval.
8. Set `DONATIONS_ENABLED=true` only after MongoDB, the live key, exact webhook secret, HTTPS `NEXT_PUBLIC_SITE_URL`, reconciliation owner, and legal/refund workflow have passed the launch checklist.

## Razorpay

1. Complete Razorpay activation, settlement, receipt, tax, and refund configuration.
2. Configure test `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. This implementation accepts Razorpay only for one-time INR donations; recurring and non-INR donations route to Stripe.
3. Register `POST /api/webhooks/razorpay` for `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, and `refund.processed`.
4. Set an independent webhook secret in both Razorpay and `RAZORPAY_WEBHOOK_SECRET`.
5. Verify the browser callback through `POST /api/payments/razorpay/verify`; keep the record in `processing` until the signed webhook confirms the final state.
6. Test duplicate/out-of-order webhooks, abandoned orders, partial operational failures, full refunds, settlement reconciliation, and a controlled live transaction.
7. Set `DONATIONS_ENABLED=true` only after the same production gate is complete. A key alone never activates donations.

The key ID may be returned to the browser. The key secret and webhook secret must remain server-only.

## Resend

1. Add and verify an organisation-controlled sending domain.
2. Publish the required SPF and DKIM records and align DMARC with the organisation's policy.
3. Create a narrowly scoped API key and set `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to a verified sender and `CONTACT_NOTIFICATION_EMAIL` to a monitored team mailbox.
5. Test contact acknowledgements, internal contact notifications, newsletter welcome messages, and volunteer acknowledgements in a non-production audience.
6. Configure bounce/complaint handling and suppression before broad sending. Honour unsubscribe and deletion requests and document retention.
7. Confirm `CONTACT_NOTIFICATION_EMAIL` is actively monitored with a named response owner. Then set `PUBLIC_SUBMISSIONS_ENABLED=true` in the intended environment and repeat each public journey.

Public submissions fail closed unless the explicit gate, MongoDB, and Resend are ready. Contact and volunteer submissions additionally require the monitored notification address. Production does not acknowledge a public submission that was accepted only into process memory.

## Optional Express server

The Next.js Route Handlers are the primary API surface and are sufficient for Vercel. The standalone Express entry point mirrors health, content, donation status, submissions, checkout initiation, Razorpay verification, and Stripe/Razorpay webhooks. Sanity revalidation remains a Next.js-only route because it uses the Next.js cache API. Use Express only when an operational requirement calls for a separate long-running Node process, a private network adapter, or an independently scaled API.

Run it with `npm run server` and request `http://localhost:4000/api/health` by default. The adapter uses Helmet, bounded JSON/raw parsers, exact-origin CORS derived from `NEXT_PUBLIC_SITE_URL`, request IDs, rate limits, and graceful signal handling. In production, use a separate process manager/container, terminate TLS at a trusted proxy, set `PORT`, forward request IDs, expose only required routes, and give it the same validated environment. Do not deploy a second public write API unless authentication, CORS, rate limiting, logging, health checks, and ownership are equivalent to the Next.js endpoints.

## Switching from demo to live

1. Connect and test MongoDB first; the Mongo-backed atomic limiter must also operate successfully.
2. Configure and test Resend plus the monitored notification mailbox, then enable `PUBLIC_SUBMISSIONS_ENABLED` only for the approved tier.
3. Add one payment provider at a time in a non-production environment while `DONATIONS_ENABLED=false`.
4. Verify `/api/health?deep=true`, webhook behavior, and provider-specific controlled journeys before enabling the donation gate.
5. Confirm all demonstration content has been verified or removed.
6. Set `NEXT_PUBLIC_CONTENT_VERIFIED=true` only after that approval; otherwise Production, Preview, and local production builds fail closed on draft editorial routes.
7. Set `DEMO_MODE=false` explicitly in Production.
8. Promote matching live Clerk keys, review `ADMIN_USER_IDS`, and retest email/password signup in a clean browser session.
9. Set `DONATIONS_ENABLED=true` only after payment launch approval.
10. Promote only the credentials and gates intended for Production; never copy the entire Preview environment wholesale.

Donation intents never fall back to process memory. Production submissions and rate limiting also fail closed when durable MongoDB is unavailable. Payment readiness rejects test-mode Stripe or Razorpay keys, and `/api/health?deep=true` returns a failing status when required production storage is unavailable.
