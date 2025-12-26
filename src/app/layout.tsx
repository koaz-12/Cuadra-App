import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cuadra",
  description: "Tu salud financiera, simplificada.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cuadra",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0F172A",
};

import { BottomNav } from "@/components/organisms/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { OfflineBanner } from "@/components/molecules/OfflineBanner";
import { ThemeManager } from "@/components/atoms/ThemeManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" style={{ colorScheme: 'light' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 pb-24`}
      >
        <ThemeManager />
        <AuthProvider>
          <main className="min-h-screen">
            {children}
          </main>
          <OfflineBanner />
          <div className="">
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
