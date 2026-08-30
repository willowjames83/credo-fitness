import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create your account — Credo",
  description: "Start training for longevity with Credo.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
