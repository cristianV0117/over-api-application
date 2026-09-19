"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LaunchIcon from "@mui/icons-material/Launch";
import type { FeaturedProject } from "./featuredProjects";

const line = "rgba(255,255,255,0.06)";
const muted = "rgba(255,255,255,0.62)";
const display = {
  fontFamily:
    "var(--font-cristian), var(--font-geist-sans), system-ui, sans-serif",
};

const bentoCardSx = {
  height: "100%",
  bgcolor: "rgba(16, 14, 20, 0.72)",
  border: `1px solid ${line}`,
  borderRadius: 4,
  backdropFilter: "blur(12px)",
  overflow: "hidden",
  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
  "&:hover": {
    borderColor: "rgba(255,255,255,0.12)",
    boxShadow: `0 0 0 1px rgba(201, 75, 109, 0.15), 0 24px 48px rgba(0,0,0,0.45)`,
  },
} as const;

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#fff", lineHeight: 1.5, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function FeaturedProjectCard({
  project,
}: {
  project: FeaturedProject;
}) {
  return (
    <Card sx={{ ...bentoCardSx, gridColumn: { md: "span 12" } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 0.95fr) minmax(0, 1.05fr)" },
          minHeight: { lg: 420 },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, sm: 3.5 },
            borderRight: { lg: `1px solid ${line}` },
            borderBottom: { xs: `1px solid ${line}`, lg: "none" },
          }}
        >
          <Typography
            variant="overline"
            sx={{ ...display, color: muted, letterSpacing: "0.06em", fontWeight: 700 }}
          >
            {project.role}
          </Typography>
          <Typography
            sx={{
              ...display,
              fontWeight: 800,
              fontSize: { xs: "1.35rem", sm: "1.55rem" },
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              mb: 0.75,
            }}
          >
            {project.name}
          </Typography>
          <Typography sx={{ color: "#e8deff", fontWeight: 600, mb: 1.5, lineHeight: 1.45 }}>
            {project.tagline}
          </Typography>
          <Typography variant="body2" sx={{ color: muted, lineHeight: 1.75, mb: 2.5 }}>
            {project.description}
          </Typography>
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Meta label="Arquitectura" value={project.architecture} />
            <Meta label="Base de datos" value={project.database} />
            <Meta label="Infra" value={project.hosting} />
          </Stack>
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 2.5 }}>
            {project.stack.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: line,
                  color: "rgba(255,255,255,0.82)",
                  height: 24,
                  fontSize: "0.72rem",
                }}
              />
            ))}
          </Stack>
          <Button
            component="a"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            endIcon={<LaunchIcon />}
            sx={{
              borderRadius: 999,
              px: 2.25,
              background: "linear-gradient(90deg, #6b2fb8, #c94b6d)",
              color: "#fff",
              fontWeight: 700,
              "&:hover": {
                background: "linear-gradient(90deg, #6b2fb8, #c94b6d)",
                filter: "brightness(1.08)",
              },
            }}
          >
            Abrir proyecto
          </Button>
        </CardContent>

        <Box sx={{ display: "flex", flexDirection: "column", minHeight: { xs: 320, lg: "auto" } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              px: 1.5,
              py: 1,
              borderBottom: `1px solid ${line}`,
              bgcolor: "rgba(8, 8, 12, 0.65)",
            }}
          >
            <Stack direction="row" spacing={0.6}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <Box
                  key={c}
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: c,
                    opacity: 0.85,
                  }}
                />
              ))}
            </Stack>
            <Typography
              variant="caption"
              sx={{
                flex: 1,
                color: muted,
                fontFamily: "ui-monospace, monospace",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {project.url.replace(/^https?:\/\//, "")}
            </Typography>
          </Stack>
          <Box sx={{ position: "relative", flex: 1, bgcolor: "#0b0b10", minHeight: 280 }}>
            <Box
              component="iframe"
              title={`Vista de ${project.name}`}
              src={project.embedUrl}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
                bgcolor: "#0b0b10",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
