

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

interface FeaturedServicesResponse {
  success: boolean;
  message: string;
  data: SalonService[];
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




export function pickFeaturedServices(
  services: SalonService[],
  limit = 6
): SalonService[] {
  const active = services.filter(
    (service) => service.status?.toLowerCase() === "active"
  );
  const flagged = active.filter((service) => service.isFeatured);

  return (flagged.length > 0 ? flagged : active).slice(0, limit);
}

export async function getFeaturedServices(): Promise<SalonService[]> {
  const response = await fetch(`${API_URL}/featured-services`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch featured services");
  }

  const result: FeaturedServicesResponse = await response.json();
  const featured = Array.isArray(result?.data) ? result.data : [];

  if (featured.length > 0) {
    return featured;
  }

  // No services are flagged as featured in the external API yet. Show recent
  // active services instead so the recommendations section isn't empty.
  return pickFeaturedServices(await getHomeServices());
}
