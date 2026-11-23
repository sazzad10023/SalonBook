import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

import { getMongoClient } from "./mongodb";
import { jwt } from "better-auth/plugins";

const client = getMongoClient();
const db = client.db("salonbook");

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
     autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: ["admin", "customer"],
        input: true,
        defaultValue: "customer",
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
   plugins: [
        jwt(), 
    ],
    session: {
    cookieCache: {
      enabled: true,
      strategy: 'jwt',
      maxAge: 7 * 24 * 60 * 60 
    }
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
