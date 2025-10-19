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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Invoice</h3>
        <input
          className="mb-2 w-full rounded border p-2"
          placeholder="Visit ID"
          value={visitId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setVisitId(event.target.value)}
        />
        <button className="rounded bg-black p-2 text-white" onClick={createInvoice} disabled={!visitId}>
          Create
        </button>
        <div className="mt-2 text-xs">Invoice ID: {invoiceId || "—"}</div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Item &amp; Payment</h3>
        <input
          className="mb-2 w-full rounded border p-2"
          placeholder="Description"
          value={description}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setDescription(event.target.value)}
        />
        <input
          className="mb-2 w-full rounded border p-2"
          type="number"
          placeholder="Amount (KES cents)"
          value={amount ? amount : ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setAmount(Number(event.target.value))}
        />
        <div className="flex gap-2">
          <button className="rounded border p-2" onClick={addItem} disabled={!invoiceId || !amount}>
            Add Item
          </button>
          <button className="rounded bg-black p-2 text-white" onClick={pay} disabled={!invoiceId || !amount}>
            Pay
          </button>
        </div>
      </div>
    </div>
  );
}
