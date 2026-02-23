import type { Metadata } from "next";
import { Poppins, Nunito } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
})

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "HabitFlow — Track · Build · Grow",
  description: "A habit tracker and daily time management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${nunito.variable} antialiased bg-zinc-950 text-zinc-100`}
      >
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

