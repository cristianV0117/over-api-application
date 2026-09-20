export type PortfolioBlockType =
  | "hero"
  | "text"
  | "list"
  | "accordion"
  | "embed"
  | "github"
  | "image"
  | "button"
  | "button_group"
  | "project"
  | "contact";

export type PortfolioTheme = {
  background: string;
  accentFrom: string;
  accentTo: string;
  muted: string;
  line: string;
};

/** Posición en cuadrícula bento (12 columnas, filas de altura fija) */
export type PortfolioLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

export type PortfolioBlock = PortfolioLayout & {
  id: string;
  type: PortfolioBlockType;
  /** Orden legacy; la cuadrícula usa x/y */
  order: number;
  config: Record<string, unknown>;
};

/** @deprecated alias */
export type PortfolioSection = PortfolioBlock;
export type PortfolioSectionType = PortfolioBlockType;

export type PortfolioSummary = {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  publicUrl: string | null;
  blockCount: number;
  updatedAt: string;
};

export type PortfolioConfig = PortfolioSummary & {
  theme: PortfolioTheme;
  sections: PortfolioBlock[];
};

export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 48;
export const GRID_GAP = 12;

export const BLOCK_LABELS: Record<PortfolioBlockType, string> = {
  hero: "Hero / Intro",
  text: "Texto",
  list: "Lista",
  accordion: "Acordeón",
  embed: "Embed / iframe",
  github: "GitHub stats",
  image: "Imagen",
  button: "Botón",
  button_group: "Grupo de botones",
  project: "Proyecto + embed",
  contact: "Contacto",
};

export const BLOCK_TYPES: PortfolioBlockType[] = [
  "hero",
  "text",
  "list",
  "accordion",
  "embed",
  "github",
  "image",
  "button",
  "button_group",
  "project",
  "contact",
];
