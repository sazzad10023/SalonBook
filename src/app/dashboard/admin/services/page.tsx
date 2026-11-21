
// import type { Metadata } from "next";
// import { headers } from "next/headers";
// import { redirect } from "next/navigation";

// import { auth } from "@/lib/auth";
// import { getDb } from "@/lib/mongodb";
// import { SERVICES_COLLECTION, type ServiceDocument } from "@/lib/services";
// import type { Service } from "@/app/lib/api/books";

// import { ServicesManager } from "./services-manager";

// export const metadata: Metadata = {
//   title: "Manage services | SalonBook",
// };

// function safeISOString(value?: Date | string | null): string {
//   if (!value) {
//     return new Date().toISOString();
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return new Date().toISOString();
//   }

//   return date.toISOString();
// }

// export default async function ManageServicesPage() {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   if (!session) {
//     redirect("/signin");
//   }

//   if (session.user.role !== "admin") {
//     redirect("/dashboard/customer");
//   }

//   const documents = await (await getDb())
//     .collection<ServiceDocument>(SERVICES_COLLECTION)
//     .find({})
//     .sort({ createdAt: -1 })
//     .toArray();

//   const initialServices: Service[] = documents.map(
//     ({ _id, ...service }) => ({
//       id: _id.toString(),
//       ...service,
//       createdAt: safeISOString(service.createdAt),
//       updatedAt: safeISOString(service.updatedAt),
//     })
//   );

//   return <ServicesManager initialServices={initialServices} />;
// }
