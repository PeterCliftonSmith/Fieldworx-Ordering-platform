import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WEEK_DAY_LABELS } from "@/data/registration";
import { getRegistration } from "@/lib/registration-store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const registration = await getRegistration(id);
  return {
    title: registration
      ? `Registration · ${registration.tradingName}`
      : "Registration",
  };
}

export default async function AdminRegistrationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const registration = await getRegistration(id);
  if (!registration) notFound();

  const address = [
    registration.deliveryAddress.line1,
    registration.deliveryAddress.line2,
    registration.deliveryAddress.city,
    registration.deliveryAddress.province,
    registration.deliveryAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="section-kicker">
            <Link href="/admin/registrations">Registrations</Link>
          </p>
          <h1>{registration.tradingName}</h1>
          <p className="muted">
            Submitted{" "}
            {new Date(registration.createdAt).toLocaleString("en-ZA")}
          </p>
        </div>
      </div>

      <section className="admin-panel">
        <h2>Business details</h2>
        <dl className="detail-list">
          <div>
            <dt>Registered business name</dt>
            <dd>{registration.registeredBusinessName}</dd>
          </div>
          <div>
            <dt>Trading name</dt>
            <dd>{registration.tradingName}</dd>
          </div>
          <div>
            <dt>VAT number</dt>
            <dd>{registration.vatNumber}</dd>
          </div>
          <div>
            <dt>Registration number</dt>
            <dd>{registration.registrationNumber}</dd>
          </div>
          <div>
            <dt>Landline</dt>
            <dd>{registration.landlineNumber}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-panel">
        <h2>Buyer contact</h2>
        <dl className="detail-list">
          <div>
            <dt>Name</dt>
            <dd>{registration.buyer.name}</dd>
          </div>
          <div>
            <dt>Number</dt>
            <dd>{registration.buyer.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{registration.buyer.email}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-panel">
        <h2>Accounts contact</h2>
        <dl className="detail-list">
          <div>
            <dt>Name</dt>
            <dd>{registration.accounts.name}</dd>
          </div>
          <div>
            <dt>Number</dt>
            <dd>{registration.accounts.phone}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{registration.accounts.email}</dd>
          </div>
        </dl>
      </section>

      <section className="admin-panel">
        <h2>Delivery address</h2>
        <p>{address}</p>
      </section>

      <section className="admin-panel">
        <h2>Trading times</h2>
        <ul className="detail-times">
          {registration.tradingTimes.map((item) => (
            <li key={item.day}>
              <strong>{WEEK_DAY_LABELS[item.day]}</strong>
              <span>
                {item.closed ? "Closed" : `${item.open} – ${item.close}`}
              </span>
            </li>
          ))}
        </ul>
        {registration.tradingTimesNotes ? (
          <p className="muted">{registration.tradingTimesNotes}</p>
        ) : null}
      </section>
    </div>
  );
}
