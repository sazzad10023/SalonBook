import Link from "next/link";
import { ShieldX, Home } from "lucide-react";
import BackButton from "./back-button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="relative mx-auto mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-red-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-red-500 text-white shadow-xl">
            <ShieldX size={40} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
          403
        </h1>

        <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
          Access Denied
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
          You do not have permission to view this page. Please contact your
          administrator if you think this is a mistake.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Home size={16} />
            Go Home
          </Link>

          <BackButton />
        </div>
      </div>
    </main>
  );
}