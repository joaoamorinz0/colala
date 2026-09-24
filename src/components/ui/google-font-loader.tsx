"use client";

import { useEffect } from "react";

export type GoogleFontLoaderProps = {
  fonts?: Array<string | null | undefined>;
};

export function GoogleFontLoader({ fonts = [] }: GoogleFontLoaderProps) {
  useEffect(() => {
    const uniqueFonts = Array.from(
      new Set(
        fonts
          .filter(Boolean)
          .map((font) => font!.trim())
          .filter((font) => font.length > 0),
      ),
    );

    if (!uniqueFonts.length) return;

    const currentLinks = Array.from(
      document.head.querySelectorAll("link[data-google-font-loader='true']"),
    );
    currentLinks.forEach((link) => link.remove());

    const imports = uniqueFonts
      .map((font) => {
        const normalized = font.replace(/\s+/g, "+");
        return `https://fonts.googleapis.com/css2?family=${normalized}:wght@400;500;600;700;800&display=swap`;
      })
      .map((href) => {
        const existing = document.head.querySelector(`link[href="${href}"]`);
        if (existing) return existing;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.setAttribute("data-google-font-loader", "true");
        document.head.appendChild(link);
        return link;
      });

    return () => {
      imports.forEach((link) => link.remove());
    };
  }, [fonts]);

  return null;
}
