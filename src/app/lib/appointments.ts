import { getServices, type Service } from "./api/books";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export type AppointmentCustomer = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  image?: string | null;
};

export type Appointment = {
  _id: string;
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  service?: Service | null;
  customer?: AppointmentCustomer | null;
};

type AppointmentRecord = Omit<Appointment, "service">;

type AppointmentsResponse = {
  success?: boolean;
  message?: string;
  data?: AppointmentRecord[];
};

export async function createAppointment(data: {
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  message: string;
  customer?: AppointmentCustomer;
}) {
  const response = await fetch(`${BASE_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();

  console.log("Appointment API Status:", response.status);
  console.log("Appointment API Response:", responseText);

  let result;

  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error(
      `API returned HTML or invalid JSON. HTTP Status: ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Booking request failed."
    );
  }

  return result;
}





export const getMyAppointments = async (): Promise<AppointmentsResponse> => {
  const response = await fetch(`${BASE_URL}/appointments`, {
    method: "GET",
    cache: "no-store",
  });

  const result = (await response.json()) as AppointmentsResponse;

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch appointments.");
  }

  return result;
};

async function loadServices(): Promise<Service[]> {
  return getServices().catch((error) => {
    console.error("Failed to load services for appointments", error);
    return [];
  });
}

function attachServices(
  appointments: AppointmentRecord[],
  services: Service[]
): Appointment[] {
  const servicesById = new Map(
    services.map((service) => [service.id, service])
  );

  return appointments.map((appointment) => ({
    ...appointment,
    service: servicesById.get(appointment.serviceId) ?? null,
  }));
}

export async function getMyAppointmentsWithServices(): Promise<Appointment[]> {
  const [result, services] = await Promise.all([
    getMyAppointments(),
    loadServices(),
  ]);

  return attachServices(result.data ?? [], services);
}

// Admin management

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const [result, services] = await Promise.all([
    getMyAppointments(),
    loadServices(),
  ]);

  return attachServices(result.data ?? [], services);
};

const updateAppointmentStatus = async (
  id: string,
  status: "Confirmed" | "Cancelled"
) => {
  const response = await fetch(`${BASE_URL}/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      result?.message ||
        (status === "Confirmed"
          ? "Failed to confirm appointment."
          : "Failed to cancel appointment.")
    );
  }

  return result;
};

export const confirmAppointment = (id: string) =>
  updateAppointmentStatus(id, "Confirmed");

export const cancelAdminAppointment = (id: string) =>
  updateAppointmentStatus(id, "Cancelled");
