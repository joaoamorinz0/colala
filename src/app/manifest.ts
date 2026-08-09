import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Colalá",
    short_name: "Colalá",
    description:
      "Descubra cafés, restaurantes, bares e novas experiências perto de você.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#be3d25",
    orientation: "portrait",
    lang: "pt-BR",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
