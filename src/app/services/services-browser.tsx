
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Clock,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

type ServicesBrowserProps = {
  services: Service[];
  isAuthenticated: boolean;
};

type SortOption = "default" | "low-to-high" | "high-to-low";

const SERVICE_CATEGORIES = [
  "Hair",
  "Makeup",
  "Nails",
  "Skin care",
  "Spa & massage",
  "Barber",
  "Bridal",
  "Waxing",
] as const;

export function ServicesBrowser({
  services,
  isAuthenticated,
}: ServicesBrowserProps) {
  const searchParams = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const initialCategory =
    SERVICE_CATEGORIES.find(
      (item) => item.toLowerCase() === requestedCategory?.toLowerCase()
    ) ?? "all";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(initialCategory);
  const [sort, setSort] = useState<SortOption>("default");

  // Search, filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search by service name
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      result = result.filter((service) =>
        service.name.toLowerCase().includes(query)
      );
    }

    // Filter by fixed category
    if (category !== "all") {
      result = result.filter(
        (service) =>
          service.category.trim().toLowerCase() ===
          category.toLowerCase()
      );
    }

    // Sort by price
    if (sort === "low-to-high") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "high-to-low") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [services, search, category, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    sort !== "default";

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("default");
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 rounded-sm border border-[#e3e9df] bg-white p-3 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[#82977a]"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services by name..."
              className="h-11 rounded-sm border-[#e3e9df] pl-10 text-sm focus-visible:ring-[#82977a]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#82977a] hover:text-[#355747]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 lg:w-56">
            <SlidersHorizontal
              size={16}
              className="shrink-0 text-[#82977a]"
            />

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="h-11 w-full rounded-sm border border-[#e3e9df] bg-white px-3 text-sm text-[#355747] outline-none focus:border-[#82977a]"
              aria-label="Filter by category"
            >              <option value="all">All Categories</option>

              {SERVICE_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Price Sorting */}
          <div className="lg:w-52">
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as SortOption)
              }
              className="h-11 w-full rounded-sm border border-[#e3e9df] bg-white px-3 text-sm text-[#355747] outline-none focus:border-[#82977a]"
              aria-label="Sort services by price"
            >
              <option value="default">Default Sorting</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Result Count and Reset */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0e9] pt-4">
          <p className="text-xs text-[#82977a]">
            Showing{" "}
            <span className="font-semibold text-[#355747]">
              {filteredServices.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#355747]">
              {services.length}
            </span>{" "}
            services
          </p>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 rounded-sm text-xs text-[#355747] hover:bg-[#eaf0e7]"
            >
              <X size={13} />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Service Cards */}
      {filteredServices.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-sm border border-dashed border-[#dce5dc] bg-white px-6 text-center">
          <Search size={32} className="mb-3 text-[#82977a]" />

          <h2 className="text-lg font-semibold text-[#263d32]">
            No services found
          </h2>

          <p className="mt-1 max-w-sm text-sm text-[#82977a]">
            Try changing your search keyword or filters.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="mt-5 rounded-sm border-[#dce5dc] text-[#355747]"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="group flex flex-col overflow-hidden rounded-sm border border-[#e3e9df] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eaf0e7]">
                {service.image ? (
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#82977a]">
                    <Search size={30} />
                  </div>
                )}

                <span className="absolute top-3 left-3 rounded-sm bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-[#355747] uppercase backdrop-blur-sm">
                  {service.category}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-4 p-5">
                <div>
                  <h2 className="font-serif text-xl text-[#263d32]">
                    {service.name}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#626b61]">
                    {service.description}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf0e9] pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-[#263d32]">
                      ৳{service.price.toLocaleString("en-BD")}
                    </span>

                    <span className="flex items-center gap-1 text-xs text-[#82977a]">
                      <Clock size={13} />
                      {service.duration} minutes
                    </span>
                  </div>

                  <Link
                    href={`/services/${service.id}`}
                    className="inline-flex items-center gap-1.5 rounded-sm bg-[#355747] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#263d32]"
                  >
                    View Details
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
