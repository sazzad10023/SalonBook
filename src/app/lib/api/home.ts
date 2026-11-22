
export interface SalonService {
  _id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  duration: number;
  isFeatured: boolean;
  status: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getHomeServices(): Promise<SalonService[]> {
  const response = await fetch(`${API_URL}/services`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch services");
  }

  return Array.isArray(result) ? result : result.data || [];
}
