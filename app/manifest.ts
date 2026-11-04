import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TrashDex",
    short_name: "TrashDex",
    description: "Scan one waste item and get Indonesia disposal guidance.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5ead8",
    theme_color: "#f5ead8",
    lang: "en",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
