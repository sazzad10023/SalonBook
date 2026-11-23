
import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  SERVICES_COLLECTION,
  type ServiceDocument,
} from "@/lib/services";
import { ServicesBrowser } from "./services-browser";
import { authFetch, getSession } from "@/lib/core/server";
import { getServices } from "../lib/api/books";

export const metadata: Metadata = {
  title: "Browse services | SalonBook",
  description:
    "Explore the salon services currently available to book at SalonBook.",
};

export default async function BrowseServicesPage() {
  await connection();

  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });
   getServices();
//  console.log( "session", session)
  // const response = await authFetch ("http://localhost:8000/services")
  // console.log(response)
  const documents = await (await getDb())
    .collection<ServiceDocument>(SERVICES_COLLECTION)
    .find({ status: "active" })
    .sort({ createdAt: -1 })
    .toArray();

  const services = documents.map((service) => ({
    id: service._id.toString(),
    name: service.name,
    category: service.category,
    description: service.description,
    price: service.price,
    duration: service.duration,
    image: service.image,
  }));
  
  return (
    <div className="min-h-screen bg-[#fbfcf8]">
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-12">
        {/* Page Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dce5dc] bg-[#eaf0e7] px-3 py-1.5 text-[11px] font-medium tracking-wide text-[#355747] uppercase">
            <Sparkles size={13} />
            Available now
          </p>

          <h1 className="font-serif text-4xl leading-tight text-[#263d32] sm:text-5xl">
            Browse our services
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#626b61] sm:text-base">
            Only services that are currently active are shown here.
            Pick a treatment and book an appointment that fits your schedule.
          </p>
        </div>

        {/* Services */}
        {services.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-sm border border-dashed border-[#dce5dc] bg-white px-6 text-center">
            <Sparkles size={34} className="mb-3 text-[#82977a]" />

            <h2 className="text-lg font-semibold text-[#263d32]">
              No services available right now
            </h2>

            <p className="mt-1 max-w-sm text-sm text-[#82977a]">
              Our team is updating the menu. Please check back soon
              for available treatments.
            </p>
          </div>
        ) : (
          <ServicesBrowser
            services={services}
            isAuthenticated={Boolean(session)}
          />
        )}
      </main>
    </div>
  );
}
