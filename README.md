# Ashaaya Foundation

A premium, accessible NGO platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, MongoDB, Sanity, Clerk, Stripe, Razorpay, and Resend. The application combines an editorial marketing experience with validated submission APIs, donation orchestration, signed payment webhooks, explicit launch gates, and fail-closed production behavior.

> **Content and launch status:** The names, registration details, impact figures, campaigns, people, partner organisations, testimonials, awards, addresses, and financial claims in the bundled content are demonstration data. They must be verified and approved by the real organisation before the site is made public or accepts money.

## Quick start

Requirements: Node.js 22.12 or newer and npm 10 or newer.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The example environment intentionally starts with `DEMO_MODE=true`, `PUBLIC_SUBMISSIONS_ENABLED=false`, and `DONATIONS_ENABLED=false`. Public forms and online checkout stay unavailable, CMS integration reads are disabled, and payment/email providers are not called. See [setup and integrations](docs/setup-and-integrations.md) before enabling a connected workflow.

## What is included

| Area                 | Current implementation                                                                                                                                    | Production boundary                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public experience    | Responsive App Router pages, light/dark themes, accessible navigation, gated forms, and donation readiness states                                         | Unverified editorial routes fail closed until `NEXT_PUBLIC_CONTENT_VERIFIED=true` after written approval                       |
| Content              | Typed local source in `src/content/site.ts`; read-only Sanity adapter and Studio schemas                                                                  | Publish only reviewed names, claims, documents, and rights-cleared media                                                        |
| Submissions          | Explicit `PUBLIC_SUBMISSIONS_ENABLED` gate, Zod validation, MongoDB records, Resend delivery, monitored notifications, and Mongo-backed atomic rate limits | Approve retention/deletion, consent, abuse-response, mailbox ownership, and operational response procedures                    |
| Donations            | Explicit `DONATIONS_ENABLED` gate, MongoDB-only intents, Stripe/Razorpay checkout, client verification, and signed webhooks                                | Complete provider onboarding, legal review, webhook replay tests, reconciliation, refunds, receipts, and incident runbooks     |
| Authentication       | Clerk sign-in/up, protected `/dashboard`, and a fail-closed `ADMIN_USER_IDS` allowlist for `/admin`; dashboards contain truthful empty states              | Use matching live Clerk keys in Production, MFA, server-side ownership checks, and least-privilege operator access             |
| SEO and PWA metadata | Metadata, canonical base, Open Graph image, JSON-LD, robots, sitemap, and web manifest                                                                    | Replace the canonical domain and re-run crawl, structured-data, and social-card validation                                     |
| Operational modes    | Deliberate demo/live behavior plus shallow/deep health reporting                                                                                          | Production must explicitly set live credentials and pass the deployment gate in the operations guide                           |

## Architecture at a glance

```text
Browser
  -> Next.js App Router pages and client interactions
  -> /api routes (validation, rate limiting, consistent JSON errors)
       -> service layer
            -> MongoDB repositories
            -> Stripe / Razorpay
            -> Resend
            -> Sanity Content Lake

Optional Express process
  -> health and API adapter when a separate Node service is operationally required
```

The Next.js application is the primary deployable. Server-only modules live under `src/lib/server`, Mongoose models under `src/models`, content contracts under `src/types`, and the editorial source under `src/content`. See [architecture](docs/architecture.md) for request flows, API routes, and design decisions.

## Commands

| Command                | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start Next.js development mode                      |
| `npm run build`        | Create a production build                           |
| `npm run start`        | Serve the production Next.js build                  |
| `npm run typecheck`    | Run strict TypeScript checks                        |
| `npm run lint`         | Run ESLint with zero warnings allowed               |
| `npm test`             | Run Vitest once                                     |
| `npm run test:watch`   | Run Vitest in watch mode                            |
| `npm run test:e2e`     | Run Playwright tests                                |
| `npm run check`        | Typecheck, lint, unit test, and production build    |
| `npm run server`       | Start the optional standalone Express API on `PORT` |
| `npm run format:check` | Check Prettier formatting                           |

Sanity Studio source is under `sanity/`. From that directory, run `npx sanity dev` or `npx sanity build` after configuring its environment.

## Documentation

- [Setup and provider integrations](docs/setup-and-integrations.md)
- [Architecture and feature map](docs/architecture.md)
- [Content model and Sanity workflow](docs/content-and-sanity.md)
- [Production, deployment, security, and operations](docs/production-operations.md)
- [Testing, SEO, accessibility, and performance checklists](docs/quality-checklists.md)

## Production gate

Do not enable donations merely because a provider key is available. A launch owner must confirm all of the following:

1. Demonstration claims and identities have been replaced or verified in writing before `NEXT_PUBLIC_CONTENT_VERIFIED=true` is promoted.
2. `DEMO_MODE=false`, MongoDB is durable and backed up, and `/api/health?deep=true` reports the intended live dependencies.
3. Keep `PUBLIC_SUBMISSIONS_ENABLED=false` until MongoDB, a verified Resend sender, and the monitored notification mailbox and response workflow are proven; enable it only after that sign-off.
4. Keep `DONATIONS_ENABLED=false` until the required live provider, exact production webhook, HTTPS return origin, finance reconciliation, and legal/tax/refund workflow pass controlled tests.
5. Privacy, terms, safeguarding, consent, and data-retention policies have legal approval.
6. Matching production Clerk `pk_live_` and `sk_live_` keys are present, `ADMIN_USER_IDS` contains only approved operators, and any account-level records enforce server-side ownership.
7. Prefer email/password signup. Keep Clerk phone signup disabled unless the SMS plan and intended country—including India—are enabled and tested.
8. The complete `npm run check` suite, critical Playwright journeys, accessibility audit, and production Lighthouse run pass.
9. Monitoring, alerting, submission response, reconciliation, and rollback responsibilities are assigned to named operators.

## Licence and governance

No open-source licence is declared in this repository. Treat the code, brand assets, and content as private unless the owner states otherwise. Operational access should follow least privilege, with production credentials stored only in the deployment platform and provider vaults—not in source control, screenshots, issue descriptions, or client-side environment variables.
