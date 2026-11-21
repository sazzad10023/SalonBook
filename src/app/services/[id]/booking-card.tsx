
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  createAppointment,
  type AppointmentCustomer,
} from "@/app/lib/appointments";

type Props = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  isAuthenticated: boolean;
  isAdmin: boolean;
  customer?: AppointmentCustomer;
};

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
];

export function BookingCard({
  serviceId,
  serviceName,
  price,
  duration,
  isAuthenticated,
  isAdmin,
  customer,
}: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent multiple booking requests
  const bookingInProgress = useRef(false);

  const today = new Date();

  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  async function handleBooking() {
    // Prevent duplicate clicks
    if (bookingInProgress.current) return;

    if (!date || !time) {
      toast.error("Please select appointment date and time.");
      return;
    }

    if (!isAuthenticated || isAdmin) {
      toast.error("You are not allowed to submit this booking.");
      return;
    }

    if (!customer) {
      toast.error("Your account details are unavailable. Please sign in again.");
      return;
    }

    // Lock immediately before API request
    bookingInProgress.current = true;
    setLoading(true);

    try {
      const result = await createAppointment({
        serviceId,
        appointmentDate: date,
        timeSlot: time,
        message: message.trim(),
        customer,
      });

      console.log("Appointment API Response:", result);

      toast.success(
        result?.message || "Appointment request submitted successfully!"
      );

      // Clear form
      setDate("");
      setTime("");
      setMessage("");

      // Redirect after successful booking
      router.push("/dashboard/customer/appointments");

    } catch (error) {
      console.error("Booking Error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      // Unlock only when request fails
      bookingInProgress.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-sm border border-[#e3e9df] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e3e9df] bg-[#fbf7ef] px-5 py-5">
        <h2 className="font-serif text-2xl text-[#263d32]">
          Choose your time
        </h2>

        <p className="mt-1 text-xs text-[#82977a]">
          The salon will confirm your request shortly.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* Selected Service */}
        <div className="border border-[#e3e9df] bg-[#fbfcf8] p-4">
          <p className="text-xs text-[#82977a]">
            Selected service
          </p>

          <h3 className="mt-1 font-medium text-[#263d32]">
            {serviceName}
          </h3>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-[#82977a]">
              <Clock size={14} />
              {duration} minutes
            </span>

            <span className="font-semibold text-[#355747]">
              ৳{price.toLocaleString("en-BD")}
            </span>
          </div>
        </div>

        {/* Admin Restriction */}
        {isAdmin ? (
          <div className="border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Admin accounts cannot submit customer appointment requests.
          </div>
        ) : !isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-[#626b61]">
              Please sign in to book this service.
            </p>

            <Link
              href="/signin"
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#355747] px-4 py-3 text-sm font-medium text-white hover:bg-[#263d32]"
            >
              Sign in to book
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Appointment Date */}
            <div>
              <label
                htmlFor="appointment-date"
                className="mb-2 block text-sm font-semibold text-[#263d32]"
              >
                Appointment date
              </label>

              <input
                id="appointment-date"
                type="date"
                min={minDate}
                value={date}
                disabled={loading}
                onChange={(event) => {
                  setDate(event.target.value);
                  setTime("");
                }}
                className="w-full rounded-sm border border-[#e3e9df] bg-white px-3 py-3 text-sm outline-none focus:border-[#82977a] disabled:opacity-50"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label
                htmlFor="time-slot"
                className="mb-2 block text-sm font-semibold text-[#263d32]"
              >
                Time slot
              </label>

              <select
                id="time-slot"
                value={time}
                disabled={loading}
                onChange={(event) => setTime(event.target.value)}
                className="w-full rounded-sm border border-[#e3e9df] bg-white px-3 py-3 text-sm outline-none focus:border-[#82977a] disabled:opacity-50"
              >
                <option value="">Select a time</option>

                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-[#82977a]">
                Select your preferred appointment time.
              </p>
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="booking-message"
                className="mb-2 block text-sm font-semibold text-[#263d32]"
              >
                Message for the salon{" "}
                <span className="font-normal text-[#82977a]">
                  (optional)
                </span>
              </label>

              <textarea
                id="booking-message"
                rows={4}
                maxLength={500}
                disabled={loading}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Anything we should know before your visit?"
                className="w-full resize-y rounded-sm border border-[#e3e9df] bg-white px-3 py-3 text-sm outline-none placeholder:text-[#a1a99b] focus:border-[#82977a] disabled:opacity-50"
              />
            </div>

            {/* Booking Button */}
            <button
              type="button"
              onClick={handleBooking}
              disabled={loading || !date || !time}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#355747] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#263d32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  Request Appointment
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Security Information */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#82977a]">
              <ShieldCheck size={15} />
              Your request will be reviewed by the salon.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
