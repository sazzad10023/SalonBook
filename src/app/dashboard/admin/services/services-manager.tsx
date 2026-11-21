"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Power,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteService,
  getServices,
  updateService,
  type Service,
} from "@/app/lib/api/books";

export function ServicesManager({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      setServices(await getServices());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    setBusyId(service.id);

    try {
      const updated = await updateService(service.id, { status: nextStatus });

      setServices((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );

      toast.success(
        nextStatus === "active"
          ? `"${service.name}" is now active.`
          : `"${service.name}" is now inactive.`
      );
    } catch (toggleError) {
      toast.error(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not change the service status."
      );
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `Delete "${service.name}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setBusyId(service.id);

    try {
      await deleteService(service.id);
      setServices((current) =>
        current.filter((item) => item.id !== service.id)
      );
      toast.success(`"${service.name}" was deleted.`);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete the service."
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcf8] p-4 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#263d32]">
            Manage Services
          </h1>
          <p className="mt-1 text-sm text-[#82977a]">
            Add, update, activate, or remove the services customers can book.
          </p>
        </div>

        <Link
          href="/dashboard/admin/add_book"
          className="flex items-center justify-center gap-2 rounded-sm bg-[#355747] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#263d32]"
        >
          <Plus size={17} />
          Add Service
        </Link>
      </div>

      {error && !loading && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="rounded-sm border border-red-200 px-3 py-1.5 font-medium transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-[#e3e9df] bg-white">
        <div className="flex items-center justify-between border-b border-[#e3e9df] px-4 py-4">
          <h2 className="font-medium text-[#263d32]">All Services</h2>
          <span className="text-sm text-[#82977a]">
            {services.length} {services.length === 1 ? "service" : "services"}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-52 items-center justify-center">
            <Loader2 className="animate-spin text-[#355747]" size={25} />
          </div>
        ) : services.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <ImageIcon size={35} className="mb-3 text-[#82977a]" />
            <p className="font-medium text-[#263d32]">No services found</p>
            <p className="mt-1 text-sm text-[#82977a]">
              Add your first salon service to start accepting bookings.
            </p>
            <Link
              href="/dashboard/admin/add_book"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-[#355747] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#263d32]"
            >
              <Plus size={16} />
              Add Service
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f6f8f3] text-xs uppercase text-[#82977a]">
                <tr>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf0e9]">
                {services.map((service) => {
                  const isBusy = busyId === service.id;
                  const isActive = service.status === "active";

                  return (
                    <tr key={service.id} className="hover:bg-[#fbfcf8]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-[#eaf0e7]">
                            {service.image ? (
                              <Image
                                src={service.image}
                                alt={service.name}
                                width={44}
                                height={44}
                                unoptimized
                                className="size-full object-cover"
                              />
                            ) : (
                              <ImageIcon
                                size={18}
                                className="text-[#82977a]"
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-[#263d32]">
                              {service.name}
                            </p>
                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#82977a]">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#52665a]">
                        {service.category}
                      </td>

                      <td className="px-4 py-3 font-medium text-[#263d32]">
                        ৳{service.price}
                      </td>

                      <td className="px-4 py-3 text-[#52665a]">
                        {service.duration} min
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-sm px-2 py-1 text-xs font-medium ${
                            isActive
                              ? "bg-[#eaf0e7] text-[#355747]"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(service)}
                            disabled={isBusy}
                            title={
                              isActive
                                ? "Deactivate service"
                                : "Activate service"
                            }
                            className={`flex h-8 items-center gap-1.5 rounded-sm border px-2.5 text-xs font-medium transition disabled:opacity-50 ${
                              isActive
                                ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                                : "border-[#cddcc8] text-[#355747] hover:bg-[#eaf0e7]"
                            }`}
                          >
                            {isBusy ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Power size={14} />
                            )}
                            {isActive ? "Deactivate" : "Activate"}
                          </button>

                          <Link
                            href={`/dashboard/admin/add_book?edit=${service.id}`}
                            title="Edit service"
                            className="flex size-8 items-center justify-center rounded-sm border border-[#dce5dc] text-[#355747] transition hover:bg-[#eaf0e7]"
                          >
                            <Pencil size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => void handleDelete(service)}
                            disabled={isBusy}
                            title="Delete service"
                            className="flex size-8 items-center justify-center rounded-sm border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
