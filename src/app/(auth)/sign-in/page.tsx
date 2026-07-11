import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Вход" };

export default async function SignInPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
