
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import {
    getFeaturedServices,
  
  type SalonService,
} from "@/app/lib/api/home";

export default function FeaturedServices() {
    const [services, setServices] = useState<SalonService[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");



useEffect(() => {
  async function loadServices() {
    try {
      const data = await getFeaturedServices();
      setServices(data);
    } catch (error) {
      console.error("Failed to load services:", error);
      setError("Unable to load services. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  loadServices();
}, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Our Recommendations
          </p>

          <h2 className="text-2xl font-semibold md:text-3xl">
            Featured Salon Services
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Discover our recommended salon services.
          </p>
        </div>

        <Link
          href="/services"
          className="hidden items-center gap-2 text-sm font-medium hover:text-primary sm:flex"
        >
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-sm bg-muted"
            />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <p className="py-10 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      {/* Empty */}
      {!loading && !error && services.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No featured services available.
        </p>
      )}

      {/* Services */}
      {!loading && !error && services.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service._id}
              className="group overflow-hidden rounded-sm border bg-background transition hover:border-primary"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="space-y-3 p-3 md:p-4">
                <div>
                  <p className="text-xs font-medium text-primary">
                    {service.category}
                  </p>

                  <h3 className="mt-1 font-semibold">
                    {service.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground md:text-sm">
                    {service.description}
                  </p>
                </div>

                {/* Price & Duration */}
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">
                    ${service.price}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={14} />
                    {service.duration} min
                  </span>
                </div>

                {/* View Details */}
                <Link
                  href={`/services/${service._id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  View Details
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Mobile View All */}
      <Link
        href="/services"
        className="mt-6 flex items-center justify-center gap-2 text-sm font-medium sm:hidden"
      >
        View All Services
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}
