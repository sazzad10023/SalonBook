
// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import Image from "next/image";

// import {
//   getAllAppointments,
//   confirmAppointment,
//   cancelAdminAppointment,
//   type Appointment,
// } from "@/app/lib/appointments";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   CalendarDays,
//   Clock,
//   Eye,
//   Loader2,
//   Search,
//   Check,
//   X,
//   RefreshCw,
//   Scissors,
// } from "lucide-react";

// type FilterStatus =
//   | "All"
//   | "Pending"
//   | "Confirmed"
//   | "Cancelled";

// export default function ManageAppointmentsPage() {
//   const [appointments, setAppointments] = useState<Appointment[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");
//   const [search, setSearch] = useState("");
//   const [filter, setFilter] = useState<FilterStatus>("All");
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [selectedAppointment, setSelectedAppointment] =
//     useState<Appointment | null>(null);

//   const applyAppointments = useCallback((result: Appointment[]) => {
//     setAppointments(result);
//     setError("");
//   }, []);

//   const handleFetchError = useCallback((error: unknown) => {
//     console.error(error);
//     setError("Failed to load appointments.");
//   }, []);

//   const fetchAppointments = useCallback(async () => {
//     try {
//       const result = await getAllAppointments();
//       applyAppointments(result);
//     } catch (error) {
//       handleFetchError(error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [applyAppointments, handleFetchError]);

//   // State updates happen in the promise callbacks, not synchronously in the
//   // effect body, so this is a normal external-data subscription.
//   useEffect(() => {
//     let active = true;

//     getAllAppointments()
//       .then((result) => {
//         if (!active) return;
//         applyAppointments(result);
//         setLoading(false);
//       })
//       .catch((error) => {
//         if (!active) return;
//         handleFetchError(error);
//         setLoading(false);
//       });

//     return () => {
//       active = false;
//     };
//   }, [applyAppointments, handleFetchError]);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     void fetchAppointments();
//   };

//   const counts = useMemo(() => ({
//     total: appointments.length,
//     pending: appointments.filter((a) => a.status === "Pending").length,
//     confirmed: appointments.filter((a) => a.status === "Confirmed").length,
//     cancelled: appointments.filter((a) => a.status === "Cancelled").length,
//   }), [appointments]);

//   const filteredAppointments = useMemo(() => {
//     return appointments.filter((appointment) => {
//       const matchesStatus =
//         filter === "All" || appointment.status === filter;

//       const searchText = search.toLowerCase();

//       const matchesSearch = [
//         appointment._id,
//         appointment.customer?.name,
//         appointment.customer?.email,
//         appointment.service?.name,
//       ]
//         .filter(Boolean)
//         .some((value) =>
//           String(value).toLowerCase().includes(searchText)
//         );

//       return matchesStatus && matchesSearch;
//     });
//   }, [appointments, filter, search]);

//   const handleConfirm = async (id: string) => {
//     if (!window.confirm("Confirm this appointment?")) return;

//     try {
//       setActionLoading(id);
//       await confirmAppointment(id);
//       await fetchAppointments();
//       setSelectedAppointment(null);
//     } catch (error) {
//       alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to confirm appointment."
//       );
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleCancel = async (id: string) => {
//     if (!window.confirm("Are you sure you want to cancel this appointment?")) {
//       return;
//     }

//     try {
//       setActionLoading(id);
//       await cancelAdminAppointment(id);
//       await fetchAppointments();
//       setSelectedAppointment(null);
//     } catch (error) {
//       alert(
//         error instanceof Error
//           ? error.message
//           : "Failed to cancel appointment."
//       );
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const formatDate = (date: string) =>
//     new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     });

//   const formatCreatedDate = (date: string) =>
//     new Date(date).toLocaleString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//   const statusStyle = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "bg-amber-50 text-amber-700 border-amber-200";
//       case "confirmed":
//         return "bg-green-50 text-green-700 border-green-200";
//       case "cancelled":
//         return "bg-red-50 text-red-700 border-red-200";
//       default:
//         return "bg-gray-50 text-gray-600 border-gray-200";
//     }
//   };

//   const paymentStyle = (status: string) => {
//     return status?.toLowerCase() === "paid"
//       ? "bg-green-50 text-green-700 border-green-200"
//       : "bg-amber-50 text-amber-700 border-amber-200";
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[300px] items-center justify-center">
//         <Loader2 className="h-6 w-6 animate-spin text-[#355747]" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="py-12 text-center">
//         <p className="text-sm text-red-500">{error}</p>
//         <Button
//           variant="outline"
//           size="sm"
//           className="mt-4 rounded-sm"
//           disabled={refreshing}
//           onClick={handleRefresh}
//         >
//           {refreshing ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : (
//             <RefreshCw className="mr-2 h-4 w-4" />
//           )}
//           Try Again
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-semibold text-[#263d32]">
//             Manage Appointments
//           </h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Review and manage customer appointment requests.
//           </p>
//         </div>

//         <Button
//           size="sm"
//           variant="outline"
//           className="rounded-sm"
//           disabled={refreshing}
//           onClick={handleRefresh}
//         >
//           {refreshing ? (
//             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//           ) : (
//             <RefreshCw className="mr-2 h-4 w-4" />
//           )}
//           Refresh
//         </Button>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//         {[
//           {
//             label: "Total Appointments",
//             value: counts.total,
//             color: "text-[#355747]",
//           },
//           {
//             label: "Pending",
//             value: counts.pending,
//             color: "text-amber-600",
//           },
//           {
//             label: "Confirmed",
//             value: counts.confirmed,
//             color: "text-green-700",
//           },
//           {
//             label: "Cancelled",
//             value: counts.cancelled,
//             color: "text-red-600",
//           },
//         ].map((item) => (
//           <div key={item.label} className="rounded-sm border bg-white p-4">
//             <p className="text-xs text-gray-500">{item.label}</p>
//             <p className={`mt-2 text-2xl font-semibold ${item.color}`}>
//               {item.value}
//             </p>
//           </div>
//         ))}
//       </div>

//       {/* Search & Filter */}
//       <div className="flex flex-col gap-3 sm:flex-row">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
//           <Input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search customer, email or service..."
//             className="h-10 rounded-sm pl-9"
//           />
//         </div>

//         <div className="flex flex-wrap gap-2">
//           {(["All", "Pending", "Confirmed", "Cancelled"] as FilterStatus[]).map(
//             (status) => (
//               <Button
//                 key={status}
//                 size="sm"
//                 variant={filter === status ? "default" : "outline"}
//                 onClick={() => setFilter(status)}
//                 className={
//                   filter === status
//                     ? "rounded-sm bg-[#355747] hover:bg-[#263d32]"
//                     : "rounded-sm"
//                 }
//               >
//                 {status}
//               </Button>
//             )
//           )}
//         </div>
//       </div>

//       {/* Appointment List */}
//       <div className="overflow-hidden rounded-sm border bg-white">
//         <div className="flex items-center justify-between border-b p-4">
//           <h2 className="font-semibold text-[#263d32]">
//             Appointment Requests
//           </h2>
//           <span className="text-xs text-gray-500">
//             {filteredAppointments.length} records
//           </span>
//         </div>

//         {filteredAppointments.length === 0 ? (
//           <div className="py-16 text-center">
//             <CalendarDays className="mx-auto h-9 w-9 text-gray-400" />
//             <p className="mt-3 text-sm text-gray-500">
//               No appointments found.
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y">
//             {filteredAppointments.map((appointment) => (
//               <div
//                 key={appointment._id}
//                 className="space-y-4 p-4 transition-colors hover:bg-[#fbfcf8]"
//               >
//                 <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
//                   {/* Service */}
//                   <div className="flex min-w-0 items-center gap-3">
//                     <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-[#eaf0e7]">
//                       {appointment.service?.image ? (
//                         <Image
//                           src={appointment.service.image}
//                           alt={appointment.service.name || "Service"}
//                           fill
//                           sizes="56px"
//                           unoptimized
//                           className="object-cover"
//                         />
//                       ) : (
//                         <div className="flex h-full items-center justify-center">
//                           <Scissors className="h-5 w-5 text-[#82977a]" />
//                         </div>
//                       )}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold text-[#263d32]">
//                         {appointment.service?.name || "Service"}
//                       </p>
//                       <p className="mt-1 text-xs text-gray-500">
//                         {appointment.service?.category || "Service"}
//                       </p>
//                       <p className="mt-1 text-sm font-semibold text-[#355747]">
//                         {appointment.service?.price != null
//                           ? `$${appointment.service.price.toFixed(2)}`
//                           : "Price unavailable"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Customer */}
//                   <div className="min-w-0">
//                     <p className="mb-1 text-xs text-gray-400">Customer</p>
//                     <p className="truncate text-sm font-medium text-[#263d32]">
//                       {appointment.customer?.name || "Customer information unavailable"}
//                     </p>
//                     <p className="truncate text-xs text-gray-500">
//                       {appointment.customer?.email || "No email"}
//                     </p>
//                     {appointment.customer?.phone && (
//                       <p className="text-xs text-gray-500">
//                         {appointment.customer.phone}
//                       </p>
//                     )}
//                   </div>

//                   {/* Appointment Date */}
//                   <div>
//                     <p className="mb-1 text-xs text-gray-400">Appointment</p>
//                     <p className="text-sm font-medium text-[#263d32]">
//                       {formatDate(appointment.appointmentDate)}
//                     </p>
//                     <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
//                       <Clock className="h-3 w-3" />
//                       {appointment.timeSlot}
//                     </p>
//                   </div>

//                   {/* Status */}
//                   <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
//                     <span
//                       className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(
//                         appointment.status
//                       )}`}
//                     >
//                       {appointment.status}
//                     </span>
//                     <span
//                       className={`rounded-full border px-2.5 py-1 text-xs font-medium ${paymentStyle(
//                         appointment.paymentStatus
//                       )}`}
//                     >
//                       {appointment.paymentStatus}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
//                   <p className="text-xs text-gray-500">
//                     Requested: {formatCreatedDate(appointment.createdAt)}
//                   </p>

//                   <div className="flex flex-wrap gap-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="h-8 rounded-sm"
//                       onClick={() => setSelectedAppointment(appointment)}
//                     >
//                       <Eye className="mr-1.5 h-3.5 w-3.5" />
//                       Details
//                     </Button>

//                     {appointment.status === "Pending" && (
//                       <Button
//                         size="sm"
//                         disabled={actionLoading === appointment._id}
//                         className="h-8 rounded-sm bg-[#355747] hover:bg-[#263d32]"
//                         onClick={() => handleConfirm(appointment._id)}
//                       >
//                         {actionLoading === appointment._id ? (
//                           <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
//                         ) : (
//                           <Check className="mr-1 h-3.5 w-3.5" />
//                         )}
//                         Confirm
//                       </Button>
//                     )}

//                     {(appointment.status === "Pending" ||
//                       appointment.status === "Confirmed") && (
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         disabled={actionLoading === appointment._id}
//                         className="h-8 rounded-sm border-red-200 text-red-600 hover:bg-red-50"
//                         onClick={() => handleCancel(appointment._id)}
//                       >
//                         <X className="mr-1 h-3.5 w-3.5" />
//                         Cancel
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Appointment Details Dialog */}
//       {selectedAppointment && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
//           onClick={() => setSelectedAppointment(null)}
//         >
//           <div
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="appointment-details-title"
//             className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-sm bg-white p-5 shadow-xl"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-center justify-between border-b pb-3">
//               <h2
//                 id="appointment-details-title"
//                 className="font-semibold text-[#263d32]"
//               >
//                 Appointment Details
//               </h2>
//               <button
//                 onClick={() => setSelectedAppointment(null)}
//                 className="rounded-sm p-1 text-gray-500 hover:bg-gray-100"
//                 aria-label="Close details"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="space-y-4 py-4">
//               <div className="flex items-center gap-3">
//                 {selectedAppointment.service?.image ? (
//                   <Image
//                     src={selectedAppointment.service.image}
//                     alt={selectedAppointment.service.name || "Service"}
//                     width={64}
//                     height={64}
//                     unoptimized
//                     className="h-16 w-16 rounded-sm object-cover"
//                   />
//                 ) : (
//                   <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-[#eaf0e7]">
//                     <Scissors className="h-6 w-6 text-[#82977a]" />
//                   </div>
//                 )}

//                 <div>
//                   <h3 className="font-semibold text-[#263d32]">
//                     {selectedAppointment.service?.name || "Service"}
//                   </h3>
//                   <p className="text-xs text-gray-500">
//                     {selectedAppointment.service?.category}
//                   </p>
//                   <p className="mt-1 text-sm font-semibold text-[#355747]">
//                     {selectedAppointment.service?.price != null
//                       ? `$${selectedAppointment.service.price.toFixed(2)}`
//                       : "Price unavailable"}
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-xs text-gray-500">Customer Name</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {selectedAppointment.customer?.name || "Unavailable"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Email</p>
//                   <p className="mt-1 break-all text-sm font-medium">
//                     {selectedAppointment.customer?.email || "Unavailable"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Phone</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {selectedAppointment.customer?.phone || "Unavailable"}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Appointment Date</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {formatDate(selectedAppointment.appointmentDate)}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Time Slot</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {selectedAppointment.timeSlot}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Payment Status</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {selectedAppointment.paymentStatus}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Appointment Status</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {selectedAppointment.status}
//                   </p>
//                 </div>

//                 <div>
//                   <p className="text-xs text-gray-500">Requested On</p>
//                   <p className="mt-1 text-sm font-medium">
//                     {formatCreatedDate(selectedAppointment.createdAt)}
//                   </p>
//                 </div>
//               </div>

//               <div className="rounded-sm bg-[#fbfcf8] p-3">
//                 <p className="text-xs text-gray-500">Customer Message</p>
//                 <p className="mt-1 text-sm text-[#263d32]">
//                   {selectedAppointment.message || "No message provided."}
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
//               {selectedAppointment.status === "Pending" && (
//                 <Button
//                   size="sm"
//                   disabled={actionLoading === selectedAppointment._id}
//                   className="rounded-sm bg-[#355747] hover:bg-[#263d32]"
//                   onClick={() => handleConfirm(selectedAppointment._id)}
//                 >
//                   <Check className="mr-1.5 h-4 w-4" />
//                   Confirm
//                 </Button>
//               )}

//               {(selectedAppointment.status === "Pending" ||
//                 selectedAppointment.status === "Confirmed") && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   disabled={actionLoading === selectedAppointment._id}
//                   className="rounded-sm border-red-200 text-red-600 hover:bg-red-50"
//                   onClick={() => handleCancel(selectedAppointment._id)}
//                 >
//                   <X className="mr-1.5 h-4 w-4" />
//                   Cancel
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
