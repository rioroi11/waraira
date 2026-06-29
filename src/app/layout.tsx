import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Shell } from "@/components/Shell";
import { RegistrarSW } from "@/components/RegistrarSW";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waraira · Coordinación civil — Venezuela",
  description:
    "Plataforma offline-first para censar y proteger niños, organizar cordones de cuido, voluntariado, reunificación familiar e insumos. Unir, no dividir.",
  manifest: "/manifest.webmanifest",
  applicationName: "Waraira",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Waraira" },
};

export const viewport: Viewport = {
  themeColor: "#1b6b4f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <ConvexClientProvider>
          <Shell>{children}</Shell>
        </ConvexClientProvider>
        <RegistrarSW />
      </body>
    </html>
  );
}
