import type { ServiceInput } from "@/lib/services";

export type { ServiceInput, ServiceStatus } from "@/lib/services";
 

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
export type Service = ServiceInput & {
  id: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiError = { error?: string };

async function parseResponse<T>(response: Response): Promise<T> {
  const result = (await response.json().catch(() => null)) as
    | (T & ApiError)
    | null;

  if (!response.ok) {
    throw new Error(
      result?.error ?? `Request failed with status ${response.status}.`
    );
  }

  if (result === null) {
    throw new Error("The server returned an empty response.");
  }

  return result;
}

type ServiceApiDocument = Omit<Service, "id"> & {
  id?: string;
  _id?: string;
};

type ServiceApiResponse =
  | ServiceApiDocument[]
  | { services: ServiceApiDocument[] }
  | { data: ServiceApiDocument[] };

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${BASE_URL}/services`, { cache: "no-store" });
  const data = await parseResponse<ServiceApiResponse>(response);

  const services = Array.isArray(data)
    ? data
    : "services" in data
      ? data.services
      : data.data;

  return services.map(({ _id, id, ...service }) => ({
    ...service,
    id: id ?? _id ?? "",
  }));
}

export async function updateService(
  id: string,
  data: Partial<ServiceInput>
): Promise<Service> {
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseResponse<Service>(response);
}

export async function deleteService(id: string): Promise<{ id: string }> {
  const response = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
  });

  return parseResponse<{ id: string }>(response);
}
