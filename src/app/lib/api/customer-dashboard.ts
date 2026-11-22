const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function getCustomerDashboardStats() {
  const response = await fetch(`${BASE_URL}/customer-stats`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch dashboard stats");
  }

  return result.data;
}