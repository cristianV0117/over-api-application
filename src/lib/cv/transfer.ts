import { createSection, normalizeHeader, normalizeSectionScale, normalizeTheme } from "./defaults";
import type { CvColumn, CvHeader, CvSection, CvSectionType, CvTheme } from "./types";
import { SECTION_TYPES } from "./types";

export const CV_EXPORT_KIND = "overapp-cv";
export const CV_EXPORT_VERSION = 1;

export type CvExportPayload = {
  kind: typeof CV_EXPORT_KIND;
  version: number;
  name: string;
  locale: "es" | "en";
  theme: CvTheme;
  header: CvHeader;
  sections: CvSection[];
};

const SECTION_TYPE_SET = new Set<string>(SECTION_TYPES);

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function newSectionId(type: string, index: number) {
  return `${type}-${Date.now().toString(36)}-${index.toString(36)}`;
}

export function toExportPayload(config: {
  name: string;
  locale: "es" | "en";
  theme: CvTheme;
  header: CvHeader;
  sections: CvSection[];
}): CvExportPayload {
  return {
    kind: CV_EXPORT_KIND,
    version: CV_EXPORT_VERSION,
    name: config.name.trim() || "Mi CV",
    locale: config.locale === "en" ? "en" : "es",
    theme: normalizeTheme(config.theme),
    header: normalizeHeader(config.header),
    sections: config.sections.map((section, index) => ({
      ...section,
      id: section.id || newSectionId(section.type, index),
      scale: normalizeSectionScale(section.scale),
      breakBefore: Boolean(section.breakBefore),
      config: section.config ?? {},
    })),
  };
}

export function parseImportedCv(raw: unknown): Omit<CvExportPayload, "kind" | "version"> {
  const data = asRecord(raw);
  if (!data) throw new Error("El archivo no es un CV válido.");

  const nested = asRecord(data.cv) ?? data;
  const themeRaw = asRecord(nested.theme);
  const headerRaw = asRecord(nested.header);
  const sectionsRaw = Array.isArray(nested.sections) ? nested.sections : null;

  if (!themeRaw && !headerRaw && !sectionsRaw) {
    throw new Error("El archivo no incluye configuración ni contenido de un CV de OverApp.");
  }

  const sections: CvSection[] = (sectionsRaw ?? []).map((item, index) => {
    const row = asRecord(item);
    if (!row) throw new Error("Hay una sección dañada en el archivo.");
    const type = String(row.type ?? "");
    if (!SECTION_TYPE_SET.has(type)) {
      throw new Error(`Tipo de sección no soportado: ${type || "(vacío)"}`);
    }
    const column: CvColumn = row.column === "main" ? "main" : "sidebar";
    const fallback = createSection(type as CvSectionType, []);
    return {
      id: String(row.id || newSectionId(type, index)).slice(0, 64),
      type: type as CvSectionType,
      column,
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index,
      visible: row.visible !== false,
      title: String(row.title ?? fallback.title).slice(0, 80),
      scale: normalizeSectionScale(row.scale),
      breakBefore: Boolean(row.breakBefore),
      config: asRecord(row.config) ?? fallback.config,
    };
  });

  if (!sections.length) {
    throw new Error("El archivo no trae secciones.");
  }

  const name = String(nested.name ?? "Mi CV importado")
    .trim()
    .slice(0, 80) || "Mi CV importado";

  return {
    name,
    locale: nested.locale === "en" ? "en" : "es",
    theme: normalizeTheme(themeRaw ?? undefined),
    header: normalizeHeader(headerRaw ?? undefined),
    sections,
  };
}

export function downloadCvExport(payload: CvExportPayload) {
  const slug = (payload.name || "cv")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "cv";
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slug}.overapp-cv.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function readCvFile(file: File): Promise<Omit<CvExportPayload, "kind" | "version">> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("El archivo no es un JSON válido.");
  }
  return parseImportedCv(parsed);
}
