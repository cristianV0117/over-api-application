"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { PortfolioBlock } from "@/lib/portfolio/types";
import { BLOCK_LABELS } from "@/lib/portfolio/types";

type Props = {
  block: PortfolioBlock;
  onChange: (next: PortfolioBlock) => void;
};

export default function PortfolioBlockEditor({ block, onChange }: Props) {
  const setConfig = (key: string, value: unknown) => {
    onChange({ ...block, config: { ...block.config, [key]: value } });
  };

  const { type, config } = block;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {BLOCK_LABELS[type]} — arrastra y estira el bloque en la cuadrícula para moverlo o cambiar su tamaño
      </Typography>

      {type === "hero" &&
        (["greeting", "title", "subtitle", "description", "imageUrl", "logoUrl"] as const).map((k) => (
          <TextField key={k} label={k} fullWidth size="small" value={String(config[k] ?? "")} onChange={(e) => setConfig(k, e.target.value)} />
        ))}

      {type === "text" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="Contenido" fullWidth multiline minRows={4} value={String(config.body ?? "")} onChange={(e) => setConfig("body", e.target.value)} />
          <TextField select label="Alineación" size="small" value={String(config.align ?? "left")} onChange={(e) => setConfig("align", e.target.value)}>
            <MenuItem value="left">Izquierda</MenuItem>
            <MenuItem value="center">Centro</MenuItem>
            <MenuItem value="right">Derecha</MenuItem>
          </TextField>
        </>
      )}

      {type === "list" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          {(Array.isArray(config.items) ? (config.items as string[]) : [""]).map((item, i, arr) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <TextField
                label={`Ítem ${i + 1}`}
                fullWidth
                size="small"
                value={item}
                onChange={(e) => {
                  const next = [...arr];
                  next[i] = e.target.value;
                  setConfig("items", next);
                }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => setConfig("items", arr.filter((_, j) => j !== i))}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setConfig("items", [...(Array.isArray(config.items) ? config.items : []), ""])}>
            Agregar ítem
          </Button>
        </>
      )}

      {type === "accordion" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="Hint / subtítulo" fullWidth size="small" value={String(config.hint ?? "")} onChange={(e) => setConfig("hint", e.target.value)} />
          {(Array.isArray(config.items) ? (config.items as Record<string, unknown>[]) : []).map((item, i, arr) => (
            <Box key={i} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="caption" fontWeight={700}>Ítem {i + 1}</Typography>
                <IconButton size="small" color="error" onClick={() => setConfig("items", arr.filter((_, j) => j !== i))}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack spacing={1}>
                <TextField label="Título" size="small" fullWidth value={String(item.title ?? "")} onChange={(e) => {
                  const next = [...arr];
                  next[i] = { ...item, title: e.target.value };
                  setConfig("items", next);
                }} />
                <TextField label="Subtítulo" size="small" fullWidth value={String(item.subtitle ?? "")} onChange={(e) => {
                  const next = [...arr];
                  next[i] = { ...item, subtitle: e.target.value };
                  setConfig("items", next);
                }} />
                <TextField label="Logo URL" size="small" fullWidth value={String(item.logoUrl ?? "")} onChange={(e) => {
                  const next = [...arr];
                  next[i] = { ...item, logoUrl: e.target.value };
                  setConfig("items", next);
                }} />
                <TextField label="Contenido (una línea = bullet)" size="small" fullWidth multiline minRows={3} value={String(item.body ?? "")} onChange={(e) => {
                  const next = [...arr];
                  next[i] = { ...item, body: e.target.value };
                  setConfig("items", next);
                }} />
              </Stack>
            </Box>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() =>
              setConfig("items", [
                ...(Array.isArray(config.items) ? config.items : []),
                { title: "Nuevo ítem", subtitle: "", logoUrl: "", body: "" },
              ])
            }
          >
            Agregar ítem al acordeón
          </Button>
        </>
      )}

      {type === "embed" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="URL embed / iframe" fullWidth size="small" value={String(config.url ?? "")} onChange={(e) => setConfig("url", e.target.value)} />
        </>
      )}

      {type === "github" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="Usuario GitHub" fullWidth size="small" value={String(config.username ?? "")} onChange={(e) => setConfig("username", e.target.value)} />
        </>
      )}

      {type === "image" && (
        <>
          <TextField label="Título (opcional)" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="URL imagen" fullWidth size="small" value={String(config.imageUrl ?? "")} onChange={(e) => setConfig("imageUrl", e.target.value)} />
          <TextField label="Link al hacer clic (opcional)" fullWidth size="small" value={String(config.linkUrl ?? "")} onChange={(e) => setConfig("linkUrl", e.target.value)} />
          <TextField label="Texto alternativo" fullWidth size="small" value={String(config.alt ?? "")} onChange={(e) => setConfig("alt", e.target.value)} />
        </>
      )}

      {type === "button" && (
        <>
          <TextField label="Texto del botón" fullWidth size="small" value={String(config.label ?? "")} onChange={(e) => setConfig("label", e.target.value)} />
          <TextField label="URL" fullWidth size="small" value={String(config.url ?? "")} onChange={(e) => setConfig("url", e.target.value)} />
          <TextField select label="Estilo" size="small" value={String(config.variant ?? "contained")} onChange={(e) => setConfig("variant", e.target.value)}>
            <MenuItem value="contained">Sólido</MenuItem>
            <MenuItem value="outlined">Outline</MenuItem>
            <MenuItem value="text">Texto</MenuItem>
          </TextField>
          <TextField select label="Alineación" size="small" value={String(config.align ?? "center")} onChange={(e) => setConfig("align", e.target.value)}>
            <MenuItem value="left">Izquierda</MenuItem>
            <MenuItem value="center">Centro</MenuItem>
            <MenuItem value="right">Derecha</MenuItem>
          </TextField>
        </>
      )}

      {type === "button_group" && (
        <>
          <TextField select label="Alineación" size="small" value={String(config.align ?? "center")} onChange={(e) => setConfig("align", e.target.value)}>
            <MenuItem value="left">Izquierda</MenuItem>
            <MenuItem value="center">Centro</MenuItem>
            <MenuItem value="right">Derecha</MenuItem>
          </TextField>
          {(Array.isArray(config.buttons) ? (config.buttons as Record<string, unknown>[]) : []).map((btn, i, arr) => (
            <Stack key={i} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
              <TextField label="Texto" size="small" value={String(btn.label ?? "")} onChange={(e) => {
                const next = [...arr];
                next[i] = { ...btn, label: e.target.value };
                setConfig("buttons", next);
              }} />
              <TextField label="URL" size="small" fullWidth value={String(btn.url ?? "")} onChange={(e) => {
                const next = [...arr];
                next[i] = { ...btn, url: e.target.value };
                setConfig("buttons", next);
              }} />
              <TextField select label="Estilo" size="small" value={String(btn.variant ?? "outlined")} onChange={(e) => {
                const next = [...arr];
                next[i] = { ...btn, variant: e.target.value };
                setConfig("buttons", next);
              }}>
                <MenuItem value="contained">Sólido</MenuItem>
                <MenuItem value="outlined">Outline</MenuItem>
              </TextField>
              <IconButton size="small" color="error" onClick={() => setConfig("buttons", arr.filter((_, j) => j !== i))}>
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setConfig("buttons", [...(Array.isArray(config.buttons) ? config.buttons : []), { label: "Nuevo", url: "#", variant: "outlined" }])}>
            Agregar botón
          </Button>
        </>
      )}

      {type === "project" && (
        <>
          <TextField label="Nombre" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="Tagline" fullWidth size="small" value={String(config.tagline ?? "")} onChange={(e) => setConfig("tagline", e.target.value)} />
          <TextField label="URL embed" fullWidth size="small" value={String(config.embedUrl ?? "")} onChange={(e) => setConfig("embedUrl", e.target.value)} />
        </>
      )}

      {type === "contact" && (
        <>
          <TextField label="Título" fullWidth size="small" value={String(config.title ?? "")} onChange={(e) => setConfig("title", e.target.value)} />
          <TextField label="Email" fullWidth size="small" value={String(config.email ?? "")} onChange={(e) => setConfig("email", e.target.value)} />
          {(Array.isArray(config.links) ? (config.links as Record<string, unknown>[]) : []).map((link, i, arr) => (
            <Stack key={i} direction="row" spacing={1}>
              <TextField label="Etiqueta" size="small" value={String(link.label ?? "")} onChange={(e) => {
                const next = [...arr];
                next[i] = { ...link, label: e.target.value };
                setConfig("links", next);
              }} />
              <TextField label="URL" size="small" fullWidth value={String(link.url ?? "")} onChange={(e) => {
                const next = [...arr];
                next[i] = { ...link, url: e.target.value };
                setConfig("links", next);
              }} />
              <IconButton size="small" color="error" onClick={() => setConfig("links", arr.filter((_, j) => j !== i))}>
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => setConfig("links", [...(Array.isArray(config.links) ? config.links : []), { label: "", url: "" }])}>
            Agregar link
          </Button>
        </>
      )}
    </Stack>
  );
}
