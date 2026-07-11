import { betterAuth } from "better-auth";
import { pool, db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

export const auth = betterAuth({
  database: pool,
  secret: process.env.NEON_AUTH_COOKIE_SECRET,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.V0_RUNTIME_URL),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    ...(process.env.V0_RUNTIME_URL ? [process.env.V0_RUNTIME_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`]
      : []),
    // In development / v0 preview the browser Origin is the sandbox/preview
    // host (and localhost during local testing), which we can't enumerate up
    // front — trust all origins there. Production stays locked to the env list.
    ...(process.env.NODE_ENV === "development" ? ["*"] : []),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  databaseHooks: {
    user: {
      create: {
        // First user to ever sign up becomes the platform superadmin.
        // Everyone after is a normal reader until promoted in the admin.
        before: async (data) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(user);
          const isFirst = Number(count) === 0;
          return {
            data: {
              ...data,
              role: isFirst ? "superadmin" : "reader",
            },
          };
        },
      },
    },
  },
  // We manage the `role` column ourselves (via the create hook below + a
  // server action) and gate access by reading session.user.role, so the
  // admin plugin (which validates custom role strings) is intentionally omitted.
  user: {
    additionalFields: {
      role: { type: "string", required: false, input: false },
    },
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
});
