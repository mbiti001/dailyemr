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

  if (error) return <div>Error loading patients.</div>;
  if (!data) return <div className="animate-pulse">Loading...</div>;

  const { total } = data;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h3 className="font-semibold mb-2">Patients</h3>
      <input
        className="border rounded p-2 w-full mb-2"
        placeholder="Search patients..."
        value={search}
  onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left">Name</th>
              <th>Sex</th>
              <th>DOB</th>
            </tr>
          </thead>
          <tbody>
            {data.data?.length ? (
              data.data.map(patient => (
                <tr key={patient.id} className="border-t">
                  <td className="py-1">
                    {patient.firstName} {patient.lastName}
                  </td>
                  <td className="text-center">{patient.sex}</td>
                  <td className="text-center">{patient.dateOfBirth?.slice(0, 10)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-3 text-slate-500">
                  No patients
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <button
          disabled={page <= 1}
          onClick={() => setPage(prev => prev - 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {data.page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(prev => prev + 1)}
          className="px-2 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
