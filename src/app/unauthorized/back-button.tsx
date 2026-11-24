"use client";

import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  return (
    <button
      type="button"
      onClick={() => window.history.back()}
      className="inline-flex w-full items-center justify-center gap-2 rounded-sm border px-6 py-3 text-sm font-medium transition hover:bg-muted sm:w-auto"
    >
      <ArrowLeft size={16} />
      Go Back
    </button>
  );
}