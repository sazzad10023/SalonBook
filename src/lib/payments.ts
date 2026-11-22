import "server-only";

import { ObjectId } from "mongodb";
import type Stripe from "stripe";

import { getDb } from "./mongodb";

const APPOINTMENTS_COLLECTION = "appointments";
const SERVICES_COLLECTION = "services";
export const TRANSACTIONS_COLLECTION = "transactions";

export type PaymentAppointment = {
  _id: ObjectId;
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  status: string;
  paymentStatus: string;
  /** Latest Stripe Checkout Session created for this appointment. */
  paymentSessionId?: string | null;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentService = {
  _id: ObjectId;
  name: string;
  price: number;
  category?: string;
  duration?: number;
  image?: string;
  status?: string;
};

export type TransactionDocument = {
  appointmentId: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  status: string | null;
  paymentStatus: string;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  serviceId: string | null;
  serviceName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getAppointmentById(
  id: string
): Promise<PaymentAppointment | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDb();
  return db
    .collection<PaymentAppointment>(APPOINTMENTS_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
}

/**
 * Stores the Checkout Session ID on the appointment so payment can be
 * confirmed later without relying on a webhook.
 */
export async function setAppointmentCheckoutSession(
  appointmentId: string,
  sessionId: string
) {
  if (!ObjectId.isValid(appointmentId)) {
    return;
  }

  const db = await getDb();

  await db
    .collection<PaymentAppointment>(APPOINTMENTS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(appointmentId) },
      {
        $set: {
          paymentSessionId: sessionId,
          updatedAt: new Date(),
        },
      }
    );
}

export async function getServiceById(
  id: string
): Promise<PaymentService | null> {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const db = await getDb();
  return db
    .collection<PaymentService>(SERVICES_COLLECTION)
    .findOne({ _id: new ObjectId(id) });
}

export async function getTransactionForSession(
  sessionId: string,
  appointmentId: string
): Promise<TransactionDocument | null> {
  const db = await getDb();

  return db.collection<TransactionDocument>(TRANSACTIONS_COLLECTION).findOne({
    stripeSessionId: sessionId,
    appointmentId,
  });
}

function getTransactionFields(
  session: Stripe.Checkout.Session,
  appointmentId: string,
  status: "paid" | "failed"
) {
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  return {
    appointmentId,
    stripeSessionId: session.id,
    stripePaymentIntentId: paymentIntent,
    amount: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    status,
    paymentStatus: session.payment_status ?? "unpaid",
    customerId: session.metadata?.customerId ?? null,
    customerName: session.metadata?.customerName ?? null,
    customerEmail:
      session.customer_details?.email ??
      session.customer_email ??
      session.metadata?.customerEmail ??
      null,
    serviceId: session.metadata?.serviceId ?? null,
    serviceName: session.metadata?.serviceName ?? null,
  };
}

/**
 * Records a paid Checkout Session and marks its appointment as Paid.
 *
 * Both the Stripe webhook and the success/sync paths call this function, so it
 * must be safe to call more than once for the same session.
 */
export async function recordPaidCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ recorded: boolean; appointmentId?: string; reason?: string }> {
  if (session.mode !== "payment" || session.payment_status !== "paid") {
    return { recorded: false, reason: "Payment is not complete." };
  }

  const appointmentId =
    session.metadata?.appointmentId ?? session.client_reference_id ?? null;

  if (!appointmentId || !ObjectId.isValid(appointmentId)) {
    return { recorded: false, reason: "Session has no valid appointment." };
  }

  const now = new Date();
  const db = await getDb();

  await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .updateOne(
      { stripeSessionId: session.id },
      {
        $set: {
          ...getTransactionFields(session, appointmentId, "paid"),
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

  await db
    .collection<PaymentAppointment>(APPOINTMENTS_COLLECTION)
    .updateOne(
      { _id: new ObjectId(appointmentId) },
      { $set: { paymentStatus: "Paid", updatedAt: now } }
    );

  return { recorded: true, appointmentId };
}

/**
 * Records an expired or failed Checkout Session with status "failed".
 * A session that was already recorded as paid is left untouched.
 */
export async function recordFailedCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<{ recorded: boolean; appointmentId?: string; reason?: string }> {
  if (session.mode !== "payment") {
    return { recorded: false, reason: "Session is not a payment." };
  }

  const appointmentId =
    session.metadata?.appointmentId ?? session.client_reference_id ?? null;

  if (!appointmentId || !ObjectId.isValid(appointmentId)) {
    return { recorded: false, reason: "Session has no valid appointment." };
  }

  const now = new Date();
  const db = await getDb();

  const result = await db
    .collection<TransactionDocument>(TRANSACTIONS_COLLECTION)
    .updateOne(
      { stripeSessionId: session.id, status: { $ne: "paid" } },
      {
        $set: {
          ...getTransactionFields(session, appointmentId, "failed"),
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );

  return {
    recorded: result.upsertedCount > 0 || result.modifiedCount > 0,
    appointmentId,
  };
}
