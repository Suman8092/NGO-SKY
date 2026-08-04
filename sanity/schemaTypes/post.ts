import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Article",
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
      name: "publishedAt",
      title: "Publication date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.required().min(1).max(3).unique(),
    }),
    defineField({
      name: "mainImage",
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
      name: "body",
      title: "Article body",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "reviewedAt",
      title: "Editorial review date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "seo", title: "Search and sharing", type: "seo" }),
  ],
  orderings: [
    {
      title: "Publication date",
      name: "publishedAt",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "author.name", media: "mainImage" },
  },
});
