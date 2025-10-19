"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import classNames from "classnames";

type DashboardNavLinkProps = PropsWithChildren<{
  href: Route;
}>;

export function DashboardNavLink({ href, children }: DashboardNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={classNames(
        "rounded-xl px-4 py-3 font-medium transition",
        isActive
          ? "bg-white text-brand-midnight shadow-[0_18px_32px_-20px_rgba(56,189,248,0.55)]"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}
