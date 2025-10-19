import dynamic from "next/dynamic";

const PatientsList = dynamic(() => import("./patients-list"), { ssr: false });

export default function PatientsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Patient Registry</h1>
        <p className="text-sm text-slate-500">
          Search patients across identifiers and quickly start a workflow.
        </p>
      </div>
      <PatientsList />
    </section>
  );
}
