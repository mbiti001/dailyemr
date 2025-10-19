"use client";

import { type ChangeEvent, useState } from "react";

export default function BillingPage() {
  const [visitId, setVisitId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [invoiceId, setInvoiceId] = useState("");

  async function createInvoice() {
    try {
      const response = await fetch("/api/billing/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, payer: "CASH" })
      });
      if (!response.ok) throw new Error("Failed");
      const invoice = await response.json();
      setInvoiceId(invoice.id);
    } catch {
      alert("Error creating invoice");
    }
  }

  async function addItem() {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, amount })
      });
      if (!response.ok) throw new Error("Failed");
      alert("Item added");
    } catch {
      alert("Error adding item");
    }
  }

  async function pay() {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: "CASH", amount })
      });
      if (!response.ok) throw new Error("Failed");
      alert("Paid");
    } catch {
      alert("Error processing payment");
    }
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <h3 className="text-lg font-semibold text-brand-midnight">Create invoice</h3>
        <p className="text-sm text-slate-500">Tie line items to a visit and prepare the claim ledger.</p>
        <input
          className="mt-4 w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
          placeholder="Visit ID"
          value={visitId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setVisitId(event.target.value)}
        />
        <button
          className="mt-4 inline-flex rounded-full bg-brand-sky px-5 py-2 text-sm font-semibold text-brand-midnight shadow-[0_18px_32px_-18px_rgba(56,189,248,0.65)] transition hover:shadow-[0_22px_42px_-18px_rgba(56,189,248,0.7)] disabled:opacity-40"
          onClick={createInvoice}
          disabled={!visitId}
        >
          Create invoice
        </button>
        <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-slate-500">
          Invoice ID
          <span className="rounded-full bg-brand-sky/20 px-3 py-1 text-[11px] font-semibold text-brand-blue">
            {invoiceId || "Pending"}
          </span>
        </div>
      </div>
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <h3 className="text-lg font-semibold text-brand-midnight">Items &amp; settlement</h3>
        <p className="text-sm text-slate-500">Capture tariff lines then record payment or SHA remittance.</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
            placeholder="Description"
            value={description}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
            type="number"
            placeholder="Amount (KES cents)"
            value={amount ? amount : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAmount(Number(event.target.value))}
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="inline-flex rounded-full border border-brand-blue/40 px-4 py-2 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white disabled:opacity-40"
            onClick={addItem}
            disabled={!invoiceId || !amount}
          >
            Add item
          </button>
          <button
            className="inline-flex rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-midnight disabled:opacity-40"
            onClick={pay}
            disabled={!invoiceId || !amount}
          >
            Mark as paid
          </button>
        </div>
      </div>
    </section>
  );
}
