import Link from "next/link";

const features = [
  {
    title: "Kenya-first workflows",
    description: "SHA/SHIF billing, MFL facility context, and DHIS2-ready exports built in from day one."
  },
  {
    title: "Lightning triage",
    description: "Capture vitals, open visits, and route orders in seconds with an uncluttered interface."
  },
  {
    title: "Claims-ready ledger",
    description: "Track invoices, payments, and batches with a clear audit trail for reimbursements."
  }
];

const dashboardLinks = [
  { href: "/dashboard/patients", label: "Patients", blurb: "Search, register, and review charts." },
  { href: "/dashboard/triage", label: "Triage", blurb: "Start visits and log vitals fast." },
  { href: "/dashboard/labs", label: "Labs", blurb: "Order, receive, and result investigations." },
  { href: "/dashboard/billing", label: "Billing", blurb: "Close out claims and cash payments." }
];

export default function HomePage() {
  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-16 px-6 pb-20 pt-24 sm:px-10 lg:px-20">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-[420px] w-full max-w-4xl rounded-[48px] bg-brand-sheen blur-3xl opacity-90" aria-hidden />

      <header className="overflow-hidden rounded-3xl border border-white/30 bg-[rgba(12,23,46,0.92)] p-10 text-white shadow-card backdrop-blur-lg md:p-14">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-sky">
          SHA/SHIF era ready
        </span>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
          Every patient journey, beautifully organised for Kenyan facilities.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
          Daily EMR stitches together clinical, laboratory, pharmacy, and billing moments so your team can focus on patients—not paper.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/triage"
            className="inline-flex items-center justify-center rounded-full bg-brand-sky px-6 py-3 text-sm font-semibold text-brand-midnight shadow-[0_22px_48px_-18px_rgba(56,189,248,0.62)] transition hover:shadow-[0_26px_60px_-18px_rgba(56,189,248,0.7)]"
          >
            Launch workspace
          </Link>
          <Link
            href="/dashboard/patients"
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Browse patient registry
          </Link>
        </div>
        <dl className="mt-10 grid gap-4 text-sm text-white/70 sm:grid-cols-3">
          <div>
            <dt className="uppercase tracking-[0.2em] text-[11px] text-white/50">Visits tracked</dt>
            <dd className="text-2xl font-semibold text-white">50K+</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.2em] text-[11px] text-white/50">Labs resolved</dt>
            <dd className="text-2xl font-semibold text-white">24K</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.2em] text-[11px] text-white/50">Claims matched</dt>
            <dd className="text-2xl font-semibold text-white">92%</dd>
          </div>
        </dl>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map(feature => (
          <article
            key={feature.title}
            className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-card ring-1 ring-brand-sky/10 backdrop-blur"
          >
            <h2 className="text-lg font-semibold text-brand-midnight">{feature.title}</h2>
            <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-3xl border border-transparent bg-white p-6 shadow-card transition hover:-translate-y-1 hover:bg-brand-sky/10 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-sky/25 text-brand-navy">
              <span className="text-lg font-semibold">{link.label[0]}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-brand-midnight">{link.label}</h3>
            <p className="mt-2 text-sm text-slate-600">{link.blurb}</p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-blue">
              Open {link.label.toLowerCase()} →
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
