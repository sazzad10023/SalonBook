
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  X,
  Scissors,
  ChevronDown,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Better Auth session
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  // Role-based dashboard
  const role = (user as typeof user & { role?: string })?.role;

  const dashboardPath =
    role === "admin" ? "/admin/dashboard" : "/dashboard";

  const navLinks = user
    ? [
        { name: "Home", href: "/" },
        { name: "Browse Services", href: "/services" },
        { name: "Dashboard", href: dashboardPath },
      ]
    : [
        { name: "Home", href: "/" },
        { name: "Browse Services", href: "/services" },
      ];

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const getInitials = (name?: string | null) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "U";
  };

  // Logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await authClient.signOut();

      toast.success("Logged out successfully!");

      closeMenu();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e8e9df] bg-[#fbfcf8]/95 backdrop-blur-md">
      <nav className="mx-auto flex min-h-[64px] max-w-7xl flex-wrap items-center justify-between gap-x-4 px-4 py-3 sm:px-6 md:flex-nowrap md:gap-6 lg:px-12">

        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#355747] text-white">
            <Scissors size={18} />
          </div>

          <span className="text-lg font-semibold tracking-tight text-[#263d32] sm:text-xl">
            Salon<span className="text-[#82977a]">Book</span>
          </span>
        </Link>

        {/* Navigation */}
        <div
          className={`
            order-3 w-full flex-col gap-1
            md:order-none md:flex md:w-auto md:flex-1
            md:flex-row md:items-center md:justify-center
            md:gap-4 lg:gap-8
            ${menuOpen ? "flex" : "hidden"}
          `}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-[#626b61] transition-colors hover:bg-[#edf2e9] hover:text-[#355747] md:px-1 md:py-2 md:hover:bg-transparent"
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Auth Buttons */}
          {!isPending && !user && (
            <div className="flex gap-3 border-t border-[#e8e9df] pt-3 md:hidden">
              <Link
                href="/signin"
                onClick={closeMenu}
                className="flex-1 rounded-md border border-[#355747] py-2.5 text-center text-sm font-medium text-[#355747]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                onClick={closeMenu}
                className="flex-1 rounded-md bg-[#355747] py-2.5 text-center text-sm font-medium text-white"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Profile */}
          {!isPending && user && (
            <div className="border-t border-[#e8e9df] pt-3 md:hidden">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-[#eaf0e7] text-sm font-medium text-[#355747]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#263d32]">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-[#899187]">
                    {user.email}
                  </p>
                </div>
              </div>

              <Link
                href={dashboardPath}
                onClick={closeMenu}
                className="flex items-center gap-2 rounded-md px-3 py-3 text-sm text-[#626b61] hover:bg-[#edf2e9]"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-3 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <LogOut size={16} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex lg:gap-5">

          {/* Logged Out */}
          {!isPending && !user && (
            <>
              <Link
                href="/signin"
                className="whitespace-nowrap text-sm font-medium text-[#355747] hover:text-[#82977a]"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="whitespace-nowrap rounded-full bg-[#355747] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#263d32] lg:px-5"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Logged In */}
          {!isPending && user && (
            <div className="relative">

              {/* Avatar Trigger */}
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
                aria-label="Open user profile"
                className="flex items-center gap-2 rounded-full border border-[#e5e8df] bg-white px-2 py-1.5 transition hover:border-[#82977a] sm:px-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-[#eaf0e7] text-sm font-medium text-[#355747]">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <span className="max-w-24 truncate text-sm font-medium text-[#263d32] lg:max-w-28">
                  {user.name}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-[#626b61] transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-[#e8e9df] bg-white p-2 shadow-lg">

                  <div className="flex items-center gap-3 border-b border-[#edf0e9] px-3 py-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="bg-[#eaf0e7] text-sm font-medium text-[#355747]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#263d32]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#899187]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={dashboardPath}
                    onClick={closeMenu}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#626b61] hover:bg-[#f1f4ed] hover:text-[#355747]"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full justify-start gap-2 rounded-md px-3 py-2.5 text-sm font-normal text-red-600 hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut size={16} />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#e5e8df] text-[#355747] transition hover:bg-[#edf2e9] md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>

      </nav>
    </header>
  );
}
