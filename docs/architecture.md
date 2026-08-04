# Architecture and feature map

## System shape

Ashaaya is a single Next.js application with an optional Express adapter. The browser receives server-rendered App Router pages and selectively hydrated client components. Route Handlers own the public API. Business logic, persistence, provider adapters, and validation are kept outside page components.

```text
src/app                 routes, metadata, errors, and API boundary
src/components          shared UI, page compositions, motion, and forms
src/content/site.ts     typed demonstration/editorial content
src/types/content.ts    content contracts
src/lib/server          server-only environment, HTTP, services, repositories, and providers
src/models              Mongoose documents and indexes
public                  local static assets
sanity                  Studio configuration and editorial schemas
server                  optional Express entry point
tests                   unit/integration and content-integrity tests
```

### Request flow

```text
Route Handler
  -> request ID + client identity
  -> route-specific rate limit
  -> bounded body parsing + Zod schema
  -> service orchestration
       -> repository (MongoDB or memory)
       -> payment/email/CMS adapter when eligible
  -> stable JSON envelope
```

Expected success responses use `{ "ok": true, "data": ..., "meta": ... }`. Expected failures use `{ "ok": false, "error": { "code", "message", "details"? }, "requestId" }`. Internal errors are logged by type and context without serialising raw exceptions, payloads, or secrets.

## Rendering and interaction boundaries

- Prefer Server Components for page structure, content, metadata, and data that does not need browser state.
- Use Client Components only for interaction: forms, theme changes, menus, toasts, motion, cursor treatment, or browser-only APIs.
- `next/font` hosts Inter and Plus Jakarta Sans within the build, avoiding a runtime font request.
- `next/image` is the image delivery boundary. Remote hosts must be explicitly allowed before production content uses them.
- Motion must preserve the same meaning and task completion when reduced motion is requested or JavaScript is delayed.
- `AppProviders` enables Clerk when a publishable key is present. Middleware authenticates dashboard/admin routes only when both Clerk keys exist; the missing-key path intentionally permits synthetic dashboard previews and must never be mistaken for production access control.

## Content architecture

`src/content/site.ts` is the strongly typed bundled source and supplies the complete demonstration experience. It exports individual domains such as brand, navigation, programs, campaigns, stories, events, FAQ, donation copy, and an assembled `siteContent` object.

`GET /api/content` is a separate read adapter for published Sanity documents. It currently supports five collection types and returns an empty demo result when Sanity is not configured. The code does not silently merge Sanity documents into `siteContent`; a page must deliberately choose its source and loading/error behavior. This prevents partial CMS configuration from changing the public narrative unpredictably.

Content relationships are key-based:

- campaigns have stable `id` and `slug` values;
- stories reference a program slug;
- project locations reference one or more program slugs;
- the emergency appeal references a campaign slug;
- admin campaign summaries reference campaign IDs.

The content-integrity test enforces those relationships before a release.

## Persistence and demo mode

Repositories call MongoDB when a valid URI is present and demo mode is off. Otherwise they use a process-local `Map`. Demo identifiers are deterministic hashes of record identity, which makes retries predictable within a process without exposing raw identity fields.

Memory persistence is deliberately constrained:

- it disappears on restart or serverless instance replacement;
- records are not shared across instances or regions;
- email is skipped because staff cannot reliably retrieve the underlying submission;
- payment checkout is unavailable because a durable donation record is required;
- API responses disclose demo/memory mode in metadata.

This fallback is useful for interface review and automated tests. It is not a lightweight production database.

## Payment state model

Donation records progress through `pending`, `processing`, `paid`, `failed`, `refunded`, or `cancelled`.

1. `POST /api/donations` validates donor consent and amount, chooses Stripe or Razorpay, and stores an idempotent intent.
2. Live checkout starts only after a MongoDB record exists and the selected provider is configured.
3. Stripe returns a hosted Checkout URL. Razorpay returns an order ID and the public key ID needed by its browser checkout.
4. A browser return or Razorpay callback is not final evidence of payment.
5. Signed webhooks update the durable record. Status updates guard against a late failure overwriting a paid donation.
6. Finance operations must reconcile application state, provider event history, settlements, refunds, receipts, and the accounting ledger.

Provider idempotency and the database key reduce duplicate-intent risk. A production system should also persist processed webhook event IDs and audit every state transition, especially if throughput or retry complexity grows.

## API map

All mutation bodies are JSON except webhooks, which use their provider's raw signed payload. Normal JSON bodies are limited to 64 KiB; webhook bodies are limited to 1 MiB.

| Method and route                     | Purpose                                                           | Important behavior                                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`                    | Shallow integration/configuration status                          | Add `?deep=true` to ping MongoDB; protect or restrict detailed diagnostics if they become sensitive                   |
| `GET /api/content?type=&limit=`      | Read published CMS collections                                    | Types: `campaigns`, `programs`, `stories`, `posts`, `events`; limit 1–50; Sanity responses carry shared-cache headers |
| `POST /api/contact`                  | Store a consented enquiry                                         | Honeypot, 5 requests per 10 minutes per observed client IP; optional acknowledgement/internal email                   |
| `POST /api/newsletter`               | Create or reactivate a consented subscription                     | Idempotent by normalised email; 10 requests per hour                                                                  |
| `POST /api/volunteer`                | Store an application                                              | Structured availability/skills, 3 requests per hour; optional acknowledgement/internal email                          |
| `POST /api/donations`                | Create an idempotent donation intent and, when eligible, checkout | Amounts 1–10,000,000 with at most two decimals; INR/USD/EUR/GBP; provider rules enforced                              |
| `GET /api/donations/:id`             | Read non-sensitive donation status                                | Accepts MongoDB ObjectId or demo ID; never returns donor identity or provider secrets                                 |
| `POST /api/payments/stripe/checkout` | Retry/start Stripe checkout for an existing record                | Requires durable record assigned to Stripe                                                                            |
| `POST /api/payments/razorpay/order`  | Retry/start Razorpay checkout for an existing record              | Requires durable one-time INR record assigned to Razorpay                                                             |
| `POST /api/payments/razorpay/verify` | Verify browser checkout signature                                 | Moves a matching record to processing; final status waits for webhook                                                 |
| `POST /api/webhooks/stripe`          | Verify and translate Stripe events                                | Uses the exact raw body and `Stripe-Signature`                                                                        |
| `POST /api/webhooks/razorpay`        | Verify and translate Razorpay events                              | Uses the exact raw body and `X-Razorpay-Signature`                                                                    |
| `POST /api/webhooks/sanity`          | Verify content change and request tag revalidation                | Supports campaign, program, success story, post, and event types                                                      |

Unknown JSON fields are rejected by strict submission schemas. Client applications should display the stable public error message and include `requestId` in support reports; they should not infer behavior from HTTP text or expose validation internals unnecessarily.

## Feature map

The distinction between presentation, integration, and operational completeness is intentional.

### Page routes

| Route group             | Included surfaces                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| Core story              | `/`, `/about`, `/programs`, `/impact`, `/stories`, `/events`                                |
| Fundraising             | `/campaigns`, `/campaigns/[slug]`, `/donate`                                                |
| Participation           | `/volunteer`, `/contact`, `/search`                                                         |
| Policy and access       | `/privacy`, `/terms`, `/accessibility`, `/sign-in`, `/sign-up`                              |
| Supporter presentation  | `/dashboard` with synthetic giving, impact, saved-campaign, receipt, and certificate states |
| Operations presentation | `/admin` and `/admin/[section]` with synthetic management and analytics states              |

Navigation/content may reference future or policy-library paths that do not yet have route files. The release link audit must either add an intentional destination or remove/redirect each reference; a content href is not proof that a page exists.

| Capability                                            | Implemented in repository                                                                                 | Required before claiming production completeness                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Brand and marketing system                            | Typed copy, design tokens, themes, imagery, navigation/footer, responsive compositions, motion primitives | Brand/content approval, licensed final media, supported-browser QA                                |
| Programs, campaigns, impact, stories, events, gallery | Rich bundled content and route/page compositions                                                          | CMS source decision, editor workflow, verification dates, archive behavior                        |
| Donation experience                                   | Donation content, validated intents, provider adapters, status endpoint, signed webhooks                  | End-to-end UI/provider QA, receipts/tax process, reconciliation and refunds                       |
| Contact/newsletter/volunteer                          | Validated APIs, persistence abstraction, optional acknowledgements                                        | Connected form QA, retention/deletion, anti-abuse service, operational inbox ownership            |
| Sanity                                                | Read adapter, cache policy, signed webhook, Studio package/configuration and schemas                      | Project/dataset, roles, preview strategy, cache-tag proof, and editorial approval                 |
| Clerk                                                 | Conditional provider, sign-in/up routes, and authentication middleware when both keys exist               | Enforced admin/supporter roles, object-level authorization, account lifecycle, and access tests   |
| Admin/user dashboards                                 | Synthetic presentation routes, non-indexable metadata, and reusable dashboard shell                       | Never treat displayed people, receipts, activity, or metrics as real; add authorized data sources |
| SEO/PWA                                               | Metadata, JSON-LD, sitemap, robots, Open Graph image, manifest                                            | Final domain/content validation, crawl and structured-data checks, real icon/device QA            |
| Accessibility                                         | Semantic/focus foundations, reduced-motion-compatible direction, theme support                            | Manual keyboard and screen-reader testing, automated scans, contrast/zoom/reflow evidence         |
| Observability                                         | Request IDs, safe server error logging, health endpoint                                                   | Central logs/metrics/traces, alerts, redaction tests, synthetic journeys, incident ownership      |
| Optional Express API                                  | Runnable mirror for health/content/submission/donation/payment routes and provider webhooks               | Deploy only if its independent operational need and security parity are established               |

## Design decisions and trade-offs

### Local content plus Sanity

Bundled content guarantees deterministic builds and a complete demo. Sanity enables editorial changes without a code release. Keeping them separate until a page explicitly selects a source avoids accidental mixed truth, but production owners must choose and document precedence.

### Graceful provider absence

Public storytelling remains available if a provider is absent. Write APIs return transparent mode metadata rather than pretending a live side effect occurred. This improves local review but makes a production health gate essential.

### Serverless-safe database connection caching

The Mongoose connection promise is cached on `globalThis` to reduce development hot-reload and warm-instance connection churn. Atlas pool size remains bounded. Capacity planning must still account for the maximum number of concurrent functions and regions.

### In-process rate limiting

The current limiter protects one runtime instance and caps stale bucket accumulation. It does not provide a global quota across Vercel instances. Production mutation routes should use a shared, atomic store or an edge/WAF rate limit, with separate controls for payment webhooks so provider retries are not blocked.

## Extension rules

- Add validation at the public boundary before service logic.
- Keep secrets and provider SDKs in server-only modules.
- Store money in integer minor units; never use floating-point amounts as the ledger value.
- Make external mutations idempotent and retry-safe.
- Authorize the resource, not only the route.
- Preserve raw request bodies for signed webhook verification.
- Add content relationship checks when a new slug/ID reference is introduced.
- Represent an unavailable integration honestly; do not fabricate success states.
