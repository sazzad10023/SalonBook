
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowUpRight,
  Scissors,
} from "lucide-react";

type SocialIconProps = {
  size?: number;
};

function FacebookIcon({ size = 17 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.6V3.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.2v3h2.8v8H13.5z" />
    </svg>
  );
}

function GithubIcon({ size = 17 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.14.68-3.8-1.33-3.8-1.33-.5-1.3-1.22-1.65-1.22-1.65-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.17-3.02-.12-.29-.51-1.44.11-2.99 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.99.72.79 1.16 1.79 1.16 3.02 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

function LinkedinIcon({ size = 17 }: SocialIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.53v16.94c0 .85.69 1.53 1.55 1.53h16.9c.86 0 1.55-.68 1.55-1.53V3.53c0-.85-.69-1.53-1.55-1.53ZM8.02 18.9H5.1V9.5h2.92v9.4ZM6.56 8.22a1.69 1.69 0 1 1 0-3.38 1.69 1.69 0 0 1 0 3.38ZM18.9 18.9h-2.91v-4.57c0-1.09-.02-2.49-1.52-2.49-1.52 0-1.75 1.19-1.75 2.41v4.65H9.8V9.5h2.8v1.28h.04c.39-.74 1.34-1.52 2.76-1.52 2.95 0 3.5 1.94 3.5 4.46v5.18Z" />
    </svg>
  );
}

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "About Us", href: "#" },
  { label: "Contact Us", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  {
    icon: FacebookIcon,
    href: "https://www.facebook.com/YOUR_USERNAME",
    label: "Facebook",
  },
  {
    icon: GithubIcon,
    href: "https://github.com/YOUR_USERNAME",
    label: "GitHub",
  },
  {
    icon: LinkedinIcon,
    href: "https://www.linkedin.com/in/YOUR_USERNAME",
    label: "LinkedIn",
  },
];

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 lg:py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-2"
            >
              <span className="flex size-9 items-center justify-center rounded-sm bg-primary text-primary-foreground">
                <Scissors size={19} />
              </span>

              <span className="text-xl font-bold tracking-tight">
                Salon<span className="text-primary">Book</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xs text-sm leading-7 text-muted-foreground">
              Your beauty, our priority. Discover professional salon
              services and book your next appointment with ease.
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-sm border bg-background text-muted-foreground transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon size={17} />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide">
              Quick Links
            </h3>

            <ul className="mt-5 space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={13}
                      className="opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide">
              Get in Touch
            </h3>

            <ul className="mt-5 space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <span>+880 1634845501</span>
              </li>

              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <span>support@salonbook.com</span>
              </li>

              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-sm font-semibold tracking-wide">
              Opening Hours
            </h3>

            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Clock
                  size={17}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <div className="space-y-1">
                  <p className="font-medium">Saturday – Thursday</p>
                  <p className="text-muted-foreground">
                    10:00 AM – 09:00 PM
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Clock
                  size={17}
                  className="mt-0.5 shrink-0 text-muted-foreground"
                />

                <div className="space-y-1">
                  <p className="font-medium">Friday</p>
                  <p className="text-muted-foreground">Closed</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-5 border-t py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} SalonBook. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
