import Link from "next/link";

const dashboardLinks = [
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/triage", label: "Triage" },
  { href: "/dashboard/labs", label: "Labs" },
  { href: "/dashboard/billing", label: "Billing" }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <header>
        <h1 className="text-4xl font-bold">Daily EMR</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          A lightweight facility EMR tailored for the Kenyan SHA/SHIF era. Jump into a workflow below to start capturing data.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {dashboardLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-400 hover:shadow"
          >
            <h2 className="text-xl font-semibold">{link.label}</h2>
            <p className="mt-2 text-sm text-slate-500">Open the {link.label.toLowerCase()} workspace.</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
