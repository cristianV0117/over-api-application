import type { LayoutItem } from "react-grid-layout/legacy";
import { verticalCompactor } from "react-grid-layout";
import type { PortfolioBlock, PortfolioBlockType } from "./types";
import { GRID_COLS } from "./types";

export function blocksToLayout(blocks: PortfolioBlock[]): LayoutItem[] {
  return blocks.map((b) => ({
    i: b.id,
    x: b.x,
    y: b.y,
    w: b.w,
    h: b.h,
    minW: b.minW ?? 2,
    minH: b.minH ?? 2,
  }));
}

export function mergeLayoutIntoBlocks(blocks: PortfolioBlock[], layout: readonly LayoutItem[]): PortfolioBlock[] {
  const byId = new Map(layout.map((l) => [l.i, l]));
  return blocks.map((b, i) => {
    const l = byId.get(b.id);
    if (!l) return { ...b, order: i };
    return { ...b, x: l.x, y: l.y, w: l.w, h: l.h, order: i };
  });
}

export function layoutEqual(a: readonly LayoutItem[], b: readonly LayoutItem[]): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(b.map((item) => [item.i, item]));
  return a.every((item) => {
    const other = byId.get(item.i);
    if (!other) return false;
    return item.x === other.x && item.y === other.y && item.w === other.w && item.h === other.h;
  });
}

export function blocksLayoutSignature(blocks: Pick<PortfolioBlock, "id" | "x" | "y" | "w" | "h">[]): string {
  return blocks.map((b) => `${b.id}:${b.x},${b.y},${b.w},${b.h}`).join("|");
}

const DEFAULT_HEIGHTS: Record<string, number> = {
  hero: 5,
  text: 3,
  list: 4,
  accordion: 6,
  embed: 8,
  github: 4,
  image: 4,
  button: 2,
  button_group: 2,
  project: 8,
  contact: 4,
  about: 4,
  experience: 6,
  projects: 8,
  github_stats: 4,
  custom: 3,
};

export function defaultBlockHeight(type: string): number {
  return DEFAULT_HEIGHTS[type] ?? 4;
}

export function nextGridRow(sections: Pick<PortfolioBlock, "y" | "h">[]): number {
  if (!sections.length) return 0;
  return Math.max(...sections.map((s) => s.y + s.h));
}

export function normalizeBlockLayout(
  section: Partial<PortfolioBlock> & { id: string; type: string; order: number; config: Record<string, unknown> },
  index: number,
  stackedY: { value: number }
): PortfolioBlock {
  const h = section.h ?? defaultBlockHeight(section.type);
  const hasLayout =
    typeof section.x === "number" &&
    typeof section.y === "number" &&
    typeof section.w === "number" &&
    typeof section.h === "number";

  const y = hasLayout ? section.y! : stackedY.value;
  if (!hasLayout) stackedY.value += h;

  return {
    id: section.id,
    type: section.type as PortfolioBlockType,
    order: section.order ?? index,
    config: section.config ?? {},
    x: section.x ?? 0,
    y,
    w: section.w ?? GRID_COLS,
    h,
    minW: section.minW ?? 2,
    minH: section.minH ?? 2,
  };
}

export function normalizeSections(
  sections: Array<Partial<PortfolioBlock> & { id: string; type: string; order: number; config: Record<string, unknown> }>
): PortfolioBlock[] {
  const sorted = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const stackedY = { value: 0 };
  return sorted.map((s, i) => normalizeBlockLayout(s, i, stackedY));
}

/** Migra tipos legacy a widgets genéricos */
export function migrateBlockType(type: string, config: Record<string, unknown>): { type: PortfolioBlockType; config: Record<string, unknown> } {
  switch (type) {
    case "about":
      return { type: "list", config: { title: config.title ?? "Sobre mí", items: config.items ?? [] } };
    case "custom":
      return { type: "text", config: { title: config.title ?? "", body: config.body ?? "", align: "left" } };
    case "github_stats":
      return { type: "github", config: { title: config.title ?? "GitHub", username: config.username ?? "" } };
    case "experience": {
      const entries = Array.isArray(config.entries) ? config.entries : [];
      return {
        type: "accordion",
        config: {
          title: config.title ?? "Experiencia",
          hint: config.hint ?? "",
          items: entries.map((e: Record<string, unknown>) => ({
            title: e.role ?? "",
            subtitle: [e.company, e.period].filter(Boolean).join(" · "),
            logoUrl: e.logoUrl ?? "",
            body: Array.isArray(e.bullets) ? (e.bullets as string[]).join("\n") : "",
          })),
        },
      };
    }
    case "projects": {
      const items = Array.isArray(config.items) ? config.items : [];
      if (items.length <= 1) {
        const p = (items[0] ?? {}) as Record<string, unknown>;
        return {
          type: "project",
          config: {
            title: String(p.name ?? config.title ?? "Proyecto"),
            tagline: p.tagline ?? "",
            embedUrl: p.embedUrl ?? p.url ?? "",
          },
        };
      }
      return {
        type: "accordion",
        config: {
          title: config.title ?? "Proyectos",
          items: items.map((p: Record<string, unknown>) => ({
            title: p.name ?? "Proyecto",
            subtitle: p.tagline ?? "",
            body: p.embedUrl ? `Embed: ${p.embedUrl}` : "",
          })),
        },
      };
    }
    default:
      return { type: type as PortfolioBlockType, config };
  }
}

export function migrateSections(sections: PortfolioBlock[]): PortfolioBlock[] {
  return sections.map((s) => {
    const migrated = migrateBlockType(s.type, s.config);
    return { ...s, type: migrated.type, config: migrated.config };
  });
}

/** Normaliza tipos, rellena layout faltante y compacta (misma lógica que el editor) */
export function prepareBlocksForDisplay(
  sections: Array<Partial<PortfolioBlock> & { id: string; type: string; order: number; config: Record<string, unknown> }>
): PortfolioBlock[] {
  const normalized = normalizeSections(sections);
  const migrated = migrateSections(normalized);
  const compacted = verticalCompactor.compact(blocksToLayout(migrated), GRID_COLS);
  return mergeLayoutIntoBlocks(migrated, compacted);
}
