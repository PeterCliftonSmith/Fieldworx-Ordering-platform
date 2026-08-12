"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  WEEK_DAYS,
  WEEK_DAY_LABELS,
  type CustomerRegistrationInput,
  type DayTradingHours,
} from "@/data/registration";

const emptyPerson = { name: "", phone: "", email: "" };

function defaultTradingTimes(): DayTradingHours[] {
  return WEEK_DAYS.map((day) => ({
    day,
    closed: day === "sunday",
    open: day === "sunday" ? "" : "08:00",
    close: day === "sunday" ? "" : "17:00",
  }));
}

export function RegistrationForm() {
  const [registeredBusinessName, setRegisteredBusinessName] = useState("");
  const [tradingName, setTradingName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [landlineNumber, setLandlineNumber] = useState("");
  const [buyer, setBuyer] = useState(emptyPerson);
  const [accounts, setAccounts] = useState(emptyPerson);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [tradingTimes, setTradingTimes] = useState(defaultTradingTimes);
  const [tradingTimesNotes, setTradingTimesNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const sameAsBuyerLabel = useMemo(
    () => "Use the same details as the buyer contact",
    [],
  );

  function updateTradingDay(
    day: DayTradingHours["day"],
    patch: Partial<DayTradingHours>,
  ) {
    setTradingTimes((current) =>
      current.map((item) => (item.day === day ? { ...item, ...patch } : item)),
    );
  }

  function copyBuyerToAccounts() {
    setAccounts({ ...buyer });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: CustomerRegistrationInput = {
      registeredBusinessName,
      tradingName,
      vatNumber,
      registrationNumber,
      landlineNumber,
      buyer,
      accounts,
      deliveryAddress: {
        line1,
        line2,
        city,
        province,
        postalCode,
      },
      tradingTimes,
      tradingTimesNotes,
    };

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        error?: string;
        registration?: { id: string };
      };
      if (!response.ok) {
        throw new Error(data.error || "Could not submit registration.");
      }
      setSubmittedId(data.registration?.id ?? "submitted");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not submit registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (submittedId) {
    return (
      <div className="register-success">
        <h2>Registration received</h2>
        <p>
          Thanks — Fieldworx has your restaurant details. We’ll be in touch to
          confirm your account before ordering goes live.
        </p>
        <p className="muted small">Reference: {submittedId}</p>
      </div>
    );
  }

  return (
    <form className="register-form" onSubmit={onSubmit}>
      {error ? <p className="admin-error">{error}</p> : null}

      <section className="register-panel">
        <h2>Business details</h2>
        <div className="admin-grid">
          <label>
            Registered business name
            <input
              required
              value={registeredBusinessName}
              onChange={(e) => setRegisteredBusinessName(e.target.value)}
            />
          </label>
          <label>
            Trading name
            <input
              required
              value={tradingName}
              onChange={(e) => setTradingName(e.target.value)}
            />
          </label>
          <label>
            VAT number
            <input
              required
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="4xxxxxxxxx"
            />
          </label>
          <label>
            Registration number
            <input
              required
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
            />
          </label>
          <label className="span-2">
            Landline number
            <input
              required
              value={landlineNumber}
              onChange={(e) => setLandlineNumber(e.target.value)}
              placeholder="021 ..."
            />
          </label>
        </div>
      </section>

      <section className="register-panel">
        <h2>Buyer contact</h2>
        <p className="muted small">
          The person who will place orders for the kitchen.
        </p>
        <div className="admin-grid">
          <label>
            Name
            <input
              required
              value={buyer.name}
              onChange={(e) => setBuyer({ ...buyer, name: e.target.value })}
            />
          </label>
          <label>
            Number
            <input
              required
              value={buyer.phone}
              onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })}
            />
          </label>
          <label className="span-2">
            Email
            <input
              required
              type="email"
              value={buyer.email}
              onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="register-panel">
        <div className="register-panel-heading">
          <div>
            <h2>Accounts contact</h2>
            <p className="muted small">
              The person who should receive invoices and statements.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={copyBuyerToAccounts}
          >
            {sameAsBuyerLabel}
          </button>
        </div>
        <div className="admin-grid">
          <label>
            Name
            <input
              required
              value={accounts.name}
              onChange={(e) =>
                setAccounts({ ...accounts, name: e.target.value })
              }
            />
          </label>
          <label>
            Number
            <input
              required
              value={accounts.phone}
              onChange={(e) =>
                setAccounts({ ...accounts, phone: e.target.value })
              }
            />
          </label>
          <label className="span-2">
            Email
            <input
              required
              type="email"
              value={accounts.email}
              onChange={(e) =>
                setAccounts({ ...accounts, email: e.target.value })
              }
            />
          </label>
        </div>
      </section>

      <section className="register-panel">
        <h2>Delivery address</h2>
        <div className="admin-grid">
          <label className="span-2">
            Address line 1
            <input
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
            />
          </label>
          <label className="span-2">
            Address line 2
            <input value={line2} onChange={(e) => setLine2(e.target.value)} />
          </label>
          <label>
            City / town
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </label>
          <label>
            Province
            <input
              required
              value={province}
              onChange={(e) => setProvince(e.target.value)}
            />
          </label>
          <label>
            Postal code
            <input
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="register-panel">
        <h2>Trading times</h2>
        <p className="muted small">
          Set when your kitchen can receive deliveries or place orders.
        </p>
        <div className="trading-times">
          {tradingTimes.map((item) => (
            <div className="trading-day" key={item.day}>
              <p className="trading-day-label">{WEEK_DAY_LABELS[item.day]}</p>
              <label className="trading-closed">
                <input
                  type="checkbox"
                  checked={item.closed}
                  onChange={(e) =>
                    updateTradingDay(item.day, {
                      closed: e.target.checked,
                      open: e.target.checked ? "" : item.open || "08:00",
                      close: e.target.checked ? "" : item.close || "17:00",
                    })
                  }
                />
                Closed
              </label>
              <label>
                Open
                <input
                  type="time"
                  disabled={item.closed}
                  value={item.open}
                  onChange={(e) =>
                    updateTradingDay(item.day, { open: e.target.value })
                  }
                />
              </label>
              <label>
                Close
                <input
                  type="time"
                  disabled={item.closed}
                  value={item.close}
                  onChange={(e) =>
                    updateTradingDay(item.day, { close: e.target.value })
                  }
                />
              </label>
            </div>
          ))}
        </div>
        <label className="trading-notes">
          Notes (optional)
          <textarea
            rows={3}
            value={tradingTimesNotes}
            onChange={(e) => setTradingTimesNotes(e.target.value)}
            placeholder="e.g. No deliveries during lunch service 12:00–14:30"
          />
        </label>
      </section>

      <div className="register-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Submitting…" : "Submit registration"}
        </button>
      </div>
    </form>
  );
}
