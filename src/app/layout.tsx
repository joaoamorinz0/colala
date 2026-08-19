import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://colala-amber.vercel.app"),

  title: {
    default: "Colalá",
    template: "%s | Colalá",
  },

  description:
    "Encontre experiências incríveis perto de você e compartilhe suas descobertas.",

  openGraph: {
    title: "Colalá — Descubra lugares pelas pessoas, não pelo algoritmo",
    description:
      "Encontre experiências incríveis perto de você e compartilhe suas descobertas.",
    url: "https://colala-amber.vercel.app",
    siteName: "Colalá",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "https://colala-amber.vercel.app/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "Colalá",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Colalá — Descubra lugares pelas pessoas, não pelo algoritmo",
    description:
      "Encontre experiências incríveis perto de você e compartilhe suas descobertas.",
    images: ["https://colala-amber.vercel.app/icons/icon-512.png"],
  },

  applicationName: "Colalá",

  generator: "Next.js",

  keywords: [
    "Colalá",
    "lugares",
    "restaurantes",
    "cafés",
    "bares",
    "experiências",
    "descobrir lugares",
  ],

  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    title: "Colalá",
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },

  icons: {
    icon: [
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: {
      url: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#be3d25",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
