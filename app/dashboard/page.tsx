import Link from "next/link";

const sections = [
  { title: "Patients", description: "Search and manage patient demographics.", href: "/dashboard/patients" },
  { title: "Triage", description: "Open visits and capture vitals readings.", href: "/dashboard/triage" },
  { title: "Labs", description: "Order and result laboratory tests.", href: "/dashboard/labs" },
  { title: "Billing", description: "Raise invoices and record payments.", href: "/dashboard/billing" }
];

export default function DashboardHome() {
  return (
    <section className="grid gap-5 sm:grid-cols-2">
      {sections.map(section => (
        <Link
          key={section.href}
          href={section.href}
          className="group rounded-3xl border border-white/40 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/5 transition hover:-translate-y-1 hover:bg-white/95 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sky/20 text-brand-navy">
            <span className="text-lg font-semibold">{section.title[0]}</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-brand-midnight">{section.title}</h2>
          <p className="mt-2 text-sm text-slate-600">{section.description}</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue opacity-0 transition group-hover:opacity-100">
            Enter workspace →
          </span>
        </Link>
      ))}
    </section>
  );
}
