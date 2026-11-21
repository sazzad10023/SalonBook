import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { recordPaidCheckoutSession } from "@/lib/payments";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // Webhook is optional. Payments are confirmed by retrieving the
    // Checkout Session from Stripe on the success page or sync endpoint.
    return NextResponse.json({
      received: false,
      ignored: true,
      reason: "STRIPE_WEBHOOK_SECRET is not configured.",
    });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  // Stripe signatures are computed over the raw request body.
  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error(
      "Stripe signature verification failed:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const result = await recordPaidCheckoutSession(event.data.object);

        if (!result.recorded) {
          console.warn("Skipped Stripe session:", result.reason);
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to process Stripe webhook:", error);

    // A 500 makes Stripe retry the event.
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
