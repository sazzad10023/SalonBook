"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type SyncResponse = {
  paid?: boolean;
  alreadyPaid?: boolean;
  reason?: string;
  error?: string;
};

export function CheckPaymentButton({
  appointmentId,
}: {
  appointmentId: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkPayment = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/payments/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      const result = (await response.json().catch(() => null)) as SyncResponse | null;

      if (!response.ok) {
        throw new Error(result?.error ?? "Could not check the payment status.");
      }

      if (result?.paid || result?.alreadyPaid) {
        toast.success("Payment confirmed. Your appointment is now Paid.");
        router.refresh();
      } else {
        toast.message(result?.reason ?? "Payment is not confirmed yet.");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not check the payment status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={checkPayment}
      className="rounded-sm"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="mr-2 h-4 w-4" />
      )}
      {loading ? "Checking..." : "Check payment status"}
    </Button>
  );
}
