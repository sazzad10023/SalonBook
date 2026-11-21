import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { SERVICES_COLLECTION, type ServiceDocument } from "@/lib/services";

import { ServiceForm, type EditableService } from "./service-form";

export const metadata: Metadata = {
  title: "Add or edit a service | SalonBook",
};

export default async function AddServicePage({
  searchParams,
}: PageProps<"/dashboard/admin/add_book">) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard/customer");
  }

  const params = await searchParams;
  const editParam = params.edit;
  const editId = Array.isArray(editParam) ? editParam[0] : editParam;
  let service: EditableService | null = null;

  if (editId) {
    if (!ObjectId.isValid(editId)) {
      redirect("/dashboard/admin/services");
    }

    const document = await (await getDb())
      .collection<ServiceDocument>(SERVICES_COLLECTION)
      .findOne({ _id: new ObjectId(editId) });

    if (!document) {
      redirect("/dashboard/admin/services");
    }

    service = {
      id: document._id.toString(),
      name: document.name,
      category: document.category,
      description: document.description,
      price: document.price,
      duration: document.duration,
      image: document.image,
      status: document.status,
    };
  }

  return <ServiceForm key={service?.id ?? "new"} service={service} />;
}
