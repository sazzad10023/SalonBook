import type { ServiceInput } from "@/lib/services";

export type CreateBookResult = {
  id?: string;
  error?: string;
};
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export const createBook = async (
  data: ServiceInput
): Promise<CreateBookResult> => {
  const response = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = (await response.json().catch(() => null)) as
    | { id?: string; error?: string }
    | null;

  if (!response.ok) {
    return { error: result?.error ?? "Could not save the service." };
  }

  return { id: result?.id };
};
