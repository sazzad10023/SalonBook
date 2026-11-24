import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/admin","/dashboard/customer","/customer/appointments","/customer/profile","/dashboard/admin/services","/dashboard/admin/appointments",
    "/dashboard/admin/customers","/dashboard/admin/transactions","/dashboard/admin/add_book","/dashboard/admin/profile"
  ],
};