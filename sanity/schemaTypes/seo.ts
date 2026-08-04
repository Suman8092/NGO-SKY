import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "Search and sharing",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        "A specific search title; the site name is appended by the application.",
      validation: (rule) =>
        rule.min(15).max(60).warning("Aim for 15–60 characters."),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      validation: (rule) =>
        rule.min(50).max(160).warning("Aim for 50–160 characters."),
    }),
    defineField({
      name: "shareImage",
      title: "Social share image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) => rule.required().min(5).max(180),
        }),
      ],
    }),
    defineField({
      name: "noIndex",
      title: "Exclude from search engines",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
