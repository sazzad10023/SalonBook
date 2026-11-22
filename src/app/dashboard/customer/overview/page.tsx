// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   CalendarDays,
//   CalendarCheck,
//   CalendarX,
//   Clock,
//   RefreshCw,
// } from "lucide-react";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { getMyAppointmentsWithServices } from "@/app/lib/appointments";
// import { useSession } from "@/lib/auth-client";

// type CustomerDashboardStats = {
//   totalAppointments: number;
//   pendingAppointments: number;
//   confirmedAppointments: number;
//   cancelledAppointments: number;
// };

// const initialStats: CustomerDashboardStats = {
//   totalAppointments: 0,
//   pendingAppointments: 0,
//   confirmedAppointments: 0,
//   cancelledAppointments: 0,
// };

// const cards = [
//   {
//     key: "totalAppointments",
//     title: "Total Appointment Requests",
//     description: "All appointment requests",
//     icon: CalendarDays,
//     color: "bg-blue-50 text-blue-600",
//   },
//   {
//     key: "pendingAppointments",
//     title: "Pending Appointments",
//     description: "Awaiting confirmation",
//     icon: Clock,
//     color: "bg-amber-50 text-amber-600",
//   },
//   {
//     key: "confirmedAppointments",
//     title: "Confirmed Appointments",
//     description: "Confirmed bookings",
//     icon: CalendarCheck,
//     color: "bg-green-50 text-green-600",
//   },
//   {
//     key: "cancelledAppointments",
//     title: "Cancelled Appointments",
//     description: "Cancelled bookings",
//     icon: CalendarX,
//     color: "bg-red-50 text-red-600",
//   },
// ] as const;

// export default function CustomerDashboardPage() {
//   const router = useRouter();
//   const { data: session, isPending } = useSession();

//   const [stats, setStats] = useState<CustomerDashboardStats>(initialStats);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const userId = session?.user.id;
//   const userEmail =
//     typeof session?.user.email === "string"
//       ? session.user.email.toLowerCase()
//       : null;
//   const hasUser = Boolean(session?.user);

//   // The appointments API returns every booking, so keep only the ones that
//   // belong to the signed-in customer, then count their statuses.
//   const loadStats = useCallback(async (): Promise<CustomerDashboardStats> => {
//     const appointments = await getMyAppointmentsWithServices();

//     const myAppointments = appointments.filter((appointment) => {
//       const customer = appointment.customer;

//       if (!customer) return false;
//       if (userId && customer.id === userId) return true;
//       if (
//         userEmail &&
//         typeof customer.email === "string" &&
//         customer.email.toLowerCase() === userEmail
//       ) {
//         return true;
//       }

//       return false;
//     });

//     const countByStatus = (status: string) =>
//       myAppointments.filter(
//         (appointment) => appointment.status?.toLowerCase() === status
//       ).length;

//     return {
//       totalAppointments: myAppointments.length,
//       pendingAppointments: countByStatus("pending"),
//       confirmedAppointments: countByStatus("confirmed"),
//       cancelledAppointments: countByStatus("cancelled"),
//     };
//   }, [userId, userEmail]);

//   useEffect(() => {
//     if (isPending) return;

//     if (!hasUser || (!userId && !userEmail)) {
//       router.replace("/signin");
//       return;
//     }

//     let active = true;

//     loadStats()
//       .then((data) => {
//         if (active) {
//           setStats(data);
//           setError("");
//         }
//       })
//       .catch(() => {
//         if (active) setError("Failed to load your appointment statistics.");
//       })
//       .finally(() => {
//         if (active) setLoading(false);
//       });

//     return () => {
//       active = false;
//     };
//   }, [hasUser, isPending, loadStats, router, userId, userEmail]);

//   const refreshStats = () => {
//     if (!hasUser || (!userId && !userEmail)) return;

//     setLoading(true);
//     setError("");

//     loadStats()
//       .then((data) => {
//         setStats(data);
//         setError("");
//       })
//       .catch(() => setError("Failed to load your appointment statistics."))
//       .finally(() => setLoading(false));
//   };

//   return (
//     <div className="space-y-6 p-4 md:p-6">
//       <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//         <div>
//           <h1 className="text-2xl font-semibold tracking-tight">
//             Dashboard Overview
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Track your salon appointments and booking status.
//           </p>
//         </div>

//         <Button
//           variant="outline"
//           size="sm"
//           onClick={refreshStats}
//           disabled={loading}
//         >
//           <RefreshCw
//             className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
//           />
//           Refresh
//         </Button>
//       </div>

//       {error && (
//         <div className="flex items-center justify-between rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">
//           <span>{error}</span>
//           <Button variant="outline" size="sm" onClick={refreshStats}>
//             Retry
//           </Button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {cards.map((card) => {
//           const Icon = card.icon;

//           return (
//             <Card key={card.key} className="rounded-sm shadow-none">
//               <CardHeader className="flex flex-row items-center justify-between pb-2">
//                 <CardTitle className="text-sm font-medium text-muted-foreground">
//                   {card.title}
//                 </CardTitle>

//                 <div className={`rounded-sm p-2 ${card.color}`}>
//                   <Icon className="h-4 w-4" />
//                 </div>
//               </CardHeader>

//               <CardContent>
//                 {loading ? (
//                   <Skeleton className="h-8 w-20" />
//                 ) : (
//                   <p className="text-2xl font-semibold tabular-nums">
//                     {stats[card.key].toLocaleString()}
//                   </p>
//                 )}

//                 <p className="mt-1 text-xs text-muted-foreground">
//                   {card.description}
//                 </p>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
