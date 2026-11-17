import type { Metadata } from "next";
import { Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/auto-refresh";
import { Sidebar, SidebarFallback } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Indra",
  description: "Read-only homelab dashboard for Avi's machines.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-AU"
      className={`dark ${inter.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body className="min-h-dvh p-4 text-[13px] leading-[1.45] md:p-[76px]">
        <div className="mx-auto flex min-h-[calc(100dvh-152px)] max-w-[1331px] flex-col overflow-hidden rounded-xl bg-shell shadow-[0_0_0_1px_var(--color-rim),0_24px_80px_-24px_rgb(5_5_12/0.7)] md:flex-row">
          <Suspense fallback={<SidebarFallback />}>
            <Sidebar />
          </Suspense>
          <main className="min-w-0 flex-1 px-4 pt-8 pb-16 md:px-6 md:pt-[49px]">{children}</main>
        </div>
        <AutoRefresh />
      </body>
    </html>
  );
}
