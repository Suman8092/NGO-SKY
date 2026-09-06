import "server-only";

import {
  ContactSubmissionModel,
  DonationModel,
  NewsletterSubscriberModel,
  VolunteerApplicationModel,
} from "@/models";

import { connectMongo } from "./db";

export type OperationalRead<T> =
  | { state: "ready"; data: T }
  | {
      state: "unavailable";
      reason: "database_not_configured" | "database_unavailable";
    };

export type AccountDonationRecord = {
  id: string;
  amountMinor: number;
  currency: "INR" | "USD" | "EUR" | "GBP";
  frequency: "one_time" | "monthly" | "yearly";
  provider: "stripe" | "razorpay";
  status:
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "refunded"
    | "cancelled";
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OperationsSummary = {
  donations: number;
  confirmedDonations: number;
  contactSubmissions: number;
  volunteerApplications: number;
  activeNewsletterSubscribers: number;
};

export type AdminDonationRecord = AccountDonationRecord & {
  donorName: string;
  donorEmail: string;
};

export type AdminVolunteerRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  areaOfInterest: string;
  availability: string;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  createdAt: string;
};

export type AdminContactRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  status: "new" | "read" | "resolved" | "spam";
  createdAt: string;
};

export type AdminNewsletterRecord = {
  id: string;
  email: string;
  name?: string;
  source: string;
  status: "active" | "unsubscribed" | "bounced" | "complained";
  subscribedAt: string;
  updatedAt: string;
};

function boundedLimit(limit: number): number {
  if (!Number.isFinite(limit)) return 25;
  return Math.min(100, Math.max(1, Math.trunc(limit)));
}

async function readMongo<T>(read: () => Promise<T>): Promise<OperationalRead<T>> {
  try {
    const connection = await connectMongo();
    if (!connection) {
      return { state: "unavailable", reason: "database_not_configured" };
    }
    return { state: "ready", data: await read() };
  } catch {
    return { state: "unavailable", reason: "database_unavailable" };
  }
}

export async function getAccountDonationHistory(
  accountUserId: string,
  limit = 25,
): Promise<OperationalRead<AccountDonationRecord[]>> {
  const userId = accountUserId.trim();
  if (!userId || userId.length > 100) {
    return { state: "ready", data: [] };
  }

  return readMongo(async () => {
    const documents = await DonationModel.find({ accountUserId: userId })
      .select(
        "amountMinor currency frequency provider status paidAt createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .limit(boundedLimit(limit));

    return documents.map((document) => ({
      id: document._id.toString(),
      amountMinor: document.amountMinor,
      currency: document.currency,
      frequency: document.frequency,
      provider: document.provider,
      status: document.status,
      paidAt: document.paidAt?.toISOString(),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    }));
  });
}

export async function getOperationsSummary(): Promise<
  OperationalRead<OperationsSummary>
> {
  return readMongo(async () => {
    const [
      donations,
      confirmedDonations,
      contactSubmissions,
      volunteerApplications,
      activeNewsletterSubscribers,
    ] = await Promise.all([
      DonationModel.countDocuments({}),
      DonationModel.countDocuments({ status: "paid" }),
      ContactSubmissionModel.countDocuments({}),
      VolunteerApplicationModel.countDocuments({}),
      NewsletterSubscriberModel.countDocuments({ status: "active" }),
    ]);

    return {
      donations,
      confirmedDonations,
      contactSubmissions,
      volunteerApplications,
      activeNewsletterSubscribers,
    };
  });
}

export async function getAdminDonationRecords(
  limit = 50,
): Promise<OperationalRead<AdminDonationRecord[]>> {
  return readMongo(async () => {
    const documents = await DonationModel.find({})
      .select(
        "amountMinor currency frequency provider donor.name donor.email status paidAt createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .limit(boundedLimit(limit));

    return documents.map((document) => ({
      id: document._id.toString(),
      amountMinor: document.amountMinor,
      currency: document.currency,
      frequency: document.frequency,
      provider: document.provider,
      status: document.status,
      donorName: document.donor.name,
      donorEmail: document.donor.email,
      paidAt: document.paidAt?.toISOString(),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    }));
  });
}

export async function getAdminVolunteerRecords(
  limit = 50,
): Promise<OperationalRead<AdminVolunteerRecord[]>> {
  return readMongo(async () => {
    const documents = await VolunteerApplicationModel.find({})
      .select(
        "name email phone city country areaOfInterest availability status createdAt",
      )
      .sort({ createdAt: -1 })
      .limit(boundedLimit(limit));

    return documents.map((document) => ({
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      phone: document.phone,
      city: document.city,
      country: document.country,
      areaOfInterest: document.areaOfInterest,
      availability: document.availability,
      status: document.status,
      createdAt: document.createdAt.toISOString(),
    }));
  });
}

export async function getAdminSubmissionRecords(
  limit = 50,
): Promise<
  OperationalRead<{
    contacts: AdminContactRecord[];
    newsletter: AdminNewsletterRecord[];
  }>
> {
  const recordLimit = boundedLimit(limit);
  return readMongo(async () => {
    const [contacts, newsletter] = await Promise.all([
      ContactSubmissionModel.find({})
        .select("name email phone subject status createdAt")
        .sort({ createdAt: -1 })
        .limit(recordLimit),
      NewsletterSubscriberModel.find({})
        .select("email name source status subscribedAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(recordLimit),
    ]);

    return {
      contacts: contacts.map((document) => ({
        id: document._id.toString(),
        name: document.name,
        email: document.email,
        phone: document.phone,
        subject: document.subject,
        status: document.status,
        createdAt: document.createdAt.toISOString(),
      })),
      newsletter: newsletter.map((document) => ({
        id: document._id.toString(),
        email: document.email,
        name: document.name,
        source: document.source,
        status: document.status,
        subscribedAt: document.subscribedAt.toISOString(),
        updatedAt: document.updatedAt.toISOString(),
      })),
    };
  });
}

export type DetailedAnalytics = {
  donations: {
    totalCount: number;
    paidCount: number;
    totalAmountInr: number;
    averageAmountInr: number;
    monthlyRecurringCount: number;
    oneTimeCount: number;
  };
  volunteers: {
    totalCount: number;
    approvedCount: number;
    reviewingCount: number;
    submittedCount: number;
  };
  contacts: {
    totalCount: number;
    newCount: number;
    resolvedCount: number;
  };
  newsletter: {
    totalCount: number;
    activeCount: number;
  };
  system: {
    databaseStatus: "connected" | "unavailable";
    uptimeSeconds: number;
    nodeEnv: string;
    nextPublicSiteUrl: string;
  };
};

export async function getDetailedAnalytics(): Promise<
  OperationalRead<DetailedAnalytics>
> {
  return readMongo(async () => {
    const [
      totalDonations,
      paidDonations,
      donationAgg,
      monthlyDonations,
      oneTimeDonations,
      totalContacts,
      newContacts,
      resolvedContacts,
      totalVolunteers,
      approvedVolunteers,
      reviewingVolunteers,
      totalSubscribers,
      activeSubscribers,
    ] = await Promise.all([
      DonationModel.countDocuments({}),
      DonationModel.countDocuments({ status: "paid" }),
      DonationModel.aggregate<{ _id: null; totalMinor: number; avgMinor: number }>([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalMinor: { $sum: "$amountMinor" },
            avgMinor: { $avg: "$amountMinor" },
          },
        },
      ]),
      DonationModel.countDocuments({ frequency: "monthly" }),
      DonationModel.countDocuments({ frequency: "one_time" }),
      ContactSubmissionModel.countDocuments({}),
      ContactSubmissionModel.countDocuments({ status: "new" }),
      ContactSubmissionModel.countDocuments({ status: "resolved" }),
      VolunteerApplicationModel.countDocuments({}),
      VolunteerApplicationModel.countDocuments({ status: "approved" }),
      VolunteerApplicationModel.countDocuments({ status: "reviewing" }),
      NewsletterSubscriberModel.countDocuments({}),
      NewsletterSubscriberModel.countDocuments({ status: "active" }),
    ]);

    const totalMinor = donationAgg[0]?.totalMinor ?? 0;
    const avgMinor = donationAgg[0]?.avgMinor ?? 0;

    return {
      donations: {
        totalCount: totalDonations,
        paidCount: paidDonations,
        totalAmountInr: Math.round(totalMinor / 100),
        averageAmountInr: Math.round(avgMinor / 100),
        monthlyRecurringCount: monthlyDonations,
        oneTimeCount: oneTimeDonations,
      },
      volunteers: {
        totalCount: totalVolunteers,
        approvedCount: approvedVolunteers,
        reviewingCount: reviewingVolunteers,
        submittedCount: Math.max(
          0,
          totalVolunteers - approvedVolunteers - reviewingVolunteers,
        ),
      },
      contacts: {
        totalCount: totalContacts,
        newCount: newContacts,
        resolvedCount: resolvedContacts,
      },
      newsletter: {
        totalCount: totalSubscribers,
        activeCount: activeSubscribers,
      },
      system: {
        databaseStatus: "connected",
        uptimeSeconds: Math.floor(process.uptime()),
        nodeEnv: process.env.NODE_ENV ?? "development",
        nextPublicSiteUrl:
          process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      },
    };
  });
}

export type UserVolunteerRecord = {
  id: string;
  areaOfInterest: string;
  availability: string;
  city: string;
  country: string;
  status: "submitted" | "reviewing" | "approved" | "rejected";
  createdAt: string;
};

export type UserContactRecord = {
  id: string;
  subject: string;
  status: "new" | "read" | "resolved" | "spam";
  createdAt: string;
};

export type UserDashboardData = {
  donations: AccountDonationRecord[];
  kpis: {
    totalDonatedMinor: number;
    donationCount: number;
    taxExemptMinor: number;
    volunteerStatus: "none" | "submitted" | "reviewing" | "approved" | "rejected";
  };
  volunteers: UserVolunteerRecord[];
  contacts: UserContactRecord[];
  newsletterSubscribed: boolean;
};

export async function getUserDashboardData(
  accountUserId: string,
  userEmails: string[] = [],
): Promise<OperationalRead<UserDashboardData>> {
  const userId = accountUserId.trim();
  const emails = userEmails
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));

  if (!userId && emails.length === 0) {
    return {
      state: "ready",
      data: {
        donations: [],
        kpis: {
          totalDonatedMinor: 0,
          donationCount: 0,
          taxExemptMinor: 0,
          volunteerStatus: "none",
        },
        volunteers: [],
        contacts: [],
        newsletterSubscribed: false,
      },
    };
  }

  return readMongo(async () => {
    const donationQuery =
      userId && emails.length > 0
        ? {
            $or: [
              { accountUserId: userId },
              { "donor.email": { $in: emails } },
            ],
          }
        : userId
          ? { accountUserId: userId }
          : { "donor.email": { $in: emails } };

    const emailFilter = emails.length > 0 ? { email: { $in: emails } } : null;

    const [donationDocs, volunteerDocs, contactDocs, subscriberDoc] =
      await Promise.all([
        DonationModel.find(donationQuery)
          .select(
            "amountMinor currency frequency provider status paidAt createdAt updatedAt",
          )
          .sort({ createdAt: -1 })
          .limit(50),
        emailFilter
          ? VolunteerApplicationModel.find(emailFilter)
              .select(
                "areaOfInterest availability city country status createdAt",
              )
              .sort({ createdAt: -1 })
              .limit(20)
          : Promise.resolve([]),
        emailFilter
          ? ContactSubmissionModel.find(emailFilter)
              .select("subject status createdAt")
              .sort({ createdAt: -1 })
              .limit(20)
          : Promise.resolve([]),
        emailFilter
          ? NewsletterSubscriberModel.findOne({
              email: { $in: emails },
              status: "active",
            }).select("_id")
          : Promise.resolve(null),
      ]);

    const donations: AccountDonationRecord[] = donationDocs.map((d) => ({
      id: d._id.toString(),
      amountMinor: d.amountMinor,
      currency: d.currency,
      frequency: d.frequency,
      provider: d.provider,
      status: d.status,
      paidAt: d.paidAt?.toISOString(),
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    const paidDonations = donations.filter((d) => d.status === "paid");
    const totalDonatedMinor = paidDonations.reduce(
      (sum, d) => sum + d.amountMinor,
      0,
    );
    const taxExemptMinor = paidDonations
      .filter((d) => d.currency === "INR")
      .reduce((sum, d) => sum + d.amountMinor, 0);

    const volunteers: UserVolunteerRecord[] = volunteerDocs.map((v) => ({
      id: v._id.toString(),
      areaOfInterest: v.areaOfInterest,
      availability: v.availability,
      city: v.city,
      country: v.country,
      status: v.status,
      createdAt: v.createdAt.toISOString(),
    }));

    const latestVolunteer = volunteers[0];
    const volunteerStatus = latestVolunteer ? latestVolunteer.status : "none";

    const contacts: UserContactRecord[] = contactDocs.map((c) => ({
      id: c._id.toString(),
      subject: c.subject,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    }));

    return {
      donations,
      kpis: {
        totalDonatedMinor,
        donationCount: donations.length,
        taxExemptMinor,
        volunteerStatus,
      },
      volunteers,
      contacts,
      newsletterSubscribed: Boolean(subscriberDoc),
    };
  });
}

export async function updateVolunteerStatus(
  id: string,
  status: "submitted" | "reviewing" | "approved" | "rejected",
): Promise<OperationalRead<AdminVolunteerRecord | null>> {
  return readMongo(async () => {
    const document = await VolunteerApplicationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!document) return null;
    return {
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      phone: document.phone,
      city: document.city,
      country: document.country,
      areaOfInterest: document.areaOfInterest,
      availability: document.availability,
      status: document.status,
      createdAt: document.createdAt.toISOString(),
    };
  });
}

export async function updateContactStatus(
  id: string,
  status: "new" | "read" | "resolved" | "spam",
): Promise<OperationalRead<AdminContactRecord | null>> {
  return readMongo(async () => {
    const document = await ContactSubmissionModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!document) return null;
    return {
      id: document._id.toString(),
      name: document.name,
      email: document.email,
      phone: document.phone,
      subject: document.subject,
      status: document.status,
      createdAt: document.createdAt.toISOString(),
    };
  });
}
