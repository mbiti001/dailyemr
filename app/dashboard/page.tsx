import Link from "next/link";

const sections = [
  { title: "Patients", description: "Search and manage patient demographics.", href: "/dashboard/patients" },
  { title: "Triage", description: "Open visits and capture vitals readings.", href: "/dashboard/triage" },
  { title: "Labs", description: "Order and result laboratory tests.", href: "/dashboard/labs" },
  { title: "Billing", description: "Raise invoices and record payments.", href: "/dashboard/billing" }
];

export default function DashboardHome() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sections.map(section => (
        <Link
          key={section.href}
          href={section.href}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow"
        >
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="mt-2 text-sm text-slate-500">{section.description}</p>
        </Link>
      ))}
    </div>
  );
}
