import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Confección App",
  description: "Gestión de talleres de confección y lotes de producción",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${inter.className} h-full bg-[#F8FAFC]`}>
        <AppShell>
          {children}
        </AppShell>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
