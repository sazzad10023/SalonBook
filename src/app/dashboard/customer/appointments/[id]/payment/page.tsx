import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Scissors,
  ShieldCheck,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getAppointmentById, getServiceById } from "@/lib/payments";
import { Button } from "@/components/ui/button";

import { CheckPaymentButton } from "./check-payment-button";
import { PayButton } from "./pay-button";

export const metadata = {
  title: "Pay for appointment | SalonBook",
};

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PaymentPage(
  props: PageProps<"/dashboard/customer/appointments/[id]/payment">
) {
  const { id } = await props.params;

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

  const service = await getServiceById(appointment.serviceId);

  if (!service) {
    notFound();
  }

  const alreadyPaid = appointment.paymentStatus === "Paid";
  const isConfirmed = appointment.status === "Confirmed";
  const amount = Number(service.price);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#263d32]">
          Pay for your appointment
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review the details below before continuing to secure checkout.
        </p>
      </div>

      {alreadyPaid ? (
        <div className="rounded-sm border border-[#c5eadb] bg-[#e8f7ef] p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#287653]" />
          <h2 className="mt-3 text-lg font-semibold text-[#263d32]">
            Already paid
          </h2>
          <p className="mt-1 text-sm text-[#4c6b5d]">
            This appointment has already been marked as Paid.
          </p>
        </div>
      ) : !isConfirmed ? (
        <div className="rounded-sm border border-amber-200 bg-amber-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-amber-800">
            Waiting for confirmation
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            Payment becomes available once the salon confirms your appointment.
            Current status: {appointment.status}.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-sm border bg-white p-5">
            <div className="flex items-start gap-4 border-b pb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-[#eaf0e7]">
                <Scissors className="h-5 w-5 text-[#355747]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Service</p>
                <p className="truncate text-base font-semibold text-[#263d32]">
                  {service.name}
                </p>
                <p className="text-xs text-gray-500">
                  {service.category || "Salon service"}
                </p>
              </div>
            </div>

            <dl className="grid gap-4 py-4 sm:grid-cols-2">
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
                <dd className="mt-1 text-sm font-medium text-amber-600">
                  {appointment.paymentStatus}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-400">Appointment status</dt>
                <dd className="mt-1 text-sm font-medium text-[#287653]">
                  {appointment.status}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium text-gray-500">
                Total to pay
              </span>
              <span className="text-2xl font-semibold text-[#355747]">
                ${amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="rounded-sm border bg-[#fbfcf8] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#355747]" />
              <p className="text-sm text-gray-600">
                You will be redirected to Stripe to complete your payment. Your
                appointment is marked as Paid only after Stripe confirms the
                payment. If you have already paid, use Check payment status to
                refresh it.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              nativeButton={false}
              variant="outline"
              className="rounded-sm"
              render={
                <Link href="/dashboard/customer/appointments" />
              }
            >
              Back to appointments
            </Button>
            <CheckPaymentButton appointmentId={appointment._id.toString()} />
            <PayButton appointmentId={appointment._id.toString()} />
          </div>
        </>
      )}
    </div>
  );
}
