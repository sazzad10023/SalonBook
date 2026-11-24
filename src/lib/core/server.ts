
"use server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// import { headers } from "next/headers";
// import { auth } from "../auth";

// export const getSession = async () => {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });

//   return session;
// };

// export const getToken = async () => {
//     const session = await getSession();
//     console.log("session",session)
//     if (!session || !session.session?.token) {

//         redirect("/unauthorized");
//     }
//     return session.session.token;
// }


export const getSession = async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
};

export const getToken = async () => {
  const jwtToken = await auth.api.getToken({
    headers: await headers(),
  });

  if (!jwtToken?.token) {
    redirect("/unauthorized");
  }

  return jwtToken.token;
};

export const authFetch = async (api: string, init: RequestInit = {}) => {
  const token = await getToken();
  const requestHeaders = new Headers(init.headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  requestHeaders.set("Authorization", `Bearer ${token}`);

  const res = await fetch(api, {
    ...init,
    headers: requestHeaders,
    cache: init.cache ?? "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    redirect("/unauthorized");
  }

  return res;
};
// export const authFetch = async (api: string) => {
//     const token = await getToken();
//     const res = await fetch(api, {
//         headers: {
//             authorization: `Bearer ${token}`
//         }
//     })
//     if (res.status === 401 || res.status === 403) {
//         redirect("/unauthorized");
//     }
//     return res;
// }



export const requirrole = async (role: string) => {
  const session = await getSession();

  if (!session || session.user.role !== role) {
    redirect("/unauthorized");
  }

  return session;
};





// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

// export async function getAllUsers(): Promise<TAdminUser[]> {
//   const jwtToken = await auth.api.getToken({ headers: await headers() });
//   if (!jwtToken) {
//     throw new Error("No token found. User must be logged in to fetch users.");
//   }
//   const token = jwtToken?.token;
//   console.log(token, 'jwt token');

//   const res = await fetch(`${BASE_URL}/users`, {
//     headers: {
//       "Content-Type": "application/json",
//       "authorization": `Bearer ${token}`
//     },
//     cache: "no-store"
//   });

//   if (!res.ok) {
//     throw new Error(`Could not load users (status ${res.status}).`);
//   }

//   const body = await res.json();
//   return body.data ?? [];
// }