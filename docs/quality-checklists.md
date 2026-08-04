# Testing and quality checklists

Quality evidence must come from the production build and representative devices, not only the development server. Record the URL, commit/release, environment, browser/device, date, and result for launch audits.

## Test commands

```powershell
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run format:check
```

`npm run check` runs typecheck, lint, Vitest, and the production build in sequence. Run Playwright separately because provider/browser tests often need an already running environment and controlled credentials.

## Test layers

### Static and content checks

- TypeScript strict mode passes without suppressing new errors.
- ESLint passes with zero warnings.
- Prettier check passes.
- The content-integrity test confirms unique IDs/slugs, valid references, sensible campaign/event numbers, allocation totals, image metadata, dates, and internal links.
- No private key, connection string, donor/participant record, or real production credential appears in the repository or build output.
- No bundled demo claim reaches a production release without verification evidence.

### Unit tests

Prioritise deterministic policy logic:

- Zod boundaries, trimming, amount precision, consent, honeypots, and provider compatibility;
- provider-selection rules and money conversion to minor units;
- webhook event-to-state mapping, signature failure, duplicate delivery, and paid-state protection;
- repository idempotency and status transitions;
- HTML escaping and email delivery summary behavior;
- cache/source behavior for configured, absent, and failing Sanity;
- demo IDs and explicit no-side-effect mode.

Use fixed clocks and provider fixtures. Never call live payment, email, identity, CMS, or database accounts from unit tests.

### Route integration tests

For each API route, cover success plus invalid JSON, wrong content type, oversized body, unknown fields, validation errors, rate limiting, provider absence, repository failure, and stable error envelopes. Assert that support-visible failures contain a request ID and do not leak exceptions or submitted personal data.

Webhook tests must use exact raw fixture bytes and both valid and invalid signatures. Include ignored event types, missing references, out-of-order events, repeat delivery, refunds, and a paid record receiving a late failure.

### Browser journeys

Critical Playwright coverage:

1. Navigate every public header/footer route and verify a single meaningful `h1`, page title, no broken console errors, and a working skip link.
2. Use keyboard-only navigation through the mega menu, theme toggle, accordions, filters, gallery/dialogs, and all forms.
3. Complete contact, newsletter, and volunteer flows in demo and connected staging modes, including inline/server errors and duplicate subscription.
4. Complete donation amount/frequency/provider selection, cancellation, processing, success pending webhook, final confirmation, refresh, and status lookup.
5. Validate reduced motion, light/dark/forced-colors where supported, 200% zoom, mobile reflow, and slow/offline failure states.
6. Verify not-found, global error, loading, empty CMS, stale CMS, and integration-unavailable experiences.
7. Check protected account/admin URLs as signed out, wrong role, correct role, expired session, and direct API caller before enabling those routes.

Run at minimum on current Chromium, Firefox, and WebKit engines plus representative iOS Safari and mid-range Android Chrome devices. Include keyboard and screen-reader manual testing; emulation is not equivalent to hardware.

### Provider acceptance

- MongoDB: connection failure, recovery, unique keys, index use, backup and restore.
- Sanity: public/private dataset, publish/unpublish/delete, webhook signature, cache freshness, consent withdrawal.
- Clerk: sign-in/out, session expiry, MFA, role change, deprovisioning, direct object access.
- Stripe: one-time, monthly, yearly, asynchronous success/failure, duplicate webhook, refund, reconciliation.
- Razorpay: one-time INR, authorised/captured/failed, callback verification, duplicate webhook, refund, reconciliation.
- Resend: sender authentication, acknowledgement, internal notification, bounce, complaint, suppression, unsubscribe/deletion process.

### Non-functional tests

- Load test read routes and submission bursts against staging with synthetic data and provider stubs.
- Test global rate limits across multiple instances after a shared limiter is introduced.
- Scan dependencies, secrets, headers, TLS, and common web vulnerabilities.
- Run Lighthouse in a production build and collect real-user Core Web Vitals.
- Test database restore, application rollback, webhook replay, credential rotation, and provider outage runbooks.

## Test-data rules

- Use reserved provider test modes and clearly synthetic people, addresses, tax identifiers, and email domains.
- Never clone production donor, volunteer, participant, or consent data into Preview.
- Ensure automated email recipients are controlled test inboxes.
- Add a run identifier to synthetic persisted records and remove them according to the staging retention policy.
- Prevent tests from changing provider live mode through environment and account-level guardrails.

## SEO launch checklist

### Crawl and index control

- [ ] `NEXT_PUBLIC_SITE_URL` is the single canonical HTTPS origin.
- [ ] Apex/`www`, HTTP/HTTPS, uppercase, trailing slash, and legacy paths resolve to one intentional URL or redirect.
- [ ] Production `robots.txt` permits intended public routes and blocks nothing solely as a privacy control.
- [ ] Preview/staging uses deployment protection and no-index controls.
- [ ] The sitemap contains canonical, indexable, successful pages only; dynamic campaigns, programs, stories, articles, and events are included when they are truly routed.
- [ ] Removed/renamed slugs have specific permanent redirects; permanently removed content returns 404/410 rather than a soft 404.
- [ ] Search, filter, tracking, and donation-success parameters do not create duplicate indexable URLs.

### Page metadata

- [ ] Every indexable page has a unique, useful title and description aligned with visible content.
- [ ] Canonical links are self-referential unless an approved duplicate-content strategy says otherwise.
- [ ] Open Graph and social-card title, description, URL, and 1200×630 rights-cleared image are verified in platform debuggers.
- [ ] Language is correct; add reciprocal `hreflang` only when fully translated equivalent pages exist.
- [ ] Date metadata distinguishes published and materially modified dates.
- [ ] No demo registration, impact, partner, award, or tax claim remains in metadata or generated images.

### Structured data

- [ ] NGO/Organization JSON-LD contains verified legal name, canonical URL, logo, contacts, area served, and official social profiles.
- [ ] Add BreadcrumbList, Article, Event, and FAQ schema only where the visible page and search-engine policy support it.
- [ ] Donation/campaign markup does not invent ratings, prices, availability, or outcomes.
- [ ] Structured-data validators pass with no misleading or unsupported properties.
- [ ] JSON-LD is serialised safely and never includes untrusted HTML or personal data.

### Content and technical quality

- [ ] Each page has one descriptive primary heading and a logical heading hierarchy.
- [ ] Anchor text is meaningful outside its sentence; internal links connect related programs, campaigns, evidence, and policies.
- [ ] Images have contextual alt text, dimensions, efficient formats, and stable URLs where needed for sharing.
- [ ] Essential copy is present in rendered HTML and does not depend on scrolling or animation to appear.
- [ ] Page errors, empty states, and CMS outages do not return a 200 page that looks like valid missing content.
- [ ] Core Web Vitals are measured by template; mobile performance and layout stability meet the launch budget.
- [ ] Search Console/Bing verification, sitemap submission, crawl monitoring, and correction ownership are configured after launch.

## Accessibility checklist (WCAG 2.2 AA target)

### Structure and navigation

- [ ] `html` language, landmarks, page title, single `main`, and heading hierarchy describe every route.
- [ ] The skip link becomes visible on focus and moves focus to the main content target.
- [ ] Header, mega menu, breadcrumbs, pagination, and footer work with keyboard, touch, speech, and screen readers.
- [ ] Current page/state is programmatically exposed; repeated navigation order remains predictable.
- [ ] Focus is never trapped or lost on route changes, menus, dialogs, lightboxes, toasts, or errors.

### Keyboard and focus

- [ ] Every action works without a pointer; hover-only content has an equivalent focus/touch path.
- [ ] Focus indicators are clearly visible in both themes and are not obscured by sticky UI.
- [ ] Dialogs have an accessible name, initial focus, focus containment, Escape behavior, and focus restoration.
- [ ] Carousels/maps/3D scenes have pause and non-gesture alternatives; arrow-key behavior follows the chosen pattern.
- [ ] Touch targets meet WCAG target-size expectations or documented exceptions and have adequate spacing.

### Visual presentation

- [ ] Text and meaningful icons meet AA contrast in light/dark themes, gradients, glass surfaces, hover/focus/disabled states, and charts.
- [ ] Content reflows at 320 CSS pixels and remains usable at 200% text zoom and 400% browser zoom without two-dimensional scrolling except essential data views.
- [ ] Text spacing overrides do not clip or overlap content.
- [ ] Color, shape, position, animation, and sound are never the only way information or urgency is communicated.
- [ ] Forced-colors/high-contrast mode preserves controls, focus, status, and chart meaning.

### Images, video, maps, and motion

- [ ] Informative images have concise contextual alternatives; decorative images use empty alt attributes.
- [ ] Charts, maps, before/after treatments, and 3D visualisations have equivalent text/table content and keyboard access where interactive.
- [ ] Prerecorded video has accurate captions, transcript, and audio description or equivalent description when visual detail carries meaning.
- [ ] No media autoplays with sound; users can pause moving content lasting more than five seconds.
- [ ] `prefers-reduced-motion` removes non-essential parallax, smooth scrolling, cursor effects, particles, counters, and transitions without hiding content.
- [ ] Flashing content stays below seizure thresholds.

### Forms, donations, and status

- [ ] Every input has a persistent programmatic label, appropriate autocomplete/input mode, instructions, and clearly marked required state.
- [ ] Errors identify the field and remedy in text, are announced, and move/focus users sensibly without erasing valid entries.
- [ ] Consent is unchecked by default, specific, understandable, and not bundled with unrelated purposes.
- [ ] Donation amount, frequency, currency, fees, recurring terms, tax wording, and final status are reviewed before payment.
- [ ] Destructive/financial submissions provide review, correction, duplicate protection, and an accessible confirmation/reference.
- [ ] Loading, success, demo, processing, failure, and unavailable states use appropriate live-region behavior without repeated announcements.
- [ ] Time limits and emergency countdowns can be extended/disabled where required and never manufacture urgency.

### Assistive-technology manual pass

- [ ] NVDA with Firefox or Chrome on Windows.
- [ ] VoiceOver with Safari on macOS and iOS.
- [ ] TalkBack with Chrome on Android.
- [ ] Keyboard-only and switch-like sequential navigation.
- [ ] Voice control for actions identified by visible label.

Automated tools can find only part of the accessibility risk. Track defects by user impact, retest fixes with the affected interaction, and publish a staffed accessibility contact route.

## Performance checklist

- [ ] Test `npm run build` output and production mode, not only hot-reload development.
- [ ] Record per-route JavaScript, CSS, image/video bytes, request count, server response time, LCP, INP, and CLS budgets.
- [ ] Only the true hero/LCP image is high priority; all other media uses correct responsive sizes and lazy loading.
- [ ] Remote media domains are narrowly allowlisted and every asset has known dimensions.
- [ ] Three.js, maps, video, gallery lightboxes, and admin charts are route/viewport loaded with static fallbacks.
- [ ] Scroll/mouse animation work is throttled, transform/opacity based, paused offscreen, and disabled for reduced motion.
- [ ] Server Components remain the default; client bundles contain only interactive code.
- [ ] Public CMS reads have intentional cache lifetime and invalidation; personal/financial responses are never publicly cached.
- [ ] Database queries are indexed/paginated and connection totals stay within Atlas limits at maximum Vercel concurrency.
- [ ] Third-party scripts load only after consent/interaction when appropriate and their availability cannot block navigation or donation clarity.
- [ ] Field Core Web Vitals are segmented by route, device, geography, connection, and release with regression alerts.

## Manifest/configuration follow-ups

These are reported here because the documentation/content work does not modify `package.json` or root test configuration:

1. Consider explicit `studio:dev`, `studio:build`, and `studio:validate` package scripts so contributors and CI do not depend on changing into `sanity/` and remembering raw CLI commands.
2. Expand the existing Playwright projects beyond Chromium/device emulation to real Firefox and WebKit engines, then add provider-specific staging specs before treating `npm run test:e2e` as a release gate.
3. Consider `@axe-core/playwright` for repeatable automated accessibility checks; retain the manual audit regardless.
4. Add bundle analysis only as a controlled development/CI tool if route-level JavaScript budgets cannot be obtained from the existing build output.
