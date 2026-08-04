import { z } from "zod";

const cleanText = (min: number, max: number) => z.string().trim().min(min).max(max);
const cleanSingleLine = (min: number, max: number) =>
  cleanText(min, max).refine((value) => !/[\r\n]/.test(value), "Must be a single line");
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 ()-]{6,19}$/, "Enter a valid phone number")
  .max(20);
const honeypot = z.string().max(0).optional().default("");

export const contactSchema = z
  .object({
    name: cleanSingleLine(2, 100),
    email: z.string().trim().toLowerCase().email().max(254),
    phone: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      phone.optional(),
    ),
    subject: cleanSingleLine(3, 140),
    message: cleanText(10, 5_000),
    consent: z.literal(true),
    website: honeypot,
  })
  .strict();

export const newsletterSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    name: optionalText(100),
    source: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().max(80).default("website"),
    ),
    consent: z.literal(true),
    website: honeypot,
  })
  .strict();

export const volunteerSchema = z
  .object({
    name: cleanSingleLine(2, 120),
    email: z.string().trim().toLowerCase().email().max(254),
    phone,
    city: cleanSingleLine(2, 100),
    country: cleanSingleLine(2, 100).default("India"),
    areaOfInterest: cleanSingleLine(2, 120),
    skills: z.array(cleanSingleLine(1, 80)).max(20).default([]),
    availability: z.enum(["weekdays", "weekends", "evenings", "flexible", "event_based"]),
    motivation: cleanText(20, 3_000),
    experience: optionalText(2_000),
    consent: z.literal(true),
    website: honeypot,
  })
  .strict();

const amount = z.preprocess(
  (value) => (typeof value === "string" && value.trim() !== "" ? Number(value) : value),
  z
    .number()
    .finite()
    .min(1)
    .max(10_000_000)
    .refine((value) => Number.isInteger(value * 100), "Amount can have at most two decimal places"),
);

export const donationSchema = z
  .object({
    amount,
    currency: z.enum(["INR", "USD", "EUR", "GBP"]).default("INR"),
    frequency: z.enum(["one_time", "monthly", "yearly"]).default("one_time"),
    provider: z.enum(["auto", "stripe", "razorpay"]).default("auto"),
    campaignId: optionalText(100),
    donor: z.object({
      name: cleanSingleLine(2, 120),
      email: z.string().trim().toLowerCase().email().max(254),
      phone: z.preprocess(
        (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
        phone.optional(),
      ),
      country: optionalText(100),
      taxId: optionalText(32),
    }),
    anonymous: z.boolean().default(false),
    message: optionalText(500),
    consent: z.literal(true),
    idempotencyKey: z.string().trim().min(8).max(100).regex(/^[a-zA-Z0-9._:-]+$/).optional(),
    website: honeypot,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.provider === "razorpay" && value.currency !== "INR") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currency"],
        message: "Razorpay donations must use INR",
      });
    }
    if (value.provider === "razorpay" && value.frequency !== "one_time") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frequency"],
        message: "Recurring donations use Stripe",
      });
    }
  });

export const donationReferenceSchema = z
  .object({ donationId: z.string().trim().regex(/^[a-f0-9]{24}$/i) })
  .strict();

export const razorpayVerificationSchema = z
  .object({
    donationId: z.string().trim().regex(/^[a-f0-9]{24}$/i),
    razorpay_order_id: z.string().trim().min(8).max(100),
    razorpay_payment_id: z.string().trim().min(8).max(100),
    razorpay_signature: z.string().trim().regex(/^[a-f0-9]{64}$/i),
  })
  .strict();

export const contentQuerySchema = z.object({
  type: z.enum(["campaigns", "programs", "stories", "posts", "events"]),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type VolunteerInput = z.infer<typeof volunteerSchema>;
export type DonationInput = z.infer<typeof donationSchema>;
