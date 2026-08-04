# Content model and Sanity workflow

NGO content can affect dignity, safety, tax decisions, and donor trust. The content system therefore treats verification and consent as release requirements, not optional editorial polish.

## Sources of content

### Bundled TypeScript content

`src/content/site.ts` is the complete typed source used for the demonstration build. Its shape is declared in `src/types/content.ts`. Individual named exports feed focused components, while the `siteContent` export assembles the whole graph.

Use bundled content when a release needs deterministic, code-reviewed copy. Any change should pass:

1. TypeScript compilation.
2. `tests/content-integrity.test.ts` relationship and data checks.
3. Editorial, evidence, safeguarding, and legal review appropriate to the claim.
4. Visual review at every responsive breakpoint and in both themes.

### Sanity content

Sanity is an optional published-content source exposed through `GET /api/content`. Studio schemas live under `sanity/schemaTypes`. The API reads published documents only and returns `meta.source` as either `sanity` or `demo`.

The runtime does not currently merge CMS records into the bundled `siteContent` graph. When connecting a page, define one explicit policy:

- **CMS authoritative:** render Sanity data and a deliberate unavailable/empty state.
- **Bundled authoritative:** use local content and reserve Sanity for a separate feed.
- **Reviewed fallback:** use Sanity when it succeeds and a versioned bundled snapshot when it does not, while exposing source/age to operators.

Avoid field-by-field merging. It can combine totals, dates, images, and narrative from different review cycles.

## Sanity document model

| Type           | Purpose                                            | Runtime list fields                                                                   | Important editorial controls                                                            |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `program`      | Long-running area of work                          | title, slug, summary, icon, image URL, impact                                         | ordered display, verified date, structured impact highlights                            |
| `campaign`     | Time-bound fundraising proposition                 | title, slug, summary, category, goal, raised, currency, deadline, image URL, featured | allocation totals 100%, evidence reference, status, visibility, figures verified date   |
| `successStory` | Consented participant-centred impact narrative     | title, slug, excerpt, published name, location, date, image/video URLs                | verified publication consent, opaque consent-system reference, transcript, privacy note |
| `post`         | Research, field note, perspective, or news article | title, slug, excerpt, date, image URL, author, categories                             | author/category references, review date, structured body                                |
| `event`        | Public gathering or online event                   | title, slug, summary, start/end, location, image URL, registration URL                | end-after-start validation, timezone, access information, cancellation state            |
| `author`       | Public author identity                             | referenced by posts                                                                   | publishable role, biography, consented portrait                                         |
| `category`     | Controlled article taxonomy                        | referenced by posts                                                                   | stable slug and concise definition                                                      |
| `seo`          | Reusable search/share settings                     | connected by documents                                                                | bounded title/description, alt text, explicit no-index control                          |

Sanity stores editorial content and media, not donation ledgers, donor profiles, signed consent forms, medical details, background-check material, payment events, tax identifiers, or volunteer case notes. Use opaque references to restricted systems where an audit link is necessary.

## Field semantics

- A slug is a stable public identifier. Changing it requires a redirect and link/canonical review.
- Campaign `goal` and `raised` are entered in major currency units for editorial display. Payment and accounting records use integer minor units in MongoDB/provider systems.
- `raised` is a verified reporting figure, not an incrementing client-side counter. Document its source and reconciliation time.
- An impact figure needs a definition, period, geography, source, owner, and last verification date.
- Image alt text describes the image's purpose in context; the credit field records attribution and is not a substitute.
- A story's published name may be an approved pseudonym. Never infer or disclose a participant's legal identity.
- Event accessibility fields must state confirmed facilities and a staffed accommodation contact route; aspirational claims are unsafe.
- SEO overrides should be specific to the page. If an editor leaves them blank, the application must provide a reviewed fallback rather than an empty tag.

## Editorial workflow

Use a role-based sequence with named reviewers:

1. **Draft:** The editor records source links, evidence reference, image rights, dates, and the intended audience.
2. **Program review:** A field/program owner confirms context, terminology, geography, outcome definition, and whether the copy overstates causality.
3. **Safeguarding and consent review:** Required for participant names, images, quotes, video, children, health, crisis, violence, location risk, or other sensitive details.
4. **Finance review:** Required for fundraising goals, amount raised, allocation, tax language, cost claims, program-spend ratios, and donation examples.
5. **Legal/brand review:** Required for registration, awards, partner logos, policy language, terms, privacy, refunds, and externally supplied intellectual property.
6. **Accessibility and SEO review:** Confirm heading/link meaning, text alternatives, transcript/captions, metadata, canonical intent, and share image.
7. **Publish:** Record reviewer names and evidence outside public fields; confirm production preview at mobile and desktop sizes.
8. **Post-publish verification:** Check the live URL, cache freshness, analytics/consent behavior, and links. Retain an auditable change record.

High-risk content should use two-person approval. Editors should not be able to approve their own finance or safeguarding claims.

## Dignity and consent standard

- Obtain informed, specific, revocable permission for each channel and content type.
- Provide a meaningful choice that does not affect access to services or benefits.
- Explain likely audience, duration, search visibility, reuse, and withdrawal limits in an understood language.
- Reconfirm consent when context, audience, risk, or intended use changes.
- Use the minimum identifiable detail needed. Generalise locations when disclosure could create harm.
- Never use humiliating framing, staged deprivation, fabricated quotes, or urgency that removes agency.
- Provide transcripts/captions and avoid relying on a participant to retell trauma for promotion.
- Maintain a rapid withdrawal process that covers the CMS, application caches, social channels, email assets, and downstream partners.

The Studio holds only the consent status, last review date, and an opaque reference. The restricted consent system remains authoritative.

## Claims and metrics

For every public metric, keep an internal metric card containing:

- exact definition and unit of analysis;
- numerator, denominator, exclusions, and deduplication rule;
- reporting period and verification timestamp;
- primary source and transformation method;
- geographic/program scope;
- accountable owner and reviewer;
- known limitations and correction history.

Do not combine people reached, services delivered, households, sessions, or estimated indirect reach. Do not label an output as an outcome. Time-stamp progress indicators and state whether provider fees or offline gifts are included.

## Images, video, and documents

1. Store a rights/consent record and expiry outside Sanity.
2. Remove embedded location and device metadata before upload when it could identify participants.
3. Crop without changing the meaning of the scene. Do not use generative edits that imply real events or beneficiaries.
4. Supply contextual alternative text; use empty alt text only when an application image is truly decorative.
5. Caption spoken video, provide a transcript, describe important non-speech audio, and avoid autoplay with sound.
6. Optimise image dimensions/quality before upload. Preserve a rights-cleared archival original separately.
7. Treat PDFs as secondary formats. Provide accessible HTML for essential reports and test tagged PDFs independently.

## CMS caching and revalidation

The content endpoint marks Sanity responses `s-maxage=300, stale-while-revalidate=3600` and demo responses `no-store`. The signed webhook accepts the five supported content types and calls `revalidateTag`.

A page or data fetch must attach the corresponding cache tag for tag revalidation to invalidate it. Verify this behavior in the deployed cache before promising instant publication or withdrawal. For urgent consent withdrawal, use the deployment platform's purge controls or a fresh release if the tagged path is not proven.

## Schema changes

1. Add fields compatibly and keep existing documents readable.
2. Update GROQ projections, runtime types, page fallbacks, fixtures, and integrity tests in the same change.
3. Backfill and validate documents in a non-production dataset.
4. For renames or shape changes, write and rehearse a migration with counts before and after.
5. Deploy reader compatibility before migrating writers; remove obsolete fields only after the rollback window.
6. Record the migration, affected document IDs, reviewer, and recovery plan.

## Launch content audit

- Replace or verify every bundled demonstration identity and claim.
- Confirm legal name, registration identifiers, tax eligibility wording, foreign-contribution route, and official contact details.
- Confirm every partner/award and written permission to display its name or mark.
- Reconcile every campaign amount, deadline, allocation, outcome, and image.
- Reconfirm participant consent, privacy notes, captions, transcripts, and withdrawal contact.
- Replace stock/demo imagery with licensed, contextually honest media or clearly identify illustrative imagery.
- Publish current privacy, terms, safeguarding, donation/refund, grievance, and speak-up policies.
- Test all report downloads and ensure the documents actually exist.
- Remove expired events, emergency language, and stale “live” timestamps.
- Run the content-integrity test and complete a human link/copy proof after the final content freeze.
