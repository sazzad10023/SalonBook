"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { updateService } from "@/app/lib/api/books";
import type { ServiceInput, ServiceStatus } from "@/lib/services";
import { createBook } from "@/app/lib/action/books";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1400;
const JPEG_QUALITY = 0.82;
const MAX_IMAGE_LENGTH = 6_000_000;

const CATEGORY_SUGGESTIONS = [
  "Hair",
  "Makeup",
  "Nails",
  "Skin care",
  "Spa & massage",
  "Barber",
  "Bridal",
  "Waxing",
];

type FormErrors = Partial<
  Record<
    "name" | "category" | "description" | "price" | "duration" | "image",
    string
  >
>;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read that image file."));
    image.src = source;
  });
}

async function compressImage(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Image resizing is not supported in this browser.");
    }

    // JPEG has no transparency, so paint a white background first.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export type EditableService = ServiceInput & { id: string };

type ServiceFormProps = {
  service?: EditableService | null;
};

export function ServiceForm({ service = null }: ServiceFormProps) {
  const router = useRouter();
  const isEditing = service !== null;
  const [name, setName] = useState(service?.name ?? "");
  const [category, setCategory] = useState(service?.category ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service ? String(service.price) : "");
  const [duration, setDuration] = useState(
    service ? String(service.duration) : ""
  );
  const [status, setStatus] = useState<ServiceStatus>(
    service?.status ?? "active"
  );
  const [image, setImage] = useState<string | null>(service?.image ?? null);
  const [imageName, setImageName] = useState(
    service ? "Current image" : ""
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return { ...current, [field]: undefined };
    });
  }

  function resetForm() {
    setName("");
    setCategory("");
    setDescription("");
    setPrice("");
    setDuration("");
    setStatus("active");
    setImage(null);
    setImageName("");
    setErrors({});
  }

  function clearImage() {
    setImage(null);
    setImageName("");
  }

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file again still fires onChange.
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file (JPG, PNG, WebP, or GIF).");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("That image is larger than 10 MB. Choose a smaller file.");
      return;
    }

    clearError("image");
    setIsProcessingImage(true);

    try {
      const dataUrl = await compressImage(file);

      if (dataUrl.length > MAX_IMAGE_LENGTH) {
        toast.error("That image is too large after compression. Try a smaller one.");
        return;
      }

      setImage(dataUrl);
      setImageName(file.name);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not process that image. Try another file."
      );
    } finally {
      setIsProcessingImage(false);
    }
  }

  function validate() {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedCategory = category.trim();
    const trimmedDescription = description.trim();
    const priceValue = Number(price);
    const durationValue = Number(duration);

    if (!trimmedName) {
      nextErrors.name = "Enter a service name.";
    } else if (trimmedName.length > 120) {
      nextErrors.name = "Keep the name to 120 characters or fewer.";
    }

    if (!trimmedCategory) {
      nextErrors.category = "Enter a service category.";
    } else if (trimmedCategory.length > 80) {
      nextErrors.category = "Keep the category to 80 characters or fewer.";
    }

    if (!trimmedDescription) {
      nextErrors.description = "Add a short description of the service.";
    } else if (trimmedDescription.length > 2000) {
      nextErrors.description = "Keep the description to 2000 characters or fewer.";
    }

    if (!price.trim() || !Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = "Enter a price greater than 0.";
    }

    if (
      !duration.trim() ||
      !Number.isInteger(durationValue) ||
      durationValue <= 0
    ) {
      nextErrors.duration = "Enter a whole number of minutes greater than 0.";
    }

    if (!image) {
      nextErrors.image = "Upload a service image.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      name: trimmedName,
      category: trimmedCategory,
      description: trimmedDescription,
      price: priceValue,
      duration: durationValue,
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = validate();

    if (!values || !image) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const serviceData = {
      ...values,
      image,
      status,
    };

    setIsSubmitting(true);

    try {
      if (service) {
        await updateService(service.id, serviceData);
        toast.success(`"${values.name}" was updated.`);
        router.push("/dashboard/admin/services");
        router.refresh();
        return;
      }

      const result = await createBook(serviceData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`"${values.name}" was added.`);
      resetForm();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not reach the server. Check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isBusy = isSubmitting || isProcessingImage;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold">
            {isEditing ? "Edit service" : "Add a service"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? "Update this service's details, price, image, or availability."
              : "Create a bookable service for your salon. Only admins can add or change services."}
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href="/dashboard/admin/services" />}
        >
          Back to services
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader>
            <CardTitle>Service details</CardTitle>
            <CardDescription>
              This information is shown to customers when they browse your
              services.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="service-name">Service name</FieldLabel>
                <Input
                  id="service-name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                  placeholder="e.g. Signature haircut"
                  autoComplete="off"
                  maxLength={120}
                  aria-invalid={Boolean(errors.name)}
                  disabled={isBusy}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.category)}>
                <FieldLabel htmlFor="service-category">
                  Service category
                </FieldLabel>
                <Input
                  id="service-category"
                  name="category"
                  list="service-category-options"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    clearError("category");
                  }}
                  placeholder="e.g. Hair"
                  autoComplete="off"
                  maxLength={80}
                  aria-invalid={Boolean(errors.category)}
                  disabled={isBusy}
                />
                <datalist id="service-category-options">
                  {CATEGORY_SUGGESTIONS.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
                <FieldDescription>
                  Pick a suggestion or type your own category.
                </FieldDescription>
                <FieldError>{errors.category}</FieldError>
              </Field>

              <Field data-invalid={Boolean(errors.description)}>
                <FieldLabel htmlFor="service-description">
                  Description
                </FieldLabel>
                <Textarea
                  id="service-description"
                  name="description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    clearError("description");
                  }}
                  placeholder="Describe what the service includes and who it is for."
                  maxLength={2000}
                  className="min-h-28"
                  aria-invalid={Boolean(errors.description)}
                  disabled={isBusy}
                />
                <FieldDescription>
                  {description.trim().length}/2000 characters
                </FieldDescription>
                <FieldError>{errors.description}</FieldError>
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field data-invalid={Boolean(errors.price)}>
                  <FieldLabel htmlFor="service-price">Price</FieldLabel>
                  <Input
                    id="service-price"
                    name="price"
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={(event) => {
                      setPrice(event.target.value);
                      clearError("price");
                    }}
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.price)}
                    disabled={isBusy}
                  />
                  <FieldError>{errors.price}</FieldError>
                </Field>

                <Field data-invalid={Boolean(errors.duration)}>
                  <FieldLabel htmlFor="service-duration">
                    Estimated duration
                  </FieldLabel>
                  <Input
                    id="service-duration"
                    name="duration"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={duration}
                    onChange={(event) => {
                      setDuration(event.target.value);
                      clearError("duration");
                    }}
                    placeholder="60"
                    aria-invalid={Boolean(errors.duration)}
                    disabled={isBusy}
                  />
                  <FieldDescription>In minutes.</FieldDescription>
                  <FieldError>{errors.duration}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="service-status">Status</FieldLabel>
                  <NativeSelect
                    id="service-status"
                    name="status"
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as ServiceStatus)
                    }
                    className="w-full"
                    disabled={isBusy}
                  >
                    <NativeSelectOption value="active">Active</NativeSelectOption>
                    <NativeSelectOption value="inactive">
                      Inactive
                    </NativeSelectOption>
                  </NativeSelect>
                  <FieldDescription>
                    Inactive services stay hidden from customers.
                  </FieldDescription>
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.image)}>
                <FieldLabel htmlFor="service-image">Service image</FieldLabel>
                <Input
                  id="service-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-invalid={Boolean(errors.image)}
                  disabled={isBusy}
                />
                <FieldDescription>
                  JPG, PNG, WebP, or GIF up to 10 MB. Large photos are resized
                  and compressed automatically.
                </FieldDescription>
                <FieldError>{errors.image}</FieldError>

                {isProcessingImage && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="animate-spin" />
                    Optimizing image...
                  </p>
                )}

                {image && (
                  <div className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 sm:flex-row sm:items-center">
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
                      <Image
                        src={image}
                        alt={
                          imageName
                            ? `Preview of ${imageName}`
                            : "Service image preview"
                        }
                        fill
                        unoptimized
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {imageName || "service-image.jpg"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isEditing
                          ? "Upload a new file to replace the current image."
                          : "Ready to be saved with this service."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={clearImage}
                      disabled={isBusy}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  </div>
                )}
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-end gap-2 border-t">
            <Button
              type="button"
              variant="ghost"
              render={<Link href="/dashboard/admin/services" />}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : isEditing ? (
                <Save />
              ) : (
                <ImagePlus />
              )}
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save changes"
                  : "Add service"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
