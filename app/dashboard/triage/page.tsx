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
    <section className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-midnight">Start visit</h3>
            <p className="text-sm text-slate-500">Assign a clinician encounter from the registry.</p>
          </div>
          <span className="rounded-full bg-brand-sky/20 px-3 py-1 text-xs font-semibold text-brand-blue">
            {patients.length} waiting
          </span>
        </div>
        <ul className="mt-4 max-h-80 overflow-auto rounded-2xl border border-white/40">
          {patients.map((patient: BasicPatient) => (
            <li
              key={patient.id}
              className="flex items-center justify-between border-b border-white/50 px-4 py-2 last:border-b-0 hover:bg-brand-sky/10"
            >
              <span className="text-sm font-medium text-brand-midnight">
                {patient.firstName} {patient.lastName}
              </span>
              <button
                onClick={() => startVisit(patient.id)}
                className="rounded-full bg-brand-sky px-3 py-1 text-xs font-semibold text-brand-midnight shadow-[0_14px_32px_-18px_rgba(56,189,248,0.6)] transition hover:shadow-[0_18px_36px_-16px_rgba(56,189,248,0.7)]"
              >
                New visit
              </button>
            </li>
          ))}
          {!patients.length && (
            <li className="px-4 py-6 text-center text-sm text-slate-500">No patients yet.</li>
          )}
        </ul>
        <div className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-500">
          Visit ID<span className="ml-3 rounded-full bg-brand-sky/20 px-3 py-1 text-[11px] font-semibold text-brand-blue">{visitId || "Pending"}</span>
        </div>
      </div>
      <div className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
        <h3 className="text-lg font-semibold text-brand-midnight">Record vitals</h3>
        <p className="text-sm text-slate-500">Key metrics sync to FHIR Observation for downstream analytics.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {["heightCm", "weightKg", "temperatureC", "pulseBpm", "systolic", "diastolic", "spo2"].map(key => (
            <input
              key={key}
              className="rounded-2xl border border-white/50 bg-white/70 px-3 py-2 text-sm text-brand-midnight placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-sky/40"
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
          className="mt-5 inline-flex rounded-full bg-brand-blue px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
        >
          Save vitals
        </button>
      </div>
    </section>
  );
}
