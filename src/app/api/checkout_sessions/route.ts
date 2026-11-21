import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  getAppointmentById,
  getServiceById,
  setAppointmentCheckoutSession,
} from "@/lib/payments";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to pay for an appointment." },
        { status: 401 }
      );
    }

    const body: unknown = await request.json().catch(() => null);
    const appointmentId =
      body && typeof body === "object" && "appointmentId" in body
        ? String((body as { appointmentId: unknown }).appointmentId)
        : "";

    if (!appointmentId || !ObjectId.isValid(appointmentId)) {
      return NextResponse.json(
        { error: "A valid appointment ID is required." },
        { status: 400 }
      );
    }

    const appointment = await getAppointmentById(appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 }
      );
    }

    if (
      appointment.customer?.id &&
      appointment.customer.id !== session.user.id
    ) {
      return NextResponse.json(
        { error: "This appointment belongs to another customer." },
        { status: 403 }
      );
    }

    if (appointment.status !== "Confirmed") {
      return NextResponse.json(
        { error: "Only confirmed appointments can be paid." },
        { status: 409 }
      );
    }

    if (appointment.paymentStatus === "Paid") {
      return NextResponse.json(
        { error: "This appointment has already been paid." },
        { status: 409 }
      );
    }

    const service = await getServiceById(appointment.serviceId);

    if (!service) {
      return NextResponse.json(
        { error: "The service for this appointment no longer exists." },
        { status: 404 }
      );
    }

    const unitAmount = Math.round(Number(service.price) * 100);

    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json(
        { error: "This service does not have a valid price." },
        { status: 400 }
      );
    }

    const origin = request.headers.get("origin") ?? new URL(request.url).origin;
    const customerEmail =
      appointment.customer?.email ?? session.user.email ?? undefined;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: service.name,
              ...(service.category ? { description: service.category } : {}),
            },
          },
        },
      ],
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      client_reference_id: appointmentId,
      metadata: {
        appointmentId,
        serviceId: appointment.serviceId,
        serviceName: service.name,
        customerId: session.user.id,
        customerName: session.user.name ?? "",
        customerEmail: session.user.email ?? "",
      },
      success_url: `${origin}/dashboard/customer/appointments/${appointmentId}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/customer/appointments/${appointmentId}/payment/cancel`,
    });

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    await setAppointmentCheckoutSession(appointmentId, checkoutSession.id);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Failed to create checkout session", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not start the payment process.",
      },
      { status: 500 }
    );
  }
}
