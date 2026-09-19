import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Income Starter Kit — Turn AI Into Your First Paying Skill",
  description: "Choose one AI service, build a clear offer, and start pursuing your first paid project. A practical 30-day kit with 15 PDFs and 6 Excel tools. ₹499, one time.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
