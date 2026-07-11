import { OnboardingFlow } from "@/components/site/OnboardingFlow";

export const metadata = {
  title: "Настройка ленты — Rusability",
  description: "Выберите темы и авторов, чтобы собрать персональную ленту.",
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
