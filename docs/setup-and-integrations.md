# Setup and provider integrations

This guide covers a safe local start and the deliberate transition to connected services. Configure one environment per deployment tier. Never reuse production keys in local development or preview deployments.

## Local setup

1. Install Node.js 22.12 or newer.
2. Run `npm install` from the repository root.
3. Copy `.env.example` to `.env.local`.
4. Keep `DEMO_MODE=true` for the first run.
5. Run `npm run dev` and open `http://localhost:3000`.
6. Run `npm run typecheck`, `npm run lint`, and `npm test` before connecting providers.

The environment parser treats empty optional values as absent. An invalid non-empty value is excluded from the parsed configuration and is reported by `/api/health`; it is not silently used.

## Environment reference

| Variable                            | Exposure                        | Required when                         | Meaning                                                                                     |
| ----------------------------------- | ------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `NODE_ENV`                          | Server                          | Set by runtime                        | `development`, `test`, or `production`; normally managed by Next.js/Vercel                  |
| `DEMO_MODE`                         | Server                          | Always recommended                    | When true, explicitly disables MongoDB, payments, Resend, and Sanity integration checks     |
| `NEXT_PUBLIC_SITE_URL`              | Browser and server              | All environments                      | Absolute origin used for canonical metadata and Stripe return URLs; no trailing path        |
| `MONGODB_URI`                       | Secret                          | Live persistence                      | MongoDB or Atlas connection URI                                                             |
| `MONGODB_DB_NAME`                   | Server                          | Live persistence                      | Database name; defaults to `ashaaya-foundation`                                             |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Browser                         | Clerk UI/session provider             | Public Clerk instance key; its presence enables `ClerkProvider`                             |
| `CLERK_SECRET_KEY`                  | Secret                          | Protected dashboard/admin routes      | Clerk backend key; together with the publishable key it activates authentication middleware |
| `STRIPE_SECRET_KEY`                 | Secret                          | Stripe Checkout                       | Stripe test/live secret key beginning with `sk_`                                            |
| `STRIPE_WEBHOOK_SECRET`             | Secret                          | Stripe status updates                 | Signing secret beginning with `whsec_` for the exact deployed webhook endpoint              |
| `RAZORPAY_KEY_ID`                   | Server response-safe identifier | Razorpay checkout                     | Razorpay test/live key ID beginning with `rzp_`                                             |
| `RAZORPAY_KEY_SECRET`               | Secret                          | Razorpay checkout                     | Secret paired with the key ID; used for order creation and checkout signature verification  |
| `RAZORPAY_WEBHOOK_SECRET`           | Secret                          | Razorpay status updates               | Independently chosen webhook signing secret                                                 |
| `RESEND_API_KEY`                    | Secret                          | Transactional mail                    | Resend API key beginning with `re_`                                                         |
| `RESEND_FROM_EMAIL`                 | Server                          | Transactional mail                    | Verified sender, such as `Ashaaya Foundation <giving@example.org>`                          |
| `CONTACT_NOTIFICATION_EMAIL`        | Server                          | Internal contact/volunteer alerts     | Valid monitored recipient address                                                           |
| `SANITY_PROJECT_ID`                 | Server identifier               | Server-side Sanity reads              | Preferred project identifier                                                                |
| `SANITY_DATASET`                    | Server identifier               | Server-side Sanity reads              | Preferred dataset name, commonly `production`                                               |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`     | Browser identifier              | Studio/browser clients                | Public project identifier; never place a token in a public variable                         |
| `NEXT_PUBLIC_SANITY_DATASET`        | Browser identifier              | Studio/browser clients                | Public dataset name                                                                         |
| `SANITY_API_VERSION`                | Server                          | Sanity reads                          | Pinned API date in `YYYY-MM-DD` format                                                      |
| `SANITY_API_TOKEN`                  | Secret                          | Private dataset or authenticated read | Least-privilege, read-only Content Lake token                                               |
| `SANITY_REVALIDATE_SECRET`          | Secret                          | Sanity webhook                        | Random value of at least 16 characters used to validate signed revalidation requests        |
| `SANITY_STUDIO_PROJECT_ID`          | Studio identifier               | Local/deployed Studio                 | Project identifier read by the Studio configuration                                         |
| `SANITY_STUDIO_DATASET`             | Studio identifier               | Local/deployed Studio                 | Dataset read by the Studio configuration                                                    |
| `PORT`                              | Server                          | Optional Express process              | Listener port, default `4000`                                                               |

Values prefixed with `NEXT_PUBLIC_` are shipped to the browser. They must never contain credentials, tokens, webhook secrets, connection strings, personal data, or internal-only endpoints.

## MongoDB

1. Create separate Atlas projects or clusters for development/staging and production.
2. Create a database user scoped to the Ashaaya database. Do not use an Atlas owner credential in the application.
3. Restrict network access using Vercel's supported connectivity pattern, private networking, or the narrowest practical access list. Avoid a permanent unrestricted IP rule.
4. Set `MONGODB_URI` and `MONGODB_DB_NAME` in the target environment.
5. Keep TLS enabled and require authentication. Configure automated backups, point-in-time recovery where available, and a tested restore procedure.
6. Start the application and request `/api/health?deep=true`. The database integration should report `connected`.
7. Verify the declared indexes for donations, contacts, subscriptions, and volunteer applications in production. Index creation should be an explicit release step rather than an unobserved first-request side effect.

The persistence layer hashes client IPs and donor tax identifiers before storage and exposes only the final four tax-ID characters on the model. That reduces risk but does not remove privacy, retention, access-control, or breach-notification obligations.

## Sanity CMS

The repository includes Studio configuration and schemas in `sanity/`. The runtime read adapter supports `campaign`, `program`, `successStory`, `post`, and `event` documents.

1. Create or select a Sanity project and create distinct datasets for non-production and production content.
2. Populate `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, and the corresponding server/public identifiers. Make the Studio pair available to the Sanity process through the deployment environment, the current shell, or a gitignored `sanity/.env.local`; do not assume that the root `.env.local` is loaded after changing directories.
3. From `sanity/`, run `npx sanity dev`. Review validation rules and editorial roles before inviting editors.
4. For a public dataset, omit `SANITY_API_TOKEN` unless authenticated perspective or private drafts are explicitly required. For a private dataset, create a read-only token and store it only server-side.
5. Add local and deployed Studio/application origins to Sanity CORS. Allow credentials only for Studio origins that need authenticated editing.
6. Create a signed Sanity webhook targeting `https://<site>/api/webhooks/sanity`, use the same value as `SANITY_REVALIDATE_SECRET`, and trigger it for create/update/delete events on the supported document types.
7. Publish sample documents, then verify `/api/content?type=campaigns&limit=3` returns `meta.source: "sanity"`.

Publishing in Sanity does not automatically prove that content is accurate or safe. Use the approval and dignity checks in [content and Sanity](content-and-sanity.md).

## Clerk

Clerk is optional in the public presentation layer. Providing `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` wraps the application in `ClerkProvider`; providing both Clerk keys activates middleware authentication for `/dashboard` and `/admin`. With either key missing, those synthetic dashboards remain open for demonstration. This conditional behavior is not production authorization by itself.

1. Create separate Clerk applications for development and production.
2. Add the exact local, preview, and production origins and redirect URLs in Clerk.
3. Set both the publishable and secret key in connected environments. Production must not rely on the missing-key demo fallback.
4. Define a small role model such as donor, editor, operations, finance, and administrator. Store authoritative roles in Clerk metadata or the application's database, not in client-controlled state.
5. Keep middleware authentication and enforce authorization inside every protected Server Component, Route Handler, server action, and Express endpoint. A hidden button, authenticated session, or client redirect is not proof of an administrator role.
6. Require stronger controls for finance and administration: MFA, short sessions, audit records, least privilege, and immediate offboarding.

The current dashboard values, names, receipts, certificates, activity, and admin metrics are synthetic presentation data. Do not launch or connect account, donation-history, receipt, certificate, volunteer-dashboard, or admin data until ownership/role checks and data-isolation tests exist.

## Stripe

1. Complete account, charity, tax, settlement, statement-descriptor, and refund configuration with the organisation's finance owner.
2. Start with Stripe test keys. Set `STRIPE_SECRET_KEY`, a test `NEXT_PUBLIC_SITE_URL`, and live MongoDB-style persistence in a non-production database. Checkout is intentionally unavailable with memory persistence.
3. Register `POST /api/webhooks/stripe` and subscribe to the events handled by the adapter: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, and `charge.refunded`.
4. Put the endpoint-specific signing secret in `STRIPE_WEBHOOK_SECRET`. Preserve the raw body through any proxy; signature verification depends on exact bytes.
5. Exercise one-time and recurring Checkout, success/cancel returns, delayed payment, failure, duplicate delivery, out-of-order delivery, and refund paths.
6. Treat the signed webhook—not the browser redirect—as the source of payment truth. Reconcile provider settlements against MongoDB and accounting records.
7. Replace test keys with live keys only in Production and repeat a low-value controlled transaction with finance approval.

## Razorpay

1. Complete Razorpay activation, settlement, receipt, tax, and refund configuration.
2. Configure test `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. This implementation accepts Razorpay only for one-time INR donations; recurring and non-INR donations route to Stripe.
3. Register `POST /api/webhooks/razorpay` for `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`, and `refund.processed`.
4. Set an independent webhook secret in both Razorpay and `RAZORPAY_WEBHOOK_SECRET`.
5. Verify the browser callback through `POST /api/payments/razorpay/verify`; keep the record in `processing` until the signed webhook confirms the final state.
6. Test duplicate/out-of-order webhooks, abandoned orders, partial operational failures, full refunds, settlement reconciliation, and a controlled live transaction.

The key ID may be returned to the browser. The key secret and webhook secret must remain server-only.

## Resend

1. Add and verify an organisation-controlled sending domain.
2. Publish the required SPF and DKIM records and align DMARC with the organisation's policy.
3. Create a narrowly scoped API key and set `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to a verified sender and `CONTACT_NOTIFICATION_EMAIL` to a monitored team mailbox.
5. Test contact acknowledgements, internal contact notifications, newsletter welcome messages, and volunteer acknowledgements in a non-production audience.
6. Configure bounce/complaint handling and suppression before broad sending. Honour unsubscribe and deletion requests and document retention.

Email is intentionally skipped when a record is stored only in memory. This avoids sending an acknowledgement for data that operators cannot later retrieve.

## Optional Express server

The Next.js Route Handlers are the primary API surface and are sufficient for Vercel. The standalone Express entry point mirrors health, content, donation status, submissions, checkout initiation, Razorpay verification, and Stripe/Razorpay webhooks. Sanity revalidation remains a Next.js-only route because it uses the Next.js cache API. Use Express only when an operational requirement calls for a separate long-running Node process, a private network adapter, or an independently scaled API.

Run it with `npm run server` and request `http://localhost:4000/api/health` by default. The adapter uses Helmet, bounded JSON/raw parsers, exact-origin CORS derived from `NEXT_PUBLIC_SITE_URL`, request IDs, rate limits, and graceful signal handling. In production, use a separate process manager/container, terminate TLS at a trusted proxy, set `PORT`, forward request IDs, expose only required routes, and give it the same validated environment. Do not deploy a second public write API unless authentication, CORS, rate limiting, logging, health checks, and ownership are equivalent to the Next.js endpoints.

## Switching from demo to live

1. Connect and test MongoDB first.
2. Add one provider at a time in a non-production environment.
3. Verify `/api/health?deep=true` and provider-specific test journeys.
4. Confirm all demonstration content has been verified or removed.
5. Set `DEMO_MODE=false` explicitly in Production.
6. Promote only the credentials intended for Production; never copy the entire Preview environment wholesale.
