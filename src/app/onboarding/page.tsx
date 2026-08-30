import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata: Metadata = {
  title: "Set up your training — Credo",
  description: "Tell Credo about your goals and we'll build your first week.",
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
