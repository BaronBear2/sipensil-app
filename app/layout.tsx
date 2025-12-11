// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import Inter
import "./globals.css";

// 2. Configure Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIPENSIL - Dinas Ketenagakerjaan",
  description: "Sistem Informasi Pelayanan Sipil dan Ketenagakerjaan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* 3. Apply Inter class to the body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}