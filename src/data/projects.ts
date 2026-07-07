export type ProjectTag = "game" | "brand" | "web" | "video";

export const TAG_COLORS: Record<ProjectTag, string> = {
  game: "#2535E8",
  brand: "#FF28A8",
  web: "#00C44E",
  video: "#ff940f",
};

export interface Project {
  label: string;
  href?: string; // undefined = not yet linked
  preview?: string; // path under /img/, e.g. "/img/etea-preview.jpg"
  video?: string; // path under /video/, plays once the panel is open
  tags?: ProjectTag[];
  external?: boolean;
}

export const projects: Project[] = [
  {
    label: "astra",
    // href: "/projects/astra",
    preview: "/img/astra.webp",
    tags: ["brand"],
  },
  {
    label: "kiwi's shop",
    href: "https://shop.kiwis.page/",
    preview: "/img/kiwi-shop.webp",
    tags: ["brand", "web"],
    external: true,
  },
  {
    label: "etea.cafe",
    href: "https://etea.cafe",
    preview: "/img/etea-cafe.webp",
    tags: ["game", "web"],
    external: true,
  },
  {
    label: "spread the love",
    href: "https://store.steampowered.com/app/3852520/Spread_The_Love/",
    preview: "/img/spread-the-love.webp",
    video: "/video/stl.webm",
    tags: ["game"],
    external: true,
  },
  {
    label: "etea",
    // href: "/projects/etea",
    preview: "/img/etea.webp",
    tags: ["game"],
  },
  {
    label: "infisical",
    href: "https://infisical.com",
    video: "/video/infisical.webm",
    tags: ["web", "video"],
    external: true,
  },
  {
    label: "coderabbit",
    video: "/video/coderabbit.webm",
    tags: ["video"],
  },
  {
    label: "circleback",
    video: "/video/circleback.webm",
    tags: ["video"],
  },
  // more coming: maybe some personal work too
  // drop the file in public/video/ then uncomment/fill in `video: "/video/yourfile.webm"` above
];
