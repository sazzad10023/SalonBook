"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PayButton({ appointmentId }: { appointmentId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkout_sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      const result = (await response.json().catch(() => null)) as {
        url?: string;
        error?: string;
      } | null;

      if (!response.ok || !result?.url) {
        throw new Error(result?.error ?? "Could not start checkout.");
      }

      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      disabled={loading}
      onClick={handlePay}
      className="rounded-sm bg-[#355747] px-6 hover:bg-[#263d32]"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      {loading ? "Opening Stripe..." : "Pay with Stripe"}
    </Button>
  );
}
