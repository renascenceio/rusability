import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Регистрация" };

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
