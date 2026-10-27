import { CV_PALETTES } from "./palettes";
import type { CvColumn, CvHeader, CvSection, CvSectionType, CvTheme } from "./types";
import { SECTION_LABELS } from "./types";

export const DEFAULT_CV_THEME: CvTheme = { ...CV_PALETTES[0].theme };

export function normalizeTheme(theme?: Partial<CvTheme> | null): CvTheme {
  return {
    ...DEFAULT_CV_THEME,
    ...theme,
    fontFamily: theme?.fontFamily || DEFAULT_CV_THEME.fontFamily,
  };
}

export function normalizeHeader(header?: Partial<CvHeader> | null): CvHeader {
  return {
    fullName: header?.fullName ?? "",
    role: header?.role ?? "",
    location: header?.location ?? "",
    phone: header?.phone ?? "",
    email: header?.email ?? "",
    photoDataUrl: header?.photoDataUrl ?? "",
    showPhoto: Boolean(header?.showPhoto),
  };
}

export function emptyConfig(type: CvSectionType): Record<string, unknown> {
  switch (type) {
    case "about":
    case "custom":
      return { text: "" };
    case "personal":
      return { items: [{ label: "", value: "" }] };
    case "links":
      return { items: [{ label: "", url: "" }] };
    case "education":
      return { items: [{ title: "", place: "", year: "", detail: "" }] };
    case "skills":
      return { items: [""] };
    case "icons":
      return { items: ["php", "js", "ts", "mysql"] };
    case "languages":
      return { items: [{ name: "", level: "" }] };
    case "courses":
      return { items: [{ title: "", date: "" }] };
    case "experience":
      return {
        items: [
          {
            company: "",
            role: "",
            location: "",
            start: "",
            end: "",
            duration: "",
            description: "",
          },
        ],
      };
    default:
      return {};
  }
}

export function defaultColumn(type: CvSectionType): CvColumn {
  return type === "experience" ? "main" : "sidebar";
}

export function createSection(type: CvSectionType, existing: CvSection[]): CvSection {
  const column = defaultColumn(type);
  const order = existing.filter((s) => s.column === column).length;
  return {
    id: `${type}-${Date.now().toString(36)}`,
    type,
    column,
    order,
    visible: true,
    title: SECTION_LABELS[type],
    config: emptyConfig(type),
  };
}

export function hexOr(value: string | undefined, fallback: string) {
  return value?.startsWith("#") ? value : fallback;
}
