"use client";

import NextLink from "next/link";
import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LaunchIcon from "@mui/icons-material/Launch";
import LoginIcon from "@mui/icons-material/Login";

const bg = "#060608";
const accentFrom = "#6b2fb8";
const accentTo = "#c94b6d";
const muted = "rgba(255,255,255,0.62)";
const line = "rgba(255,255,255,0.06)";

const bentoCardSx = {
  height: "100%",
  bgcolor: "rgba(16, 14, 20, 0.72)",
  border: `1px solid ${line}`,
  borderRadius: 4,
  backdropFilter: "blur(12px)",
  transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow: `0 0 0 1px rgba(201, 75, 109, 0.15), 0 24px 48px rgba(0,0,0,0.45)`,
  },
} as const;

/** Tipografía de acento: sans redondeada, tono informal */
const display = {
  fontFamily:
    "var(--font-cristian), var(--font-geist-sans), system-ui, sans-serif",
};

const sectionTitleSx = {
  ...display,
  fontSize: "1rem",
  fontWeight: 800,
  letterSpacing: "-0.02em",
  mb: 2,
  color: "rgba(255,255,255,0.88)",
};

export default function CristianDevPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        color: "rgba(255,255,255,0.92)",
        bgcolor: bg,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 90% 70% at 10% -10%, rgba(107, 47, 184, 0.28), transparent 55%),
            radial-gradient(ellipse 60% 50% at 95% 20%, rgba(201, 75, 109, 0.12), transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, rgba(45, 10, 21, 0.55), transparent 45%)
          `,
          pointerEvents: "none",
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          component="header"
          sx={{
            borderBottom: `1px solid ${line}`,
            backdropFilter: "blur(14px)",
            bgcolor: "rgba(6, 6, 8, 0.65)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Container maxWidth="lg" sx={{ py: 2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                sx={{
                  ...display,
                  fontSize: { xs: "1rem", sm: "1.05rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  background: `linear-gradient(90deg, #e8e4ff, ${accentTo})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                cristian dev
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  component={NextLink}
                  href="/"
                  variant="contained"
                  size="medium"
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                    color: "#fff",
                    fontWeight: 700,
                    "&:hover": {
                      background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})`,
                      filter: "brightness(1.08)",
                    },
                  }}
                >
                  OVER APP
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, sm: 3 } }}>
          {/* Hero + Bento intro */}
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.05fr) minmax(0, 0.95fr)" },
              mb: 2.5,
              alignItems: "stretch",
            }}
          >
            <Card sx={{ ...bentoCardSx, borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1.1fr" },
                  minHeight: { xs: "auto", sm: 280 },
                }}
              >
                <Box
                  sx={{
                    minHeight: { xs: 200, sm: "auto" },
                    background: `
                      linear-gradient(145deg, rgba(20,18,28,0.95), rgba(60,20,40,0.5)),
                      url("https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format&fit=crop") center/cover
                    `,
                    borderRight: { sm: `1px solid ${line}` },
                  }}
                />
                <CardContent sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography
                    variant="overline"
                    sx={{ ...display, color: muted, letterSpacing: "0.04em", mb: 1, fontWeight: 600 }}
                  >
                    Hi there 👋
                  </Typography>
                  <Typography
                    sx={{
                      ...display,
                      fontSize: { xs: "1.5rem", sm: "1.85rem" },
                      lineHeight: 1.2,
                      mb: 2,
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Soy Cristian Vásquez — backend developer
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ ...display, fontWeight: 600, color: "rgba(255,255,255,0.88)", mb: 0.5 }}
                  >
                    Bienvenido a mi perfil
                  </Typography>
                  <Typography variant="body2" sx={{ color: muted, lineHeight: 1.7 }}>
                    Presentación personal dentro del mismo proyecto que impulsa{" "}
                    <Box component="span" sx={{ color: "#fff", fontWeight: 600 }}>OVER APP</Box>.
                    Explora el producto cuando quieras volver al tablero.
                  </Typography>
                </CardContent>
              </Box>
            </Card>

            <Stack spacing={2.5} sx={{ minHeight: "100%" }}>
              <Card sx={{ ...bentoCardSx, flex: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={sectionTitleSx}>Sobre mí</Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" sx={{ color: muted, lineHeight: 1.75 }}>
                      👨‍💻 FullStack hace <Box component="strong" sx={{ color: "#fff" }}>6 años</Box> y estudiante de Ingeniería de Sistemas.
                    </Typography>
                    <Typography variant="body2" sx={{ color: muted, lineHeight: 1.75 }}>
                      💼 Experiencia en empresas de comercio y tecnología, backend y frontend.
                    </Typography>
                    <Typography variant="body2" sx={{ color: muted, lineHeight: 1.75 }}>
                      🎸 Músico en el tiempo libre; cine y anime.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Bento grid */}
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" },
            }}
          >
            <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 7" } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={sectionTitleSx}>🚀 Proyectos y aprendizaje</Typography>
                <Typography variant="body2" sx={{ color: muted, lineHeight: 1.8, mb: 2 }}>
                  🔭 Actualmente en{" "}
                  <Link
                    href="https://over-api-application-production.up.railway.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: "#f5b4ff",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    Over API App <LaunchIcon sx={{ fontSize: 16 }} />
                  </Link>
                </Typography>
                <Typography variant="body2" sx={{ color: muted, lineHeight: 1.8 }}>
                  🌱 Aprendiendo: <strong style={{ color: "#fff" }}>DDD</strong>, <strong style={{ color: "#fff" }}>TDD</strong>,{" "}
                  <strong style={{ color: "#fff" }}>NestJS</strong>, <strong style={{ color: "#fff" }}>Hexagonal Architecture</strong>,{" "}
                  <strong style={{ color: "#fff" }}>Next.js</strong>.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 5" } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={sectionTitleSx}>📚 Instructor en Udemy</Typography>
                <Stack spacing={1.75}>
                  <Link
                    href="https://www.udemy.com/course/principios-solid-y-patrones-de-desarrollo-en-php/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#e8deff", fontSize: "0.9rem", lineHeight: 1.5, fontWeight: 500 }}
                  >
                    🎓 Principios SOLID y patrones de desarrollo en PHP
                  </Link>
                  <Link
                    href="https://www.udemy.com/course/api-rest-hecho-en-laravel-con-arquitectura-hexagonal-y-jwt/"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ color: "#e8deff", fontSize: "0.9rem", lineHeight: 1.5, fontWeight: 500 }}
                  >
                    🔐 API REST en Laravel con arquitectura hexagonal y JWT
                  </Link>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 12" } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={sectionTitleSx}>🧰 Stack y herramientas</Typography>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      maxWidth: 720,
                      height: { xs: 56, sm: 64 },
                    }}
                  >
                    <Image
                      src="https://skillicons.dev/icons?i=html,css,bootstrap,php,ts,laravel,lumen,nextjs,nestjs,nodejs,mysql,mongodb,docker,git,linux,redis,vscode,postman,jwt"
                      alt="Stack tecnológico"
                      fill
                      unoptimized
                      style={{ objectFit: "contain" }}
                    />
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="center">
                    <Box
                      component="img"
                      src="https://img.shields.io/badge/Architecture-DDD%20%7C%20Hexagonal-9cf?style=flat-square"
                      alt="Arquitectura"
                      sx={{ height: 20 }}
                    />
                    <Box
                      component="img"
                      src="https://img.shields.io/badge/MQ-RabbitMQ-orange?style=flat-square&logo=rabbitmq&logoColor=white"
                      alt="RabbitMQ"
                      sx={{ height: 20 }}
                    />
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 5" } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={sectionTitleSx}>📫 Contacto</Typography>
                <Stack spacing={1.25}>
                  <Typography variant="body2">
                    💌{" "}
                    <Link href="mailto:cvo6372@gmail.com" sx={{ color: "#f5b4ff" }}>
                      cvo6372@gmail.com
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    🐙{" "}
                    <Link href="https://github.com/cristianV0117" target="_blank" rel="noopener noreferrer" sx={{ color: "#f5b4ff" }}>
                      github.com/cristianV0117
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    💼{" "}
                    <Link
                      href="https://www.linkedin.com/in/cristian-camilo-vasquez-osorio-1b791b1a3/"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#f5b4ff" }}
                    >
                      LinkedIn
                    </Link>
                  </Typography>
                  <Typography variant="body2">
                    🌐{" "}
                    <Link href="https://mi-portafolio-personal.herokuapp.com/" target="_blank" rel="noopener noreferrer" sx={{ color: "#f5b4ff" }}>
                      Portafolio
                    </Link>
                  </Typography>
                </Stack>
                <Button
                  component={NextLink}
                  href="/"
                  fullWidth
                  sx={{
                    mt: 3,
                    borderRadius: 999,
                    py: 1.25,
                    border: `1px solid rgba(255,255,255,0.18)`,
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
                  }}
                >
                  Volver a OVER APP (login)
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 7" } }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={sectionTitleSx}>📊 GitHub</Typography>
                <Stack spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src="https://komarev.com/ghpvc/?username=cristianV0117&color=blue"
                    alt="Visitas al perfil"
                    sx={{ maxWidth: "100%", height: "auto" }}
                  />
                  <Box
                    component="img"
                    src="https://github-readme-stats.vercel.app/api/top-langs/?username=cristianV0117&layout=compact&bg_color=0d1117&title_color=e8deff&text_color=c9d1d9&border_color=30363d"
                    alt="Top lenguajes"
                    sx={{ maxWidth: "100%", height: "auto", borderRadius: 1 }}
                  />
                  <Box
                    component="img"
                    src="https://github-readme-stats.vercel.app/api?username=cristianV0117&show_icons=true&bg_color=0d1117&title_color=e8deff&text_color=c9d1d9&icon_color=bc6ff1&border_color=30363d"
                    alt="Estadísticas GitHub"
                    sx={{ maxWidth: "100%", height: "auto", borderRadius: 1 }}
                  />
                  <Box
                    component="img"
                    src="https://github-readme-activity-graph.vercel.app/graph?username=cristianV0117&theme=github-compact&bg_color=0d1117&color=c9d1d9&line=bc6ff1&point=e8deff"
                    alt="Actividad en GitHub"
                    sx={{ maxWidth: "100%", height: "auto", borderRadius: 1 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Typography variant="caption" sx={{ display: "block", textAlign: "center", mt: 5, color: "rgba(255,255,255,0.35)" }}>
            © {new Date().getFullYear()} Cristian Vásquez · Presentación en OVER APP
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
