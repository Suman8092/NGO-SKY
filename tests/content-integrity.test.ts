import { describe, expect, it } from "vitest";

import siteContentDefault, {
  about,
  adminSummary,
  articles,
  brand,
  brandValues,
  campaigns,
  donation,
  emergencyAppeal,
  events,
  faqs,
  footerGroups,
  gallery,
  hero,
  impactStats,
  impactStories,
  newsletter,
  offices,
  partners,
  primaryNavigation,
  programs,
  projectLocations,
  recognitions,
  siteContent,
  siteSeo,
  team,
  testimonials,
  timeline,
  trustMarkers,
  volunteer,
} from "@/content/site";

function expectUnique(values: string[], label: string): void {
  const duplicates = values.filter(
    (value, index) => values.indexOf(value) !== index,
  );
  expect(duplicates, `${label} must be unique`).toEqual([]);
}

function expectValidDate(value: string, label: string): void {
  expect(
    Number.isNaN(Date.parse(value)),
    `${label} must be an ISO-compatible date`,
  ).toBe(false);
}

function collectValuesForKeys(
  input: unknown,
  keys: ReadonlySet<string>,
  results: string[] = [],
): string[] {
  if (Array.isArray(input)) {
    input.forEach((item) => collectValuesForKeys(item, keys, results));
    return results;
  }
  if (!input || typeof input !== "object") return results;

  Object.entries(input).forEach(([key, value]) => {
    if (keys.has(key) && typeof value === "string") results.push(value);
    collectValuesForKeys(value, keys, results);
  });
  return results;
}

function collectImageAssets(
  input: unknown,
  results: Array<Record<string, unknown>> = [],
) {
  if (Array.isArray(input)) {
    input.forEach((item) => collectImageAssets(item, results));
    return results;
  }
  if (!input || typeof input !== "object") return results;

  const record = input as Record<string, unknown>;
  if (
    "src" in record &&
    "alt" in record &&
    "width" in record &&
    "height" in record
  ) {
    results.push(record);
  }
  Object.values(record).forEach((value) => collectImageAssets(value, results));
  return results;
}

describe("site content integrity", () => {
  it("assembles every named content domain without divergence", () => {
    expect(siteContentDefault).toBe(siteContent);
    expect(siteContent).toEqual({
      brand,
      seo: siteSeo,
      navigation: primaryNavigation,
      hero,
      stats: impactStats,
      trustMarkers,
      partners,
      about,
      values: brandValues,
      timeline,
      programs,
      campaigns,
      emergencyAppeal,
      stories: impactStories,
      projectLocations,
      gallery,
      events,
      team,
      recognitions,
      testimonials,
      faqs,
      offices,
      donation,
      volunteer,
      articles,
      newsletter,
      footer: footerGroups,
      admin: adminSummary,
    });
  });

  it("retains the complete minimum editorial catalogue", () => {
    expect(programs.length).toBeGreaterThanOrEqual(10);
    expect(campaigns.length).toBeGreaterThanOrEqual(4);
    expect(impactStats.length).toBeGreaterThanOrEqual(7);
    expect(impactStories.length).toBeGreaterThanOrEqual(3);
    expect(events.length).toBeGreaterThan(0);
    expect(faqs.length).toBeGreaterThan(0);
    expect(articles.length).toBeGreaterThan(0);
    expect(brand.name.trim()).not.toHaveLength(0);
    expect(hero.title.trim()).not.toHaveLength(0);
    expect(newsletter.consentLabel.toLowerCase()).toContain("agree");
  });

  it("uses unique stable identifiers", () => {
    expectUnique(
      impactStats.map(({ id }) => id),
      "impact stat IDs",
    );
    expectUnique(
      brandValues.map(({ id }) => id),
      "value IDs",
    );
    expectUnique(
      programs.map(({ slug }) => slug),
      "program slugs",
    );
    expectUnique(
      campaigns.map(({ id }) => id),
      "campaign IDs",
    );
    expectUnique(
      campaigns.map(({ slug }) => slug),
      "campaign slugs",
    );
    expectUnique(
      impactStories.map(({ slug }) => slug),
      "story slugs",
    );
    expectUnique(
      projectLocations.map(({ id }) => id),
      "project location IDs",
    );
    expectUnique(
      gallery.map(({ id }) => id),
      "gallery IDs",
    );
    expectUnique(
      events.map(({ slug }) => slug),
      "event slugs",
    );
    expectUnique(
      team.map(({ name }) => name),
      "team member names",
    );
    expectUnique(
      faqs.map(({ id }) => id),
      "FAQ IDs",
    );
    expectUnique(
      offices.map(({ id }) => id),
      "office IDs",
    );
    expectUnique(
      volunteer.roles.map(({ slug }) => slug),
      "volunteer role slugs",
    );
    expectUnique(
      articles.map(({ slug }) => slug),
      "article slugs",
    );
    expectUnique(
      adminSummary.kpis.map(({ id }) => id),
      "dashboard KPI IDs",
    );
  });

  it("keeps cross-content references resolvable", () => {
    const programSlugs = new Set(programs.map(({ slug }) => slug));
    const campaignSlugs = new Set(campaigns.map(({ slug }) => slug));
    const campaignIds = new Set(campaigns.map(({ id }) => id));
    const storySlugs = new Set(impactStories.map(({ slug }) => slug));

    expect(campaignSlugs.has(emergencyAppeal.campaignSlug)).toBe(true);
    impactStories.forEach((story) =>
      expect(programSlugs.has(story.programSlug)).toBe(true),
    );
    projectLocations.forEach((location) => {
      expect(location.programSlugs.length).toBeGreaterThan(0);
      location.programSlugs.forEach((slug) =>
        expect(programSlugs.has(slug)).toBe(true),
      );
    });
    adminSummary.campaignPerformance.forEach(({ campaignId }) =>
      expect(campaignIds.has(campaignId)).toBe(true),
    );
    gallery.forEach(({ storyHref }) => {
      if (!storyHref?.startsWith("/stories/")) return;
      expect(storySlugs.has(storyHref.slice("/stories/".length))).toBe(true);
    });
  });

  it("keeps financial and progress figures internally coherent", () => {
    campaigns.forEach((campaign) => {
      expect(campaign.goal, `${campaign.slug} goal`).toBeGreaterThan(0);
      expect(campaign.raised, `${campaign.slug} raised`).toBeGreaterThanOrEqual(
        0,
      );
      expect(
        campaign.raised,
        `${campaign.slug} raised must not exceed goal`,
      ).toBeLessThanOrEqual(campaign.goal);
      expect(
        campaign.donorCount,
        `${campaign.slug} donor count`,
      ).toBeGreaterThanOrEqual(0);
      expect(
        campaign.fundAllocation.reduce(
          (sum, allocation) => sum + allocation.percentage,
          0,
        ),
        `${campaign.slug} allocation`,
      ).toBeCloseTo(100, 5);
      campaign.givingExamples.forEach(({ amount }) =>
        expect(amount).toBeGreaterThan(0),
      );
      expectValidDate(campaign.endDate, `${campaign.slug} end date`);
    });

    donation.tiers.forEach(({ amount }) => expect(amount).toBeGreaterThan(0));
    expect(
      adminSummary.donationChannels.reduce(
        (sum, channel) => sum + channel.percentage,
        0,
      ),
    ).toBeCloseTo(100, 5);
    adminSummary.campaignPerformance.forEach(({ goal, raised }) => {
      expect(goal).toBeGreaterThan(0);
      expect(raised).toBeGreaterThanOrEqual(0);
      expect(raised).toBeLessThanOrEqual(goal);
    });
  });

  it("keeps dates, event capacity, and geographic coordinates valid", () => {
    impactStats.forEach((stat) => {
      expect(stat.value).toBeGreaterThanOrEqual(0);
      expectValidDate(stat.updatedAt, `${stat.id} update date`);
    });
    expectValidDate(
      emergencyAppeal.responseStartedAt,
      "emergency response start",
    );
    expectValidDate(emergencyAppeal.updateTimestamp, "emergency update");
    impactStories.forEach(({ slug, publishedAt }) =>
      expectValidDate(publishedAt, `${slug} date`),
    );
    articles.forEach(({ slug, publishedAt }) =>
      expectValidDate(publishedAt, `${slug} date`),
    );
    gallery.forEach(({ id, capturedAt }) =>
      expectValidDate(capturedAt, `${id} capture date`),
    );

    events.forEach((event) => {
      expectValidDate(event.start, `${event.slug} start`);
      expectValidDate(event.end, `${event.slug} end`);
      expect(Date.parse(event.end)).toBeGreaterThan(Date.parse(event.start));
      expect(event.capacity).toBeGreaterThanOrEqual(0);
      expect(event.remainingPlaces).toBeGreaterThanOrEqual(0);
      expect(event.remainingPlaces).toBeLessThanOrEqual(event.capacity);
      expect(
        () => new Intl.DateTimeFormat("en", { timeZone: event.timezone }),
      ).not.toThrow();
    });

    projectLocations.forEach(
      ({ latitude, longitude, activeProjects, peopleReached }) => {
        expect(latitude).toBeGreaterThanOrEqual(-90);
        expect(latitude).toBeLessThanOrEqual(90);
        expect(longitude).toBeGreaterThanOrEqual(-180);
        expect(longitude).toBeLessThanOrEqual(180);
        expect(activeProjects).toBeGreaterThanOrEqual(0);
        expect(peopleReached).toBeGreaterThanOrEqual(0);
      },
    );
  });

  it("provides safe links and usable image metadata", () => {
    const links = collectValuesForKeys(
      siteContent,
      new Set([
        "href",
        "annualReportHref",
        "transcriptHref",
        "storyHref",
        "registrationHref",
        "directionsHref",
      ]),
    );
    expect(links.length).toBeGreaterThan(0);
    links.forEach((href) => {
      const isInternal = href.startsWith("/") && !href.startsWith("//");
      const isSecureExternal = href.startsWith("https://");
      expect(
        isInternal || isSecureExternal,
        `unsafe or malformed link: ${href}`,
      ).toBe(true);
      expect(href).not.toMatch(/[\r\n]/);
    });

    const images = collectImageAssets(siteContent);
    expect(images.length).toBeGreaterThan(0);
    images.forEach(({ src, alt, width, height }) => {
      expect(typeof src).toBe("string");
      expect(
        (src as string).startsWith("/") ||
          (src as string).startsWith("https://"),
      ).toBe(true);
      expect(typeof alt).toBe("string");
      expect((alt as string).trim().length).toBeGreaterThanOrEqual(8);
      expect(Number.isInteger(width) && (width as number) > 0).toBe(true);
      expect(Number.isInteger(height) && (height as number) > 0).toBe(true);
    });
  });

  it("keeps base SEO copy within practical search limits", () => {
    expect(siteSeo.title.length).toBeGreaterThanOrEqual(15);
    expect(siteSeo.title.length).toBeLessThanOrEqual(65);
    expect(siteSeo.description.length).toBeGreaterThanOrEqual(50);
    expect(siteSeo.description.length).toBeLessThanOrEqual(170);
    expect(siteSeo.canonicalPath).toBe("/");
    expect(siteSeo.keywords.length).toBeGreaterThan(0);
    expectUnique(
      siteSeo.keywords.map((keyword) => keyword.toLocaleLowerCase()),
      "SEO keywords",
    );
  });
});
