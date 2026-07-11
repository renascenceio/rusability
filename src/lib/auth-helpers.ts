import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type AppRole = "superadmin" | "admin" | "editor" | "author" | "reader";

/** Roles allowed into the /admin console. */
export const ADMIN_ROLES: AppRole[] = ["superadmin", "admin", "editor"];
/** Roles allowed into the /author console (admins can see it too). */
export const AUTHOR_ROLES: AppRole[] = ["superadmin", "admin", "editor", "author"];

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  image?: string | null;
}

function normalize(u: {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  image?: string | null;
}): SessionUser {
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email ?? "",
    role: (u.role as AppRole) ?? "reader",
    image: u.image ?? null,
  };
}

/** Returns the current user or null. Never throws. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return normalize(session.user as Parameters<typeof normalize>[0]);
}

/** Require any signed-in user; redirect to sign-in otherwise. */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Require one of the given roles; redirect if not allowed. */
export async function requireRole(roles: AppRole[], next?: string): Promise<SessionUser> {
  const user = await requireUser(next);
  if (!roles.includes(user.role)) redirect("/?denied=1");
  return user;
}
