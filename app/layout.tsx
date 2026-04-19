import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ioTORQ LEAN Report Dashboard",
  description: "Production-line reporting dashboard for Paneva's ioTORQ LEAN take-home assignment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
