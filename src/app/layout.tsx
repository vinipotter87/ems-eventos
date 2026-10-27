import type { Metadata, Viewport } from "next";
import "@fontsource-variable/sora";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eventos EMS | Checklist",
  description: "Organização de eventos médicos EMS: checklist por evento, do planejamento à prestação de contas.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1F2D44",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
