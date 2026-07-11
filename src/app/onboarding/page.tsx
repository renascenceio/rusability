import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/site/OnboardingFlow";

export const metadata: Metadata = {
  title: "Добро пожаловать в Rusability",
  description: "Настройте персональную ленту Rusability за несколько шагов.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
