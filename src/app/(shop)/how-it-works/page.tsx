import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MotionReveal } from "@/components/MotionReveal";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "See how Fieldworx sits between restaurants and suppliers for clearer ordering.",
};

const steps = [
  {
    title: "Register your restaurant",
    body: "Share your business, buyer, accounts, delivery, and trading details so Fieldworx can set you up.",
  },
  {
    title: "Browse suppliers",
    body: "Open catalogues from produce, seafood, meat, and pantry partners already on Fieldworx.",
  },
  {
    title: "Build one draft order",
    body: "Add lines across suppliers as you plan the week. Quantities stay with you until you submit.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <header className="page-intro">
        <MotionReveal>
          <h1>How Fieldworx works</h1>
          <p>
            A simple middle path between the kitchen that needs stock and the
            supplier that fulfils it.
          </p>
        </MotionReveal>
      </header>

      <section className="section split-panel" style={{ paddingTop: "1rem" }}>
        <MotionReveal>
          <div className="split-visual">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1600&q=80"
              alt="Chef preparing ingredients in a professional kitchen"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </div>
        </MotionReveal>

        <MotionReveal delayMs={100}>
          <div className="steps">
            {steps.map((step) => (
              <article key={step.title} className="step">
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </article>
            ))}
            <div>
              <Link href="/register" className="btn btn-primary">
                Register your restaurant
              </Link>
            </div>
          </div>
        </MotionReveal>
      </section>
    </div>
  );
}
