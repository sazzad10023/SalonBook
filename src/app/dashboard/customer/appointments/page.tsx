
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getMyAppointmentsWithServices,
  type Appointment,
} from "@/app/lib/appointments";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Eye,
  Loader2,
} from "lucide-react";

export default function MyAppointmentsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userId = session?.user.id;
  const userEmail =
    typeof session?.user.email === "string"
      ? session.user.email.toLowerCase()
      : null;
  const hasUser = Boolean(session?.user);

  useEffect(() => {
    if (isPending) return;

    if (!hasUser || (!userId && !userEmail)) {
      router.replace("/signin");
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getMyAppointmentsWithServices();

        // The backend returns all bookings, so keep only the ones that belong
        // to the signed-in customer.
        const myAppointments = result.filter((appointment) => {
          const customer = appointment.customer;

          if (!customer) return false;
          if (userId && customer.id === userId) return true;
          if (
            userEmail &&
            typeof customer.email === "string" &&
            customer.email.toLowerCase() === userEmail
          ) {
            return true;
          }

          return false;
        });

        setAppointments(myAppointments);
      } catch (error) {
        console.error(error);
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [hasUser, isPending, router, userEmail, userId]);

  const formatDate = (date: string) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRequestedDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "border-[#c5eadb] bg-[#e8f7ef] text-[#287653]";
      case "pending":
        return "border-[#f3dfb5] bg-[#fff7e7] text-[#a16b13]";
      case "cancelled":
        return "border-[#f3cece] bg-[#fff0f0] text-[#bd4545]";
      default:
        return "border-gray-200 bg-gray-100 text-gray-600";
    }
  };

  const getPaymentStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "border-[#c5eadb] bg-[#e8f7ef] text-[#287653]";
      case "unpaid":
        return "border-[#f3dfb5] bg-[#fff7e7] text-[#a16b13]";
      default:
        return "border-gray-200 bg-gray-100 text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#355747]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#263d32]">
            My Appointments
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your appointments.
          </p>
        </div>

        <Button
          nativeButton={false}
          size="sm"
          className="rounded-sm bg-[#355747] hover:bg-[#263d32]"
          render={<Link href="/services" />}
        >
          Book Appointment
        </Button>
      </div>

      {/* Appointment Count */}
      <div className="rounded-sm border bg-white p-4">
        <p className="text-sm text-gray-500">Total Appointments</p>
        <p className="mt-1 text-2xl font-semibold text-[#355747]">
          {appointments.length}
        </p>
      </div>

      {/* Appointment Cards */}
      {appointments.length === 0 ? (
        <div className="rounded-sm border bg-white px-4 py-16 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-400" />

          <h2 className="mt-4 font-semibold text-[#263d32]">
            No Appointments Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            You haven&apos;t booked any appointments yet.
          </p>

          <Button
            nativeButton={false}
            className="mt-5 rounded-sm bg-[#355747] hover:bg-[#263d32]"
            render={<Link href="/services" />}
          >
            Browse Services
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="rounded-sm border border-[#e9e9e2] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Main Card */}
              <div className="grid items-center gap-4 md:grid-cols-[minmax(190px,1.5fr)_minmax(160px,1fr)_90px_110px_100px]">
                {/* Service Image & Name */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#eaf0e7]">
                    {appointment.service?.image ? (
                      <Image
                        src={appointment.service.image}
                        alt={appointment.service.name || "Service"}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-[#82977a]" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#263d32]">
                      {appointment.service?.name || "Service"}
                    </h3>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {appointment.service?.category || "Salon Service"}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div>
                  <p className="text-sm font-semibold text-[#263d32]">
                    {formatDate(appointment.appointmentDate)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {appointment.timeSlot}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <p className="mb-1 text-xs text-gray-500 md:hidden">
                    Price
                  </p>
                  <p className="text-sm font-semibold text-[#263d32]">
                    {appointment.service?.price != null
                      ? `$${appointment.service.price.toFixed(2)}`
                      : "—"}
                  </p>
                </div>

                {/* Appointment Status */}
                <div>
                  <p className="mb-1 text-xs text-gray-500 md:hidden">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                      appointment.status
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {appointment.status}
                  </span>
                </div>

                {/* Payment Status */}
                <div>
                  <p className="mb-1 text-xs text-gray-500 md:hidden">
                    Payment
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getPaymentStyle(
                      appointment.paymentStatus
                    )}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {appointment.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">
                    Requested on{" "}
                    <span className="font-medium text-gray-700">
                      {formatRequestedDate(appointment.createdAt)}
                    </span>
                  </p>

                  {appointment.message && (
                    <p className="max-w-md truncate text-xs text-gray-500">
                      Message: {appointment.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-sm border-[#355747] text-xs text-[#355747] hover:bg-[#eaf0e7]"
                    render={
                      <Link href={`/services/${appointment.serviceId}`} />
                    }
                  >
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    Service Details
                  </Button>


                  {appointment.status === "Confirmed" &&
                    appointment.paymentStatus === "Unpaid" && (
                      <Button
                        nativeButton={false}
                        size="sm"
                        className="h-8 rounded-sm bg-[#355747] text-xs hover:bg-[#263d32]"
                        render={
                          <Link
                            href={`/dashboard/customer/appointments/${appointment._id}/payment`}
                          />
                        }
                      >
                        <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                        Pay Now
                      </Button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
