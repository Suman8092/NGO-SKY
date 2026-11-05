import { z } from "zod";
import { getModule } from "@/lib/ngo/catalog";
import { ApiError } from "../errors";
export const mutationEnvelope = z
  .object({
    data: z.record(z.unknown()),
    status: z.string().min(1).max(40),
    revision: z.number().int().positive().optional(),
  })
  .strict();
export function validateData(module: string, input: Record<string, unknown>) {
  const definition = getModule(module);
  if (!definition || definition.readOnly)
    throw new ApiError(404, "UNKNOWN_MODULE", "This module is unavailable.");
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of definition.fields) {
    let type: z.ZodTypeAny;
    if (field.type === "checkbox")
      type = field.required ? z.literal(true) : z.boolean().default(false);
    else if (field.type === "money" || field.type === "number") {
      type = z
        .number()
        .finite()
        .min(0)
        .max(field.type === "money" ? 10000000 : 1000000)
        .refine(
          (n) =>
            field.type === "money"
              ? Number.isSafeInteger(Math.round(n * 100)) &&
                Math.abs(n * 100 - Math.round(n * 100)) < 0.00001
              : Number.isInteger(n),
          "Use a valid whole number or currency amount.",
        );
    } else if (field.type === "select")
      type = z
        .string()
        .refine((v) => !!field.options?.includes(v), "Choose a valid option.");
    else if (field.type === "email")
      type = z.string().trim().toLowerCase().email().max(254);
    else if (field.type === "date")
      type = z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .refine((v) => {
          const d = new Date(v);
          return (
            Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === v
          );
        }, "Choose a valid date.");
    else if (field.type === "image" || field.type === "file")
      type = z
        .string()
        .regex(
          /^\/api\/ngo\/files\/[a-f0-9]{24}$/,
          "Upload a file using this form.",
        );
    else if (field.type === "tel")
      type = z
        .string()
        .trim()
        .regex(/^\+?[0-9 ()-]{7,25}$/);
    else
      type = z
        .string()
        .trim()
        .min(field.required ? 1 : 0)
        .max(field.type === "textarea" ? 12000 : 500);
    shape[field.key] =
      field.required || field.type === "checkbox"
        ? type
        : z.preprocess(
            (v) => (v === "" || v === null ? undefined : v),
            type.optional(),
          );
  }
  const parsed = z.object(shape).strict().safeParse(input);
  if (!parsed.success)
    throw new ApiError(
      422,
      "VALIDATION_ERROR",
      parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")
        .slice(0, 1000),
    );
  const data = Object.fromEntries(
    Object.entries(parsed.data).filter(([, v]) => v !== undefined),
  ) as Record<string, string | number | boolean>;
  if (
    data.startDate &&
    data.endDate &&
    String(data.endDate) < String(data.startDate)
  )
    throw new ApiError(
      422,
      "INVALID_DATES",
      "End date must follow start date.",
    );
  if (module === "projects" && Number(data.progress) > 100)
    throw new ApiError(422, "INVALID_PROGRESS", "Progress cannot exceed 100%.");
  if (module === "messages" && data.audience === "member" && !data.member)
    throw new ApiError(
      422,
      "RECIPIENT_REQUIRED",
      "Choose the recipient member.",
    );
  if (data.method && data.method !== "cash" && !data.transaction)
    throw new ApiError(
      422,
      "TRANSACTION_REQUIRED",
      "A transaction reference is required for non-cash payments.",
    );
  if (
    ["designations"].includes(module) &&
    (Number(data.termMonths) < 1 || Number(data.termMonths) > 120)
  )
    throw new ApiError(
      422,
      "INVALID_TERM",
      "Membership terms must be between 1 and 120 months.",
    );
  if (module === "events" && Number(data.capacity) < 1)
    throw new ApiError(
      422,
      "INVALID_CAPACITY",
      "Event capacity must be at least one.",
    );
  if (
    data.dateOfBirth &&
    String(data.dateOfBirth) > new Date().toISOString().slice(0, 10)
  )
    throw new ApiError(
      422,
      "INVALID_BIRTHDAY",
      "Date of birth cannot be in the future.",
    );
  if (
    [
      "offline-donations",
      "membership-payments",
      "project-funds",
      "expenses",
      "custom-receipts",
    ].includes(module) &&
    Number(data.amount) <= 0
  )
    throw new ApiError(
      422,
      "INVALID_AMOUNT",
      "The recorded amount must be greater than zero.",
    );
  if (module === "in-kind" && Number(data.quantity) < 1)
    throw new ApiError(
      422,
      "INVALID_QUANTITY",
      "Item quantities must be at least one.",
    );
  if (
    module === "designations" &&
    data.provisional === true &&
    Number(data.fee) > 0
  )
    throw new ApiError(
      422,
      "PROVISIONAL_FEE_NOT_ALLOWED",
      "Provisional testing categories must have a zero fee. Remove the test flag only when the category is official.",
    );
  return data;
}
export const recordId = z.string().regex(/^[a-f0-9]{24}$/i);
export function literalSearch(value: string) {
  return [...value]
    .map((c) => (".*+?^${}()|[]\\".includes(c) ? "\\" + c : c))
    .join("");
}
