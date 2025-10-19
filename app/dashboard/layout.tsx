import Link from "next/link";
import { PropsWithChildren } from "react";

const links = [
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/triage", label: "Triage" },
  { href: "/dashboard/labs", label: "Labs" },
  { href: "/dashboard/billing", label: "Billing" }
];

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white/80 p-6 shadow-sm md:block">
        <h2 className="text-lg font-semibold">Daily EMR</h2>
        <nav className="mt-6 flex flex-col gap-2 text-sm">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 px-4 py-6 md:px-8 md:py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {children}
        </div>
      </main>
    </div>
  );
}
