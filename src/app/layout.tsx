import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Colalá",
    template: "%s | Colalá",
  },
  description:
    "Aplicativo mobile-first para descoberta de cafés, restaurantes, bares e experiências.",
};

export const viewport: Viewport = {
  themeColor: "#be3d25",
  width: "device-width",
  initialScale: 1,
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
