# Production deployment, security, and operations

## Environment strategy

Maintain at least three isolated tiers:

| Tier            | Content and data                                                  | Provider mode                                           | Public access                  |
| --------------- | ----------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------ |
| Local           | Bundled demo or development dataset; local/non-production MongoDB | Demo or test keys only                                  | Developer machine              |
| Preview/Staging | Non-production Sanity dataset and MongoDB database                | Test/sandbox accounts; email limited to team recipients | Deployment protection required |
| Production      | Approved production content and durable production database       | Live keys and verified webhooks                         | Canonical public domain        |

Never share databases, datasets, webhook endpoints, or signing secrets between tiers. Vercel environment scoping should be reviewed variable by variable; Preview must not inherit live payment/email credentials.

## Vercel deployment

The Next.js application is the primary Vercel deployable.

1. Import the repository into a Vercel project and keep the repository root as the project root.
2. Select the Next.js framework preset and Node.js 22.12 or newer. Use `npm install` and `npm run build` unless the lockfile policy specifies stricter commands.
3. Add safe Preview variables first: `DEMO_MODE=true` or isolated MongoDB plus provider test keys. Apply deployment protection to previews.
4. Deploy Preview and run the full quality gate against the generated URL.
5. Add Production variables individually from an approved secret inventory. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin and `DEMO_MODE=false` only after live readiness is signed off.
6. Attach and verify the production domain, canonical `www`/apex redirect, DNS, and TLS.
7. Register provider webhooks against the stable production URL after the domain is final. Store the endpoint-specific signing secrets in Production only.
8. Trigger a new production deployment after changing any build-time `NEXT_PUBLIC_` value.
9. Validate `/api/health` and `/api/health?deep=true`, a Sanity read, each submission flow, and controlled payment journeys.
10. Enable observability and alerts before announcing launch. Keep the last known-good deployment ready for immediate rollback.

Place serverless execution close to MongoDB where practical and measure the effect on the actual donor regions. A region change can improve database latency while worsening public API latency elsewhere, so use field data.

### Deploying Sanity Studio

Studio can be deployed with Sanity's hosting or as a separately protected application. Do not expose it at the public site merely for convenience.

1. Install the locked dependencies and confirm the Studio uses the reviewed Sanity version.
2. From `sanity/`, run `npx sanity build` with the intended project and dataset identifiers.
3. Restrict project membership and dataset roles. Editors should not receive administrator permissions.
4. Configure exact CORS origins and test login, draft, validation, publish, and rollback behavior.
5. Keep operational and participant-sensitive data outside the Studio.

### Optional Express deployment

Do not deploy the Express process to Vercel as a second copy of the same public API. If a separate Node service is required, package `server/index.ts` for a container/process platform with health probes, graceful shutdown, bounded resources, TLS proxying, central logs, and an independent deployment pipeline. Allow only the required application origins; do not use permissive production CORS.

## Responsible demo mode

Demo mode is an explicit safety feature, not an error-masking feature.

When `DEMO_MODE=true`:

- configured MongoDB, Sanity, Stripe, Razorpay, and Resend values are treated as disabled by integration readiness checks;
- submissions and donation intents are stored only in process memory;
- responses expose `mode: "demo"` or `persistence: "memory"` metadata;
- emails are skipped;
- payment initiation returns an unavailable reason and no provider call is made;
- CMS collection reads return an empty demo source rather than fabricated CMS records.

When MongoDB is missing with `DEMO_MODE=false`, writes still fall back to memory and payments remain unavailable. Therefore the boolean alone does not prove live readiness; deep health, an integration test, and provider dashboards must agree.

Presentation rules for demo environments:

- show a persistent, unambiguous “demonstration—no payment will be taken” message in donation and admin experiences;
- never label a demo intent paid, receipted, tax-deductible, emailed, synced, or stored permanently;
- do not collect real tax IDs, medical details, identity documents, or personal narratives during demos;
- use synthetic email addresses and names in review sessions;
- keep dashboard/admin content explicitly synthetic; with either Clerk key missing, the middleware permits those preview routes;
- protect public preview URLs and periodically restart/clear preview instances;
- never copy demo records into production or use synthetic impact metrics in external communications.

Production startup and release automation should fail closed if demo mode, memory persistence, invalid environment fields, missing Clerk keys while dashboard routes exist, or a test-mode payment account is detected.

## Security baseline

### Secrets and access

- Store secrets in Vercel/provider secret stores and developer-specific `.env.local` files; never commit or paste them into logs, tickets, analytics, or screenshots.
- Give MongoDB, Sanity, Resend, Stripe, Razorpay, and Clerk credentials the minimum role and environment scope.
- Require MFA for source control, Vercel, CMS, payment, database, identity, DNS, and email providers.
- Maintain an access register and remove leavers immediately. Review privileged access at least quarterly.
- Rotate credentials after suspected exposure and on an established schedule; test dual-key rotation where supported.

### Application boundary

- Preserve Zod validation, strict object schemas, bounded request bodies, consent literals, and honeypots on all public mutations.
- Replace the in-memory IP limiter with a shared atomic limiter or platform/WAF policy for horizontally scaled production traffic.
- Trust forwarding headers only from the deployment proxy. Directly exposed Express servers need explicit trusted-proxy configuration.
- Add server-side Clerk authentication and object-level authorization before any account/admin/private endpoint exists.
- If cookie-authenticated mutations are added, validate origin and anti-CSRF tokens; JSON content type alone is not a complete CSRF design.
- Return stable public errors and request IDs. Keep payloads, personal information, connection strings, provider responses, and raw exceptions out of logs.
- Sanitize any future rich content renderer. Sanity Portable Text should be mapped to an allowlisted component set rather than emitted as arbitrary HTML.

### Browser policy and headers

The current Next.js configuration sets `nosniff`, frame protection, a strict-origin referrer policy, and a restrictive permissions policy. Before launch, test and add:

- a nonce- or hash-based Content Security Policy that includes only the exact Clerk/payment/analytics/media endpoints in use;
- `Strict-Transport-Security` on the final HTTPS production domain after subdomain implications are understood;
- a deliberate frame policy for payment hand-offs and Studio isolation;
- `frame-ancestors`, `form-action`, `connect-src`, `img-src`, `media-src`, and `object-src 'none'` directives;
- cookie `Secure`, `HttpOnly`, and appropriate `SameSite` attributes where cookies are introduced.

Roll CSP out in report-only mode first, collect violations without personal data, then enforce it. Do not weaken the policy globally to accommodate one unreviewed script.

### Payments

- Require MongoDB durability before checkout and store currency amounts as integer minor units.
- Verify webhook signatures against the untouched raw body and reject missing/invalid signatures.
- Use HTTPS provider-hosted checkout where possible and never handle card details directly.
- Persist provider event IDs and a payment-status audit trail as throughput grows, enabling deterministic replay and duplicate rejection.
- Treat browser success pages as informational until the signed webhook confirms `paid`.
- Reconcile daily during launch and define owners for exceptions, refunds, disputes, receipt reissue, and settlement differences.
- Never log donor tax identifiers or secrets. Restrict finance exports, watermark where appropriate, and audit access.

### Privacy and safeguarding

- Publish a data inventory and purpose/retention schedule for contacts, subscriptions, volunteer applications, donors, accounts, analytics, and CMS content.
- Collect only fields with a defined operational use. Consent must be specific and withdrawal routes must work.
- Encrypt data in transit and at rest, restrict production exports, and test deletion/anonymisation procedures including backups and vendors.
- Keep participant consent records, safeguarding cases, identity documents, and health information out of public content systems.
- Complete a privacy/security review of analytics, maps, video, chat, push notifications, and AI features before enabling them.

### Supply chain

- Use the committed lockfile in CI and require review for dependency changes.
- Run dependency and secret scanning on every pull request and scheduled production branch scans.
- Review transitive packages that execute install scripts or ship browser code.
- Pin CI actions and deployment integrations to reviewed versions.
- Generate and retain an SBOM for releases where governance or funder requirements call for it.

## Observability

Minimum production signals:

| Signal       | Examples                                                                                | Alert direction                                              |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Availability | Homepage, donation page, health endpoint, provider callback reachability                | sustained 5xx, timeout, unhealthy deep probe                 |
| API quality  | request count, status/code, latency, body rejection, rate limit                         | error/latency increase by route and release                  |
| Payments     | intents, checkout starts, paid/failed gap, webhook age, signature failures, settlements | webhook silence, processing backlog, reconciliation mismatch |
| Database     | connection latency, pool pressure, query latency, storage, backup status                | connection failures, slow queries, capacity threshold        |
| Email        | attempted, accepted, bounced, complained, suppressed                                    | unusual failure or complaint rate                            |
| CMS          | fetch latency/error, content age, webhook validation                                    | stale urgent content, fetch failures                         |
| Frontend     | Core Web Vitals, JS errors, route transition failures                                   | regression by route/device/release                           |

Use structured logs with timestamp, environment, release, route, request ID, safe error code, duration, and result. Hashing an identifier does not automatically make analytics collection anonymous; apply retention and access controls.

## Backup, recovery, and continuity

- Enable MongoDB backups and prove restoration into an isolated environment at a scheduled interval.
- Use Sanity history/export appropriate to the content recovery objective.
- Retain provider records and accounting exports according to legal/finance policy.
- Document recovery time and recovery point objectives for public content, submissions, donations, and receipts.
- Maintain a static emergency communication path if the application or CMS is unavailable.
- Keep DNS, domain, source, deployment, and provider recovery access under organisation-controlled accounts.

## Release and rollback

1. Freeze and approve high-risk content changes.
2. Run `npm run check` and critical browser/provider tests against Preview.
3. Review environment diff and database/schema compatibility.
4. Deploy during an owned observation window.
5. Run smoke tests and monitor error, latency, webhook, and conversion signals.
6. If impact is material, roll back the application first. Do not roll back data blindly; use the documented forward/restore procedure.
7. Record the release, verification evidence, incidents, and follow-up owners.

## Production optimization

### Delivery and rendering

- Keep static marketing routes server-rendered or pre-rendered; do not force dynamic rendering for purely editorial pages.
- Cache public Sanity lists with explicit freshness and stale behavior. Keep personal, donation, admin, and health responses `no-store`.
- Dynamically import Three.js, maps, video, complex galleries, and admin visualisations only on routes/sections that use them.
- Do not hydrate entire pages for small interactions. Keep client-provider scope and client component boundaries measurable.
- Prefetch only likely navigation; indiscriminate prefetching wastes mobile bandwidth.

### Media and fonts

- Use responsive `next/image` sizes, accurate dimensions, AVIF/WebP, meaningful priority for only the true largest-contentful image, and lazy loading below the fold.
- Explicitly allowlist final remote image hosts or migrate rights-cleared media to Sanity/local assets.
- Provide compressed posters and user-initiated playback for video. Avoid autoplay downloads on data-saving/reduced-motion preferences.
- Keep the two local font families and limit weights/styles. Subset additional scripts deliberately for multilingual launches.

### Motion and 3D

- Animate transforms and opacity; avoid layout-triggering properties in scroll loops.
- Pause offscreen animation, cap device-pixel ratio for canvases, and dispose Three.js resources.
- Provide a static fallback for reduced motion, low-power devices, unsupported WebGL, and failure states.
- Profile CPU, GPU, memory, and input responsiveness on representative mid-range Android hardware.

### Server and data

- Keep MongoDB pools bounded per serverless instance and monitor aggregate connections across regions.
- Project only required fields, paginate unbounded collections, and verify query indexes with production-like volumes.
- Move global rate limiting and idempotency/event processing to durable shared primitives where necessary.
- Set timeouts and bounded retries for providers; do not retry non-idempotent operations without a stable key.

### Performance budgets

Set route-specific budgets in CI and field monitoring. A useful launch target at the 75th percentile is LCP at or below 2.5 s, INP at or below 200 ms, and CLS at or below 0.1 on mobile and desktop. Also budget transferred JavaScript, image/video bytes, request count, server response time, and long tasks; a Lighthouse score alone is not a service-level objective.
