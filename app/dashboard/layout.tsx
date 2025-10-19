import Link from "next/link";
import { PropsWithChildren } from "react";

import { DashboardNavLink } from "@/components/dashboard-nav-link";

const links = [
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/triage", label: "Triage" },
  { href: "/dashboard/labs", label: "Labs" },
  { href: "/dashboard/billing", label: "Billing" }
];

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-72 shrink-0 flex-col justify-between bg-[rgba(12,23,46,0.95)] p-8 text-white shadow-2xl shadow-brand-midnight/60 md:flex">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-sky/30 text-brand-sky">
              <span className="text-lg font-semibold">DE</span>
            </div>
            <div>
              <p className="text-lg font-semibold">Daily EMR</p>
              <p className="text-xs uppercase tracking-[0.26em] text-white/60">SHA/SHIF</p>
            </div>
          </Link>
          <nav className="mt-10 flex flex-col gap-1 text-sm">
            {links.map(link => (
              <DashboardNavLink key={link.href} href={link.href}>
                {link.label}
              </DashboardNavLink>
            ))}
          </nav>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/70">
          <p className="font-semibold text-white">Continuous improvements</p>
          <p className="mt-2">
            Deploy via GitHub Actions & Vercel for fast feedback and automatic previews every push.
          </p>
        </div>
      </aside>
      <main className="relative flex-1 bg-gradient-to-br from-brand-cloud via-white to-brand-sky/10 px-4 py-6 md:px-12 md:py-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-brand-radial" aria-hidden />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          {children}
        </div>
      </main>
    </div>
  );
}
