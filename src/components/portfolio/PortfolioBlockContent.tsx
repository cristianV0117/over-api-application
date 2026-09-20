"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Link from "@mui/material/Link";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { PortfolioBlock, PortfolioTheme } from "@/lib/portfolio/types";

type Props = {
  block: PortfolioBlock;
  theme: PortfolioTheme;
  compact?: boolean;
};

function cardSx(line: string) {
  return {
    height: "100%",
    bgcolor: "rgba(16, 14, 20, 0.72)",
    border: `1px solid ${line}`,
    borderRadius: 3,
    backdropFilter: "blur(12px)",
    overflow: "auto",
  } as const;
}

export default function PortfolioBlockContent({ block, theme, compact }: Props) {
  const { type, config } = block;
  const sx = cardSx(theme.line);

  if (type === "hero") {
    return (
      <Card sx={sx}>
        <CardContent sx={{ p: compact ? 1.5 : { xs: 2, md: 2.5 }, height: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="center" height="100%">
            {typeof config.imageUrl === "string" && config.imageUrl ? (
              <Box sx={{ position: "relative", width: compact ? 72 : 120, height: compact ? 90 : 150, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
                <Image src={config.imageUrl} alt="" fill style={{ objectFit: "cover" }} unoptimized />
              </Box>
            ) : null}
            <Box minWidth={0}>
              {config.logoUrl ? <Box component="img" src={String(config.logoUrl)} alt="" sx={{ height: compact ? 24 : 32, mb: 0.5 }} /> : null}
              <Typography sx={{ color: theme.muted, fontSize: compact ? "0.65rem" : "0.8rem" }}>{String(config.greeting ?? "")}</Typography>
              <Typography variant={compact ? "subtitle1" : "h5"} sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {String(config.title ?? "")}
              </Typography>
              <Typography sx={{ color: theme.muted, mt: 0.5, fontSize: compact ? "0.75rem" : "0.9rem" }}>{String(config.subtitle ?? "")}</Typography>
              {!compact && config.description ? (
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.78)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  {String(config.description)}
                </Typography>
              ) : null}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (type === "text") {
    const align = String(config.align ?? "left");
    return (
      <Card sx={sx}>
        <CardContent>
          {config.title ? (
            <Typography variant="h6" fontWeight={800} mb={1} textAlign={align as "left" | "center" | "right"}>
              {String(config.title)}
            </Typography>
          ) : null}
          <Typography sx={{ color: theme.muted, whiteSpace: "pre-wrap", textAlign: align as "left" | "center" | "right", fontSize: compact ? "0.8rem" : "1rem" }}>
            {String(config.body ?? "")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (type === "list") {
    const items = Array.isArray(config.items) ? config.items : [];
    return (
      <Card sx={sx}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={1}>{String(config.title ?? "Lista")}</Typography>
          <List dense disablePadding>
            {items.map((item, i) => (
              <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                <ListItemText primary={`• ${String(item)}`} sx={{ color: theme.muted, "& .MuiListItemText-primary": { fontSize: compact ? "0.8rem" : "0.95rem" } }} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }

  if (type === "accordion") {
    const items = Array.isArray(config.items) ? config.items : [];
    return (
      <Box height="100%" sx={{ overflow: "auto" }}>
        <Typography variant="h6" fontWeight={800} mb={0.5}>{String(config.title ?? "Acordeón")}</Typography>
        {config.hint ? <Typography sx={{ color: theme.muted, mb: 1, fontSize: "0.8rem" }}>{String(config.hint)}</Typography> : null}
        {items.map((item, i) => {
          const e = item as Record<string, unknown>;
          const body = String(e.body ?? "");
          const bullets = body.split("\n").filter(Boolean);
          return (
            <Accordion
              key={i}
              disableGutters
              sx={{ bgcolor: "rgba(16,14,20,0.72)", border: `1px solid ${theme.line}`, mb: 0.5, "&:before": { display: "none" } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: theme.muted }} />} sx={{ minHeight: compact ? 40 : 48 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  {e.logoUrl ? (
                    <Box component="img" src={String(e.logoUrl)} alt="" sx={{ width: 28, height: 28, borderRadius: 1 }} />
                  ) : null}
                  <Box minWidth={0}>
                    <Typography fontWeight={700} fontSize={compact ? "0.85rem" : "1rem"}>{String(e.title ?? "")}</Typography>
                    {e.subtitle ? <Typography variant="body2" sx={{ color: theme.muted, fontSize: "0.75rem" }}>{String(e.subtitle)}</Typography> : null}
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                {bullets.length > 1 ? (
                  <List dense disablePadding>
                    {bullets.map((b, j) => (
                      <ListItem key={j} disableGutters sx={{ display: "list-item", ml: 2, py: 0 }}>
                        <ListItemText primary={b} sx={{ color: theme.muted }} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography sx={{ color: theme.muted, whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>{body}</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  }

  if (type === "embed") {
    const url = String(config.url ?? "");
    if (!url) return <Card sx={sx}><CardContent><Typography color="text.secondary">Sin URL de embed</Typography></CardContent></Card>;
    return (
      <Card sx={sx}>
        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {config.title ? <Typography variant="h6" fontWeight={800} mb={1}>{String(config.title)}</Typography> : null}
          <Box component="iframe" src={url} title={String(config.title ?? "embed")} sx={{ flex: 1, minHeight: 120, width: "100%", border: `1px solid ${theme.line}`, borderRadius: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (type === "github") {
    const username = String(config.username ?? "").trim();
    if (!username) return <Card sx={sx}><CardContent><Typography color="text.secondary">Usuario GitHub vacío</Typography></CardContent></Card>;
    const statsUrl = `https://github-readme-stats.vercel.app/api?username=${encodeURIComponent(username)}&theme=radical&hide_border=true`;
    return (
      <Card sx={sx}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={1}>{String(config.title ?? "GitHub")}</Typography>
          <Box component="img" src={statsUrl} alt={`GitHub ${username}`} sx={{ maxWidth: "100%" }} />
        </CardContent>
      </Card>
    );
  }

  if (type === "image") {
    const imageUrl = String(config.imageUrl ?? "");
    const linkUrl = String(config.linkUrl ?? "");
    const img = imageUrl ? (
      <Box component="img" src={imageUrl} alt={String(config.alt ?? "")} sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", borderRadius: 2 }} />
    ) : (
      <Typography color="text.secondary">Sin imagen</Typography>
    );
    return (
      <Card sx={sx}>
        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {config.title ? <Typography variant="subtitle2" fontWeight={700} mb={1} alignSelf="flex-start">{String(config.title)}</Typography> : null}
          {linkUrl ? <Link href={linkUrl} target="_blank" rel="noopener">{img}</Link> : img}
        </CardContent>
      </Card>
    );
  }

  if (type === "button") {
    const align = String(config.align ?? "center");
    return (
      <Card sx={{ ...sx, display: "flex", alignItems: "center", justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" }}>
        <CardContent>
          <Button
            variant={(config.variant as "contained" | "outlined" | "text") ?? "contained"}
            href={String(config.url ?? "#")}
            target={String(config.url ?? "").startsWith("http") ? "_blank" : undefined}
            sx={{
              background: config.variant !== "outlined" ? `linear-gradient(135deg, ${theme.accentFrom}, ${theme.accentTo})` : undefined,
            }}
          >
            {String(config.label ?? "Botón")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (type === "button_group") {
    const buttons = Array.isArray(config.buttons) ? config.buttons : [];
    const align = String(config.align ?? "center");
    return (
      <Card sx={sx}>
        <CardContent>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"}>
            {buttons.map((btn, i) => {
              const b = btn as Record<string, unknown>;
              return (
                <Button
                  key={i}
                  size="small"
                  variant={(b.variant as "contained" | "outlined") ?? "outlined"}
                  href={String(b.url ?? "#")}
                  target="_blank"
                  sx={b.variant === "contained" ? { background: `linear-gradient(135deg, ${theme.accentFrom}, ${theme.accentTo})` } : undefined}
                >
                  {String(b.label ?? "Link")}
                </Button>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (type === "project") {
    const embedUrl = String(config.embedUrl ?? "");
    return (
      <Card sx={sx}>
        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Typography fontWeight={700}>{String(config.title ?? "Proyecto")}</Typography>
          {config.tagline ? <Typography sx={{ color: theme.muted, mb: 1, fontSize: "0.85rem" }}>{String(config.tagline)}</Typography> : null}
          {embedUrl ? (
            <Box component="iframe" src={embedUrl} title={String(config.title ?? "proyecto")} sx={{ flex: 1, minHeight: 120, width: "100%", border: `1px solid ${theme.line}`, borderRadius: 2 }} />
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (type === "contact") {
    const links = Array.isArray(config.links) ? config.links : [];
    return (
      <Card sx={sx}>
        <CardContent>
          <Typography variant="h6" fontWeight={800} mb={1}>{String(config.title ?? "Contacto")}</Typography>
          {config.email ? (
            <Typography sx={{ mb: 1, fontSize: "0.9rem" }}>
              <Link href={`mailto:${String(config.email)}`} sx={{ color: "#f5b4ff" }}>{String(config.email)}</Link>
            </Typography>
          ) : null}
          <Stack spacing={0.5}>
            {links.map((link, i) => {
              const l = link as Record<string, unknown>;
              return (
                <Link key={i} href={String(l.url ?? "#")} target="_blank" rel="noopener" sx={{ color: "#f5b4ff", fontSize: "0.9rem" }}>
                  {String(l.label ?? l.url ?? "Link")}
                </Link>
              );
            })}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return null;
}
