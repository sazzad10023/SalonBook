
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Copy,
  Check,
  CreditCard,
  Receipt,
} from "lucide-react";
import { getTransactions, Transaction } from "@/app/lib/api/transactions";



export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const copySessionId = async (id: string) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);

    setTimeout(() => setCopiedId(""), 2000);
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredTransactions = transactions.filter((item) => {
    const value = search.toLowerCase();

    return (
      item.customer?.name?.toLowerCase().includes(value) ||
      item.customer?.email?.toLowerCase().includes(value) ||
      item.service?.toLowerCase().includes(value) ||
      item.stripeSessionId?.toLowerCase().includes(value)
    );
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View all payment transactions.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-sm border px-4 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total Transactions
            </p>
            <Receipt size={20} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold">
            {transactions.length}
          </h2>
        </div>

        <div className="rounded-sm border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Paid Transactions
            </p>
            <CreditCard size={20} />
          </div>
          <h2 className="mt-3 text-2xl font-semibold">
            {
              transactions.filter(
                (item) => item.paymentStatus?.toLowerCase() === "paid"
              ).length
            }
          </h2>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-sm border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-sm border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Appointment</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Session ID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Transaction Date</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/30">
                    {/* Customer */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {item.customer?.image ? (
                          <img
                            src={item.customer.image}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-medium">
                            {item.customer?.name?.charAt(0) || "U"}
                          </div>
                        )}

                        <div>
                          <p className="font-medium">
                            {item.customer?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.customer?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-4 py-4">{item.service}</td>

                    {/* Appointment */}
                    <td className="px-4 py-4">
                      <p>{formatDate(item.appointmentDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.timeSlot}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-4 font-medium">
                      {formatAmount(item.amount, item.currency)}
                    </td>

                    {/* Session ID */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span title={item.stripeSessionId}>
                          {item.stripeSessionId
                            ? `${item.stripeSessionId.slice(0, 12)}...`
                            : "N/A"}
                        </span>

                        {item.stripeSessionId && (
                          <button
                            onClick={() => copySessionId(item.stripeSessionId)}
                            title="Copy Session ID"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === item.stripeSessionId ? (
                              <Check size={15} />
                            ) : (
                              <Copy size={15} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-sm px-2 py-1 text-xs font-medium ${
                          item.paymentStatus?.toLowerCase() === "paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </td>

                    {/* Transaction Date */}
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(item.transactionDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions.
        Payment records are read-only.
      </p>
    </div>
  );
}
