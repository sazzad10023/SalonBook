"use server";
import { authFetch } from "@/lib/core/server";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface DashboardStats {
  totalCustomers: number;
  totalActiveServices: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  totalSuccessfulPayments: {
    currency: string;
    amount: number;
  }[];
}

interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await authFetch(
    `${BASE_URL}/admin/dashboard`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = (await response.json().catch(() => null)) as DashboardResponse | null;

  if (!response.ok) {
    throw new Error(
      result?.message || `Failed to fetch dashboard statistics (${response.status}).`
    );
  }

  if (!result?.success) {
    throw new Error(result?.message || "Failed to fetch dashboard statistics");
  }

  return result.data;
}
