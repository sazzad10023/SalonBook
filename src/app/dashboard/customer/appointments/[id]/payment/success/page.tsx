import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ReceiptText,
} from "lucide-react";
import type Stripe from "stripe";

import { auth } from "@/lib/auth";
import {
  getAppointmentById,
  getTransactionForSession,
  recordPaidCheckoutSession,
  type TransactionDocument,
} from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

import { CheckPaymentButton } from "../check-payment-button";

export const metadata = {
  title: "Payment successful | SalonBook",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PaymentSuccessPage(
  props: PageProps<"/dashboard/customer/appointments/[id]/payment/success">
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const sessionId =
    typeof searchParams.session_id === "string"
      ? searchParams.session_id
      : null;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  const appointment = await getAppointmentById(id);

  if (!appointment) {
    notFound();
  }

  if (
    appointment.customer?.id &&
    appointment.customer.id !== session.user.id
  ) {
    notFound();
  }

  let transaction: TransactionDocument | null = null;
  let verifiedSession: Stripe.Checkout.Session | null = null;

  if (sessionId) {
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

      const belongsToAppointment =
        stripeSession.client_reference_id === id ||
        stripeSession.metadata?.appointmentId === id;

      if (belongsToAppointment && stripeSession.payment_status === "paid") {
        // Idempotent and authoritative: Stripe itself confirms the session.
        // The webhook is optional, so this is the normal recording path when
        // STRIPE_WEBHOOK_SECRET is not configured.
        await recordPaidCheckoutSession(stripeSession);
        transaction = await getTransactionForSession(sessionId, id);
        verifiedSession = stripeSession;
      }
    } catch (error) {
      console.error("Failed to verify Stripe Checkout Session:", error);
    }
  }

  const freshAppointment = (await getAppointmentById(id)) ?? appointment;
  const isPaid =
    freshAppointment.paymentStatus === "Paid" || transaction?.status === "paid";
  const amount = isPaid ? (transaction?.amount ?? null) : null;
  const currency = transaction?.currency ?? "usd";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div
        className={`rounded-sm border p-8 text-center ${
          isPaid
            ? "border-[#c5eadb] bg-[#e8f7ef]"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        {isPaid ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#287653]" />
            <h1 className="mt-4 text-2xl font-semibold text-[#263d32]">
              Payment successful
            </h1>
            <p className="mt-2 text-sm text-[#4c6b5d]">
              Your payment has been confirmed. Thank you for booking with
              SalonBook.
            </p>
          </>
        ) : (
          <>
            <CreditCard className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="mt-4 text-2xl font-semibold text-[#263d32]">
              Payment not confirmed yet
            </h1>
            <p className="mt-2 text-sm text-amber-700">
              We have not received a verified payment confirmation for this
              appointment. If you completed checkout, it may take a few moments
              to appear.
            </p>
          </>
        )}
      </div>

      <div className="rounded-sm border bg-white p-5">
        <h2 className="flex items-center gap-2 font-semibold text-[#263d32]">
          <ReceiptText className="h-4 w-4 text-[#355747]" />
          Appointment summary
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-400">Appointment date</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#263d32]">
              <CalendarDays className="h-4 w-4 text-[#82977a]" />
              {formatDate(appointment.appointmentDate)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Time slot</dt>
            <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#263d32]">
              <Clock className="h-4 w-4 text-[#82977a]" />
              {appointment.timeSlot}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Payment status</dt>
            <dd
              className={`mt-1 text-sm font-medium ${
                isPaid ? "text-[#287653]" : "text-amber-600"
              }`}
            >
              {freshAppointment.paymentStatus}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Amount paid</dt>
            <dd className="mt-1 text-sm font-semibold text-[#355747]">
              {amount !== null
                ? `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`
                : "Pending confirmation"}
            </dd>
          </div>
        </dl>

        {verifiedSession?.id && (
          <p className="mt-4 break-all border-t pt-4 text-xs text-gray-400">
            Stripe session: {verifiedSession.id}
          </p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {!isPaid && <CheckPaymentButton appointmentId={id} />}
        <Button
          nativeButton={false}
          className="rounded-sm bg-[#355747] hover:bg-[#263d32]"
          render={<Link href="/dashboard/customer/appointments" />}
        >
          View my appointments
        </Button>
      </div>
    </div>
  );
}
