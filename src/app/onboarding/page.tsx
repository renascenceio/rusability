import { redirect } from "next/navigation";

/**
 * Reader onboarding/registration is disabled — the site is read-only for the
 * public. Any hit is sent to the home feed.
 */
export default function OnboardingPage() {
  redirect("/");
}
