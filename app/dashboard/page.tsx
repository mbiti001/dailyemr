import Link from "next/link";
import type { Route } from "next";

import { Sparkline } from "@/components/sparkline";
import { getDashboardStats } from "@/lib/dashboard";

type DashboardSection = {
  title: string;
  description: string;
  href: Route;
};

const sections: DashboardSection[] = [
  { title: "Patients", description: "Search and manage patient demographics.", href: "/dashboard/patients" },
  { title: "Triage", description: "Open visits and capture vitals readings.", href: "/dashboard/triage" },
  { title: "Labs", description: "Order and result laboratory tests.", href: "/dashboard/labs" },
  { title: "Billing", description: "Raise invoices and record payments.", href: "/dashboard/billing" }
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("en-KE");

function formatCurrency(amountCents: number) {
  return currencyFormatter.format(amountCents / 100);
}

function formatDelta(delta: number) {
  if (delta === 0) return "0";
  const formatted = numberFormatter.format(Math.abs(delta));
  return `${delta > 0 ? "+" : "-"}${formatted}`;
}

function deltaTone(delta: number) {
  if (delta === 0) return "text-slate-500";
  return delta > 0 ? "text-emerald-600" : "text-rose-600";
}

export default async function DashboardHome() {
  const stats = await getDashboardStats();

  const metricCards = [
    {
      title: "Registered patients",
      value: numberFormatter.format(stats.totals.patients),
      detail: `${numberFormatter.format(stats.totals.visitsAllTime)} lifetime visits`
    },
    {
      title: "Active visits",
      value: numberFormatter.format(stats.totals.activeVisits),
      detail: `${numberFormatter.format(stats.totals.visitsToday)} started today`
    },
    {
      title: "Revenue this month",
      value: formatCurrency(stats.revenue.thisMonth),
      detail: `${formatDelta(stats.revenue.change)} vs last month`,
      tone: deltaTone(stats.revenue.change)
    },
    {
      title: "Outstanding balance",
      value: formatCurrency(stats.revenue.outstanding),
      detail: `${numberFormatter.format(stats.labs.pending)} labs awaiting results`
    }
  ];

  const visitTrendValues = stats.visits.trend.map(point => point.count);

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(card => (
          <article
            key={card.title}
            className="rounded-3xl border border-white/50 bg-white/85 p-6 shadow-card ring-1 ring-brand-sky/10 backdrop-blur"
          >
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-midnight">{card.value}</p>
            <p className={`mt-3 text-xs font-medium uppercase tracking-[0.22em] ${card.tone ?? "text-slate-500"}`}>
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-3xl border border-white/50 bg-white/85 p-6 shadow-card ring-1 ring-brand-sky/10 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-brand-midnight">Visit volume (7 days)</h2>
              <p className="text-sm text-slate-500">
                {numberFormatter.format(stats.visits.lastSevenDays)} visits • {formatDelta(stats.visits.change)} vs prior week
              </p>
            </div>
            <Sparkline values={visitTrendValues} />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-7">
            {stats.visits.trend.map(point => (
              <div key={point.date} className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{point.label}</p>
                <p className="mt-1 text-lg font-semibold text-brand-midnight">{point.count}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-white/50 bg-white/85 p-6 shadow-card ring-1 ring-brand-sky/10 backdrop-blur">
          <h2 className="text-lg font-semibold text-brand-midnight">Lab operations</h2>
          <p className="text-sm text-slate-500">Monitoring open investigations and turnaround time.</p>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-brand-sky/20 bg-brand-sky/10 px-4 py-3">
              <dt className="text-sm font-medium text-brand-midnight">Pending samples</dt>
              <dd className="text-lg font-semibold text-brand-midnight">{numberFormatter.format(stats.labs.pending)}</dd>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
              <dt className="text-sm font-medium text-emerald-700">Completed last 24h</dt>
              <dd className="text-lg font-semibold text-emerald-700">{numberFormatter.format(stats.labs.completed24h)}</dd>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs leading-relaxed text-slate-500">
              Keep pending tests under 10 and turnaround under 6 hours for premium SLA status.
            </div>
          </dl>
        </article>
      </section>

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
    </div>
  );
}
