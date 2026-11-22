
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Scissors,
  CalendarDays,
  Clock,
  CalendarCheck,
  Wallet,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats, getDashboardStats } from "@/app/lib/api/dashboard";


const statistics = [
  {
    key: "totalCustomers",
    title: "Total Registered Customers",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    key: "totalActiveServices",
    title: "Total Active Services",
    icon: Scissors,
    iconClass: "bg-purple-50 text-purple-600",
  },
  {
    key: "totalAppointments",
    title: "Total Appointment Requests",
    icon: CalendarDays,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    key: "pendingAppointments",
    title: "Pending Appointments",
    icon: Clock,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    key: "confirmedAppointments",
    title: "Confirmed Appointments",
    icon: CalendarCheck,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    getDashboardStats()
      .then((data) => {
        if (active) {
          setStats(data);
          setError("");
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setError(
            error instanceof Error ? error.message : "Something went wrong"
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const refreshStats = () => {
    setLoading(true);
    setError("");
    void fetchStats();
  };

  const formatPayments = (
    payments: DashboardStats["totalSuccessfulPayments"]
  ) => {
    if (!payments?.length) return "0";

    return payments
      .map(({ currency, amount }) => {
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency.toUpperCase(),
        });

        return formatter.format(amount / 100);
      })
      .join(" + ");
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to your SalonBook admin dashboard.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshStats}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${
              loading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">{error}</p>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshStats}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statistics.map((item) => {
          const Icon = item.icon;

          const value = stats
            ? stats[item.key]
            : 0;

          return (
            <Card key={item.key} className="rounded-sm shadow-none">
              <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {item.title}
                  </p>

                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <h2 className="text-2xl font-semibold tabular-nums">
                      {value.toLocaleString("en-US")}
                    </h2>
                  )}
                </div>

                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-sm ${item.iconClass}`}
                >
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Successful Payments */}
        <Card className="rounded-sm shadow-none">
          <CardContent className="flex items-center justify-between gap-4 p-5">
            <div className="min-w-0 space-y-2">
              <p className="text-sm text-muted-foreground">
                Total Successful Payments
              </p>

              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <h2 className="break-words text-xl font-semibold tabular-nums">
                  {stats
                    ? formatPayments(stats.totalSuccessfulPayments)
                    : "0"}
                </h2>
              )}
            </div>

            <div className="flex size-11 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600">
              <Wallet className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
