
export interface Transaction {
  _id: string;
  customer?: {
    name?: string;
    email?: string;
    image?: string;
  };
  service: string;
  appointmentDate: string;
  timeSlot: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  stripeSessionId: string;
  transactionDate: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getTransactions(): Promise<Transaction[]> {
  const response = await fetch(`${API_URL}/transactions`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch transactions");
  }

  return result.data;
}
