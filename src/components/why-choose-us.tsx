
import {
  CalendarCheck,
  Clock3,
  ShieldCheck,
  Sparkles,
  Users,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Easy Online Booking",
    description:
      "Book your favorite salon services anytime, anywhere with just a few clicks.",
    number: "01",
    color: {
      icon: "bg-blue-500/10 text-blue-600",
      border: "hover:border-blue-500/40",
      hover: "group-hover:bg-blue-600 group-hover:text-white",
      arrow: "group-hover:text-blue-600",
    },
  },
  {
    icon: Users,
    title: "Expert Professionals",
    description:
      "Connect with skilled beauty professionals who care about your style.",
    number: "02",
    color: {
      icon: "bg-purple-500/10 text-purple-600",
      border: "hover:border-purple-500/40",
      hover: "group-hover:bg-purple-600 group-hover:text-white",
      arrow: "group-hover:text-purple-600",
    },
  },
  {
    icon: Clock3,
    title: "Flexible Scheduling",
    description:
      "Choose a convenient date and time that perfectly fits your schedule.",
    number: "03",
    color: {
      icon: "bg-amber-500/10 text-amber-600",
      border: "hover:border-amber-500/40",
      hover: "group-hover:bg-amber-500 group-hover:text-white",
      arrow: "group-hover:text-amber-600",
    },
  },
  {
    icon: ShieldCheck,
    title: "Trusted Experience",
    description:
      "Enjoy a smooth and reliable booking experience from start to finish.",
    number: "04",
    color: {
      icon: "bg-emerald-500/10 text-emerald-600",
      border: "hover:border-emerald-500/40",
      hover: "group-hover:bg-emerald-600 group-hover:text-white",
      arrow: "group-hover:text-emerald-600",
    },
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-sm bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="size-3.5" />
            Why Choose Us
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Beauty, Our{" "}
            <span className="text-primary">Priority</span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            We make finding and booking your perfect salon experience
            simple, convenient, and stress-free.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className={`group relative overflow-hidden rounded-sm border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${feature.color.border}`}
              >
                {/* Icon & Number */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex size-12 items-center justify-center rounded-sm transition-all duration-300 ${feature.color.icon} ${feature.color.hover}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <span className="text-sm font-semibold text-muted-foreground/40">
                    {feature.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mt-6 text-lg font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>

                {/* Arrow */}
                <div className="mt-6 flex items-center justify-end">
                  <ArrowUpRight
                    className={`size-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 ${feature.color.arrow}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
