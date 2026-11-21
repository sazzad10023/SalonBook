export const SERVICES_COLLECTION = "services";

export const SERVICE_STATUSES = ["active", "inactive"] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export type ServiceInput = {
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: ServiceStatus;
};

export type ServiceDocument = ServiceInput & {
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};
