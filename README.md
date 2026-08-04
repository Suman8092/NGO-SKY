# Ashaaya Foundation

A premium, accessible NGO platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, MongoDB, Sanity, Clerk, Stripe, Razorpay, and Resend. The application combines an editorial marketing experience with validated submission APIs, donation orchestration, signed payment webhooks, and an explicit no-side-effect demo mode.

> **Content and launch status:** The names, registration details, impact figures, campaigns, people, partner organisations, testimonials, awards, addresses, and financial claims in the bundled content are demonstration data. They must be verified and approved by the real organisation before the site is made public or accepts money.

## Quick start

Requirements: Node.js 22.12 or newer and npm 10 or newer.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The example environment intentionally starts in `DEMO_MODE=true`: forms use ephemeral in-process storage, email is skipped, CMS reads are disabled, and payment gateways are never called. See [setup and integrations](docs/setup-and-integrations.md) before enabling live mode.

## What is included

| Area                 | Current implementation                                                                                                                                    | Production boundary                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public experience    | Responsive App Router pages, light/dark themes, premium motion, accessible navigation, campaign/program/story/event content, forms, and donation journeys | Verify every route, link, claim, image licence, and policy with the organisation                                               |
| Content              | Typed local source in `src/content/site.ts`; read-only Sanity adapter and Studio schemas                                                                  | Publish reviewed Sanity documents; decide whether each page reads local, CMS, or merged content                                |
| Submissions          | Contact, newsletter, and volunteer APIs with Zod validation, honeypots, request IDs, rate limits, MongoDB persistence, and optional Resend delivery       | Add retention/deletion procedures, consent records, abuse monitoring, and a shared rate-limit store                            |
| Donations            | Idempotent donation intent records, Stripe Checkout, Razorpay orders, client verification, and signed provider webhooks                                   | Complete provider onboarding, tax/legal review, webhook replay tests, reconciliation, refunds, receipts, and incident runbooks |
| Authentication       | Clerk sign-in/up, provider, and middleware protection for `/dashboard` and `/admin` when both keys exist                                                  | Authentication is not admin authorization; enforce roles and object ownership before connecting private data or mutations      |
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

1. Demonstration claims and identities have been replaced or verified in writing.
2. `DEMO_MODE=false`, MongoDB is durable and backed up, and `/api/health?deep=true` reports live dependencies as expected.
3. Stripe and/or Razorpay live-mode webhooks pass signature and replay tests on the production hostname.
4. Privacy, terms, safeguarding, refund, donation, tax, consent, and data-retention policies have legal approval.
5. Both Clerk keys are present, protected routes enforce roles and object ownership on the server, and the synthetic dashboards are not connected to private data until those checks pass.
6. The complete `npm run check` suite, critical Playwright journeys, accessibility audit, and production Lighthouse run pass.
7. Monitoring, alerting, reconciliation ownership, and rollback procedures are assigned to named operators.

## Licence and governance

No open-source licence is declared in this repository. Treat the code, brand assets, and content as private unless the owner states otherwise. Operational access should follow least privilege, with production credentials stored only in the deployment platform and provider vaults—not in source control, screenshots, issue descriptions, or client-side environment variables.
