"use client";

import { type ChangeEvent, useEffect, useState } from "react";

type PendingLab = {
  id: string;
  status: string;
  orderItem: {
    name: string;
    order: {
      visitId: string;
      visit: {
        patient: {
          firstName: string;
          lastName: string;
        };
      };
    };
  };
};

export default function LabsPage() {
  const [visitId, setVisitId] = useState("");
  const [testName, setTestName] = useState("");
  const [pending, setPending] = useState<PendingLab[]>([]);

  useEffect(() => {
    refreshPending().catch(() => setPending([]));
  }, []);

  async function refreshPending() {
    const response = await fetch("/api/labs/pending");
    if (!response.ok) throw new Error("Failed to load pending labs");
    const data = await response.json();
    setPending(data ?? []);
  }

  async function orderLab() {
    try {
      const response = await fetch("/api/orders/labs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitId,
          items: [
            {
              code: "HB",
              name: testName || "Haemoglobin"
            }
          ]
        })
      });
      if (!response.ok) throw new Error("Order failed");
      alert("Ordered");
      setVisitId("");
      setTestName("");
      await refreshPending();
    } catch {
      alert("Error ordering lab");
    }
  }

  async function markComplete(id: string) {
    try {
      const response = await fetch(`/api/labs/${id}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: "13.2 g/dL", resultCode: "", status: "COMPLETE" })
      });
      if (!response.ok) throw new Error("Failed");
      await refreshPending();
    } catch {
      alert("Error completing lab");
    }
  }

  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <h3 className="text-lg font-semibold text-brand-midnight">Order laboratory test</h3>
        <p className="text-sm text-slate-500">Raise investigations in context of an active visit.</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
            placeholder="Visit ID"
            value={visitId}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setVisitId(event.target.value)}
          />
          <input
            className="w-full rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
            placeholder="Test name"
            value={testName}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setTestName(event.target.value)}
          />
        </div>
        <button
          className="mt-5 inline-flex rounded-full bg-brand-sky px-5 py-2 text-sm font-semibold text-brand-midnight shadow-[0_18px_32px_-18px_rgba(56,189,248,0.65)] transition hover:shadow-[0_22px_42px_-18px_rgba(56,189,248,0.7)] disabled:opacity-40"
          onClick={orderLab}
          disabled={!visitId}
        >
          Submit order
        </button>
      </div>
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-midnight">Pending labs</h3>
          <button
            onClick={refreshPending}
            className="rounded-full border border-brand-sky/40 px-3 py-1 text-xs font-semibold text-brand-blue"
          >
            Refresh
          </button>
        </div>
        <ul className="mt-4 max-h-96 overflow-auto rounded-2xl border border-white/50">
          {pending.map((lab: PendingLab) => (
            <li
              key={lab.id}
              className="flex items-center justify-between border-b border-white/50 px-4 py-3 last:border-b-0 hover:bg-brand-sky/10"
            >
              <div>
                <p className="text-sm font-semibold text-brand-midnight">{lab.orderItem.name}</p>
                <p className="text-xs text-slate-500">
                  Visit {lab.orderItem.order.visitId} · {lab.orderItem.order.visit.patient.firstName} {lab.orderItem.order.visit.patient.lastName}
                </p>
              </div>
              <button
                className="rounded-full border border-brand-blue/40 px-3 py-1 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
                onClick={() => markComplete(lab.id)}
              >
                Mark complete
              </button>
            </li>
          ))}
          {!pending.length && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">No pending labs.</li>
          )}
        </ul>
      </div>
    </section>
  );
}
