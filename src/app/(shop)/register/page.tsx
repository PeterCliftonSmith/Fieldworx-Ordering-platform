import type { Metadata } from "next";
import { RegistrationForm } from "@/components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register your restaurant",
  description:
    "Register your restaurant with Fieldworx, create a login, and wait for approval before ordering.",
};

export default function RegisterPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <h1>Register your restaurant</h1>
        <p>
          Create your login and share your business details. Fieldworx will
          review the application before you can sign in and place orders.
        </p>
      </header>
      <RegistrationForm />
    </div>
  );
}
