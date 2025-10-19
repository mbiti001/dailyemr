import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily EMR",
  description: "Kenya-focused EMR for daily operations"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
