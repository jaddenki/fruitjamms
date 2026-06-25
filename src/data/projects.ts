export interface Project {
  label: string;
  href?: string; // undefined = not yet linked
  preview?: string; // path under /img/, e.g. "/img/etea-preview.jpg"
  external?: boolean;
}

export const projects: Project[] = [
  {
    label: "astra",
    // href: "/projects/astra",
    preview: "/img/astra.webp",
  },
  {
    label: "etea.cafe",
    href: "https://etea.cafe",
    preview: "/img/etea-cafe.webp",
    external: true,
  },
  {
    label: "spread the love",
    href: "/projects/spread-the-love",
    preview: "/img/spread-the-love.webp",
  },
  {
    label: "etea",
    // href: "/projects/etea",
    preview: "/img/etea.webp",
  },
];
