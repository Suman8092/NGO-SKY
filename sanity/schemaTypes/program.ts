import { defineField, defineType } from "sanity";

export const programType = defineType({
  name: "program",
  title: "Program",
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
      validation: (rule) => rule.required().min(40).max(260),
    }),
    defineField({
      name: "body",
      title: "Program narrative",
      type: "array",
      of: [{ type: "block" }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "icon",
      title: "Icon key",
      type: "string",
      description:
        "A supported application icon name, not an emoji or arbitrary SVG.",
      validation: (rule) => rule.required().max(60),
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
      name: "impact",
      title: "Verified impact highlights",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required().max(100),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        },
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) => rule.integer().min(0).max(1000),
    }),
    defineField({
      name: "lastVerifiedAt",
      title: "Impact last verified",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", title: "Search and sharing", type: "seo" }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "summary", media: "image" } },
});
