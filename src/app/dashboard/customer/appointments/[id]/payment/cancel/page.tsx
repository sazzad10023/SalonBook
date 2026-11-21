// import Link from "next/link";
// import { headers } from "next/headers";
// import { notFound, redirect } from "next/navigation";
// import { CalendarDays, Clock, XCircle } from "lucide-react";

// import { auth } from "@/lib/auth";
// import { getAppointmentById } from "@/lib/payments";
// import { Button } from "@/components/ui/button";

// export const metadata = {
//   title: "Payment cancelled | SalonBook",
// };

// function formatDate(date: string) {
//   return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
//     weekday: "long",
//     month: "long",
//     day: "numeric",
//     year: "numeric",
//   });
// }

// export default async function PaymentCancelPage(
//   props: PageProps<"/dashboard/customer/appointments/[id]/payment/cancel">
// ) {
//   const { id } = await props.params;

//   const session = await auth.api.getSession({ headers: await headers() });

//   if (!session) {
//     redirect("/signin");
//   }

//   const appointment = await getAppointmentById(id);

//   if (!appointment) {
//     notFound();
//   }

//   if (
//     appointment.customer?.id &&
//     appointment.customer.id !== session.user.id
//   ) {
//     notFound();
//   }

//   const canRetry =
//     appointment.status === "Confirmed" && appointment.paymentStatus !== "Paid";

//   return (
//     <div className="mx-auto max-w-2xl space-y-6">
//       <div className="rounded-sm border border-amber-200 bg-amber-50 p-8 text-center">
//         <XCircle className="mx-auto h-12 w-12 text-amber-600" />
//         <h1 className="mt-4 text-2xl font-semibold text-[#263d32]">
//           Payment cancelled
//         </h1>
//         <p className="mt-2 text-sm text-amber-800">
//           You cancelled the checkout. No payment was taken and your appointment
//           is still {appointment.status.toLowerCase()}.
//         </p>
//       </div>

//       <div className="rounded-sm border bg-white p-5">
//         <h2 className="font-semibold text-[#263d32]">Appointment details</h2>

//         <dl className="mt-4 grid gap-4 sm:grid-cols-2">
//           <div>
//             <dt className="text-xs text-gray-400">Date</dt>
//             <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#263d32]">
//               <CalendarDays className="h-4 w-4 text-[#82977a]" />
//               {formatDate(appointment.appointmentDate)}
//             </dd>
//           </div>
//           <div>
//             <dt className="text-xs text-gray-400">Time slot</dt>
//             <dd className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#263d32]">
//               <Clock className="h-4 w-4 text-[#82977a]" />
//               {appointment.timeSlot}
//             </dd>
//           </div>
//           <div>
//             <dt className="text-xs text-gray-400">Payment status</dt>
//             <dd className="mt-1 text-sm font-medium text-amber-600">
//               {appointment.paymentStatus}
//             </dd>
//           </div>
//         </dl>
//       </div>

//       <div className="flex flex-wrap justify-end gap-3">
//         <Button
//           nativeButton={false}
//           variant="outline"
//           className="rounded-sm"
//           render={<Link href="/dashboard/customer/appointments" />}
//         >
//           Back to appointments
//         </Button>

//         {canRetry && (
//           <Button
//             nativeButton={false}
//             className="rounded-sm bg-[#355747] hover:bg-[#263d32]"
//             render={
//               <Link
//                 href={`/dashboard/customer/appointments/${appointment._id.toString()}/payment`}
//               />
//             }
//           >
//             Try payment again
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }
