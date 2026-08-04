import { defineField, defineType } from "sanity";

export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "bio",
      title: "Biography",
      type: "text",
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
    defineField({
      name: "image",
      title: "Portrait",
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
  ],
  preview: { select: { title: "name", subtitle: "role", media: "image" } },
});
