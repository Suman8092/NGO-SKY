import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "7kf36p68",
  dataset: "production",
  token: "skHszcFkWH6HUXUH5vT1VrQinn60kb3uCau48Qsz8a8HslDd4T92raEns267W6SkuENKMBFvLToPie5Q6viG3LplnuYjiQqufgWiRGWC3LtnXykKp6q50GFYvILLk7tHbnoCuJYfKkJToyy2hZS2fkwozC151cjmowoJeJZFDd4MiUTGMmcH",
  apiVersion: "2025-02-19",
  useCdn: false,
});

async function seed() {
  console.log("Starting Sanity seeding for Skymeredian Foundation...");

  // 1. Categories
  const categories = [
    { _id: "cat-education", _type: "category", title: "Education", description: "Learning pods, teacher training, and digital classrooms." },
    { _id: "cat-water", _type: "category", title: "Clean Water", description: "Community filtration stations and water conservation." },
    { _id: "cat-health", _type: "category", title: "Healthcare", description: "Preventive health camps and maternal care outreach." },
    { _id: "cat-livelihoods", _type: "category", title: "Livelihoods", description: "Regenerative agriculture and women's cooperatives." },
  ];

  for (const cat of categories) {
    await client.createOrReplace(cat);
    console.log(`✓ Seeded Category: ${cat.title}`);
  }

  // 2. Programs
  const programs = [
    {
      _id: "prog-education",
      _type: "program",
      title: "Foundational Learning & Floating Pods",
      slug: { _type: "slug", current: "education-access" },
      summary: "Equipping riverine communities and remote hamlets with adaptive learning kits, solar hubs, and trained local educators.",
      icon: "BookOpen",
      order: 1,
      impact: [
        { _key: "m1", value: "148 Pods", label: "Active Learning Hubs" },
        { _key: "m2", value: "32,000+", label: "Children Enrolled" },
      ],
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Every child deserves safe access to quality learning, regardless of geographical isolation or flood seasons." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "prog-water",
      _type: "program",
      title: "Community Water & Climate Resilience",
      slug: { _type: "slug", current: "clean-water" },
      summary: "Solar-powered micro-filtration plants and groundwater recharging managed directly by village water committees.",
      icon: "Droplets",
      order: 2,
      impact: [
        { _key: "m1", value: "87 Hubs", label: "Filtration Stations" },
        { _key: "m2", value: "65,000+", label: "People with Daily Safe Water" },
      ],
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Sustainable clean water infrastructure owned and maintained locally by community leadership." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "prog-health",
      _type: "program",
      title: "Mobile Primary & Maternal Care",
      slug: { _type: "slug", current: "rural-healthcare" },
      summary: "Bringing diagnostic facilities, essential pharmaceuticals, and maternal health monitoring directly to underserved hamlets.",
      icon: "HeartPulse",
      order: 3,
      impact: [
        { _key: "m1", value: "42 Camps", label: "Monthly Care Camps" },
        { _key: "m2", value: "18,400+", label: "Patients Screened" },
      ],
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Preventive healthcare access reaching the last mile with complete confidentiality and care." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
  ];

  for (const prog of programs) {
    await client.createOrReplace(prog);
    console.log(`✓ Seeded Program: ${prog.title}`);
  }

  // 3. Campaigns
  const campaigns = [
    {
      _id: "camp-boats",
      _type: "campaign",
      title: "Floating Learning Classrooms for Flood Hamlets",
      slug: { _type: "slug", current: "flood-learning-boats" },
      summary: "Building and deploying 12 solar-powered boat classrooms to keep school terms running during severe river flooding.",
      category: "Education",
      location: "Brahmaputra Basin, Assam",
      status: "active",
      currency: "INR",
      goal: 2500000,
      raised: 1845000,
      deadline: "2026-11-30T18:00:00.000Z",
      featured: true,
      isActive: true,
      story: [
        {
          _key: "s1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "During flood season, roads vanish for five months. These boats ensure learning never stops." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "camp-water",
      _type: "campaign",
      title: "Solar Water Hubs for Drought-Prone Villages",
      slug: { _type: "slug", current: "safe-water-pods" },
      summary: "Installing 20 solar-powered water purifiers eliminating fluoride and arsenic contamination across 14 rural clusters.",
      category: "Clean Water",
      location: "Bundelkhand & Marathwada",
      status: "active",
      currency: "INR",
      goal: 3000000,
      raised: 2150000,
      deadline: "2026-12-15T18:00:00.000Z",
      featured: true,
      isActive: true,
      story: [
        {
          _key: "s1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Clean drinking water drastically reduces fluorosis and infant hospital admissions." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "camp-health",
      _type: "campaign",
      title: "Mobile Health Units & Maternal Care Vans",
      slug: { _type: "slug", current: "mobile-health-vans" },
      summary: "Equipping 4 custom medical vans with ultrasound scanners, rapid diagnostics, and trained nurse practitioners.",
      category: "Healthcare",
      location: "Barmer & Jaisalmer, Rajasthan",
      status: "active",
      currency: "INR",
      goal: 4000000,
      raised: 3120000,
      deadline: "2026-10-31T18:00:00.000Z",
      featured: false,
      isActive: true,
      story: [
        {
          _key: "s1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Timely maternal monitoring and diagnostic tests save lives in remote desert settlements." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "camp-livelihoods",
      _type: "campaign",
      title: "Indigenous Agroforestry & Women Livelihoods",
      slug: { _type: "slug", current: "agroforestry-livelihoods" },
      summary: "Supplying native saplings, solar dryers, and collective market linkages for 600 tribal women farmers.",
      category: "Livelihoods",
      location: "Wayanad & Nilgiris",
      status: "active",
      currency: "INR",
      goal: 1800000,
      raised: 1420000,
      deadline: "2026-09-30T18:00:00.000Z",
      featured: false,
      isActive: true,
      story: [
        {
          _key: "s1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Regenerative soil cultivation paired with guaranteed fair-trade cooperative purchase." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
  ];

  for (const camp of campaigns) {
    await client.createOrReplace(camp);
    console.log(`✓ Seeded Campaign: ${camp.title}`);
  }

  // 4. Events
  const events = [
    {
      _id: "evt-symposium",
      _type: "event",
      title: "Annual Community Leadership & Impact Symposium",
      slug: { _type: "slug", current: "annual-learning-symposium" },
      summary: "A two-day assembly of community elders, field educators, and public policy researchers sharing verified ground lessons.",
      startAt: "2026-10-15T09:30:00.000Z",
      endAt: "2026-10-16T17:00:00.000Z",
      timezone: "Asia/Kolkata",
      location: "Bengaluru, Karnataka (Hybrid Online)",
      registrationUrl: "https://www.skymeredian.org/events#annual-learning-symposium",
    },
    {
      _id: "evt-water-summit",
      _type: "event",
      title: "Rural Water Resilience & Solar Tech Field Day",
      slug: { _type: "slug", current: "water-resilience-field-day" },
      summary: "Hands-on demonstration of community-managed micro-filtration hubs, groundwater recharge, and solar pumping stations.",
      startAt: "2026-11-05T10:00:00.000Z",
      endAt: "2026-11-05T16:00:00.000Z",
      timezone: "Asia/Kolkata",
      location: "Jhansi, Uttar Pradesh",
      registrationUrl: "https://www.skymeredian.org/events#water-resilience-field-day",
    },
  ];

  for (const evt of events) {
    await client.createOrReplace(evt);
    console.log(`✓ Seeded Event: ${evt.title}`);
  }

  // 5. Success Stories
  const stories = [
    {
      _id: "story-boat-schools",
      _type: "successStory",
      title: "How Classroom Boats Kept 400 Children Learning During the Great Flood",
      slug: { _type: "slug", current: "meera-floating-schools" },
      excerpt: "When the Brahmaputra overflowed, local boat operators partnered with Skymeredian to convert transport boats into floating study hubs.",
      personName: "Pabitra Das",
      location: "Majuli, Assam",
      program: { _type: "reference", _ref: "prog-education" },
      publishedAt: "2026-03-01T10:00:00.000Z",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Instead of losing four months of academic progress, students gathered each morning at the riverbank dock." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
    {
      _id: "story-solar-water",
      _type: "successStory",
      title: "Overcoming Fluoride: The Women-Led Solar Water Revolution",
      slug: { _type: "slug", current: "solar-water-turnaround" },
      excerpt: "Villagers in Mahoba transformed their health outcomes after commissioning an arsenic-fluoride reverse filtration hub.",
      personName: "Sunita Devi",
      location: "Mahoba, Bundelkhand",
      program: { _type: "reference", _ref: "prog-water" },
      publishedAt: "2026-02-15T10:00:00.000Z",
      body: [
        {
          _key: "b1",
          _type: "block",
          children: [{ _key: "c1", _type: "span", text: "Hospital visits among children for water-borne illnesses dropped by 88% within eight months." }],
          markDefs: [],
          style: "normal",
        },
      ],
    },
  ];

  for (const st of stories) {
    await client.createOrReplace(st);
    console.log(`✓ Seeded Story: ${st.title}`);
  }

  console.log("\nALL SANITY SEEDING COMPLETED SUCCESSFULLY!");
}

seed().catch((err) => {
  console.error("Sanity seeding error:", err);
  process.exit(1);
});
