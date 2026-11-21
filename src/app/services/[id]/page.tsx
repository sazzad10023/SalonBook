
import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";

import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  SERVICES_COLLECTION,
  type ServiceDocument,
} from "@/lib/services";

import { BookingCard } from "./booking-card";

export const metadata: Metadata = {
  title: "Service Details | SalonBook",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ServiceDetailsPage({ params }: Props) {
  await connection();

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    notFound();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const service = await (await getDb())
    .collection<ServiceDocument>(SERVICES_COLLECTION)
    .findOne({
      _id: new ObjectId(id),
      status: "active",
    });

  if (!service) {
    notFound();
  }

  const isAdmin = session?.user.role === "admin";
  const isAuthenticated = Boolean(session);

  return (
    <div className="min-h-screen bg-[#fbfcf8]">
    

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-12">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm text-[#82977a] hover:text-[#355747]"
        >
          <ArrowLeft size={16} />
          Back to services
        </Link>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">

          {/* LEFT: Service Details */}
          <section className="min-w-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-[#eaf0e7]">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  priority
                  unoptimized
                  sizes="(min-width: 1024px) 65vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[#82977a]">
                  <Sparkles size={40} />
                </div>
              )}

              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium uppercase text-[#355747]">
                {service.category}
              </span>
            </div>

            <div className="mt-7">
              <p className="text-xs font-medium uppercase tracking-widest text-[#82977a]">
                Salon Service
              </p>

              <h1 className="mt-2 font-serif text-3xl text-[#263d32] sm:text-4xl">
                {service.name}
              </h1>

              <p className="mt-4 text-sm leading-7 text-[#626b61] sm:text-base">
                {service.description}
              </p>
            </div>

            {/* Price and Duration */}
            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="border border-[#e3e9df] bg-white p-5">
                <p className="text-xs text-[#82977a]">Service Price</p>
                <p className="mt-2 text-2xl font-semibold text-[#263d32]">
                  ৳{service.price.toLocaleString("en-BD")}
                </p>
              </div>

              <div className="border border-[#e3e9df] bg-white p-5">
                <p className="flex items-center gap-2 text-xs text-[#82977a]">
                  <Clock size={15} />
                  Estimated Duration
                </p>
                <p className="mt-2 text-2xl font-semibold text-[#263d32]">
                  {service.duration} min
                </p>
              </div>
            </div>

            <div className="mt-7 border border-[#e3e9df] bg-white p-5 sm:p-6">
              <h2 className="font-serif text-xl text-[#263d32]">
                About this service
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#626b61]">
                {service.description}
              </p>
            </div>
          </section>

          {/* RIGHT: Booking Card */}
          <aside className="w-full lg:sticky lg:top-6">
            <BookingCard
              serviceId={service._id.toString()}
              serviceName={service.name}
              price={service.price}
              duration={service.duration}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              customer={
                session
                  ? {
                      id: session.user.id,
                      name: session.user.name,
                      email: session.user.email,
                      image: session.user.image,
                    }
                  : undefined
              }
            />
          </aside>

        </div>
      </main>
    </div>
  );
}
