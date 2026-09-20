"use client";

import { useMemo, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LaunchIcon from "@mui/icons-material/Launch";
import PublicOffIcon from "@mui/icons-material/PublicOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { PortfolioBlock, PortfolioBlockType, PortfolioConfig } from "@/lib/portfolio/types";
import { BLOCK_LABELS, BLOCK_TYPES } from "@/lib/portfolio/types";
import { createBlock, DEFAULT_PORTFOLIO_THEME } from "@/lib/portfolio/defaults";
import { migrateSections, normalizeSections, prepareBlocksForDisplay } from "@/lib/portfolio/layout";
import PortfolioBlockEditor from "./PortfolioBlockEditor";
import PortfolioGridCanvas, { type PortfolioGridCanvasHandle } from "./PortfolioGridCanvas";
import PortfolioRenderer from "./PortfolioRenderer";

type Props = {
  initial: PortfolioConfig;
  onBack?: () => void;
  onDelete?: () => Promise<void>;
  onUnpublish?: () => Promise<PortfolioConfig>;
  onSave: (payload: {
    name: string;
    slug: string;
    theme: PortfolioConfig["theme"];
    sections: PortfolioBlock[];
    published?: boolean;
  }) => Promise<PortfolioConfig>;
  onPublish: () => Promise<PortfolioConfig>;
};

export default function PortfolioBuilder({ initial, onBack, onDelete, onUnpublish, onSave, onPublish }: Props) {
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [theme, setTheme] = useState(initial.theme);
  const [blocks, setBlocks] = useState<PortfolioBlock[]>(() =>
    migrateSections(normalizeSections(initial.sections))
  );
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0]?.id ?? null);
  const [published, setPublished] = useState(initial.published);
  const [publicUrl, setPublicUrl] = useState(initial.publicUrl);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newType, setNewType] = useState<PortfolioBlockType>("text");
  const [previewSections, setPreviewSections] = useState<PortfolioBlock[] | null>(null);
  const gridRef = useRef<PortfolioGridCanvasHandle>(null);

  const selected = blocks.find((b) => b.id === selectedId) ?? null;

  const previewConfig: PortfolioConfig = useMemo(
    () => ({
      ...initial,
      name,
      slug,
      published,
      theme,
      sections: (previewSections ?? blocks).map((b, i) => ({ ...b, order: i })),
      publicUrl,
      updatedAt: initial.updatedAt,
    }),
    [initial, name, slug, published, theme, blocks, previewSections, publicUrl]
  );

  const openPreview = () => {
    const flushed = gridRef.current?.flushLayout() ?? blocks;
    setBlocks(flushed);
    setPreviewSections(prepareBlocksForDisplay(flushed));
    setPreview(true);
  };

  const addBlock = () => {
    const block = createBlock(newType, blocks);
    setBlocks((prev) => [...prev, block]);
    setSelectedId(block.id);
  };

  const save = async (alsoPublish = false) => {
    setBusy(true);
    try {
      const payload = {
        name: name.trim() || "Mi portafolio",
        slug: slug.trim().toLowerCase(),
        theme,
        sections: blocks.map((b, i) => ({ ...b, order: i })),
      };
      let result = await onSave(payload);
      if (alsoPublish) result = await onPublish();
      setPublished(result.published);
      setPublicUrl(result.publicUrl);
      setBlocks(migrateSections(normalizeSections(result.sections)));
    } finally {
      setBusy(false);
    }
  };

  if (preview) {
    return (
      <Box>
        <Button
          sx={{ mb: 2 }}
          onClick={() => {
            setPreview(false);
            setPreviewSections(null);
          }}
        >
          Volver al editor
        </Button>
        <PortfolioRenderer config={previewConfig} preview />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {onBack ? (
        <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ alignSelf: "flex-start" }}>
          Volver a mis portafolios
        </Button>
      ) : null}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {name || "Portafolio"} — configuración
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Nombre"
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                label="Slug (URL)"
                fullWidth
                size="small"
                helperText={`Tu link será: /${slug || "tu-slug"}`}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              />
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" minWidth={200}>
                {publicUrl ? (
                  <Button component="a" href={publicUrl} target="_blank" rel="noopener" startIcon={<LaunchIcon />} variant="outlined">
                    {publicUrl}
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Publica para generar el link
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {(["background", "accentFrom", "accentTo"] as const).map((key) => (
                <TextField
                  key={key}
                  label={key}
                  type="color"
                  fullWidth
                  size="small"
                  value={theme[key]?.startsWith("#") ? theme[key] : DEFAULT_PORTFOLIO_THEME[key]}
                  onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                />
              ))}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
            <Button variant="contained" disabled={busy} onClick={() => save(false)}>
              Guardar
            </Button>
            <Button variant="contained" color="secondary" disabled={busy} onClick={() => save(true)}>
              Generar / Publicar
            </Button>
            <Button variant="outlined" onClick={openPreview}>
              Vista previa
            </Button>
            {published && onUnpublish ? (
              <Button
                variant="outlined"
                color="warning"
                disabled={busy}
                startIcon={<PublicOffIcon />}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const result = await onUnpublish();
                    setPublished(result.published);
                    setPublicUrl(result.publicUrl);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Despublicar
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="outlined"
                color="error"
                disabled={busy}
                startIcon={<DeleteOutlineIcon />}
                onClick={async () => {
                  if (!window.confirm("¿Eliminar este portafolio? Esta acción no se puede deshacer.")) return;
                  setBusy(true);
                  try {
                    await onDelete();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Eliminar
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <PortfolioGridCanvas
        ref={gridRef}
        blocks={blocks}
        theme={theme}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onLayoutChange={setBlocks}
        onRemove={(id) => {
          setBlocks((prev) => prev.filter((b) => b.id !== id));
          if (selectedId === id) setSelectedId(null);
        }}
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="flex-start">
        <Box flex={{ md: "0 0 280px" }} width="100%">
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Agregar bloque
          </Typography>
          <Stack direction="row" spacing={1}>
            <TextField select size="small" value={newType} onChange={(e) => setNewType(e.target.value as PortfolioBlockType)} sx={{ minWidth: 180, flex: 1 }}>
              {BLOCK_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {BLOCK_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
            <Button startIcon={<AddIcon />} onClick={addBlock}>
              Agregar
            </Button>
          </Stack>
        </Box>
        <Box flex={1} width="100%">
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={2}>
                {selected ? `Editar: ${BLOCK_LABELS[selected.type]}` : "Selecciona un bloque en la cuadrícula"}
              </Typography>
              {selected ? (
                <PortfolioBlockEditor
                  block={selected}
                  onChange={(next) => setBlocks((prev) => prev.map((b) => (b.id === next.id ? next : b)))}
                />
              ) : null}
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Stack>
  );
}
