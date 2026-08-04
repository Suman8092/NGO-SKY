import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Event",
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
      name: "startAt",
      title: "Starts",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endAt",
      title: "Ends",
      type: "datetime",
      validation: (rule) =>
        rule.required().custom((endAt, context) => {
          const startAt = (context.parent as { startAt?: string } | undefined)
            ?.startAt;
          if (!endAt || !startAt) return true;
          return (
            new Date(endAt).getTime() > new Date(startAt).getTime() ||
            "End time must be after start time."
          );
        }),
    }),
    defineField({
      name: "timezone",
      title: "IANA timezone",
      type: "string",
      initialValue: "Asia/Kolkata",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "location",
      title: "Display location",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "venue",
      title: "Venue or platform",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      options: { list: ["in-person", "online", "hybrid"], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "registrationUrl",
      title: "Registration URL",
      type: "url",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({
      name: "accessibility",
      title: "Accessibility information",
      type: "array",
      of: [{ type: "string" }],
      description:
        "State verified access features and a contact route for accommodation requests.",
      validation: (rule) => rule.required().min(1).max(12).unique(),
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
      name: "isCancelled",
      title: "Cancelled",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "seo", title: "Search and sharing", type: "seo" }),
  ],
  orderings: [
    {
      title: "Start time",
      name: "startAt",
      by: [{ field: "startAt", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      startAt: "startAt",
      location: "location",
      cancelled: "isCancelled",
      media: "image",
    },
    prepare: ({ title, startAt, location, cancelled, media }) => ({
      title: cancelled ? `[Cancelled] ${title}` : title,
      subtitle: [
        startAt ? new Date(startAt).toLocaleDateString("en-IN") : null,
        location,
      ]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
