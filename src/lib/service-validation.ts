import {
  SERVICE_STATUSES,
  type ServiceInput,
  type ServiceStatus,
} from "@/lib/services";

export const MAX_SERVICE_NAME_LENGTH = 120;
export const MAX_SERVICE_CATEGORY_LENGTH = 80;
export const MAX_SERVICE_DESCRIPTION_LENGTH = 2000;
export const MAX_SERVICE_IMAGE_LENGTH = 6_000_000;
export const SERVICE_IMAGE_PATTERN = /^data:image\/(jpeg|png|webp);base64,/;

export type ServiceValidationResult =
  | { ok: true; value: ServiceInput }
  | { ok: false; error: string };

export type ServiceStatusResult =
  | { ok: true; status: ServiceStatus }
  | { ok: false; error: string };

export function isServiceStatus(value: unknown): value is ServiceStatus {
  return (
    typeof value === "string" &&
    SERVICE_STATUSES.includes(value as ServiceStatus)
  );
}

export function validateServiceStatus(value: unknown): ServiceStatusResult {
  if (!isServiceStatus(value)) {
    return { ok: false, error: "Status must be active or inactive." };
  }

  return { ok: true, status: value };
}

export function validateServiceInput(
  input: Record<string, unknown>
): ServiceValidationResult {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const category =
    typeof input.category === "string" ? input.category.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const image = typeof input.image === "string" ? input.image : "";
  const status = validateServiceStatus(input.status);

  if (!name) {
    return { ok: false, error: "Service name is required." };
  }

  if (name.length > MAX_SERVICE_NAME_LENGTH) {
    return {
      ok: false,
      error: `Service name must be ${MAX_SERVICE_NAME_LENGTH} characters or fewer.`,
    };
  }

  if (!category) {
    return { ok: false, error: "Service category is required." };
  }

  if (category.length > MAX_SERVICE_CATEGORY_LENGTH) {
    return {
      ok: false,
      error: `Service category must be ${MAX_SERVICE_CATEGORY_LENGTH} characters or fewer.`,
    };
  }

  if (!description) {
    return { ok: false, error: "Description is required." };
  }

  if (description.length > MAX_SERVICE_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Description must be ${MAX_SERVICE_DESCRIPTION_LENGTH} characters or fewer.`,
    };
  }

  if (
    typeof input.price !== "number" ||
    !Number.isFinite(input.price) ||
    input.price <= 0
  ) {
    return { ok: false, error: "Price must be a positive number." };
  }

  if (
    typeof input.duration !== "number" ||
    !Number.isInteger(input.duration) ||
    input.duration <= 0
  ) {
    return {
      ok: false,
      error: "Duration must be a positive whole number of minutes.",
    };
  }

  if (!status.ok) {
    return status;
  }

  if (!SERVICE_IMAGE_PATTERN.test(image)) {
    return { ok: false, error: "A valid service image is required." };
  }

  if (image.length > MAX_SERVICE_IMAGE_LENGTH) {
    return { ok: false, error: "The service image is too large." };
  }

  return {
    ok: true,
    value: {
      name,
      category,
      description,
      price: Math.round(input.price * 100) / 100,
      duration: input.duration,
      image,
      status: status.status,
    },
  };
}
