import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import cors from "cors";
import express, { type ErrorRequestHandler, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { type ZodTypeAny, type z } from "zod";

import { fetchPublishedContent } from "../src/lib/server/cms/sanity";
import { getServerEnv } from "../src/lib/server/env";
import { ApiError, safeLogError } from "../src/lib/server/errors";
import {
  constructStripeEvent,
  razorpayWebhookToDonationUpdate,
  stripeEventToDonationUpdate,
  verifyRazorpayWebhook,
} from "../src/lib/server/payments";
import { findDonation } from "../src/lib/server/repository";
import {
  createDonationIntent,
  acknowledgeRazorpayPayment,
  processDonationPaymentUpdate,
  startDonationCheckout,
} from "../src/lib/server/services/donations";
import { getHealthSnapshot } from "../src/lib/server/services/health";
import {
  submitContact,
  submitVolunteerApplication,
  subscribeToNewsletter,
} from "../src/lib/server/services/submissions";
import {
  contactSchema,
  contentQuerySchema,
  donationReferenceSchema,
  donationSchema,
  newsletterSchema,
  razorpayVerificationSchema,
  volunteerSchema,
} from "../src/lib/server/validation";

type Envelope<T> = { ok: true; data: T; meta?: Record<string, unknown> };

function requestId(request: Request, response: Response): string {
  const incoming = request.get("x-request-id")?.trim();
  const id = incoming && /^[a-zA-Z0-9._:-]{8,100}$/.test(incoming) ? incoming : randomUUID();
  response.setHeader("X-Request-Id", id);
  response.locals.requestId = id;
  return id;
}

function parse<TSchema extends ZodTypeAny>(schema: TSchema, input: unknown): z.output<TSchema> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    throw new ApiError(422, "VALIDATION_ERROR", "Please check the submitted fields.", {
      details: {
        fieldErrors: flattened.fieldErrors,
        formErrors: flattened.formErrors,
      },
    });
  }
  return parsed.data;
}

function send<T>(
  response: Response,
  data: T,
  options: { status?: number; meta?: Record<string, unknown> } = {},
): void {
  response.status(options.status ?? 200).json({
    ok: true,
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  } satisfies Envelope<T>);
}

function metadata(request: Request, response: Response) {
  return {
    requestId: response.locals.requestId as string,
    ip: request.ip,
    userAgent: request.get("user-agent"),
  };
}

const publicLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      ok: false,
      error: { code: "RATE_LIMITED", message: "Too many requests. Please try again shortly." },
      requestId: response.locals.requestId,
    });
  },
});

const mutationLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    response.status(429).json({
      ok: false,
      error: { code: "RATE_LIMITED", message: "Too many submissions. Please try again later." },
      requestId: response.locals.requestId,
    });
  },
});

export function createServer(): express.Express {
  const app = express();
  const env = getServerEnv();
  const allowedOrigin = new URL(env.NEXT_PUBLIC_SITE_URL).origin;

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use((request, response, next) => {
    requestId(request, response);
    next();
  });
  app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
  app.use(
    cors({
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      origin(origin, callback) {
        callback(null, !origin || origin === allowedOrigin);
      },
    }),
  );
  app.post("/api/webhooks/stripe", express.raw({ type: "application/json", limit: "1mb" }), async (request, response, next) => {
    try {
      const rawBody = Buffer.isBuffer(request.body) ? request.body.toString("utf8") : "";
      const event = constructStripeEvent(rawBody, request.get("stripe-signature") ?? null);
      const update = stripeEventToDonationUpdate(event);
      const processed = update ? await processDonationPaymentUpdate(update) : null;
      send(response, { received: true, eventType: event.type, processed: Boolean(processed?.donation) });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/webhooks/razorpay", express.raw({ type: "application/json", limit: "1mb" }), async (request, response, next) => {
    try {
      const rawBody = Buffer.isBuffer(request.body) ? request.body.toString("utf8") : "";
      verifyRazorpayWebhook(rawBody, request.get("x-razorpay-signature") ?? null);
      let payload: unknown;
      try {
        payload = JSON.parse(rawBody);
      } catch {
        throw new ApiError(400, "INVALID_JSON", "The webhook body is not valid JSON.");
      }
      const update = razorpayWebhookToDonationUpdate(payload);
      const processed = update ? await processDonationPaymentUpdate(update) : null;
      send(response, { received: true, processed: Boolean(processed?.donation) });
    } catch (error) {
      next(error);
    }
  });

  app.use(publicLimiter);
  app.use(express.json({ limit: "64kb", strict: true, type: "application/json" }));

  app.get("/api/health", async (request, response, next) => {
    try {
      const snapshot = await getHealthSnapshot(request.query.deep === "true");
      send(response, snapshot.body, { status: snapshot.httpStatus });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/content", async (request, response, next) => {
    try {
      const query = parse(contentQuerySchema, request.query);
      const result = await fetchPublishedContent(query.type, query.limit);
      response.setHeader(
        "Cache-Control",
        result.source === "sanity" ? "public, max-age=60, stale-while-revalidate=300" : "no-store",
      );
      send(response, result.data, { meta: { source: result.source, type: query.type, count: result.data.length } });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/donations/:id", async (request, response, next) => {
    try {
      const id = request.params.id;
      if (!/^(?:[a-f0-9]{24}|demo_[a-f0-9]{20})$/i.test(id)) {
        throw new ApiError(400, "INVALID_DONATION_ID", "Donation reference is invalid.");
      }
      const result = await findDonation(id);
      if (!result) throw new ApiError(404, "DONATION_NOT_FOUND", "Donation record not found.");
      send(response, {
        id: result.record.id,
        amount: result.record.amountMinor / 100,
        currency: result.record.currency,
        frequency: result.record.frequency,
        provider: result.record.provider,
        status: result.record.status,
        updatedAt: result.record.updatedAt,
      }, { meta: { mode: result.persistence === "memory" ? "demo" : "live" } });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contact", mutationLimiter, async (request, response, next) => {
    try {
      const result = await submitContact(parse(contactSchema, request.body), metadata(request, response));
      send(response, { ...result.record, message: "Thank you. Your message has been received." }, {
        status: 201,
        meta: { mode: result.persistence === "memory" ? "demo" : "live", email: result.email.status },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/newsletter", mutationLimiter, async (request, response, next) => {
    try {
      const result = await subscribeToNewsletter(
        parse(newsletterSchema, request.body),
        metadata(request, response),
      );
      send(response, { ...result.record, subscribed: true }, {
        status: result.created ? 201 : 200,
        meta: { mode: result.persistence === "memory" ? "demo" : "live", email: result.email.status },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/volunteer", mutationLimiter, async (request, response, next) => {
    try {
      const result = await submitVolunteerApplication(
        parse(volunteerSchema, request.body),
        metadata(request, response),
      );
      send(response, { ...result.record, message: "Your volunteer application has been received." }, {
        status: 201,
        meta: { mode: result.persistence === "memory" ? "demo" : "live", email: result.email.status },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/donations", mutationLimiter, async (request, response, next) => {
    try {
      const result = await createDonationIntent(parse(donationSchema, request.body), metadata(request, response));
      send(response, {
        donation: {
          id: result.record.id,
          amount: result.record.amountMinor / 100,
          currency: result.record.currency,
          frequency: result.record.frequency,
          provider: result.record.provider,
          status: result.record.status,
        },
        payment: result.payment,
      }, {
        status: result.created ? 201 : 200,
        meta: { mode: result.persistence === "memory" ? "demo" : "live" },
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/stripe/checkout", mutationLimiter, async (request, response, next) => {
    try {
      const { donationId } = parse(donationReferenceSchema, request.body);
      send(response, await startDonationCheckout(donationId, "stripe"), { status: 201 });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/razorpay/order", mutationLimiter, async (request, response, next) => {
    try {
      const { donationId } = parse(donationReferenceSchema, request.body);
      send(response, await startDonationCheckout(donationId, "razorpay"), { status: 201 });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payments/razorpay/verify", mutationLimiter, async (request, response, next) => {
    try {
      const input = parse(razorpayVerificationSchema, request.body);
      const result = await acknowledgeRazorpayPayment({
        donationId: input.donationId,
        orderId: input.razorpay_order_id,
        paymentId: input.razorpay_payment_id,
        signature: input.razorpay_signature,
      });
      send(response, result, { status: 202, meta: { webhookConfirmationRequired: true } });
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => {
    response.status(404).json({
      ok: false,
      error: { code: "NOT_FOUND", message: "API route not found." },
      requestId: response.locals.requestId,
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    void _next;
    const apiError =
      error instanceof ApiError
        ? error
        : error && typeof error === "object" && "type" in error && error.type === "entity.too.large"
          ? new ApiError(413, "PAYLOAD_TOO_LARGE", "The request body is too large.")
          : error instanceof SyntaxError
            ? new ApiError(400, "INVALID_JSON", "The request body is not valid JSON.")
            : new ApiError(500, "INTERNAL_ERROR", "The request could not be completed.");
    if (apiError.status >= 500) safeLogError("express", error);
    if (apiError.retryAfter) response.setHeader("Retry-After", String(apiError.retryAfter));
    response.status(apiError.status).json({
      ok: false,
      error: {
        code: apiError.code,
        message: apiError.message,
        ...(apiError.details ? { details: apiError.details } : {}),
      },
      requestId: response.locals.requestId,
    });
  };
  app.use(errorHandler);

  return app;
}

const entryFile = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (entryFile === import.meta.url) {
  const env = getServerEnv();
  const app = createServer();
  const server = app.listen(env.PORT, () => {
    console.log(`Ashaaya API listening on port ${env.PORT}`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
