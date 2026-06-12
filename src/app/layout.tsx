import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClientWrapper } from "./client-wrapper";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dia dos Namorados | Premium Experience",
  description:
    "Website cinematografico para celebrar o Dia dos Namorados com animacoes premium.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="antialiased">
        <ClientWrapper>
          <div aria-hidden className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_10%,rgba(236,72,153,0.22),transparent_38%),radial-gradient(circle_at_82%_0%,rgba(147,51,234,0.26),transparent_36%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.2),transparent_44%),linear-gradient(150deg,#0f0a17_4%,#171026_45%,#050308_100%)]" />
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] opacity-10" />
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.5))]" />
        </ClientWrapper>
        {children}
      </body>
    </html>
  );
}
