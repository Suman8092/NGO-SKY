import { defineField, defineType } from "sanity";

export const successStoryType = defineType({
  name: "successStory",
  title: "Impact story",
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
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(40).max(280),
    }),
    defineField({
      name: "personName",
      title: "Published name or approved pseudonym",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "location",
      title: "Publishable location",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "program",
      title: "Program",
      type: "reference",
      to: [{ type: "program" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Publication date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Story",
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
      name: "video",
      title: "Optional video",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      fields: [
        defineField({
          name: "title",
          title: "Accessible title",
          type: "string",
          validation: (rule) => rule.required().max(140),
        }),
        defineField({
          name: "transcript",
          title: "Transcript",
          type: "text",
          rows: 8,
          validation: (rule) => rule.required().min(40),
        }),
      ],
    }),
    defineField({
      name: "consentStatus",
      title: "Publication consent",
      type: "string",
      options: {
        list: [
          { title: "Verified for these channels", value: "verified" },
          { title: "Withdrawn", value: "withdrawn" },
          { title: "Expired", value: "expired" },
        ],
        layout: "radio",
      },
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              value === "verified" || "Only verified stories may be published.",
          ),
    }),
    defineField({
      name: "consentReference",
      title: "Consent-system reference",
      type: "string",
      description:
        "Opaque reference only. Keep signed forms and personal records in the approved restricted system.",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "consentReviewedAt",
      title: "Consent last reviewed",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "privacyNote",
      title: "Public privacy note",
      type: "string",
      validation: (rule) => rule.max(240),
    }),
    defineField({ name: "seo", title: "Search and sharing", type: "seo" }),
  ],
  preview: {
    select: {
      title: "title",
      person: "personName",
      consent: "consentStatus",
      media: "image",
    },
    prepare: ({ title, person, consent, media }) => ({
      title,
      subtitle: `${person ?? "Unnamed"} · consent ${consent ?? "unset"}`,
      media,
    }),
  },
});
