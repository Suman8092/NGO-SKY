import { defineField, defineType } from "sanity";

export const campaignType = defineType({
  name: "campaign",
  title: "Campaign",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(8).max(140),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(40).max(280),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Urgent", value: "urgent" },
          { title: "Funded", value: "funded" },
          { title: "Completed", value: "completed" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      options: { list: ["INR", "USD"] },
      initialValue: "INR",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "goal",
      title: "Fundraising goal (major currency units)",
      type: "number",
      validation: (rule) => rule.required().positive().integer(),
    }),
    defineField({
      name: "raised",
      title: "Verified amount raised (major currency units)",
      type: "number",
      initialValue: 0,
      validation: (rule) => rule.required().min(0).integer(),
    }),
    defineField({
      name: "deadline",
      title: "Campaign deadline",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "story",
      title: "Campaign narrative",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "image",
      title: "Lead image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required().min(8).max(180),
        }),
        defineField({
          name: "credit",
          title: "Credit",
          type: "string",
          validation: (rule) => rule.max(120),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "expectedOutcomes",
      title: "Expected outcomes",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.required().min(1).max(10).unique(),
    }),
    defineField({
      name: "fundAllocation",
      title: "Fund allocation",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "percentage",
              title: "Percentage",
              type: "number",
              validation: (rule) => rule.required().min(0).max(100),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              validation: (rule) => rule.required().max(240),
            }),
          ],
          preview: { select: { title: "label", subtitle: "percentage" } },
        },
      ],
      validation: (rule) =>
        rule
          .required()
          .min(1)
          .custom((items: unknown) => {
            if (!Array.isArray(items)) return true;
            const total = items.reduce<number>((sum, item: unknown) => {
              if (!item || typeof item !== "object") return sum;
              const percentage = (item as { percentage?: unknown }).percentage;
              return sum + (typeof percentage === "number" ? percentage : 0);
            }, 0);
            return (
              Math.abs(total - 100) < 0.001 ||
              "Fund allocation must total 100%."
            );
          }),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isActive",
      title: "Visible in campaign feeds",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "lastVerifiedAt",
      title: "Figures last verified",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "evidenceReference",
      title: "Internal evidence reference",
      type: "string",
      description:
        "Opaque reference only; do not store participant or donor records in Sanity.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({ name: "seo", title: "Search and sharing", type: "seo" }),
  ],
  orderings: [
    {
      title: "Deadline",
      name: "deadline",
      by: [{ field: "deadline", direction: "asc" }],
    },
    {
      title: "Recently created",
      name: "created",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      status: "status",
      location: "location",
      media: "image",
    },
    prepare: ({ title, status, location, media }) => ({
      title,
      subtitle: [status, location].filter(Boolean).join(" · "),
      media,
    }),
  },
});
