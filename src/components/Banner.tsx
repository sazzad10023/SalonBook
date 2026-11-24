
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Star } from "lucide-react";

const Banner = () => {
  return (
    <section className="relative isolate min-h-[420px] overflow-hidden bg-[#263d32] sm:min-h-[450px] lg:min-h-[480px]">

      {/* Background Image */}
      <Image
        src="/images/salon-hero.png"
        alt="SalonBook luxury salon interior"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-center"
      />

      {/* Background Overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#17271f]/90 via-[#17271f]/70 to-[#17271f]/20" />

      {/* Content */}
      <div className="mx-auto flex min-h-[420px] max-w-7xl items-center px-5 py-12 sm:min-h-[450px] sm:px-8 lg:min-h-[480px] lg:px-12">

        <div className="max-w-2xl">

          {/* Availability */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] text-white backdrop-blur-md sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#a9c49a]" />
            Open today until 8:00 PM
            <span className="text-white/40">|</span>
            <MapPin size={12} />
            Your Local Salon
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Beauty begins,
            <span className="block italic text-[#c2d2b8]">
              with you.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-lg text-xs leading-6 text-white/80 sm:text-sm sm:leading-7">
            Discover a better salon experience. Explore professional
            beauty services, find your perfect treatment, and book
            an appointment that fits your schedule.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 rounded-sm bg-[#82977a] px-5 py-3 text-xs font-medium text-white transition hover:bg-[#71876a] sm:text-sm"
            >
              Explore Services
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-sm border border-white/40 bg-white/10 px-5 py-3 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/20 sm:text-sm"
            >
              Create an account
            </Link>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid max-w-sm grid-cols-3 border-t border-white/25 pt-5">
            <div>
              <div className="flex items-center gap-1 font-serif text-xl text-white sm:text-2xl">
                4.9
                <Star
                  size={12}
                  className="fill-[#c2d2b8] text-[#c2d2b8]"
                />
              </div>
              <p className="mt-1 text-[10px] text-white/70 sm:text-xs">
                Client Rating
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-white sm:text-2xl">
                8k+
              </h3>
              <p className="mt-1 text-[10px] text-white/70 sm:text-xs">
                Appointments
              </p>
            </div>

            <div>
              <h3 className="font-serif text-xl text-white sm:text-2xl">
                12
              </h3>
              <p className="mt-1 text-[10px] text-white/70 sm:text-xs">
                Salon Experts
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Banner;
