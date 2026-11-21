// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// import { auth } from "@/lib/auth";
// import {
//   getAppointmentById,
//   recordPaidCheckoutSession,
// } from "@/lib/payments";
// import { stripe } from "@/lib/stripe";

// export const runtime = "nodejs";

// /**
//  * Confirms a payment by asking Stripe for the Checkout Session stored on the
//  * appointment. This is the no-webhook path and is safe to call repeatedly.
//  */
// export async function POST(request: Request) {
//   try {
//     const session = await auth.api.getSession({ headers: request.headers });

//     if (!session) {
//       return NextResponse.json(
//         { error: "You must be signed in to check a payment." },
//         { status: 401 }
//       );
//     }

//     const body: unknown = await request.json().catch(() => null);
//     const appointmentId =
//       body && typeof body === "object" && "appointmentId" in body
//         ? String((body as { appointmentId: unknown }).appointmentId)
//         : "";

//     if (!appointmentId || !ObjectId.isValid(appointmentId)) {
//       return NextResponse.json(
//         { error: "A valid appointment ID is required." },
//         { status: 400 }
//       );
//     }

//     const appointment = await getAppointmentById(appointmentId);

//     if (!appointment) {
//       return NextResponse.json(
//         { error: "Appointment not found." },
//         { status: 404 }
//       );
//     }

//     if (
//       appointment.customer?.id &&
//       appointment.customer.id !== session.user.id
//     ) {
//       return NextResponse.json(
//         { error: "This appointment belongs to another customer." },
//         { status: 403 }
//       );
//     }

//     if (appointment.paymentStatus === "Paid") {
//       return NextResponse.json({ paid: true, alreadyPaid: true });
//     }

//     if (!appointment.paymentSessionId) {
//       return NextResponse.json({
//         paid: false,
//         reason: "No checkout session has been started for this appointment.",
//       });
//     }

//     const checkoutSession = await stripe.checkout.sessions.retrieve(
//       appointment.paymentSessionId
//     );

//     const belongsToAppointment =
//       checkoutSession.client_reference_id === appointmentId ||
//       checkoutSession.metadata?.appointmentId === appointmentId;

//     if (!belongsToAppointment) {
//       return NextResponse.json({
//         paid: false,
//         reason: "The checkout session does not match this appointment.",
//       });
//     }

//     if (checkoutSession.payment_status !== "paid") {
//       return NextResponse.json({
//         paid: false,
//         reason: "Stripe has not confirmed payment for this session yet.",
//       });
//     }

//     const result = await recordPaidCheckoutSession(checkoutSession);

//     return NextResponse.json({
//       paid: result.recorded,
//       sessionId: checkoutSession.id,
//     });
//   } catch (error) {
//     console.error("Failed to sync payment status:", error);

//     return NextResponse.json(
//       {
//         error:
//           error instanceof Error
//             ? error.message
//             : "Could not check the payment status.",
//       },
//       { status: 500 }
//     );
//   }
// }
