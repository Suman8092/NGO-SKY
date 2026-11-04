import { z } from "zod";
import { NgoAuditModel, NgoRecordModel } from "@/models/NgoRecord";
import {
  recordInput,
  serializeRecord,
  findLinked,
  createDocument,
} from "@/lib/server/ngo/records";
import { verifiedAccount, requireNgoDatabase } from "@/lib/server/ngo/access";
import { validateData } from "@/lib/server/ngo/validation";
import {
  errorResponse,
  getRequestId,
  jsonSuccess,
  parseJsonRequest,
} from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { ApiError } from "@/lib/server/errors";
export const dynamic = "force-dynamic";
const schema = z
  .object({
    data: z.record(z.unknown()),
    consent: z.literal(true),
    website: z.string().max(0).optional(),
  })
  .strict();
export async function POST(
  request: Request,
  { params }: { params: Promise<{ module: string }> },
) {
  try {
    const { actor, email, name } = await verifiedAccount();
    const { module } = await params;
    if (
      !["members", "registrations", "applications", "complaints"].includes(
        module,
      )
    )
      throw new ApiError(404, "NOT_FOUND", "Application type not found.");
    await enforceRateLimit("ngo-application", actor.id, {
      limit: 5,
      windowMs: 3600000,
    });
    const input = await parseJsonRequest(request, schema);
    const allowed: Record<string, string[]> = {
      members: [
        "name",
        "phone",
        "designation",
        "dateOfBirth",
        "address",
        "referredBy",
      ],
      registrations: ["name", "phone", "event", "notes"],
      applications: ["name", "phone", "internship", "education", "motivation"],
      complaints: ["name", "phone", "type", "title", "description"],
    };
    if (Object.keys(input.data).some((k) => !allowed[module].includes(k)))
      throw new ApiError(
        422,
        "INVALID_FIELDS",
        "The application contains unsupported fields.",
      );
    const data = validateData(module, {
      ...input.data,
      name: input.data.name || name,
      email,
      accountUserId: actor.id,
    });
    if (
      data.dateOfBirth &&
      String(data.dateOfBirth) > new Date().toISOString().slice(0, 10)
    )
      throw new ApiError(
        422,
        "INVALID_BIRTHDAY",
        "Date of birth cannot be in the future.",
      );
    const db = await requireNgoDatabase(),
      session = await db.startSession();
    let output;
    try {
      await session.withTransaction(async () => {
        const sourceModule =
          module === "members"
            ? "designations"
            : module === "registrations"
              ? "events"
              : module === "applications"
                ? "internships"
                : null;
        const sourceField =
          module === "members"
            ? "designation"
            : module === "registrations"
              ? "event"
              : "internship";
        let feeMinor = 0,
          termMonths = 12,
          provisional = false;
        if (sourceModule) {
          const source = await findLinked(
            sourceModule,
            data[sourceField],
            session,
          );
          if (
            !source ||
            !["active", "published", "open"].includes(source.status)
          )
            throw new ApiError(
              409,
              "REGISTRATION_CLOSED",
              "Registration is not open for this item.",
            );
          if (
            source.data.endDate &&
            String(source.data.endDate) < new Date().toISOString().slice(0, 10)
          )
            throw new ApiError(
              409,
              "REGISTRATION_CLOSED",
              "This registration window has closed.",
            );
          data[sourceField] = source._id.toString();
          feeMinor = Math.round(Number(source.data.fee ?? 0) * 100);
          termMonths = Number(source.data.termMonths ?? 12);
          provisional = source.data.provisional === true;
          if (module === "registrations") {
            const count = await NgoRecordModel.countDocuments({
              module: "registrations",
              "data.event": source._id.toString(),
              status: { $ne: "cancelled" },
              deletedAt: null,
            }).session(session);
            if (count >= Number(source.data.capacity))
              throw new ApiError(
                409,
                "EVENT_FULL",
                "This event has reached capacity.",
              );
            source.revision++;
            await source.save({ session });
          }
        }
        if (data.referredBy) {
          const member = await findLinked("members", data.referredBy, session);
          if (
            !member ||
            member.status !== "approved" ||
            member.ownerId === actor.id
          )
            throw new ApiError(
              422,
              "INVALID_REFERRAL",
              "Use a valid referral from another approved member.",
            );
          data.referredBy = member._id.toString();
        }
        const identityKey =
          module === "members"
            ? `member:${actor.id}`
            : sourceModule
              ? `${module}:${actor.id}:${data[sourceField]}`
              : undefined;
        if (
          identityKey &&
          (await NgoRecordModel.exists({ identityKey }).session(session))
        )
          throw new ApiError(
            409,
            "ALREADY_REGISTERED",
            "Your application already exists. Check your member dashboard.",
          );
        const [doc] = await NgoRecordModel.create(
          [
            {
              ...recordInput(
                module,
                {
                  ...data,
                  _feeMinor: feeMinor,
                  _termMonths: termMonths,
                  _provisional: provisional,
                  _paymentStatus: feeMinor ? "unpaid" : "not-required",
                },
                module === "members"
                  ? "pending"
                  : module === "registrations"
                    ? "registered"
                    : module === "applications"
                      ? "submitted"
                      : "pending",
                actor.id,
                actor.id,
              ),
              identityKey,
            },
          ],
          { session },
        );
        if (module === "registrations" && feeMinor === 0)
          await createDocument(doc, "event-pass", session);
        await NgoAuditModel.create(
          [
            {
              actor: actor.id,
              action: "application",
              module,
              recordId: doc._id.toString(),
              reference: doc.reference,
              fields: Object.keys(data),
            },
          ],
          { session },
        );
        output = serializeRecord(doc);
      });
    } finally {
      await session.endSession();
    }
    return jsonSuccess(output, { status: 201 });
  } catch (e) {
    return errorResponse(e, getRequestId(request), "ngo-application");
  }
}
