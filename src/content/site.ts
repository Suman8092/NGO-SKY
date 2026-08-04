import type { ImageAsset, SiteContent } from "@/types/content";

const photo = (
  id: string,
  alt: string,
  width = 1600,
  height = 1067,
): ImageAsset => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`,
  alt,
  width,
  height,
  credit: "Unsplash",
});

export const brand: SiteContent["brand"] = {
  name: "Ashaaya Foundation",
  legalName: "Ashaaya Foundation",
  shortName: "Ashaaya",
  tagline: "Hope, made practical.",
  promise:
    "We turn generous intent into durable, community-owned progress—and show the work clearly.",
  mission:
    "To expand access to learning, health, livelihoods, safety, and a liveable planet by funding and building solutions with communities, not for them.",
  vision:
    "A world where a person's postcode, gender, age, or income never decides the quality of their future.",
  voice: [
    "Warm without sentimentality",
    "Precise without sounding institutional",
    "Hopeful without hiding complexity",
    "Dignity-first in every story",
  ],
  registration: {
    ngoId: "NGO Darpan: KA/2020/0264812",
    taxExemption: "Donations in India are eligible under Section 80G",
    foreignContribution:
      "International gifts are accepted through our designated giving route",
  },
  contact: {
    email: "hello@ashaaya.org",
    phone: "+91 80 4718 2020",
    donorSupportHours: "Monday–Saturday, 9:00–18:00 IST",
  },
  social: [
    {
      platform: "instagram",
      label: "Instagram",
      href: "https://instagram.com/ashaayafoundation",
      external: true,
    },
    {
      platform: "linkedin",
      label: "LinkedIn",
      href: "https://linkedin.com/company/ashaaya-foundation",
      external: true,
    },
    {
      platform: "youtube",
      label: "YouTube",
      href: "https://youtube.com/@ashaayafoundation",
      external: true,
    },
    {
      platform: "facebook",
      label: "Facebook",
      href: "https://facebook.com/ashaayafoundation",
      external: true,
    },
  ],
};

export const siteSeo: SiteContent["seo"] = {
  title: "Ashaaya Foundation — Hope, made practical",
  description:
    "Back locally led solutions in education, health, livelihoods, relief, and climate resilience. Follow every rupee from contribution to outcome.",
  canonicalPath: "/",
  keywords: [
    "NGO India",
    "donate to charity India",
    "community development",
    "education nonprofit",
    "climate resilience",
    "disaster relief",
    "women-led livelihoods",
  ],
  image: photo(
    "photo-1469571486292-0ba58a3f068b",
    "Ashaaya field team and community volunteers walking together",
    1200,
    630,
  ),
};

export const primaryNavigation: SiteContent["navigation"] = [
  {
    label: "About",
    href: "/about",
    children: [
      {
        label: "Our story",
        href: "/about",
        description: "Why Ashaaya exists and how we work",
      },
      {
        label: "People",
        href: "/about/team",
        description: "Leadership, field teams, and trustees",
      },
      {
        label: "Governance",
        href: "/about/governance",
        description: "Reports, policies, and accountability",
      },
    ],
  },
  {
    label: "Our work",
    href: "/programs",
    children: [
      {
        label: "Education",
        href: "/programs/shiksha-setu",
        description: "Learning that travels the last mile",
      },
      {
        label: "Health",
        href: "/programs/sehat-saathi",
        description: "Primary care closer to home",
      },
      {
        label: "Livelihoods",
        href: "/programs/udaan-women",
        description: "Women-led, climate-smart enterprise",
      },
      {
        label: "Relief",
        href: "/programs/raahat-ready",
        description: "Fast response and safer recovery",
      },
      {
        label: "All programs",
        href: "/programs",
        description: "Explore ten connected areas of work",
      },
    ],
  },
  {
    label: "Impact",
    href: "/impact",
    children: [
      {
        label: "Impact dashboard",
        href: "/impact",
        description: "Results, methods, and live project map",
      },
      {
        label: "Stories",
        href: "/stories",
        description: "Progress in the words of participants",
      },
      {
        label: "Field gallery",
        href: "/gallery",
        description: "A visual record of the work",
      },
    ],
  },
  {
    label: "Take action",
    href: "/get-involved",
    children: [
      {
        label: "Donate",
        href: "/donate",
        description: "Make a one-time or monthly gift",
      },
      {
        label: "Volunteer",
        href: "/volunteer",
        description: "Bring your time and skills",
      },
      {
        label: "Events",
        href: "/events",
        description: "Learn, gather, and take part",
      },
      {
        label: "Partner with us",
        href: "/contact?subject=partnership",
        description: "Build a long-term collaboration",
      },
    ],
  },
  { label: "Insights", href: "/insights" },
];

export const hero: SiteContent["hero"] = {
  eyebrow: "Locally led. Radically transparent.",
  title: "Hope should not wait for the perfect moment.",
  highlightedPhrase: "It should arrive today.",
  description:
    "Across India's hardest-to-reach communities, Ashaaya backs practical ideas that keep children learning, families healthy, incomes growing, and ecosystems alive.",
  primaryCta: { label: "Make hope happen", href: "/donate" },
  secondaryCta: { label: "See where your gift goes", href: "/impact" },
  image: photo(
    "photo-1509099836639-18ba1795216d",
    "Children smiling together outside a community learning space",
    1920,
    1280,
  ),
  floatingNotes: [
    "₹1,200 keeps a learner connected for one month",
    "91% of program spending reaches field delivery",
    "Updated from verified field logs on 31 July 2026",
  ],
};

export const impactStats: SiteContent["stats"] = [
  {
    id: "people-reached",
    label: "People reached",
    value: 148260,
    compactValue: "148K+",
    context: "Direct participants across all active and completed programs",
    updatedAt: "2026-07-31",
    icon: "users",
  },
  {
    id: "meals-served",
    label: "Nutritious meals served",
    value: 2418000,
    compactValue: "2.4M",
    context: "School, community kitchen, and emergency meal records",
    updatedAt: "2026-07-31",
    icon: "bowl",
  },
  {
    id: "trees-planted",
    label: "Native trees established",
    value: 186420,
    compactValue: "186K",
    context: "Saplings surviving after the second monsoon audit",
    updatedAt: "2026-06-30",
    icon: "sprout",
  },
  {
    id: "children-educated",
    label: "Children learning",
    value: 18940,
    compactValue: "18.9K",
    context: "Learners with at least 75% program attendance this year",
    updatedAt: "2026-07-31",
    icon: "book-open",
  },
  {
    id: "women-empowered",
    label: "Women earning more",
    value: 12680,
    compactValue: "12.6K",
    context: "Participants reporting sustained income growth after six months",
    updatedAt: "2026-06-30",
    icon: "trending-up",
  },
  {
    id: "projects-completed",
    label: "Projects completed",
    value: 96,
    compactValue: "96",
    context: "Projects closed with outcome and finance reviews",
    updatedAt: "2026-07-31",
    icon: "badge-check",
  },
  {
    id: "countries-served",
    label: "Countries connected",
    value: 4,
    compactValue: "4",
    context: "India-led learning partnerships across South Asia",
    updatedAt: "2026-07-31",
    icon: "globe-2",
  },
];

export const trustMarkers: SiteContent["trustMarkers"] = [
  {
    title: "91 paise to programs",
    detail:
      "For every rupee spent in FY 2025–26, ₹0.91 supported program delivery and field monitoring.",
    href: "/about/governance#fund-allocation",
    icon: "pie-chart",
  },
  {
    title: "80G tax benefit",
    detail:
      "Eligible Indian donors receive an automated receipt and tax certificate after payment.",
    href: "/faq#donations",
    icon: "receipt",
  },
  {
    title: "Safeguarding by design",
    detail:
      "Every team member and delivery partner signs our child and participant safeguarding code.",
    href: "/about/governance#safeguarding",
    icon: "shield-check",
  },
  {
    title: "Quarterly field verification",
    detail:
      "Outputs are reconciled against attendance, procurement, and independent sample checks.",
    href: "/impact#methodology",
    icon: "clipboard-check",
  },
];

export const partners: SiteContent["partners"] = [
  {
    name: "JalSutra Alliance",
    logoText: "JALSUTRA",
    category: "implementation",
    description: "Watershed design and village water governance",
  },
  {
    name: "Nayi Disha Collective",
    logoText: "NAYI DISHA",
    category: "community",
    description: "Women-led producer groups and local facilitation",
  },
  {
    name: "Solis Health Network",
    logoText: "SOLIS HEALTH",
    category: "knowledge",
    description: "Clinical protocols, telehealth, and referral pathways",
  },
  {
    name: "Kora Impact Labs",
    logoText: "KORA",
    category: "knowledge",
    description: "Outcome measurement and open-data infrastructure",
  },
  {
    name: "Northstar Relief Logistics",
    logoText: "NORTHSTAR",
    category: "logistics",
    description: "Pre-positioned emergency supplies and last-mile routing",
  },
  {
    name: "Earthloom Cooperative Fund",
    logoText: "EARTHLOOM",
    category: "funding",
    description: "Patient capital for regenerative rural enterprise",
  },
];

export const about: SiteContent["about"] = {
  eyebrow: "Built close to the problem",
  title: "A foundation designed to make itself less necessary.",
  introduction:
    "Ashaaya began with a simple observation: communities already hold extraordinary knowledge, but too often lack flexible capital, technical access, and a fair seat at the table. We bring those pieces together, then transfer ownership locally.",
  founderStory: {
    name: "Meera Rao",
    role: "Founder & Chief Executive",
    quote:
      "Dignity is not an extra layer of the work. It is the way the work must be done.",
    paragraphs: [
      "In 2019, after a decade designing public-health systems, Meera returned to a flood-affected district in Assam where local boat operators had converted their vessels into makeshift classrooms. The idea was ingenious; the funding cycle was not. By the time a conventional grant could arrive, the river would have shifted and another school term would be lost.",
      "Ashaaya was formed in 2020 to move at the speed of community knowledge. Its first grant put learning kits, trained facilitators, and safe boats on the water within five weeks. The model has since grown into ten connected programs, each built around local leadership, transparent budgets, and an agreed path to community ownership.",
    ],
    image: photo(
      "photo-1494790108377-be9c29b29330",
      "Meera Rao, founder of Ashaaya Foundation",
      1200,
      1500,
    ),
  },
  governanceStatement:
    "Our board reviews finance and safeguarding quarterly; program outcomes are published twice a year, and material incidents are disclosed with the corrective action taken.",
  annualReportHref: "/reports/ashaaya-annual-report-2025-26.pdf",
};

export const brandValues: SiteContent["values"] = [
  {
    id: "dignity",
    title: "Dignity before optics",
    statement: "People are participants in change, never props in a campaign.",
    proof:
      "Stories are consented, names can be changed, and participants may withdraw publication permission.",
    icon: "heart-handshake",
  },
  {
    id: "proximity",
    title: "Decisions near the work",
    statement: "The people closest to a challenge should shape the response.",
    proof:
      "At least half of every project steering group is made up of residents and local institutions.",
    icon: "map-pin",
  },
  {
    id: "evidence",
    title: "Evidence with humility",
    statement:
      "We measure what changed, name what did not, and adapt in public.",
    proof:
      "Every completed project includes an outcome note, learning memo, and field-verified financial close.",
    icon: "scan-search",
  },
  {
    id: "stewardship",
    title: "Care for every rupee",
    statement: "Generosity deserves discipline, clarity, and long-term value.",
    proof:
      "Campaign budgets show delivery, monitoring, and essential operating costs before a donor gives.",
    icon: "indian-rupee",
  },
];

export const timeline: SiteContent["timeline"] = [
  {
    year: "2020",
    title: "Ashaaya launches on the Brahmaputra",
    description:
      "Three community-run learning boats reconnect 480 children after seasonal flooding.",
    metric: "480 learners",
  },
  {
    year: "2021",
    title: "Health and food systems join the work",
    description:
      "Women health guides and neighbourhood kitchens provide a coordinated pandemic response.",
    metric: "410,000 meals",
  },
  {
    year: "2022",
    title: "Local ownership becomes policy",
    description:
      "Every new program adopts resident steering groups and published community scorecards.",
    metric: "68% local procurement",
  },
  {
    year: "2023",
    title: "From recovery to resilience",
    description:
      "Climate-smart farms, native forests, and solar clinics expand into five Indian states.",
    metric: "54 active projects",
  },
  {
    year: "2024",
    title: "The South Asia learning circle opens",
    description:
      "Grassroots organisations in Nepal, Bangladesh, and Sri Lanka begin sharing tested playbooks.",
    metric: "4 countries connected",
  },
  {
    year: "2026",
    title: "Impact becomes traceable in near real time",
    description:
      "Donors can now follow verified milestones, spending, and field notes for every active campaign.",
    metric: "148,260 people reached",
  },
];

export const programs: SiteContent["programs"] = [
  {
    slug: "shiksha-setu",
    category: "Education",
    title: "Shiksha Setu — learning that crosses the last mile",
    shortTitle: "Shiksha Setu",
    summary:
      "Flexible classrooms, learning recovery, and digital access for children cut off by distance, migration, or climate.",
    description:
      "We work with government schools and community educators to bring strong foundational learning to river islands, seasonal-migration corridors, and underserved urban settlements. Each learning hub is designed to transition into a locally run resource centre.",
    approach: [
      "Train and pay educators recruited from the community",
      "Use low-bandwidth learning tools in the child's first language",
      "Track reading and numeracy growth every twelve weeks",
    ],
    focusAreas: [
      "Foundational literacy",
      "School re-entry",
      "STEM access",
      "Teacher support",
    ],
    locations: ["Assam", "Bihar", "Karnataka"],
    metrics: [
      { value: "18,940", label: "active learners" },
      { value: "78%", label: "improved one reading level" },
      { value: "312", label: "community educators" },
    ],
    image: photo(
      "photo-1509062522246-3755977927d7",
      "Children learning with a teacher in a bright classroom",
    ),
    theme: "amber",
    icon: "book-open",
    cta: { label: "Explore Shiksha Setu", href: "/programs/shiksha-setu" },
  },
  {
    slug: "sehat-saathi",
    category: "Healthcare",
    title: "Sehat Saathi — care within reach",
    shortTitle: "Sehat Saathi",
    summary:
      "Neighbourhood health guides, mobile clinics, and referral support for families far from dependable primary care.",
    description:
      "Sehat Saathi pairs trained women health guides with solar-powered mobile clinics. The program prioritises maternal health, childhood nutrition, non-communicable disease screening, and a referral journey that does not end at a paper slip.",
    approach: [
      "Offer scheduled mobile clinics after work and school hours",
      "Support every high-risk referral through the first hospital visit",
      "Maintain consent-based, portable health records",
    ],
    focusAreas: [
      "Maternal health",
      "Nutrition",
      "Preventive screening",
      "Telemedicine",
    ],
    locations: ["Rajasthan", "Odisha", "Karnataka"],
    metrics: [
      { value: "42,310", label: "consultations" },
      { value: "6,840", label: "anaemia screenings" },
      { value: "94%", label: "high-risk referrals completed" },
    ],
    image: photo(
      "photo-1576091160399-112ba8d25d1d",
      "Community health professional listening to a patient",
    ),
    theme: "teal",
    icon: "stethoscope",
    cta: { label: "Explore Sehat Saathi", href: "/programs/sehat-saathi" },
  },
  {
    slug: "udaan-women",
    category: "Women empowerment",
    title: "Udaan — enterprise led by women",
    shortTitle: "Udaan",
    summary:
      "Skills, patient capital, and market access for women building resilient household and village economies.",
    description:
      "Udaan supports women to move from irregular, underpaid work into enterprises they control. Producer circles choose the business model, receive practical finance coaching, and negotiate with buyers as a group.",
    approach: [
      "Build peer-owned savings and working-capital circles",
      "Connect producers to transparent, repeat purchase agreements",
      "Provide childcare and safe transport during training",
    ],
    focusAreas: [
      "Enterprise finance",
      "Producer collectives",
      "Digital commerce",
      "Financial agency",
    ],
    locations: ["Maharashtra", "Rajasthan", "Bihar"],
    metrics: [
      { value: "12,680", label: "women earning more" },
      { value: "₹4,850", label: "median monthly income gain" },
      { value: "426", label: "enterprises launched" },
    ],
    image: photo(
      "photo-1489493585363-d69421e0edd3",
      "Women working together in a rural producer collective",
    ),
    theme: "rose",
    icon: "sparkles",
    cta: { label: "Explore Udaan", href: "/programs/udaan-women" },
  },
  {
    slug: "kaushal-labs",
    category: "Skill development",
    title: "Kaushal Labs — skills that lead somewhere",
    shortTitle: "Kaushal Labs",
    summary:
      "Employer-linked training and paid apprenticeships for young people entering a changing world of work.",
    description:
      "Kaushal Labs starts with local demand rather than a generic course catalogue. Young adults practise technical and workplace skills, build a verified portfolio, and receive coaching through six months of employment or self-employment.",
    approach: [
      "Co-design cohorts with regional employers and worker groups",
      "Pay travel stipends so income pressure does not force drop-out",
      "Publish placement, retention, and wage outcomes together",
    ],
    focusAreas: [
      "Green jobs",
      "Care economy",
      "Digital operations",
      "Apprenticeships",
    ],
    locations: ["Karnataka", "Maharashtra", "Odisha"],
    metrics: [
      { value: "7,460", label: "graduates" },
      { value: "71%", label: "in work after six months" },
      { value: "183", label: "employer partners" },
    ],
    image: photo(
      "photo-1524178232363-1fb2b075b655",
      "Young adults taking part in a practical skills workshop",
    ),
    theme: "indigo",
    icon: "wrench",
    cta: { label: "Explore Kaushal Labs", href: "/programs/kaushal-labs" },
  },
  {
    slug: "rasoi-network",
    category: "Food security",
    title: "Rasoi Network — nourishment with choice",
    shortTitle: "Rasoi Network",
    summary:
      "Community kitchens, maternal nutrition, and dignified food access that strengthen rather than replace local markets.",
    description:
      "Rasoi Network sources seasonal produce from nearby farmers and lets communities shape menus and serving times. During emergencies, its kitchens can scale within 24 hours without abandoning nutrition standards.",
    approach: [
      "Buy at least 70% of ingredients from local farms and vendors",
      "Design menus with cooks, parents, and nutritionists",
      "Use redeemable food credits where functioning markets exist",
    ],
    focusAreas: [
      "School meals",
      "Maternal nutrition",
      "Community kitchens",
      "Emergency food",
    ],
    locations: ["Bihar", "Odisha", "Assam", "Karnataka"],
    metrics: [
      { value: "2.4M", label: "meals served" },
      { value: "74%", label: "ingredients sourced locally" },
      { value: "38", label: "community kitchens" },
    ],
    image: photo(
      "photo-1547592180-85f173990554",
      "Fresh vegetables prepared for a community meal",
    ),
    theme: "coral",
    icon: "cooking-pot",
    cta: { label: "Explore Rasoi Network", href: "/programs/rasoi-network" },
  },
  {
    slug: "raahat-ready",
    category: "Disaster relief",
    title: "Raahat Ready — relief that thinks beyond tomorrow",
    shortTitle: "Raahat Ready",
    summary:
      "Locally stocked essentials, rapid cash support, and safer rebuilding before, during, and after climate shocks.",
    description:
      "Raahat Ready maintains district-level response plans long before a disaster reaches the news. Community responders map risk, pre-position supplies, and use transparent needs assessments to prioritise cash, shelter, water, and protection.",
    approach: [
      "Release first-response funds within six hours of verification",
      "Prioritise unrestricted cash where markets are operating",
      "Rebuild homes and services to safer, climate-ready standards",
    ],
    focusAreas: [
      "Rapid response",
      "Cash assistance",
      "WASH",
      "Resilient recovery",
    ],
    locations: ["Assam", "Odisha", "Bihar", "Bangladesh learning partner"],
    metrics: [
      { value: "6 hrs", label: "response-fund target" },
      { value: "31,200", label: "people supported in 2025" },
      { value: "86", label: "trained response teams" },
    ],
    image: photo(
      "photo-1547683905-f686c993aae5",
      "Community volunteers carrying supplies after heavy rain",
    ),
    theme: "sky",
    icon: "life-buoy",
    cta: { label: "Explore Raahat Ready", href: "/programs/raahat-ready" },
  },
  {
    slug: "hariyali-commons",
    category: "Environment",
    title: "Hariyali Commons — restore what sustains us",
    shortTitle: "Hariyali Commons",
    summary:
      "Native forests, water commons, and regenerative farms built for biodiversity and everyday livelihoods.",
    description:
      "Hariyali Commons treats ecological recovery as shared infrastructure. Residents map land and water use, select native species, earn for restoration work, and govern the commons through locally agreed rules.",
    approach: [
      "Measure survival and canopy growth, not saplings distributed",
      "Pay local stewardship teams for three full growing cycles",
      "Blend traditional water knowledge with satellite monitoring",
    ],
    focusAreas: [
      "Native forests",
      "Watersheds",
      "Regenerative farming",
      "Heat resilience",
    ],
    locations: ["Maharashtra", "Rajasthan", "Karnataka"],
    metrics: [
      { value: "186K", label: "trees established" },
      { value: "82%", label: "two-monsoon survival" },
      { value: "1.7B L", label: "annual water capacity restored" },
    ],
    image: photo(
      "photo-1441974231531-c6227db76b6e",
      "Sunlight passing through a restored native forest",
    ),
    theme: "forest",
    icon: "trees",
    cta: {
      label: "Explore Hariyali Commons",
      href: "/programs/hariyali-commons",
    },
  },
  {
    slug: "jeev-raksha",
    category: "Animal welfare",
    title: "Jeev Raksha — safer streets for every species",
    shortTitle: "Jeev Raksha",
    summary:
      "Humane street-animal care, vaccination, sterilisation, and coexistence training led with local municipalities.",
    description:
      "Jeev Raksha combines mobile veterinary care with resident education and reliable municipal systems. The goal is fewer injuries, lower disease risk, and neighbourhoods equipped to respond humanely.",
    approach: [
      "Run ward-level vaccination and sterilisation routes",
      "Train first responders in safe rescue and animal handling",
      "Reunite, foster, or responsibly rehome recoverable animals",
    ],
    focusAreas: [
      "Rabies prevention",
      "Mobile veterinary care",
      "Humane rescue",
      "Coexistence",
    ],
    locations: ["Karnataka", "Maharashtra"],
    metrics: [
      { value: "18,760", label: "animals vaccinated" },
      { value: "4,320", label: "treatments completed" },
      { value: "22", label: "wards with response teams" },
    ],
    image: photo(
      "photo-1450778869180-41d0601e046e",
      "A rescued dog resting safely with a caregiver",
    ),
    theme: "amber",
    icon: "paw-print",
    cta: { label: "Explore Jeev Raksha", href: "/programs/jeev-raksha" },
  },
  {
    slug: "surakshit-bachpan",
    category: "Child protection",
    title: "Surakshit Bachpan — childhood without fear",
    shortTitle: "Surakshit Bachpan",
    summary:
      "Prevention, safe reporting, case support, and family strengthening for children at risk of violence or exploitation.",
    description:
      "Surakshit Bachpan helps schools, families, and frontline services recognise risk early and act safely. Case work is confidential, survivor-centred, and coordinated with qualified statutory and mental-health services.",
    approach: [
      "Build child-safe reporting routes in schools and communities",
      "Fund trauma-informed counselling and legal navigation",
      "Strengthen family income and care plans where separation can be prevented",
    ],
    focusAreas: [
      "Safeguarding",
      "Mental health",
      "Case management",
      "Family strengthening",
    ],
    locations: ["Karnataka", "Bihar", "Assam"],
    metrics: [
      { value: "24,600", label: "children in safer systems" },
      { value: "1,180", label: "frontline adults trained" },
      { value: "100%", label: "high-risk cases reviewed in 24 hrs" },
    ],
    image: photo(
      "photo-1488521787991-ed7bbaae773c",
      "Children laughing together in a safe community space",
    ),
    theme: "coral",
    icon: "shield-heart",
    cta: {
      label: "Explore Surakshit Bachpan",
      href: "/programs/surakshit-bachpan",
    },
  },
  {
    slug: "saath-senior-care",
    category: "Senior care",
    title: "Saath — growing older with connection",
    shortTitle: "Saath",
    summary:
      "Home visits, health navigation, social circles, and entitlements support for older adults living alone or on low incomes.",
    description:
      "Saath trains neighbourhood companions to provide consistent, practical support without taking away independence. Older adults choose the help they want, from medicine collection to digital access and weekly companionship.",
    approach: [
      "Match each participant with a trained neighbourhood companion",
      "Coordinate health, pension, and mobility services through one plan",
      "Create intergenerational circles that reduce isolation",
    ],
    focusAreas: [
      "Healthy ageing",
      "Social connection",
      "Entitlements",
      "Home safety",
    ],
    locations: ["Karnataka", "Maharashtra"],
    metrics: [
      { value: "5,840", label: "older adults connected" },
      { value: "82%", label: "report less isolation" },
      { value: "640", label: "trained companions" },
    ],
    image: photo(
      "photo-1544005313-94ddf0286df2",
      "Older woman smiling in warm natural light",
    ),
    theme: "slate",
    icon: "hand-heart",
    cta: { label: "Explore Saath", href: "/programs/saath-senior-care" },
  },
];

export const campaigns: SiteContent["campaigns"] = [
  {
    id: "cmp-school-without-shores",
    slug: "school-without-shores",
    title: "A school without shores",
    category: "Education",
    status: "active",
    location: "Majuli river islands, Assam",
    summary:
      "Keep six solar learning boats moving so 1,200 children can learn through the flood season.",
    story:
      "For four months each year, rising water turns a short walk to school into an unsafe crossing. Local boat crews and educators have designed classrooms that move with the river: covered vessels with solar power, books in Assamese and Mising, offline lessons, life jackets, and a teacher from the island. This campaign funds a full flood-season route rather than a one-day supply drop.",
    goal: 4800000,
    raised: 3360000,
    currency: "INR",
    donorCount: 1842,
    endDate: "2026-09-30",
    featured: true,
    tags: ["children", "learning", "climate resilience"],
    image: photo(
      "photo-1542810634-71277d95dcbb",
      "Children travelling together near a river community",
    ),
    gallery: [
      photo(
        "photo-1503676260728-1c00da094a0b",
        "A learner concentrating on a classroom activity",
      ),
      photo(
        "photo-1491841550275-ad7854e35ca6",
        "Open books arranged for a reading session",
      ),
    ],
    givingExamples: [
      {
        amount: 1200,
        currency: "INR",
        impact: "Learning materials and connectivity for one child for a month",
      },
      {
        amount: 5400,
        currency: "INR",
        impact:
          "A safe return journey for an island learning group for one week",
      },
      {
        amount: 25000,
        currency: "INR",
        impact:
          "One complete solar and offline-learning kit for a boat classroom",
      },
    ],
    fundAllocation: [
      {
        label: "Boat routes and safety",
        percentage: 38,
        description:
          "Crew, fuel, maintenance, life jackets, and monsoon equipment",
      },
      {
        label: "Educators and learning",
        percentage: 42,
        description:
          "Local educator pay, materials, assessments, and connectivity",
      },
      {
        label: "Monitoring and safeguarding",
        percentage: 12,
        description: "Attendance, learning checks, consent, and safety audits",
      },
      {
        label: "Essential operations",
        percentage: 8,
        description:
          "Payments, donor receipts, technology, and campaign support",
      },
    ],
    expectedOutcomes: [
      "1,200 learners attend at least three sessions each week",
      "75% of participating children gain one reading or numeracy level",
      "Six island committees are trained to manage routes and safety checks",
    ],
    implementingPartner: "Nayi Disha Collective",
  },
  {
    id: "cmp-clinics-after-sunset",
    slug: "clinics-after-sunset",
    title: "Clinics after sunset",
    category: "Healthcare",
    status: "active",
    location: "Barmer district, Rajasthan",
    summary:
      "Equip three solar clinics that open when daily-wage families are actually able to visit.",
    story:
      "A clinic that closes before workers return home is not truly accessible. These mobile units will rotate through 24 desert villages from 16:00 to 21:00, offering antenatal care, anaemia and diabetes screening, essential medicines, teleconsultation, and accompanied referrals for high-risk patients.",
    goal: 7500000,
    raised: 4950000,
    currency: "INR",
    donorCount: 963,
    endDate: "2026-11-30",
    featured: true,
    tags: ["primary care", "women", "solar"],
    image: photo(
      "photo-1538108149393-fbbd81895907",
      "A clean community clinic prepared for patient care",
    ),
    gallery: [
      photo(
        "photo-1584982751601-97dcc096659c",
        "Health worker checking a patient's blood pressure",
      ),
      photo(
        "photo-1584515933487-779824d29309",
        "Care professional speaking calmly with an older patient",
      ),
    ],
    givingExamples: [
      {
        amount: 750,
        currency: "INR",
        impact: "Two preventive screenings with follow-up",
      },
      {
        amount: 3500,
        currency: "INR",
        impact: "A health guide's complete field kit",
      },
      {
        amount: 18000,
        currency: "INR",
        impact: "One evening clinic route for four villages",
      },
    ],
    fundAllocation: [
      {
        label: "Clinical equipment",
        percentage: 34,
        description:
          "Diagnostics, cold storage, medicine cabinets, and telehealth tools",
      },
      {
        label: "Care team",
        percentage: 39,
        description:
          "Nurses, visiting clinicians, health guides, and referral navigators",
      },
      {
        label: "Solar mobility",
        percentage: 18,
        description:
          "Vehicle fit-out, charging, maintenance, and route operations",
      },
      {
        label: "Essential operations",
        percentage: 9,
        description: "Clinical governance, data protection, and donor support",
      },
    ],
    expectedOutcomes: [
      "18,000 consultations in the first twelve months",
      "95% of high-risk pregnancies complete a referred visit",
      "24 villages receive a published, dependable clinic timetable",
    ],
    implementingPartner: "Solis Health Network",
  },
  {
    id: "cmp-raahat-monsoon",
    slug: "raahat-monsoon-response",
    title: "Raahat monsoon response",
    category: "Emergency relief",
    status: "urgent",
    location: "Kendrapara and Bhadrak, Odisha",
    summary:
      "Deliver safe water, flexible cash, and repair kits to 3,500 flood-affected families.",
    story:
      "Repeated tidal flooding has damaged hand pumps, food stores, and ground-floor homes across low-lying coastal villages. Local response teams are distributing water-treatment supplies now, while verified cash transfers let families replace exactly what they lost. The next phase will repair water points and raise essential electrical systems above known flood lines.",
    goal: 9000000,
    raised: 6840000,
    currency: "INR",
    donorCount: 2716,
    endDate: "2026-08-31",
    featured: true,
    tags: ["urgent", "flood", "cash assistance"],
    image: photo(
      "photo-1547683905-f686c993aae5",
      "Floodwater surrounding homes after severe monsoon rain",
    ),
    gallery: [
      photo(
        "photo-1594736797933-d0501ba2fe65",
        "Relief supplies being organised for household distribution",
      ),
      photo(
        "photo-1584267385494-9fdd9a71ad75",
        "Heavy rain falling over a coastal settlement",
      ),
    ],
    givingExamples: [
      {
        amount: 900,
        currency: "INR",
        impact: "Safe-water supplies for a family for four weeks",
      },
      {
        amount: 4000,
        currency: "INR",
        impact: "Flexible emergency cash for one household",
      },
      {
        amount: 16500,
        currency: "INR",
        impact: "Materials and labour to repair one community water point",
      },
    ],
    fundAllocation: [
      {
        label: "Household cash",
        percentage: 48,
        description:
          "Verified transfers for food, medicine, transport, and repairs",
      },
      {
        label: "Water and sanitation",
        percentage: 27,
        description:
          "Treatment, storage, hygiene supplies, and pump restoration",
      },
      {
        label: "Safer repair kits",
        percentage: 17,
        description: "Tools and materials selected with affected households",
      },
      {
        label: "Response operations",
        percentage: 8,
        description:
          "Needs verification, safeguarding, payments, and logistics",
      },
    ],
    expectedOutcomes: [
      "3,500 families receive support based on a verified needs assessment",
      "42 damaged water points return to safe operation",
      "All aid queries and complaints receive a response within 48 hours",
    ],
    implementingPartner: "Northstar Relief Logistics",
  },
  {
    id: "cmp-one-acre-cooler",
    slug: "one-acre-cooler",
    title: "Make one acre cooler",
    category: "Environment",
    status: "active",
    location: "Marathwada, Maharashtra",
    summary:
      "Restore 60 village commons with native shade, slower water, and paid local stewardship.",
    story:
      "Heat does not fall evenly. In treeless villages it follows children to school, workers into the afternoon, and livestock to shrinking water points. Residents have mapped 60 parcels where native canopy and contour trenches can cool shared routes, hold rain, and create paid restoration work. Every site will be monitored for three summers—not photographed once and forgotten.",
    goal: 3200000,
    raised: 1600000,
    currency: "INR",
    donorCount: 1128,
    endDate: "2027-02-28",
    featured: false,
    tags: ["heat", "native trees", "water"],
    image: photo(
      "photo-1470770841072-f978cf4d019e",
      "Green landscape with water and mature native trees",
    ),
    gallery: [
      photo(
        "photo-1511497584788-876760111969",
        "Dense green leaves in a restored woodland",
      ),
      photo(
        "photo-1464822759023-fed622ff2c3b",
        "Community landscape stretching toward low hills",
      ),
    ],
    givingExamples: [
      {
        amount: 600,
        currency: "INR",
        impact: "Six native saplings plus two-monsoon aftercare",
      },
      {
        amount: 3000,
        currency: "INR",
        impact: "A paid stewardship day for a five-person local crew",
      },
      {
        amount: 12000,
        currency: "INR",
        impact: "A contour trench that slows and stores monsoon runoff",
      },
    ],
    fundAllocation: [
      {
        label: "Local stewardship",
        percentage: 36,
        description:
          "Fair wages for planting, watering, guarding, and survival audits",
      },
      {
        label: "Land and water works",
        percentage: 34,
        description:
          "Native planting stock, soil preparation, trenches, and check bunds",
      },
      {
        label: "Ecology monitoring",
        percentage: 20,
        description: "Canopy, temperature, water, and biodiversity sampling",
      },
      {
        label: "Essential operations",
        percentage: 10,
        description:
          "Community agreements, procurement, payments, and reporting",
      },
    ],
    expectedOutcomes: [
      "24,000 native trees survive through their second monsoon",
      "60 commons record a measurable reduction in peak surface temperature",
      "180 residents earn paid, certified restoration experience",
    ],
    implementingPartner: "JalSutra Alliance",
  },
];

export const emergencyAppeal: SiteContent["emergencyAppeal"] = {
  id: "appeal-odisha-monsoon-2026",
  label: "Rapid response active",
  title: "Coastal families need clean water before the next high tide.",
  summary:
    "Ashaaya's Odisha teams are delivering water treatment and emergency cash now. Field verification is live, and the first 860 households have already received support.",
  location: "Coastal Odisha",
  responseStartedAt: "2026-07-29T06:30:00+05:30",
  updateTimestamp: "2026-08-05T08:15:00+05:30",
  needs: [
    "Water-treatment kits",
    "Flexible household cash",
    "Pump repair",
    "Accessible shelter transport",
  ],
  campaignSlug: "raahat-monsoon-response",
  image: photo(
    "photo-1584267385494-9fdd9a71ad75",
    "Monsoon clouds and rain over a low-lying coastal community",
  ),
};

export const impactStories: SiteContent["stories"] = [
  {
    slug: "the-classroom-that-follows-the-river",
    title: "The classroom that follows the river",
    dek: "When the Brahmaputra redrew the route to school, educator Rumi Pegu helped put the classroom on water.",
    person: "Rumi Pegu",
    personContext: "Community educator and learning-boat coordinator",
    location: "Majuli, Assam",
    programSlug: "shiksha-setu",
    quote:
      "The river changes its mind every season. Children should not have to change their dreams with it.",
    chapters: [
      {
        label: "Before",
        text: "Each monsoon, the path from Rumi's island to the nearest school disappeared beneath fast water. Attendance fell, younger children stayed home, and older learners tried to study from borrowed worksheets.",
      },
      {
        label: "The idea",
        text: "Boat operators, parents, and teachers mapped a safe loop between four settlements. Ashaaya funded the vessel fit-out, educator pay, solar charging, and offline learning library; the island committee set the timetable and safety rules.",
      },
      {
        label: "Now",
        text: "The boat runs five days a week and doubles as a reading room on Saturdays. Rumi's latest learning check shows that 41 of 52 regular learners advanced at least one reading level in a term.",
      },
    ],
    outcomes: [
      { value: "52", label: "regular learners" },
      { value: "79%", label: "gained a reading level" },
      { value: "0", label: "safety incidents" },
    ],
    image: photo(
      "photo-1503676260728-1c00da094a0b",
      "Young student focused on her work in a community classroom",
    ),
    publishedAt: "2026-07-18",
    readTime: "6 min read",
    privacyNote:
      "Published with Rumi's informed consent; the learning data is reported in aggregate.",
  },
  {
    slug: "a-clinic-timed-for-real-life",
    title: "A clinic timed for real life",
    dek: "Health guide Salma Bano changed one question—and helped a desert clinic meet women on their own time.",
    person: "Salma Bano",
    personContext: "Sehat Saathi community health guide",
    location: "Barmer, Rajasthan",
    programSlug: "sehat-saathi",
    quote:
      "We stopped asking why women missed the clinic. We asked when the clinic was missing them.",
    chapters: [
      {
        label: "The gap",
        text: "Daytime clinics overlapped with paid work, livestock care, and the only available bus. Preventive appointments were postponed until symptoms became emergencies.",
      },
      {
        label: "The shift",
        text: "Salma surveyed 180 households and proposed an evening route. The mobile team now arrives after 16:00, carries rapid diagnostics, and books referred appointments before a patient leaves.",
      },
      {
        label: "The result",
        text: "In six months, attendance at the route more than doubled. All 28 people flagged for high-risk follow-up reached a higher-level facility with a guide or transport plan.",
      },
    ],
    outcomes: [
      { value: "2.3×", label: "increase in attendance" },
      { value: "28/28", label: "high-risk referrals completed" },
      { value: "61%", label: "visits after 17:00" },
    ],
    image: photo(
      "photo-1559839734-2b71ea197ec2",
      "Woman health professional standing in a clinic corridor",
    ),
    publishedAt: "2026-06-24",
    readTime: "5 min read",
    privacyNote:
      "Salma chose to be named. Patient details have been combined to protect medical privacy.",
  },
  {
    slug: "the-well-that-brought-back-an-afternoon",
    title: "The well that brought back an afternoon",
    dek: "A women-led water committee restored more than a catchment; it returned hundreds of hours to the village.",
    person: "Lata Jadhav",
    personContext: "Farmer and elected water-commons treasurer",
    location: "Beed, Maharashtra",
    programSlug: "hariyali-commons",
    quote:
      "We count water in litres. I also count it in the afternoons our daughters got back.",
    chapters: [
      {
        label: "Before",
        text: "By February, the old well failed and water collection expanded to a three-kilometre round trip. Women and girls absorbed most of that time, often missing paid work or late classes.",
      },
      {
        label: "The build",
        text: "Residents traced historic runoff routes, then chose a recharge trench, native grasses, and rules for irrigation withdrawals. Ashaaya paid local crews and installed a simple water-level gauge.",
      },
      {
        label: "After two monsoons",
        text: "The well now holds through May in a normal rainfall year. Average household collection time has fallen by 47 minutes a day, and the committee publishes the gauge reading each week.",
      },
    ],
    outcomes: [
      { value: "47 min", label: "saved per household daily" },
      { value: "8.6M L", label: "estimated annual recharge" },
      { value: "64", label: "households sharing governance" },
    ],
    image: photo(
      "photo-1500530855697-b586d89ba3ee",
      "Woman looking across a green rural landscape at sunset",
    ),
    publishedAt: "2026-05-29",
    readTime: "7 min read",
    privacyNote:
      "Published with Lata's informed consent and reviewed by the village water committee.",
  },
];

export const projectLocations: SiteContent["projectLocations"] = [
  {
    id: "loc-majuli",
    name: "Majuli river islands",
    region: "Assam",
    country: "India",
    latitude: 26.95,
    longitude: 94.18,
    programSlugs: ["shiksha-setu", "raahat-ready", "surakshit-bachpan"],
    activeProjects: 9,
    peopleReached: 12840,
    summary:
      "Boat-based learning, child-safe spaces, and flood preparedness across shifting island communities.",
  },
  {
    id: "loc-gaya",
    name: "Gaya district",
    region: "Bihar",
    country: "India",
    latitude: 24.79,
    longitude: 85.0,
    programSlugs: ["shiksha-setu", "rasoi-network", "udaan-women"],
    activeProjects: 12,
    peopleReached: 26320,
    summary:
      "Learning recovery, locally sourced school meals, and women-led producer circles.",
  },
  {
    id: "loc-barmer",
    name: "Barmer district",
    region: "Rajasthan",
    country: "India",
    latitude: 25.75,
    longitude: 71.4,
    programSlugs: ["sehat-saathi", "udaan-women", "hariyali-commons"],
    activeProjects: 8,
    peopleReached: 17460,
    summary:
      "Evening mobile clinics, enterprise circles, and heat-resilient public spaces.",
  },
  {
    id: "loc-kendrapara",
    name: "Kendrapara coast",
    region: "Odisha",
    country: "India",
    latitude: 20.5,
    longitude: 86.42,
    programSlugs: ["raahat-ready", "rasoi-network", "sehat-saathi"],
    activeProjects: 11,
    peopleReached: 22410,
    summary:
      "Cyclone readiness, safe water, nutrition, and health referrals in low-lying coastal blocks.",
  },
  {
    id: "loc-beed",
    name: "Beed and Jalna",
    region: "Maharashtra",
    country: "India",
    latitude: 18.99,
    longitude: 75.76,
    programSlugs: ["hariyali-commons", "udaan-women", "kaushal-labs"],
    activeProjects: 14,
    peopleReached: 28780,
    summary:
      "Water commons, regenerative livelihoods, and green-skills pathways in drought-prone villages.",
  },
  {
    id: "loc-bengaluru",
    name: "Bengaluru urban region",
    region: "Karnataka",
    country: "India",
    latitude: 12.97,
    longitude: 77.59,
    programSlugs: [
      "kaushal-labs",
      "saath-senior-care",
      "jeev-raksha",
      "surakshit-bachpan",
    ],
    activeProjects: 16,
    peopleReached: 31450,
    summary:
      "Youth pathways, neighbourhood senior care, child safeguarding, and humane animal response.",
  },
  {
    id: "loc-koshi-learning",
    name: "Koshi learning circle",
    region: "Koshi Province",
    country: "Nepal",
    latitude: 26.66,
    longitude: 87.28,
    programSlugs: ["raahat-ready", "hariyali-commons"],
    activeProjects: 3,
    peopleReached: 3820,
    summary:
      "A peer-learning partnership on flood forecasts, local response funds, and watershed repair.",
  },
  {
    id: "loc-khulna-learning",
    name: "Khulna learning circle",
    region: "Khulna Division",
    country: "Bangladesh",
    latitude: 22.85,
    longitude: 89.54,
    programSlugs: ["raahat-ready", "sehat-saathi"],
    activeProjects: 2,
    peopleReached: 3160,
    summary:
      "Partner-led exchange on cyclone shelters, accessible warnings, and continuity of primary care.",
  },
  {
    id: "loc-matale-learning",
    name: "Matale learning circle",
    region: "Central Province",
    country: "Sri Lanka",
    latitude: 7.47,
    longitude: 80.62,
    programSlugs: ["hariyali-commons", "udaan-women"],
    activeProjects: 2,
    peopleReached: 2020,
    summary:
      "A practitioner exchange on regenerative spice farming and women-owned rural enterprise.",
  },
];

export const gallery: SiteContent["gallery"] = [
  {
    id: "gallery-river-reading",
    category: "fieldwork",
    title: "Reading hour, between crossings",
    location: "Majuli, Assam",
    capturedAt: "2026-07-12",
    image: photo(
      "photo-1491841550275-ad7854e35ca6",
      "Learners sharing books during a reading hour",
      1200,
      1500,
    ),
    storyHref: "/stories/the-classroom-that-follows-the-river",
  },
  {
    id: "gallery-health-guide",
    category: "people",
    title: "The last appointment of the evening",
    location: "Barmer, Rajasthan",
    capturedAt: "2026-06-18",
    image: photo(
      "photo-1576091160550-2173dba999ef",
      "Health worker and patient speaking during a consultation",
      1600,
      1067,
    ),
    storyHref: "/stories/a-clinic-timed-for-real-life",
  },
  {
    id: "gallery-kitchen",
    category: "fieldwork",
    title: "Lunch begins with the local market",
    location: "Gaya, Bihar",
    capturedAt: "2026-05-08",
    image: photo(
      "photo-1543353071-10c8ba85a904",
      "Seasonal vegetables ready for a community kitchen",
      1200,
      1500,
    ),
  },
  {
    id: "gallery-water-gauge",
    category: "nature",
    title: "Reading the well after the first rain",
    location: "Beed, Maharashtra",
    capturedAt: "2026-06-26",
    image: photo(
      "photo-1500534623283-312aade485b7",
      "Hands checking water in a restored rural catchment",
      1600,
      1067,
    ),
    storyHref: "/stories/the-well-that-brought-back-an-afternoon",
  },
  {
    id: "gallery-solar-clinic",
    category: "fieldwork",
    title: "Power for the night clinic",
    location: "Barmer, Rajasthan",
    capturedAt: "2026-04-15",
    image: photo(
      "photo-1508514177221-188b1cf16e9d",
      "Solar panels catching late afternoon light",
      1600,
      1067,
    ),
  },
  {
    id: "gallery-youth-lab",
    category: "events",
    title: "Portfolio day at Kaushal Labs",
    location: "Bengaluru, Karnataka",
    capturedAt: "2026-07-03",
    image: photo(
      "photo-1522202176988-66273c2fd55f",
      "Young adults collaborating around a table",
      1600,
      1067,
    ),
  },
  {
    id: "gallery-native-canopy",
    category: "nature",
    title: "Canopy audit, year two",
    location: "Jalna, Maharashtra",
    capturedAt: "2026-03-21",
    image: photo(
      "photo-1448375240586-882707db888b",
      "Looking upward through a healthy green forest canopy",
      1200,
      1500,
    ),
  },
  {
    id: "gallery-senior-circle",
    category: "people",
    title: "Tuesday belongs to stories",
    location: "Bengaluru, Karnataka",
    capturedAt: "2026-07-22",
    image: photo(
      "photo-1529156069898-49953e39b3ac",
      "Friends sharing conversation and laughter outdoors",
      1600,
      1067,
    ),
  },
];

export const events: SiteContent["events"] = [
  {
    slug: "bengaluru-night-walk-2026",
    title: "The city after six: an accessibility night walk",
    summary:
      "Map lighting, kerbs, crossings, and safe pauses with older residents and disability advocates, then turn the route into an open civic brief.",
    start: "2026-08-23T18:00:00+05:30",
    end: "2026-08-23T20:30:00+05:30",
    timezone: "Asia/Kolkata",
    location: "Bengaluru, Karnataka",
    venue: "Cubbon Park Metro, Gate B",
    format: "in-person",
    status: "open",
    category: "Community action",
    capacity: 80,
    remainingPlaces: 24,
    registrationHref: "/events/bengaluru-night-walk-2026/register",
    image: photo(
      "photo-1518005020951-eccb494ad742",
      "People walking together through a city at dusk",
    ),
    accessibility: [
      "Step-free route",
      "Indian Sign Language interpreter",
      "Seated rest points",
      "Companion registration",
    ],
  },
  {
    slug: "field-notes-live-water-commons",
    title: "Field Notes Live: who gets to govern water?",
    summary:
      "A practical online conversation with village treasurers, hydrologists, and funders on moving from water assets to shared water rules.",
    start: "2026-09-12T17:00:00+05:30",
    end: "2026-09-12T18:15:00+05:30",
    timezone: "Asia/Kolkata",
    location: "Online",
    venue: "Ashaaya Live",
    format: "online",
    status: "open",
    category: "Learning session",
    capacity: 500,
    remainingPlaces: 318,
    registrationHref: "/events/field-notes-live-water-commons/register",
    image: photo(
      "photo-1504297050568-910d24c426d3",
      "Aerial view of a river winding through a green landscape",
    ),
    accessibility: [
      "Live captions",
      "Low-bandwidth audio stream",
      "Recording and transcript after the event",
    ],
  },
  {
    slug: "run-for-the-last-mile-2026",
    title: "Run for the Last Mile 2026",
    summary:
      "A timed 5K, an untimed 3K, and an accessible 1K roll-and-walk raising a full season of learning-boat routes.",
    start: "2026-10-03T05:30:00+05:30",
    end: "2026-10-03T09:30:00+05:30",
    timezone: "Asia/Kolkata",
    location: "Bengaluru, Karnataka",
    venue: "Sree Kanteerava Stadium",
    format: "in-person",
    status: "open",
    category: "Fundraiser",
    capacity: 1800,
    remainingPlaces: 742,
    registrationHref: "/events/run-for-the-last-mile-2026/register",
    image: photo(
      "photo-1552674605-db6ffd4facb5",
      "Community runners moving together on an outdoor route",
    ),
    accessibility: [
      "Wheelchair-friendly 1K route",
      "Accessible toilets",
      "Quiet registration lane",
      "Medical and hydration support",
    ],
  },
  {
    slug: "open-books-evening-2026",
    title: "Open Books: our annual impact evening",
    summary:
      "Meet field leaders, question the numbers, explore project exhibits, and hear what did not work this year as well as what did.",
    start: "2026-11-07T16:00:00+05:30",
    end: "2026-11-07T19:00:00+05:30",
    timezone: "Asia/Kolkata",
    location: "Mumbai, Maharashtra + online",
    venue: "The Commons, Lower Parel",
    format: "hybrid",
    status: "upcoming",
    category: "Transparency",
    capacity: 350,
    remainingPlaces: 350,
    registrationHref: "/events/open-books-evening-2026/register",
    image: photo(
      "photo-1505373877841-8d25f7d46678",
      "Audience gathered for an evening presentation",
    ),
    accessibility: [
      "Step-free venue",
      "Live captions",
      "Sensory-friendly room",
      "Remote questions accepted",
    ],
  },
  {
    slug: "monsoon-readiness-lab-2026",
    title: "Monsoon Readiness Lab",
    summary:
      "A completed tabletop simulation where 86 local responders rehearsed warnings, cash release, safeguarding, and accessible evacuation.",
    start: "2026-06-20T09:00:00+05:30",
    end: "2026-06-20T16:30:00+05:30",
    timezone: "Asia/Kolkata",
    location: "Guwahati, Assam",
    venue: "Ashaaya Northeast Hub",
    format: "hybrid",
    status: "completed",
    category: "Training",
    capacity: 100,
    remainingPlaces: 0,
    registrationHref: "/events/monsoon-readiness-lab-2026",
    image: photo(
      "photo-1531482615713-2afd69097998",
      "Facilitator leading a collaborative emergency planning workshop",
    ),
    accessibility: [
      "Step-free venue",
      "Assamese and Hindi interpretation",
      "Digital exercise pack",
    ],
  },
];

export const team: SiteContent["team"] = [
  {
    name: "Meera Rao",
    role: "Founder & Chief Executive",
    group: "leadership",
    bio: "Meera builds public-interest systems that can move quickly without moving carelessly. Before Ashaaya, she led district health and climate-adaptation programs across India for twelve years.",
    expertise: ["Systems design", "Public health", "Partnerships"],
    languages: ["English", "Hindi", "Kannada"],
    image: photo(
      "photo-1494790108377-be9c29b29330",
      "Meera Rao, Founder and Chief Executive",
      800,
      1000,
    ),
  },
  {
    name: "Arjun Sen",
    role: "Chief Operating & Finance Officer",
    group: "leadership",
    bio: "Arjun turns ambitious programs into accountable operating models. He previously built finance and last-mile procurement systems for a regional humanitarian network.",
    expertise: ["Finance", "Risk", "Humanitarian operations"],
    languages: ["English", "Hindi", "Bengali"],
    image: photo(
      "photo-1500648767791-00dcc994a43e",
      "Arjun Sen, Chief Operating and Finance Officer",
      800,
      1000,
    ),
  },
  {
    name: "Dr Nilofer Khan",
    role: "Director, Health & Safeguarding",
    group: "programs",
    bio: "Nilofer is a family physician and safeguarding specialist focused on care that remains safe, practical, and accountable beyond the clinic door.",
    expertise: ["Primary care", "Safeguarding", "Clinical governance"],
    languages: ["English", "Hindi", "Urdu", "Marwari"],
    image: photo(
      "photo-1551836022-d5d88e9218df",
      "Dr Nilofer Khan, Director of Health and Safeguarding",
      800,
      1000,
    ),
  },
  {
    name: "Ritwik Das",
    role: "Director, Learning & Livelihoods",
    group: "programs",
    bio: "Ritwik works with educators, youth, and employers to make learning portable and opportunity measurable. His roots are in community radio and bilingual education.",
    expertise: ["Education", "Youth employment", "Participatory design"],
    languages: ["English", "Hindi", "Assamese", "Bengali"],
    image: photo(
      "photo-1507003211169-0a1dd7228f2d",
      "Ritwik Das, Director of Learning and Livelihoods",
      800,
      1000,
    ),
  },
  {
    name: "Devika More",
    role: "Director, Climate & Resilience",
    group: "programs",
    bio: "Devika combines watershed ecology, disaster preparedness, and local governance. She insists that every restoration metric survives longer than the launch photograph.",
    expertise: ["Watersheds", "Climate adaptation", "Emergency response"],
    languages: ["English", "Hindi", "Marathi"],
    image: photo(
      "photo-1534528741775-53994a69daeb",
      "Devika More, Director of Climate and Resilience",
      800,
      1000,
    ),
  },
  {
    name: "Ananya Iyer",
    role: "Board Chair",
    group: "governance",
    bio: "Ananya is an independent governance adviser and former social-sector auditor. She chairs the board's ethics, risk, and executive review work.",
    expertise: ["Nonprofit governance", "Audit", "Ethics"],
    languages: ["English", "Hindi", "Tamil"],
    image: photo(
      "photo-1580489944761-15a19d654956",
      "Ananya Iyer, Board Chair",
      800,
      1000,
    ),
  },
  {
    name: "Kabir Mirza",
    role: "Trustee, Community Institutions",
    group: "governance",
    bio: "Kabir has spent two decades strengthening cooperatives and resident-led institutions. He safeguards Ashaaya's commitment to place decisions close to the work.",
    expertise: ["Cooperatives", "Rural enterprise", "Community governance"],
    languages: ["English", "Hindi", "Urdu", "Gujarati"],
    image: photo(
      "photo-1531123897727-8f129e1688ce",
      "Kabir Mirza, Trustee for Community Institutions",
      800,
      1000,
    ),
  },
  {
    name: "Tsering Dolma",
    role: "Trustee, People & Culture",
    group: "governance",
    bio: "Tsering is an organisational psychologist who advises mission-led teams on healthy culture, distributed leadership, and responsible growth.",
    expertise: ["Organisational health", "Leadership", "People systems"],
    languages: ["English", "Hindi", "Tibetan"],
    image: photo(
      "photo-1534751516642-a1af1ef26a56",
      "Tsering Dolma, Trustee for People and Culture",
      800,
      1000,
    ),
  },
];

export const recognitions: SiteContent["recognitions"] = [
  {
    year: "2025",
    title: "Open Books Distinction",
    issuer: "Civic Trust Forum",
    description:
      "Recognised for publishing campaign-level costs, outcome notes, and corrective actions in one accessible record.",
  },
  {
    year: "2024",
    title: "Community Design Commendation",
    issuer: "South Asia Social Innovation Circle",
    description:
      "Honoured for transferring project decisions and maintenance budgets to resident steering groups.",
  },
  {
    year: "2023",
    title: "Climate-Ready Relief Citation",
    issuer: "Resilient Futures Assembly",
    description:
      "Cited for linking rapid household cash with long-term, locally governed recovery plans.",
  },
];

export const testimonials: SiteContent["testimonials"] = [
  {
    quote:
      "Ashaaya did not arrive with a finished answer. They brought a budget to the table and asked us to design the route.",
    name: "Rumi Pegu",
    context: "Community educator",
    location: "Majuli, Assam",
    image: photo(
      "photo-1488426862026-3ee34a7d66df",
      "Rumi Pegu, community educator",
      600,
      600,
    ),
  },
  {
    quote:
      "I can see the milestone, the spend, and the field note in the same place. That clarity is why I changed my gift from annual to monthly.",
    name: "Neel Shah",
    context: "Monthly donor since 2022",
    location: "Pune, Maharashtra",
  },
  {
    quote:
      "The strongest part of the partnership is honest course correction. When a target slips, we hear why and what the field team is changing next.",
    name: "Maya Fernandes",
    context: "Social-impact portfolio lead",
    location: "Singapore",
  },
  {
    quote:
      "My apprenticeship was not just a certificate. The coach stayed until my third salary, when I finally felt the job was mine.",
    name: "Farhan Ali",
    context: "Kaushal Labs graduate",
    location: "Bengaluru, Karnataka",
  },
];

export const faqs: SiteContent["faqs"] = [
  {
    id: "donation-use",
    category: "donations",
    question: "How will Ashaaya use my donation?",
    answer:
      "You can give to the highest-priority fund or choose an active campaign. Campaign pages show their planned allocation before you give. If a restricted campaign is fully funded, we will ask permission before moving your gift; otherwise it remains reserved for that purpose or is refunded where feasible.",
    links: [
      {
        label: "See our fund allocation",
        href: "/about/governance#fund-allocation",
      },
    ],
  },
  {
    id: "tax-receipt",
    category: "donations",
    question: "Will I receive an 80G tax receipt?",
    answer:
      "Yes. Eligible gifts made through the Indian donation flow receive a payment receipt immediately and an 80G certificate by email after the required name, address, and PAN details are complete. Tax treatment depends on your circumstances, so retain the certificate and consult a tax adviser if needed.",
  },
  {
    id: "international-gifts",
    category: "donations",
    question: "Can I donate from outside India?",
    answer:
      "Yes, through our international giving route. Select your country on the donation page and we will show the available currency, payment method, and receipt treatment before payment. Indian and foreign-source gifts are processed through separate designated accounts.",
  },
  {
    id: "monthly-donation",
    category: "donations",
    question: "Can I change or stop a monthly donation?",
    answer:
      "Any time. Sign in to manage the amount, payment method, campaign, or next payment date. You can also email donor care; requests received two working days before the next charge are applied to that cycle.",
    links: [{ label: "Manage monthly giving", href: "/account/donations" }],
  },
  {
    id: "impact-verification",
    category: "impact",
    question: "How do you verify the impact numbers?",
    answer:
      "Field teams record service delivery against participant or household IDs designed to minimise personal data. Program leads reconcile those logs with attendance, procurement, and payment records each month. Every quarter, our learning team samples records and visits sites; material corrections are dated in the public dashboard.",
    links: [
      { label: "Read the measurement method", href: "/impact#methodology" },
    ],
  },
  {
    id: "people-reached",
    category: "impact",
    question: "What does “people reached” mean?",
    answer:
      "It counts a person who directly participated in or received a defined service, not social-media impressions or family-size multipliers. Within a program, repeat visits count once for the reporting period. Cross-program deduplication is applied where consented identifiers allow it, and the remaining estimation range is disclosed in our impact notes.",
  },
  {
    id: "failed-projects",
    category: "impact",
    question: "Do you publish projects that miss their targets?",
    answer:
      "Yes. A completed project keeps its original target, final result, explanation, and corrective action. We do not quietly replace a difficult metric with an easier one. Learning notes are reviewed with the community steering group before publication.",
  },
  {
    id: "volunteer-selection",
    category: "volunteering",
    question: "Who can volunteer?",
    answer:
      "Adults aged 18 and above can apply to open roles; some event roles are available to 16–17-year-olds with guardian consent and direct supervision. Selection depends on the role, availability, relevant skills, and safeguarding requirements—not on previous nonprofit experience.",
  },
  {
    id: "volunteer-cost",
    category: "volunteering",
    question: "Do volunteers have to pay to participate?",
    answer:
      "No. Ashaaya does not charge application or placement fees. Approved role-related travel and field expenses are reimbursed under the role brief, and essential training is provided at no cost.",
  },
  {
    id: "field-visits",
    category: "volunteering",
    question: "Can donors or volunteers visit a project?",
    answer:
      "Some programs host small, scheduled learning visits when the community agrees and the visit serves a clear purpose. We do not arrange poverty tours or unscheduled photography. Visitors complete safeguarding and consent briefings before entering a site.",
  },
  {
    id: "governance-complaints",
    category: "governance",
    question: "How can I raise a safeguarding or ethics concern?",
    answer:
      "Use the confidential reporting form or email ethics@ashaaya.org. Reports may be anonymous, are restricted to trained reviewers, and are acknowledged within two working days. Immediate danger should always be reported first to the appropriate local emergency service.",
    links: [{ label: "Make a confidential report", href: "/speak-up" }],
  },
  {
    id: "governance-reports",
    category: "governance",
    question: "Where can I find financial statements and policies?",
    answer:
      "The governance library includes annual reports, audited financial statements, registration records, safeguarding and privacy policies, board attendance, executive compensation bands, and conflict-of-interest disclosures.",
    links: [
      { label: "Open the governance library", href: "/about/governance" },
    ],
  },
];

export const offices: SiteContent["offices"] = [
  {
    id: "office-bengaluru",
    name: "Ashaaya House",
    type: "registered-office",
    addressLines: ["18 Community Lane", "Shanthinagar"],
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560027",
    country: "India",
    coordinates: { latitude: 12.9582, longitude: 77.5922 },
    email: "hello@ashaaya.org",
    phone: "+91 80 4718 2020",
    hours: "Monday–Friday, 9:30–17:30; visits by appointment",
    directionsHref: "https://maps.google.com/?q=Shanthinagar+Bengaluru",
  },
  {
    id: "office-guwahati",
    name: "Northeast Regional Hub",
    type: "regional-hub",
    addressLines: ["7 Riverbend Road", "Uzan Bazar"],
    city: "Guwahati",
    state: "Assam",
    postalCode: "781001",
    country: "India",
    coordinates: { latitude: 26.1924, longitude: 91.7519 },
    email: "northeast@ashaaya.org",
    phone: "+91 361 418 2040",
    hours: "Monday–Saturday, 9:00–17:00; field schedules vary",
    directionsHref: "https://maps.google.com/?q=Uzan+Bazar+Guwahati",
  },
  {
    id: "office-bhubaneswar",
    name: "East Coast Field Office",
    type: "field-office",
    addressLines: ["22 Seva Path", "Saheed Nagar"],
    city: "Bhubaneswar",
    state: "Odisha",
    postalCode: "751007",
    country: "India",
    coordinates: { latitude: 20.2917, longitude: 85.8468 },
    email: "eastcoast@ashaaya.org",
    phone: "+91 674 418 2060",
    hours:
      "Monday–Saturday, 9:00–17:00; emergency desk operates 24/7 when activated",
    directionsHref: "https://maps.google.com/?q=Saheed+Nagar+Bhubaneswar",
  },
];

export const donation: SiteContent["donation"] = {
  eyebrow: "Make hope arrive",
  title: "Your generosity becomes a clear next step.",
  description:
    "Choose where to give or let our program team direct your gift to the most time-sensitive verified need. You will receive a receipt now and field updates as the work moves.",
  defaultFrequency: "monthly",
  tiers: [
    {
      amount: 750,
      currency: "INR",
      label: "A healthy start",
      impact: "Two preventive health screenings with follow-up",
    },
    {
      amount: 1200,
      currency: "INR",
      label: "A month of learning",
      impact:
        "Keeps one child connected to a community learning hub for a month",
    },
    {
      amount: 2500,
      currency: "INR",
      label: "Steady support",
      impact:
        "Funds a mix of urgent supplies, local expertise, and verified follow-through",
      popular: true,
    },
    {
      amount: 5000,
      currency: "INR",
      label: "Room to recover",
      impact:
        "Provides flexible emergency cash and safe-water supplies for a family",
    },
    {
      amount: 12000,
      currency: "INR",
      label: "Build resilience",
      impact:
        "Creates one rainwater contour and pays the local crew who maintains it",
    },
  ],
  assurances: [
    "Secure Razorpay and Stripe checkout",
    "Instant receipt and eligible 80G certificate",
    "Cancel or change monthly gifts any time",
    "No donor names shown publicly without consent",
  ],
  allocationNote:
    "Unrestricted gifts go to the highest-priority verified need and the systems that make delivery safe, measurable, and accountable.",
  receiptNote:
    "For an Indian tax certificate, provide the donor's legal name, address, and PAN exactly as they should appear on the receipt.",
};

export const volunteer: SiteContent["volunteer"] = {
  eyebrow: "Bring what only you can bring",
  title: "Useful work, clear expectations, real support.",
  description:
    "Volunteer roles begin with a field-defined need and end with a handover, not a vanity assignment. We provide safeguarding, context, supervision, and honest feedback.",
  benefits: [
    "Role-specific induction and safeguarding training",
    "A named supervisor and structured feedback",
    "Approved field expenses reimbursed",
    "Service certificate after agreed outcomes are completed",
    "Access to Ashaaya's quarterly learning sessions",
  ],
  requirements: [
    "Respect participant privacy and dignity at all times",
    "Complete identity, reference, and role-appropriate background checks",
    "Commit to the stated schedule rather than occasional availability",
    "Use consented systems for files, photographs, and communication",
  ],
  process: [
    {
      step: "01",
      title: "Choose a useful role",
      description:
        "Read the outcome, schedule, location, and skills before applying.",
    },
    {
      step: "02",
      title: "Talk with the team",
      description:
        "A 30-minute conversation checks mutual fit and answers practical questions.",
    },
    {
      step: "03",
      title: "Train and verify",
      description:
        "Complete safeguarding, role induction, and any required checks.",
    },
    {
      step: "04",
      title: "Do the work",
      description:
        "Start with a named supervisor, milestones, and a documented handover.",
    },
  ],
  roles: [
    {
      slug: "bilingual-learning-mentor",
      title: "Bilingual learning mentor",
      location: "Majuli, Assam",
      commitment: "Two Saturdays per month for six months",
      mode: "field",
      summary:
        "Support Assamese and English reading circles and help educators organise learner portfolios.",
      skills: [
        "Assamese fluency",
        "Patient facilitation",
        "Experience with children",
      ],
      openings: 8,
    },
    {
      slug: "impact-data-reviewer",
      title: "Impact data reviewer",
      location: "Remote within India",
      commitment: "Four hours weekly for twelve weeks",
      mode: "remote",
      summary:
        "Review de-identified field datasets for completeness, anomalies, and clear public reporting.",
      skills: [
        "Spreadsheet analysis",
        "Data privacy",
        "Clear written feedback",
      ],
      openings: 5,
    },
    {
      slug: "senior-digital-companion",
      title: "Senior digital companion",
      location: "Bengaluru, Karnataka",
      commitment: "One weekday evening for four months",
      mode: "hybrid",
      summary:
        "Help an older adult use payments, telehealth, messaging, and public-service apps safely and confidently.",
      skills: ["Kannada or Tamil", "Digital safety", "Empathy and reliability"],
      openings: 14,
    },
    {
      slug: "event-accessibility-steward",
      title: "Event accessibility steward",
      location: "Mumbai, Maharashtra",
      commitment: "Training plus Open Books event on 7 November",
      mode: "field",
      summary:
        "Support step-free arrival, quiet-room access, seating choices, and attendee wayfinding at our annual impact evening.",
      skills: [
        "Calm communication",
        "Accessibility awareness",
        "Event coordination",
      ],
      openings: 12,
    },
  ],
};

export const articles: SiteContent["articles"] = [
  {
    slug: "why-we-count-tree-survival-not-planting-days",
    title: "Why we count tree survival—not planting days",
    excerpt:
      "A sapling in the ground is an activity. Shade, habitat, and reliable local stewardship are outcomes. Here is the three-year measure behind our restoration work.",
    category: "research",
    author: "Devika More",
    publishedAt: "2026-07-28",
    readTime: "8 min read",
    image: photo(
      "photo-1448375240586-882707db888b",
      "Healthy tree canopy viewed from the forest floor",
    ),
    tags: ["restoration", "measurement", "climate"],
    featured: true,
  },
  {
    slug: "six-hours-before-the-headlines",
    title: "Six hours before the headlines",
    excerpt:
      "What a local response fund can do between a verified warning and national attention—and which safeguards should never be skipped for speed.",
    category: "field-note",
    author: "Arjun Sen",
    publishedAt: "2026-07-31",
    readTime: "6 min read",
    image: photo(
      "photo-1534274988757-a28bf1a57c17",
      "Storm clouds gathering over a coastal landscape",
    ),
    tags: ["emergency response", "cash assistance", "operations"],
    featured: true,
  },
  {
    slug: "what-evening-clinics-changed",
    title: "What changed when the clinic opened after sunset",
    excerpt:
      "The data showed missed appointments. Household conversations revealed a time-design problem. Six months later, the new route tells a different story.",
    category: "field-note",
    author: "Dr Nilofer Khan",
    publishedAt: "2026-06-19",
    readTime: "5 min read",
    image: photo(
      "photo-1584982751601-97dcc096659c",
      "Health professional preparing a patient screening",
    ),
    tags: ["primary care", "access", "women's health"],
    featured: false,
  },
  {
    slug: "the-case-for-patient-capital-in-small-enterprise",
    title: "Small enterprises need patient capital, not smaller ambition",
    excerpt:
      "Women-led rural businesses are often judged on repayment before they can negotiate a fair buyer. Udaan's working-capital circles reverse that order.",
    category: "perspective",
    author: "Meera Rao",
    publishedAt: "2026-05-12",
    readTime: "7 min read",
    image: photo(
      "photo-1556761175-b413da4baf72",
      "Women discussing a shared enterprise plan around a table",
    ),
    tags: ["livelihoods", "women", "finance"],
    featured: false,
  },
  {
    slug: "ashaaya-quarterly-field-note-april-june-2026",
    title: "Quarterly field note: April–June 2026",
    excerpt:
      "Three milestones ahead, two behind, one target retired—and the evidence that changed our next quarter's plan.",
    category: "news",
    author: "Ashaaya Learning Team",
    publishedAt: "2026-07-10",
    readTime: "10 min read",
    image: photo(
      "photo-1454165804606-c3d57bc86b40",
      "Team reviewing charts and field notes together",
    ),
    tags: ["transparency", "quarterly update", "learning"],
    featured: true,
  },
  {
    slug: "consent-is-a-living-agreement",
    title: "Consent is a living agreement, not a signed form",
    excerpt:
      "Our revised story protocol gives participants a clear second look, a withdrawal route, and meaningful choices about names, images, and channels.",
    category: "perspective",
    author: "Dr Nilofer Khan",
    publishedAt: "2026-04-22",
    readTime: "6 min read",
    image: photo(
      "photo-1521737711867-e3b97375f902",
      "Colleagues in conversation around a shared table",
    ),
    tags: ["dignity", "safeguarding", "storytelling"],
    featured: false,
  },
];

export const newsletter: SiteContent["newsletter"] = {
  eyebrow: "Field Notes, once a month",
  title: "Less noise. More signal from the work.",
  description:
    "One considered email with a field story, a number worth interrogating, and a practical way to help. No daily asks and no manufactured urgency.",
  consentLabel:
    "I agree to receive Ashaaya Field Notes and can unsubscribe at any time.",
  successMessage:
    "You are on the list. Your first Field Note will arrive on the next second Thursday.",
  sampleTopics: ["What changed", "What we learned", "Where help is needed"],
};

export const footerGroups: SiteContent["footer"] = [
  {
    title: "Explore",
    links: [
      { label: "About Ashaaya", href: "/about" },
      { label: "Programs", href: "/programs" },
      { label: "Impact dashboard", href: "/impact" },
      { label: "Stories", href: "/stories" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    title: "Take action",
    links: [
      { label: "Donate", href: "/donate" },
      { label: "Volunteer", href: "/volunteer" },
      { label: "Attend an event", href: "/events" },
      { label: "Partner with us", href: "/contact?subject=partnership" },
      { label: "Start a fundraiser", href: "/fundraise" },
    ],
  },
  {
    title: "Accountability",
    links: [
      { label: "Annual reports", href: "/about/governance#reports" },
      { label: "Financial statements", href: "/about/governance#financials" },
      { label: "Safeguarding", href: "/about/governance#safeguarding" },
      { label: "Privacy", href: "/privacy" },
      { label: "Speak up", href: "/speak-up" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faq" },
      { label: "Donor help", href: "/contact?subject=donor-support" },
      { label: "Media room", href: "/media" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

export const adminSummary: SiteContent["admin"] = {
  reportingPeriod: "1–31 July 2026",
  lastSyncedAt: "2026-08-05T09:42:00+05:30",
  kpis: [
    {
      id: "gross-donations",
      label: "Gross donations",
      value: 18420000,
      formattedValue: "₹1.84Cr",
      changePercent: 12.4,
      changeLabel: "vs previous month",
      trend: [42, 48, 45, 58, 62, 67, 73, 69, 78, 84, 81, 92],
    },
    {
      id: "active-monthly-donors",
      label: "Active monthly donors",
      value: 6428,
      formattedValue: "6,428",
      changePercent: 8.1,
      changeLabel: "vs previous month",
      trend: [52, 54, 57, 59, 62, 65, 67, 70, 74, 77, 81, 86],
    },
    {
      id: "volunteer-hours",
      label: "Verified volunteer hours",
      value: 3816,
      formattedValue: "3,816",
      changePercent: 5.7,
      changeLabel: "vs previous month",
      trend: [48, 51, 50, 54, 58, 56, 61, 65, 63, 68, 72, 76],
    },
    {
      id: "campaign-conversion",
      label: "Donation conversion",
      value: 6.84,
      formattedValue: "6.84%",
      changePercent: -0.6,
      changeLabel: "vs previous month",
      trend: [70, 74, 73, 76, 72, 71, 69, 68, 72, 70, 67, 66],
    },
  ],
  recentActivity: [
    {
      id: "activity-batch-80g",
      type: "donation",
      title: "312 tax certificates issued",
      detail:
        "July's verified 80G batch completed with 6 records held for missing PAN details.",
      occurredAt: "2026-08-05T09:28:00+05:30",
      status: "positive",
    },
    {
      id: "activity-odisha-milestone",
      type: "campaign",
      title: "Odisha household cash milestone verified",
      detail:
        "860 transfers reconciled against consented household records and payment confirmations.",
      occurredAt: "2026-08-05T08:15:00+05:30",
      status: "positive",
    },
    {
      id: "activity-volunteer-checks",
      type: "volunteer",
      title: "Background checks need review",
      detail:
        "Nine shortlisted volunteer applications have documents awaiting manual verification.",
      occurredAt: "2026-08-04T17:40:00+05:30",
      status: "attention",
    },
    {
      id: "activity-event-capacity",
      type: "event",
      title: "Run registrations passed 1,000",
      detail:
        "The accessible 1K route is at 74% capacity; additional mobility volunteers have been requested.",
      occurredAt: "2026-08-04T14:05:00+05:30",
      status: "neutral",
    },
    {
      id: "activity-field-note",
      type: "content",
      title: "Quarterly field note approved",
      detail:
        "Governance review complete; Hindi and Assamese editions remain in translation.",
      occurredAt: "2026-08-04T11:20:00+05:30",
      status: "positive",
    },
  ],
  campaignPerformance: [
    {
      campaignId: "cmp-school-without-shores",
      raised: 3360000,
      goal: 4800000,
      currency: "INR",
      donationsThisMonth: 684,
      conversionRate: 7.2,
      daysRemaining: 56,
    },
    {
      campaignId: "cmp-clinics-after-sunset",
      raised: 4950000,
      goal: 7500000,
      currency: "INR",
      donationsThisMonth: 311,
      conversionRate: 5.8,
      daysRemaining: 117,
    },
    {
      campaignId: "cmp-raahat-monsoon",
      raised: 6840000,
      goal: 9000000,
      currency: "INR",
      donationsThisMonth: 2168,
      conversionRate: 10.6,
      daysRemaining: 25,
    },
    {
      campaignId: "cmp-one-acre-cooler",
      raised: 1600000,
      goal: 3200000,
      currency: "INR",
      donationsThisMonth: 206,
      conversionRate: 4.9,
      daysRemaining: 207,
    },
  ],
  donationChannels: [
    { label: "UPI", percentage: 44, amount: 8104800 },
    { label: "Cards", percentage: 31, amount: 5710200 },
    { label: "Bank transfer", percentage: 17, amount: 3131400 },
    { label: "International", percentage: 8, amount: 1473600 },
  ],
  attentionItems: [
    {
      label: "Receipts missing PAN",
      count: 6,
      href: "/admin/donations?filter=missing-pan",
    },
    {
      label: "Volunteer checks",
      count: 9,
      href: "/admin/volunteers?filter=verification",
    },
    {
      label: "Media consent expiring",
      count: 4,
      href: "/admin/media?filter=consent-expiring",
    },
    {
      label: "Drafts awaiting review",
      count: 7,
      href: "/admin/content?filter=review",
    },
  ],
};

export const siteContent: SiteContent = {
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
};

export default siteContent;
