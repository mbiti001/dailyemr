"use client";

import { type ChangeEvent, useEffect, useState } from "react";

type BasicPatient = {
  id: string;
  firstName: string;
  lastName: string;
};

type VitalPayload = {
  heightCm?: number;
  weightKg?: number;
  temperatureC?: number;
  pulseBpm?: number;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
};

export default function TriagePage() {
  const [patients, setPatients] = useState<BasicPatient[]>([]);
  const [visitId, setVisitId] = useState<string>("");
  const [vitals, setVitals] = useState<VitalPayload>({});

  useEffect(() => {
    fetch("/api/patients")
      .then(res => res.json())
      .then(data => setPatients(data.data ?? data ?? []))
      .catch(() => setPatients([]));
  }, []);

  async function startVisit(patientId: string) {
    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, type: "OPD" })
      });
      if (!response.ok) throw new Error("Failed to start visit");
      const visit = await response.json();
      setVisitId(visit.id);
    } catch {
      alert("Error starting visit");
    }
  }

  async function saveVitals() {
    try {
      const response = await fetch(`/api/visits/${visitId}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitals)
      });
      if (!response.ok) throw new Error("Failed");
      alert("Saved vitals");
      setVitals({});
    } catch {
      alert("Error saving vitals");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Start Visit</h3>
        <ul className="max-h-80 overflow-auto">
          {patients.map((patient: BasicPatient) => (
            <li key={patient.id} className="flex items-center justify-between border-b py-1">
              <span>
                {patient.firstName} {patient.lastName}
              </span>
              <button
                onClick={() => startVisit(patient.id)}
                className="rounded border px-2 py-1 text-xs"
              >
                New Visit
              </button>
            </li>
          ))}
          {!patients.length && (
            <li className="py-4 text-center text-sm text-slate-500">No patients yet.</li>
          )}
        </ul>
        <div className="mt-2 text-xs">Visit ID: {visitId || "—"}</div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow">
        <h3 className="mb-2 font-semibold">Record Vitals</h3>
        <div className="grid grid-cols-2 gap-2">
          {["heightCm", "weightKg", "temperatureC", "pulseBpm", "systolic", "diastolic", "spo2"].map(key => (
            <input
              key={key}
              className="rounded border p-2"
              placeholder={key}
              type="number"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setVitals(prev => ({
                  ...prev,
                  [key]: event.target.value === "" ? undefined : Number(event.target.value)
                }))
              }
              value={
                vitals[key as keyof VitalPayload] === undefined
                  ? ""
                  : String(vitals[key as keyof VitalPayload])
              }
            />
          ))}
        </div>
        <button
          disabled={!visitId}
          onClick={saveVitals}
          className="mt-3 rounded bg-black p-2 text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
}
