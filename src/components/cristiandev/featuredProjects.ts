export type FeaturedProject = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  architecture: string;
  database: string;
  hosting: string;
  stack: string[];
  url: string;
  embedUrl: string;
};

export const featuredProjects: FeaturedProject[] = [
  {
    id: "overapp",
    name: "OVER APP",
    tagline: "OS personal: finanzas, tareas, vehículo, archivos y asistente",
    description:
      "Aplicación propia para organizar el día a día: contabilidad (ingresos, gastos, liquidez y créditos con abonos a capital), tareas, vehículo, explorador de archivos e imagen, y un asistente que ayuda a cargar movimientos. Auth con JWT y despliegue en Railway.",
    role: "Autor · full stack",
    architecture:
      "API hexagonal en NestJS (casos de uso + repositorios) y frontend Next.js App Router + MUI.",
    database: "MongoDB con Mongoose",
    hosting: "Railway (API + web) · volume en /app/uploads",
    stack: [
      "NestJS 11",
      "Next.js 15",
      "React 19",
      "MUI 7",
      "MongoDB",
      "JWT",
      "Railway",
    ],
    url: "https://over-api-application-production.up.railway.app/",
    embedUrl: "/",
  },
  {
    id: "gloomi",
    name: "Gloomi",
    tagline: "Tienda creepy-cute de peluches sostenibles",
    description:
      "Marca y e-commerce de peluches con historia: catálogo, adopción, personalizador 3D, upcycling, comunidad y panel admin (productos, hero, logo y mensajes). El front consume la API Nest; las fotos viven en disco persistente.",
    role: "Autor · full stack",
    architecture:
      "Monorepo: SPA Vite + React (Three.js en el personalizador) y API NestJS + Mongoose. Deploys separados por carpeta en Railway.",
    database: "MongoDB (productos, branding, home, contactos)",
    hosting: "Railway · volume /app/uploads para fotos",
    stack: [
      "NestJS",
      "Vite",
      "React 19",
      "Three.js",
      "Tailwind",
      "MongoDB",
      "Multer",
      "Railway",
    ],
    url: "https://gloomi-production.up.railway.app/",
    embedUrl: "https://gloomi-production.up.railway.app/",
  },
];
