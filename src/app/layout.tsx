import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MINEDU-NC / EPST — Gestion Documentaire Scolaire",
  description:
    "Plateforme de gestion documentaire scolaire - MINEDU-NC / EPST. Centralisation des bulletins, fiches, souches et cartes d'élèves.",
  keywords: ["MINEDU-NC", "EPST", "gestion documentaire", "bulletins", "scolaire", "ministère", "enseignement"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-[var(--color-surface-alt)]">{children}</body>
    </html>
  );
}
