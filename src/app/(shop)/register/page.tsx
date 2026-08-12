import type { Metadata } from "next";
import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register your restaurant",
  description:
    "Register your restaurant with Fieldworx to order from suppliers through the platform.",
};

export default function RegisterPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Register your restaurant</h1>
        <p>
          Tell us about your business so Fieldworx can set up ordering between
          your kitchen and suppliers.
        </p>
      </header>
      <RegistrationForm />
    </div>
  );
}
