export type ThemeTone =
  | "teal"
  | "amber"
  | "coral"
  | "indigo"
  | "forest"
  | "sky"
  | "rose"
  | "slate";

export type CampaignStatus = "active" | "urgent" | "funded" | "completed";
export type EventStatus = "upcoming" | "open" | "sold-out" | "completed";
export type EventFormat = "in-person" | "online" | "hybrid";

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  credit?: string;
  blurDataURL?: string;
}

export interface VideoAsset {
  src: string;
  poster: ImageAsset;
  title: string;
  transcriptHref?: string;
}

export interface LinkItem {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
}

export interface NavigationItem extends LinkItem {
  children?: LinkItem[];
}

export interface SocialLink extends LinkItem {
  platform: "instagram" | "linkedin" | "youtube" | "facebook" | "x";
}

export interface SeoMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  keywords: string[];
  image: ImageAsset;
}

export interface BrandIdentity {
  name: string;
  legalName: string;
  shortName: string;
  tagline: string;
  promise: string;
  mission: string;
  vision: string;
  voice: string[];
  registration: {
    ngoId: string;
    taxExemption: string;
    foreignContribution: string;
  };
  contact: {
    email: string;
    phone: string;
    donorSupportHours: string;
  };
  social: SocialLink[];
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  highlightedPhrase: string;
  description: string;
  primaryCta: LinkItem;
  secondaryCta: LinkItem;
  image: ImageAsset;
  video?: VideoAsset;
  floatingNotes: string[];
}

export interface ImpactStat {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  compactValue: string;
  context: string;
  updatedAt: string;
  icon: string;
}

export interface TrustMarker {
  title: string;
  detail: string;
  href?: string;
  icon: string;
}

export interface Partner {
  name: string;
  category:
    | "implementation"
    | "knowledge"
    | "funding"
    | "logistics"
    | "community";
  description: string;
  logoText: string;
  href?: string;
}

export interface BrandValue {
  id: string;
  title: string;
  statement: string;
  proof: string;
  icon: string;
}

export interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  metric?: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  introduction: string;
  founderStory: {
    name: string;
    role: string;
    quote: string;
    paragraphs: string[];
    image: ImageAsset;
  };
  governanceStatement: string;
  annualReportHref: string;
}

export interface ProgramMetric {
  value: string;
  label: string;
}

export interface Program {
  slug: string;
  category: string;
  title: string;
  shortTitle: string;
  summary: string;
  description: string;
  approach: string[];
  focusAreas: string[];
  locations: string[];
  metrics: ProgramMetric[];
  image: ImageAsset;
  theme: ThemeTone;
  icon: string;
  cta: LinkItem;
}

export interface FundAllocation {
  label: string;
  percentage: number;
  description: string;
}

export interface GivingExample {
  amount: number;
  currency: "INR" | "USD";
  impact: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: CampaignStatus;
  location: string;
  summary: string;
  story: string;
  goal: number;
  raised: number;
  currency: "INR" | "USD";
  donorCount: number;
  endDate: string;
  featured: boolean;
  tags: string[];
  image: ImageAsset;
  gallery: ImageAsset[];
  givingExamples: GivingExample[];
  fundAllocation: FundAllocation[];
  expectedOutcomes: string[];
  implementingPartner?: string;
}

export interface EmergencyAppeal {
  id: string;
  label: string;
  title: string;
  summary: string;
  location: string;
  responseStartedAt: string;
  updateTimestamp: string;
  needs: string[];
  campaignSlug: string;
  image: ImageAsset;
}

export interface StoryChapter {
  label: string;
  text: string;
}

export interface ImpactStory {
  slug: string;
  title: string;
  dek: string;
  person: string;
  personContext: string;
  location: string;
  programSlug: string;
  quote: string;
  chapters: StoryChapter[];
  outcomes: ProgramMetric[];
  image: ImageAsset;
  video?: VideoAsset;
  publishedAt: string;
  readTime: string;
  privacyNote?: string;
}

export interface ProjectLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  programSlugs: string[];
  activeProjects: number;
  peopleReached: number;
  summary: string;
}

export interface GalleryItem {
  id: string;
  category: "people" | "fieldwork" | "events" | "nature";
  title: string;
  location: string;
  capturedAt: string;
  image: ImageAsset;
  storyHref?: string;
}

export interface EventItem {
  slug: string;
  title: string;
  summary: string;
  start: string;
  end: string;
  timezone: string;
  location: string;
  venue: string;
  format: EventFormat;
  status: EventStatus;
  category: string;
  capacity: number;
  remainingPlaces: number;
  registrationHref: string;
  image: ImageAsset;
  accessibility: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  group: "leadership" | "programs" | "governance";
  bio: string;
  expertise: string[];
  languages: string[];
  image: ImageAsset;
  linkedin?: string;
}

export interface Recognition {
  year: string;
  title: string;
  issuer: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  context: string;
  location: string;
  image?: ImageAsset;
}

export interface FaqItem {
  id: string;
  category: "donations" | "impact" | "volunteering" | "governance";
  question: string;
  answer: string;
  links?: LinkItem[];
}

export interface OfficeLocation {
  id: string;
  name: string;
  type: "registered-office" | "regional-hub" | "field-office";
  addressLines: string[];
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: { latitude: number; longitude: number };
  email: string;
  phone: string;
  hours: string;
  directionsHref: string;
}

export interface DonationTier {
  amount: number;
  currency: "INR" | "USD";
  label: string;
  impact: string;
  popular?: boolean;
}

export interface DonationContent {
  eyebrow: string;
  title: string;
  description: string;
  defaultFrequency: "one-time" | "monthly" | "yearly";
  tiers: DonationTier[];
  assurances: string[];
  allocationNote: string;
  receiptNote: string;
}

export interface VolunteerRole {
  slug: string;
  title: string;
  location: string;
  commitment: string;
  mode: "remote" | "field" | "hybrid";
  summary: string;
  skills: string[];
  openings: number;
}

export interface VolunteerContent {
  eyebrow: string;
  title: string;
  description: string;
  benefits: string[];
  requirements: string[];
  process: { step: string; title: string; description: string }[];
  roles: VolunteerRole[];
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  category: "field-note" | "research" | "perspective" | "news";
  author: string;
  publishedAt: string;
  readTime: string;
  image: ImageAsset;
  tags: string[];
  featured: boolean;
}

export interface NewsletterContent {
  eyebrow: string;
  title: string;
  description: string;
  consentLabel: string;
  successMessage: string;
  sampleTopics: string[];
}

export interface FooterGroup {
  title: string;
  links: LinkItem[];
}

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  changePercent: number;
  changeLabel: string;
  trend: number[];
}

export interface AdminActivity {
  id: string;
  type: "donation" | "volunteer" | "campaign" | "event" | "content";
  title: string;
  detail: string;
  occurredAt: string;
  status: "positive" | "attention" | "neutral";
}

export interface AdminCampaignSummary {
  campaignId: string;
  raised: number;
  goal: number;
  currency: "INR" | "USD";
  donationsThisMonth: number;
  conversionRate: number;
  daysRemaining: number;
}

export interface AdminSummary {
  reportingPeriod: string;
  lastSyncedAt: string;
  kpis: DashboardKpi[];
  recentActivity: AdminActivity[];
  campaignPerformance: AdminCampaignSummary[];
  donationChannels: { label: string; percentage: number; amount: number }[];
  attentionItems: { label: string; count: number; href: string }[];
}

export interface SiteContent {
  brand: BrandIdentity;
  seo: SeoMetadata;
  navigation: NavigationItem[];
  hero: HeroContent;
  stats: ImpactStat[];
  trustMarkers: TrustMarker[];
  partners: Partner[];
  about: AboutContent;
  values: BrandValue[];
  timeline: TimelineMilestone[];
  programs: Program[];
  campaigns: Campaign[];
  emergencyAppeal: EmergencyAppeal;
  stories: ImpactStory[];
  projectLocations: ProjectLocation[];
  gallery: GalleryItem[];
  events: EventItem[];
  team: TeamMember[];
  recognitions: Recognition[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  offices: OfficeLocation[];
  donation: DonationContent;
  volunteer: VolunteerContent;
  articles: Article[];
  newsletter: NewsletterContent;
  footer: FooterGroup[];
  admin: AdminSummary;
}
