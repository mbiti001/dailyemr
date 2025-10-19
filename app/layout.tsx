import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily EMR",
  description: "Kenya-focused EMR for daily operations"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-brand-cloud text-slate-900 antialiased">
        <div className="brand-glow pointer-events-none fixed inset-0 -z-10 opacity-70" aria-hidden />
        {children}
      </body>
    </html>
  );
}
