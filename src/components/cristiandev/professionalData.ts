export type ExperienceEntry = {
  company: string;
  role: string;
  employment: string;
  period: string;
  duration: string;
  location: string;
  modality: string;
  skills?: string[];
  bullets: string[];
};

export const experienceEntries: ExperienceEntry[] = [
  {
    company: "Motorflash Solutions",
    role: "Backend developer",
    employment: "Jornada completa",
    period: "feb. 2026 – actualidad",
    duration: "3 meses",
    location: "España",
    modality: "Remoto",
    bullets: [
      "Desarrollo backend en productos digitales y soporte a plataformas de la compañía en entorno remoto.",
    ],
  },
  {
    company: "Alegra",
    role: "Backend developer",
    employment: "Jornada completa",
    period: "sept. 2024 – ene. 2026",
    duration: "1 año 5 meses",
    location: "Bogotá",
    modality: "Remoto",
    bullets: [
      "Plataformas: mantenimiento e implementación de módulos en soluciones sobre Zend Framework y migración del dominio hacia microservicios serverless con TypeScript.",
      "Arquitectura: migración de parte del dominio principal a microservicios aplicando DDD (Domain-Driven Design) y arquitectura hexagonal.",
      "Bases de datos: diseño y despliegue de nuevos flujos en MySQL y DynamoDB.",
      "Control de versiones: adopción del flujo GitFlow.",
      "Metodología: equipos ágiles con marco SCRUM y gestión en Asana.",
    ],
  },
  {
    company: "Bodytech Colombia",
    role: "Fullstack developer",
    employment: "Jornada completa",
    period: "ene. 2024 – sept. 2024",
    duration: "9 meses",
    location: "Bogotá",
    modality: "Presencial",
    skills: ["Phalcon", "Yii", "Next.js", "RabbitMQ", "Arquitectura hexagonal"],
    bullets: [
      "Plataformas: mantenimiento e implementación de módulos en Phalcon, Yii y Next.js; levantamiento de nuevos requerimientos y soporte al negocio.",
      "Arquitectura: evolución de microservicios con RabbitMQ y enfoque hexagonal.",
      "Bases de datos: nuevos flujos y ajustes en MySQL.",
      "Control de versiones: flujo GitFlow.",
      "Metodología: SCRUM con Jira.",
    ],
  },
  {
    company: "Laika Mascotas",
    role: "Senior Software Engineer / Desarrollador backend",
    employment: "Jornada completa",
    period: "dic. 2021 – nov. 2023",
    duration: "2 años",
    location: "Bogotá, D.C.",
    modality: "—",
    skills: ["Laravel", "Vue.js", "NestJS", "Arquitectura hexagonal", "DDD", "SOLID"],
    bullets: [
      "Plataforma: mantenimiento e implementación de módulos en Laravel y Vue.js; incorporación de nuevos requerimientos.",
      "Arquitectura: refactorización con arquitectura hexagonal y DDD, principios SOLID y buenas prácticas en PHP 7.4 y 8.1.",
      "Bases de datos: nuevos flujos en MySQL, incluidos procedimientos almacenados.",
    ],
  },
  {
    company: "Refocosta SAS",
    role: "Fullstack developer y analista BI",
    employment: "Jornada completa",
    period: "ene. 2021 – ago. 2021",
    duration: "8 meses",
    location: "Bogotá",
    modality: "—",
    skills: ["SQL Server", "API REST", "PHP 8", "Slim", "ASP.NET Core", "AWS", "IIS"],
    bullets: [
      "CRM – API: PHP 8 y Slim, Composer, ADR con Front Controller, API REST con enfoque SOLID; SQL Server; despliegue en AWS e IIS.",
      "CRM – Front: módulos en ASP.NET Core con JavaScript y Bootstrap 5; mismo entorno AWS e IIS.",
      "Gestión y ajustes de bases de datos asociadas a los productos.",
      "Soporte técnico de aplicaciones a nivel básico.",
    ],
  },
];

export type EducationEntry = {
  institution: string;
  degree: string;
  period: string;
};

export const educationEntries: EducationEntry[] = [
  {
    institution: "Fundación de Educación Superior San José",
    degree: "Ingeniería en sistemas",
    period: "feb. 2019 – nov. 2023",
  },
];

export type CertificationEntry = {
  title: string;
  issuer: "Platzi" | "Codely";
  date: string;
  credentialId?: string;
  skills?: string[];
  /** Pega aquí el enlace “Compartir” de tu diploma (Platzi / Codely) si quieres el botón “Credencial”. */
  diplomaUrl?: string;
};

/** Orden aproximado: más reciente arriba (como en LinkedIn). */
export const certificationEntries: CertificationEntry[] = [
  {
    title: "Curso de Fundamentos de Symfony 6",
    issuer: "Platzi",
    date: "feb. 2023",
    credentialId: "f2d89a34-e2b1-4ce1-82d5-3531486c74f2",
    skills: ["Symfony"],
  },
  {
    title: "Curso avanzado de Laravel",
    issuer: "Platzi",
    date: "feb. 2023",
    credentialId: "b19b44a0-2a21-4a7b-af61-35e50533f012",
  },
  {
    title: "Buenas prácticas para escritura de código",
    issuer: "Platzi",
    date: "ago. 2022",
  },
  {
    title: "CQRS",
    issuer: "Codely",
    date: "jul. 2022",
  },
  {
    title: "Arquitectura hexagonal",
    issuer: "Codely",
    date: "jun. 2022",
  },
  {
    title: "Principios SOLID aplicados",
    issuer: "Codely",
    date: "oct. 2021",
  },
  {
    title: "Curso profesional de Scrum",
    issuer: "Platzi",
    date: "ago. 2021",
    credentialId: "afa4d307-3edc-4e4b-8ae1-288ddaf07c0f",
  },
];
