import type { PortfolioBlock, PortfolioBlockType, PortfolioTheme } from "./types";
import { GRID_COLS } from "./types";
import { defaultBlockHeight, nextGridRow } from "./layout";

export const DEFAULT_PORTFOLIO_THEME: PortfolioTheme = {
  background: "#060608",
  accentFrom: "#6b2fb8",
  accentTo: "#c94b6d",
  muted: "rgba(255,255,255,0.62)",
  line: "rgba(255,255,255,0.06)",
};

export function createBlock(type: PortfolioBlockType, sections: PortfolioBlock[]): PortfolioBlock {
  const id = `${type}-${Date.now()}`;
  const y = nextGridRow(sections);
  const h = defaultBlockHeight(type);
  const base: PortfolioBlock = {
    id,
    type,
    order: sections.length,
    x: 0,
    y,
    w: GRID_COLS,
    h,
    minW: 2,
    minH: 2,
    config: {},
  };

  switch (type) {
    case "hero":
      return {
        ...base,
        config: {
          greeting: "HI THERE 👋",
          title: "Tu nombre — rol",
          subtitle: "Bienvenido a mi portafolio",
          description: "",
          imageUrl: "",
          logoUrl: "",
        },
      };
    case "text":
      return { ...base, config: { title: "Título", body: "Escribe aquí tu contenido…", align: "left" } };
    case "list":
      return { ...base, config: { title: "Lista", items: ["Primer ítem", "Segundo ítem"] } };
    case "accordion":
      return {
        ...base,
        h: 6,
        config: {
          title: "Acordeón",
          hint: "Toca cada ítem para ver el detalle…",
          items: [{ title: "Ítem 1", subtitle: "Subtítulo", logoUrl: "", body: "Contenido del ítem…" }],
        },
      };
    case "embed":
      return { ...base, h: 8, config: { title: "Embed", url: "", height: 360 } };
    case "github":
      return { ...base, config: { title: "GitHub", username: "" } };
    case "image":
      return { ...base, config: { title: "", imageUrl: "", linkUrl: "", alt: "" } };
    case "button":
      return { ...base, h: 2, config: { label: "Ver más", url: "#", variant: "contained", align: "center" } };
    case "button_group":
      return {
        ...base,
        h: 2,
        config: {
          align: "center",
          buttons: [
            { label: "GitHub", url: "https://github.com", variant: "outlined" },
            { label: "LinkedIn", url: "https://linkedin.com", variant: "outlined" },
          ],
        },
      };
    case "project":
      return { ...base, h: 8, config: { title: "Mi proyecto", tagline: "Descripción breve", embedUrl: "" } };
    case "contact":
      return { ...base, config: { title: "Contacto", email: "", links: [{ label: "LinkedIn", url: "" }] } };
    default:
      return base;
  }
}

/** @deprecated */
export const createSection = createBlock;

export const DEFAULT_BLOCKS: PortfolioBlock[] = [
  {
    id: "hero-1",
    type: "hero",
    order: 0,
    x: 0,
    y: 0,
    w: 12,
    h: 5,
    minW: 4,
    minH: 3,
    config: {
      greeting: "HI THERE 👋",
      title: "Tu nombre — rol",
      subtitle: "Bienvenido a mi portafolio",
      description: "Presentación personal configurable desde OVER APP.",
      imageUrl: "",
      logoUrl: "",
    },
  },
  {
    id: "list-1",
    type: "list",
    order: 1,
    x: 0,
    y: 5,
    w: 6,
    h: 4,
    minW: 3,
    minH: 2,
    config: {
      title: "Sobre mí",
      items: ["Desarrollador full stack.", "Apasionado por el backend."],
    },
  },
  {
    id: "github-1",
    type: "github",
    order: 2,
    x: 6,
    y: 5,
    w: 6,
    h: 4,
    minW: 3,
    minH: 2,
    config: { title: "GitHub", username: "cristianV0117" },
  },
  {
    id: "accordion-1",
    type: "accordion",
    order: 3,
    x: 0,
    y: 9,
    w: 12,
    h: 6,
    minW: 4,
    minH: 3,
    config: {
      title: "Experiencia / detalle",
      hint: "Toca cada ítem…",
      items: [],
    },
  },
  {
    id: "contact-1",
    type: "contact",
    order: 4,
    x: 0,
    y: 15,
    w: 12,
    h: 4,
    minW: 3,
    minH: 2,
    config: { title: "Contacto", email: "", links: [] },
  },
];
