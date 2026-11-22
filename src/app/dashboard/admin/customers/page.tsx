
// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import {
//     blockUser,
//     getUsers,
//     unblockUser,
//     type User,
// } from "@/app/lib/api/users";
// import {
//     Search,
//     Users,
//     UserRoundCheck,
//     UserRoundX,
//     ShieldCheck,
//     ShieldBan,
//     RefreshCw,
//     MoreHorizontal,
//     Mail,
//     CalendarDays,
//     Ban,
//     CheckCircle2,
//     UserRound,
// } from "lucide-react";
// import Image from "next/image";

// export default function ManageUsersPage() {
//     const [users, setUsers] = useState<User[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [processingId, setProcessingId] = useState<string | null>(null);
//     const [error, setError] = useState("");
//     const [search, setSearch] = useState("");
//     const [statusFilter, setStatusFilter] = useState("all");

//     const fetchUsers = useCallback(async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const data = await getUsers();
//             setUsers(data);
//         } catch (err) {
//             setError(
//                 err instanceof Error ? err.message : "Something went wrong"
//             );
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchUsers();
//     }, [fetchUsers]);

//     const handleToggleBlock = async (user: User) => {
//         const id = user._id || user.id;

//         if (!id) {
//             setError("User ID not found");
//             return;
//         }

//         const action = user.banned ? "unblock" : "block";

//         if (
//             !window.confirm(
//                 `Are you sure you want to ${action} ${user.name || user.email}?`
//             )
//         ) {
//             return;
//         }

//         try {
//             setProcessingId(id);
//             setError("");

//             if (user.banned) {
//                 await unblockUser(id);
//             } else {
//                 await blockUser(id);
//             }

//             await fetchUsers();
//         } catch (err) {
//             setError(
//                 err instanceof Error ? err.message : "Action failed"
//             );
//         } finally {
//             setProcessingId(null);
//         }
//     };

//     const stats = useMemo(() => {
//         const blocked = users.filter((user) => user.banned).length;

//         return {
//             total: users.length,
//             active: users.length - blocked,
//             blocked,
//         };
//     }, [users]);

//     const filteredUsers = useMemo(() => {
//         return users.filter((user) => {
//             const query = search.trim().toLowerCase();

//             const matchesSearch =
//                 (user.name || "").toLowerCase().includes(query) ||
//                 user.email.toLowerCase().includes(query);

//             const matchesStatus =
//                 statusFilter === "all" ||
//                 (statusFilter === "blocked" && user.banned) ||
//                 (statusFilter === "active" && !user.banned);

//             return matchesSearch && matchesStatus;
//         });
//     }, [users, search, statusFilter]);

//     const formatDate = (date?: string) => {
//         if (!date) return "—";

//         const parsedDate = new Date(date);

//         if (Number.isNaN(parsedDate.getTime())) return "—";

//         return parsedDate.toLocaleDateString("en-US", {
//             day: "numeric",
//             month: "short",
//             year: "numeric",
//         });
//     };

//     const statCards = [
//         {
//             title: "Total Users",
//             value: stats.total,
//             description: "Registered accounts",
//             icon: Users,
//             iconClass: "bg-blue-50 text-blue-600",
//         },
//         {
//             title: "Active Users",
//             value: stats.active,
//             description: "Currently active",
//             icon: UserRoundCheck,
//             iconClass: "bg-emerald-50 text-emerald-600",
//         },
//         {
//             title: "Blocked Users",
//             value: stats.blocked,
//             description: "Restricted accounts",
//             icon: UserRoundX,
//             iconClass: "bg-red-50 text-red-600",
//         },
//     ];

//     return (
//         <div className="min-h-screen space-y-6 pb-10">
//             {/* Header */}
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//                 <div>
//                     <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
//                         <ShieldCheck className="h-4 w-4" />
//                         <span>Administration</span>
//                         <span>/</span>
//                         <span className="text-foreground">Users</span>
//                     </div>

//                     <h1 className="text-2xl font-semibold tracking-tight">
//                         Manage Users
//                     </h1>

//                     <p className="mt-1 text-sm text-muted-foreground">
//                         Manage registered customers and control account access.
//                     </p>
//                 </div>

//                 <button
//                     type="button"
//                     onClick={fetchUsers}
//                     disabled={loading}
//                     className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border bg-background px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
//                 >
//                     <RefreshCw
//                         className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
//                     />
//                     Refresh
//                 </button>
//             </div>

//             {/* Statistics */}
//             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//                 {statCards.map((stat) => {
//                     const Icon = stat.icon;

//                     return (
//                         <div
//                             key={stat.title}
//                             className="rounded-sm border bg-card p-5 transition hover:shadow-sm"
//                         >
//                             <div className="flex items-start justify-between">
//                                 <div>
//                                     <p className="text-sm font-medium text-muted-foreground">
//                                         {stat.title}
//                                     </p>

//                                     <h2 className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
//                                         {loading ? "—" : stat.value.toLocaleString()}
//                                     </h2>

//                                     <p className="mt-1 text-xs text-muted-foreground">
//                                         {stat.description}
//                                     </p>
//                                 </div>

//                                 <div
//                                     className={`flex h-11 w-11 items-center justify-center rounded-sm ${stat.iconClass}`}
//                                 >
//                                     <Icon className="h-5 w-5" />
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>

//             {/* User Table */}
//             <div className="overflow-hidden rounded-sm border bg-card">
//                 {/* Table Header */}
//                 <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
//                     <div>
//                         <h2 className="font-semibold">All Users</h2>
//                         <p className="mt-1 text-sm text-muted-foreground">
//                             View and manage all registered accounts.
//                         </p>
//                     </div>

//                     <div className="flex flex-col gap-2 sm:flex-row">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

//                             <input
//                                 type="search"
//                                 placeholder="Search users..."
//                                 value={search}
//                                 onChange={(e) => setSearch(e.target.value)}
//                                 className="h-10 w-full rounded-sm border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary sm:w-64"
//                             />
//                         </div>

//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="h-10 rounded-sm border bg-background px-3 text-sm outline-none focus:border-primary"
//                         >
//                             <option value="all">All Users</option>
//                             <option value="active">Active</option>
//                             <option value="blocked">Blocked</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Error */}
//                 {error && (
//                     <div className="mx-5 mt-4 flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//                         <Ban className="h-4 w-4 shrink-0" />
//                         {error}
//                     </div>
//                 )}

//                 {/* Table */}
//                 {loading ? (
//                     <div className="flex flex-col items-center justify-center gap-3 py-20">
//                         <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
//                         <p className="text-sm text-muted-foreground">
//                             Loading users...
//                         </p>
//                     </div>
//                 ) : filteredUsers.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
//                         <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
//                             <UserRound className="h-6 w-6 text-muted-foreground" />
//                         </div>
//                         <h3 className="font-medium">No users found</h3>
//                         <p className="mt-1 text-sm text-muted-foreground">
//                             Try changing your search or filter.
//                         </p>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="overflow-x-auto">
//                             <table className="w-full min-w-[760px] text-sm">
//                                 <thead>
//                                     <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
//                                         <th className="px-5 py-4">User</th>
//                                         <th className="px-5 py-4">Role</th>
//                                         <th className="px-5 py-4">Joined</th>
//                                         <th className="px-5 py-4">Status</th>
//                                         <th className="px-5 py-4 text-right">Action</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody className="divide-y">
//                                     {filteredUsers.map((user) => {
//                                         const id = user._id || user.id;
//                                         const isProcessing = processingId === id;

//                                         return (
//                                             <tr
//                                                 key={id || user.email}
//                                                 className="transition-colors hover:bg-muted/30"
//                                             >
//                                                 {/* User */}
//                                                 <td className="px-5 py-4">
//                                                     <div className="flex items-center gap-3">
//                                                         {user.image ? (
//                                                             <Image
//                                                                 src={user.image}
//                                                                 alt={user.name || "User profile"}
//                                                                 width={40}
//                                                                 height={40}
//                                                                 unoptimized
//                                                                 className="h-10 w-10 rounded-full border object-cover"
//                                                             />
//                                                         ) : (
//                                                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
//                                                                 {(user.name || user.email).charAt(0).toUpperCase()}
//                                                             </div>
//                                                         )}


//                                                         <div className="min-w-0">
//                                                             <p className="truncate font-medium">
//                                                                 {user.name || "Unnamed User"}
//                                                             </p>

//                                                             <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
//                                                                 <Mail className="h-3 w-3" />
//                                                                 {user.email}
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </td>

//                                                 {/* Role */}
//                                                 <td className="px-5 py-4">
//                                                     <span className="inline-flex items-center rounded-sm border bg-muted/30 px-2.5 py-1 text-xs font-medium capitalize">
//                                                         {user.role || "Customer"}
//                                                     </span>
//                                                 </td>

//                                                 {/* Joined */}
//                                                 <td className="px-5 py-4 text-muted-foreground">
//                                                     <span className="flex items-center gap-2">
//                                                         <CalendarDays className="h-3.5 w-3.5" />
//                                                         {formatDate(user.createdAt)}
//                                                     </span>
//                                                 </td>

//                                                 {/* Status */}
//                                                 <td className="px-5 py-4">
//                                                     {user.banned ? (
//                                                         <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700">
//                                                             <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
//                                                             Blocked
//                                                         </span>
//                                                     ) : (
//                                                         <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
//                                                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                                                             Active
//                                                         </span>
//                                                     )}
//                                                 </td>

//                                                 {/* Action */}
//                                                 <td className="px-5 py-4 text-right">
//                                                     <button
//                                                         type="button"
//                                                         disabled={!id || isProcessing}
//                                                         onClick={() => handleToggleBlock(user)}
//                                                         className={`inline-flex h-9 min-w-[100px] items-center justify-center gap-2 rounded-sm border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${user.banned
//                                                             ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
//                                                             : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
//                                                             }`}
//                                                     >
//                                                         {isProcessing ? (
//                                                             <RefreshCw className="h-3.5 w-3.5 animate-spin" />
//                                                         ) : user.banned ? (
//                                                             <>
//                                                                 <CheckCircle2 className="h-3.5 w-3.5" />
//                                                                 Unblock
//                                                             </>
//                                                         ) : (
//                                                             <>
//                                                                 <ShieldBan className="h-3.5 w-3.5" />
//                                                                 Block
//                                                             </>
//                                                         )}
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         );
//                                     })}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Footer */}
//                         <div className="flex flex-col gap-2 border-t bg-muted/20 px-5 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
//                             <p>
//                                 Showing{" "}
//                                 <span className="font-medium text-foreground">
//                                     {filteredUsers.length}
//                                 </span>{" "}
//                                 of{" "}
//                                 <span className="font-medium text-foreground">
//                                     {users.length}
//                                 </span>{" "}
//                                 users
//                             </p>

//                             <p className="flex items-center gap-1.5">
//                                 <ShieldCheck className="h-3.5 w-3.5" />
//                                 Account access management
//                             </p>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }
