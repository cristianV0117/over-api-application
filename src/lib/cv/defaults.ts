import type { CvColumn, CvSection, CvSectionType } from "./types";
import { SECTION_LABELS } from "./types";

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
