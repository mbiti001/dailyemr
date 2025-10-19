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
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Order Lab Test</h3>
        <input
          className="mb-2 w-full rounded border p-2"
          placeholder="Visit ID"
          value={visitId}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setVisitId(event.target.value)}
        />
        <input
          className="mb-2 w-full rounded border p-2"
          placeholder="Test name"
          value={testName}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setTestName(event.target.value)}
        />
        <button className="rounded bg-black p-2 text-white" onClick={orderLab} disabled={!visitId}>
          Order
        </button>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Pending</h3>
        <ul className="max-h-96 overflow-auto">
          {pending.map((lab: PendingLab) => (
            <li key={lab.id} className="flex items-center justify-between border-b py-1">
              <span>{lab.orderItem.name}</span>
              <button
                className="rounded border px-2 py-1 text-xs"
                onClick={() => markComplete(lab.id)}
              >
                Mark Complete
              </button>
            </li>
          ))}
          {!pending.length && (
            <li className="py-4 text-center text-sm text-slate-500">No pending labs</li>
          )}
        </ul>
      </div>
    </div>
  );
}
