export type CvSectionType =
  | "about"
  | "personal"
  | "links"
  | "education"
  | "skills"
  | "languages"
  | "courses"
  | "experience"
  | "projects"
  | "icons"
  | "custom";

export type CvColumn = "sidebar" | "main";

export type CvTheme = {
  sidebarBg: string;
  sidebarText: string;
  sidebarMuted: string;
  accent: string;
  pageBg: string;
  heading: string;
  body: string;
  chipBg: string;
  chipText: string;
  fontFamily: string;
  repeatSidebar?: boolean;
  fontScale?: number;
};

export type CvHeader = {
  fullName: string;
  role: string;
  location: string;
  phone: string;
  email: string;
  photoDataUrl: string;
  showPhoto: boolean;
};

export type CvSection = {
  id: string;
  type: CvSectionType;
  column: CvColumn;
  order: number;
  visible: boolean;
  title: string;
  config: Record<string, unknown>;
};

export type CvSummary = {
  id: string;
  name: string;
  locale: "es" | "en";
  sectionCount: number;
  updatedAt: string;
};

export type CvConfig = CvSummary & {
  theme: CvTheme;
  header: CvHeader;
  sections: CvSection[];
  translatedFromId: string | null;
};

export const SECTION_LABELS: Record<CvSectionType, string> = {
  about: "Sobre mí",
  personal: "Datos personales",
  links: "Enlaces",
  education: "Educación",
  skills: "Habilidades",
  languages: "Idiomas",
  courses: "Cursos",
  experience: "Experiencia laboral",
  projects: "Proyectos",
  icons: "Iconos tech",
  custom: "Texto libre",
};

export const SECTION_TYPES: CvSectionType[] = [
  "about",
  "personal",
  "links",
  "education",
  "skills",
  "languages",
  "courses",
  "experience",
  "projects",
  "icons",
  "custom",
];

export const THEME_FIELDS: {
  key: Exclude<keyof CvTheme, "fontFamily" | "repeatSidebar" | "fontScale">;
  label: string;
}[] = [
  { key: "sidebarBg", label: "Fondo barra" },
  { key: "sidebarText", label: "Texto barra" },
  { key: "sidebarMuted", label: "Texto suave barra" },
  { key: "accent", label: "Acento" },
  { key: "pageBg", label: "Fondo página" },
  { key: "heading", label: "Títulos" },
  { key: "body", label: "Texto" },
  { key: "chipBg", label: "Fondo chips" },
  { key: "chipText", label: "Texto chips" },
];
