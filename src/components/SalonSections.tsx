
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brush,
  Droplets,
  Feather,
  Flower2,
  Gem,
  Hand,
  Palette,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { getHomeServices } from "@/app/lib/api/home";

type Category = {
  name: string;
  slug: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
};

const categories: Category[] = [
  {
    name: "Hair",
    slug: "hair",
    tagline: "Cuts, color & styling",
    icon: Scissors,
    accent: "bg-[#f3e8ff] text-[#7c3aed]",
  },
  {
    name: "Makeup",
    slug: "makeup",
    tagline: "Everyday to glam looks",
    icon: Palette,
    accent: "bg-[#ffe4e6] text-[#be123c]",
  },
  {
    name: "Nails",
    slug: "nails",
    tagline: "Manicures & pedicures",
    icon: Hand,
    accent: "bg-[#fce7f3] text-[#9d174d]",
  },
  {
    name: "Skin care",
    slug: "skin-care",
    tagline: "Facials & a fresh glow",
    icon: Droplets,
    accent: "bg-[#e0f2fe] text-[#0369a1]",
  },
  {
    name: "Spa & massage",
    slug: "spa-massage",
    tagline: "Relax and unwind",
    icon: Flower2,
    accent: "bg-[#dcfce7] text-[#15803d]",
  },
  {
    name: "Barber",
    slug: "barber",
    tagline: "Classic grooming",
    icon: Brush,
    accent: "bg-[#fef3c7] text-[#b45309]",
  },
  {
    name: "Bridal",
    slug: "bridal",
    tagline: "Your big-day look",
    icon: Gem,
    accent: "bg-[#fae8ff] text-[#a21caf]",
  },
  {
    name: "Waxing",
    slug: "waxing",
    tagline: "Smooth, lasting results",
    icon: Feather,
    accent: "bg-[#ffedd5] text-[#c2410c]",
  },
];

export default function SalonSections() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        await getHomeServices();
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <div className="space-y-20 py-16">
      {/* Service Categories */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
            Explore Services
          </p>

          <h2 className="text-2xl font-semibold md:text-3xl">
            Browse By Category
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Find the perfect service for your beauty needs.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.slug}
                className="h-48 animate-pulse rounded-sm bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.slug}
                  href={`/browser?category=${encodeURIComponent(category.name)}`}
                  className="group flex h-full flex-col rounded-sm border border-[#e3e9df] bg-white p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                >
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-sm ${category.accent}`}
                  >
                    <Icon size={22} strokeWidth={1.6} />
                  </div>

                  <h3 className="font-semibold text-[#263d32]">
                    {category.name}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {category.tagline}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-[#edf0e9] pt-3 text-xs font-medium text-[#355747]">
                    <span>Explore services</span>

                    <ArrowRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Services */}
      {/* <section className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-primary">
              Our Recommendations
            </p>

            <h2 className="text-2xl font-semibold md:text-3xl">
              Featured Services
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Discover our most popular salon services.
            </p>
          </div>

          <Link
            href="/browser"
            className="hidden items-center gap-2 text-sm font-medium hover:text-primary sm:flex"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-sm bg-muted"
              />
            ))}
          </div>
        ) : featuredServices.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No featured services available.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredServices.map((service) => (
              <div
                key={service._id}
                className="overflow-hidden rounded-sm border bg-background"
              >
                <div className="relative aspect-[4/3] bg-muted">
                  {service.image && (
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs text-primary">
                      {service.category}
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {service.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="font-semibold">
                      ${service.price}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={14} />
                      {service.duration} min
                    </span>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="flex w-full items-center justify-center rounded-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          href="/browser"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium sm:hidden"
        >
          View All Services <ArrowRight size={16} />
        </Link>
      </section> */}
    </div>
  );
}
