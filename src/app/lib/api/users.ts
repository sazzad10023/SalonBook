
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  image?: string;
  role?: string;
  banned?: boolean;
  banReason?: string;
  bannedAt?: string;
  createdAt?: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${BASE_URL}/users`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const result = await response.json();

  return Array.isArray(result) ? result : result.data ?? [];
}

export async function blockUser(id: string) {
  const response = await fetch(`${BASE_URL}/users/${id}/block`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      banReason: "Blocked by admin",
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to block user");
  }

  return result;
}

export async function unblockUser(id: string) {
  const response = await fetch(`${BASE_URL}/users/${id}/unblock`, {
    method: "PATCH",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to unblock user");
  }

  return result;
}
