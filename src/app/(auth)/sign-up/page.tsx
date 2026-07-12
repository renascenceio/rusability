import { redirect } from "next/navigation";

/**
 * Public self-registration is disabled. The platform is invite/admin-managed,
 * so any hit to /sign-up is sent to the sign-in form (used by editors/admins).
 * Accounts are created from the admin console.
 */
export default function SignUpPage() {
  redirect("/sign-in");
}
