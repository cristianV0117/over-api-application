import {
  siCss,
  siDocker,
  siExpress,
  siGit,
  siGithub,
  siGraphql,
  siHtml5,
  siJavascript,
  siJira,
  siLaravel,
  siLinux,
  siMongodb,
  siMysql,
  siNestjs,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siPhp,
  siPostgresql,
  siPython,
  siRabbitmq,
  siReact,
  siRedis,
  siTailwindcss,
  siTypescript,
  siVuedotjs,
} from "simple-icons";
import type { SimpleIcon } from "simple-icons";

export type TechIconDef = {
  id: string;
  label: string;
  hex: string;
  path: string;
};

function from(icon: SimpleIcon, id: string, label: string): TechIconDef {
  return { id, label, hex: `#${icon.hex}`, path: icon.path };
}

export const TECH_ICONS: TechIconDef[] = [
  from(siPhp, "php", "PHP"),
  from(siJavascript, "js", "JavaScript"),
  from(siTypescript, "ts", "TypeScript"),
  from(siMysql, "mysql", "MySQL"),
  from(siMongodb, "mongodb", "MongoDB"),
  from(siNodedotjs, "node", "Node.js"),
  from(siNestjs, "nestjs", "NestJS"),
  from(siLaravel, "laravel", "Laravel"),
  from(siReact, "react", "React"),
  from(siNextdotjs, "nextjs", "Next.js"),
  from(siVuedotjs, "vue", "Vue"),
  from(siGit, "git", "Git"),
  from(siGithub, "github", "GitHub"),
  from(siDocker, "docker", "Docker"),
  from(siPostgresql, "postgres", "PostgreSQL"),
  from(siPython, "python", "Python"),
  from(siHtml5, "html", "HTML5"),
  from(siCss, "css", "CSS"),
  from(siExpress, "express", "Express"),
  from(siRabbitmq, "rabbitmq", "RabbitMQ"),
  from(siLinux, "linux", "Linux"),
  from(siNginx, "nginx", "Nginx"),
  from(siRedis, "redis", "Redis"),
  from(siGraphql, "graphql", "GraphQL"),
  from(siTailwindcss, "tailwind", "Tailwind"),
  from(siJira, "jira", "Jira"),
];

export const TECH_ICONS_BY_ID = Object.fromEntries(TECH_ICONS.map((i) => [i.id, i]));

export function iconSvg(def: TechIconDef, fill?: string) {
  const color = fill || def.hex;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="${color}" d="${def.path}"/></svg>`;
}

const pngCache = new Map<string, string>();

export function isDarkHex(hex: string) {
  const h = hex.replace("#", "");
  if (h.length !== 6) return true;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 160;
}

function drawIconPng(def: TechIconDef, fill: string, size = 128): string | null {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = fill;
  ctx.fill(new Path2D(def.path));
  return canvas.toDataURL("image/png");
}

export function techIconPng(id: string, light = true): string | null {
  const def = TECH_ICONS_BY_ID[id];
  if (!def) return null;
  const key = `${id}:${light ? "l" : "d"}`;
  const hit = pngCache.get(key);
  if (hit) return hit;
  const fill = light ? "#FFFFFF" : def.hex;
  const png = drawIconPng(def, fill);
  if (!png) return null;
  pngCache.set(key, png);
  return png;
}

export function resolveTechIconPngs(config: {
  theme: { sidebarBg: string };
  sections: {
    id: string;
    type: string;
    column: string;
    visible: boolean;
    config: Record<string, unknown>;
  }[];
}): Record<string, string> {
  const out: Record<string, string> = {};
  const sidebarLight = isDarkHex(config.theme.sidebarBg);
  for (const section of config.sections) {
    if (section.type !== "icons" || !section.visible) continue;
    const items = Array.isArray(section.config.items)
      ? section.config.items.map((x) => String(x ?? "")).filter(Boolean)
      : [];
    const light = section.column === "sidebar" ? sidebarLight : false;
    for (const id of items) {
      try {
        const png = techIconPng(id, light);
        if (png) out[`${section.id}:${id}`] = png;
      } catch {
        /* un icono no debe tumbar el PDF */
      }
    }
  }
  return out;
}
