"use client";

import useSWR from "swr";
import { type ChangeEvent, useState } from "react";

type PatientListItem = {
  id: string;
  firstName: string;
  lastName: string;
  sex: string;
  dateOfBirth: string;
};

type PatientsResponse = {
  data: PatientListItem[];
  total: number;
  page: number;
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PatientsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const url = `/api/patients?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;

  const { data, error } = useSWR<PatientsResponse>(url, fetcher);

  if (error)
    return (
      <div className="rounded-3xl border border-rose-200/50 bg-rose-50/80 p-6 text-sm text-rose-700">
        Error loading patients.
      </div>
    );
  if (!data)
    return (
      <div className="h-48 animate-pulse rounded-3xl border border-white/50 bg-white/50" />
    );

  const { total } = data;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
  <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-brand-midnight">Patients</h3>
          <p className="text-sm text-slate-500">Search patients by name, UPI, or national ID.</p>
        </div>
        <input
          className="w-full rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm text-brand-midnight placeholder:text-slate-400 shadow-[0_8px_24px_-16px_rgba(15,23,42,0.24)] focus:border-brand-sky focus:outline-none focus:ring-2 focus:ring-brand-sky/40 sm:w-60"
          placeholder="Search patients..."
          value={search}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="mt-5 max-h-96 overflow-auto rounded-2xl border border-white/40">
        <table className="w-full text-sm">
          <thead className="bg-brand-sky/15 text-left uppercase tracking-[0.2em] text-[11px] text-brand-midnight/70">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-center">Sex</th>
              <th className="px-4 py-3 font-medium text-center">DOB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/60 bg-white/80">
            {data.data?.length ? (
              data.data.map(patient => (
                <tr key={patient.id} className="hover:bg-brand-sky/10">
                  <td className="px-4 py-3 font-medium text-brand-midnight">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{patient.sex}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{patient.dateOfBirth?.slice(0, 10)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  No patients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <button
          disabled={page <= 1}
          onClick={() => setPage(prev => prev - 1)}
          className="inline-flex items-center rounded-full border border-brand-sky/40 px-4 py-2 font-semibold text-brand-blue transition disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          Page {data.page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="inline-flex items-center rounded-full border border-brand-sky/40 px-4 py-2 font-semibold text-brand-blue transition disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  );
}
