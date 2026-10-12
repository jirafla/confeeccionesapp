import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Confección App",
  description: "Gestión de talleres de confección y lotes de producción",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${inter.className} h-full bg-[#F8FAFC]`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
