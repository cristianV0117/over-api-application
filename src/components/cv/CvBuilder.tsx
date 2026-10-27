"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TranslateIcon from "@mui/icons-material/Translate";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createSection, hexOr, normalizeHeader, normalizeTheme } from "@/lib/cv/defaults";
import { CV_FONTS, cvFontFaceCss } from "@/lib/cv/fonts";
import { CV_PALETTES } from "@/lib/cv/palettes";
import { compressProfilePhoto } from "@/lib/cv/photo";
import type { CvConfig, CvHeader, CvSection, CvSectionType, CvTheme } from "@/lib/cv/types";
import { SECTION_TYPES, SECTION_LABELS, THEME_FIELDS } from "@/lib/cv/types";
import CvSectionEditor from "./CvSectionEditor";
import CvSectionList from "./CvSectionList";

const CvPreview = dynamic(() => import("./CvPreview"), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography color="text.secondary">Cargando vista previa…</Typography>
    </Box>
  ),
});

type Props = {
  initial: CvConfig;
  onBack: () => void;
  onSave: (payload: {
    name: string;
    locale: "es" | "en";
    theme: CvTheme;
    header: CvHeader;
    sections: CvSection[];
  }) => Promise<CvConfig>;
  onTranslate: () => Promise<CvConfig>;
  onDelete: () => Promise<void>;
};

function withOrder(list: CvSection[], column: CvSection["column"]): CvSection[] {
  return list.map((s, i) => ({ ...s, column, order: i }));
}

export default function CvBuilder({ initial, onBack, onSave, onTranslate, onDelete }: Props) {
  const [name, setName] = useState(initial.name);
  const [theme, setTheme] = useState(() => normalizeTheme(initial.theme));
  const [header, setHeader] = useState(() => normalizeHeader(initial.header));
  const [sections, setSections] = useState(initial.sections);
  const [selectedId, setSelectedId] = useState<string | null>(initial.sections[0]?.id ?? null);
  const [newType, setNewType] = useState<CvSectionType>("experience");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(true);

  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const sidebar = useMemo(
    () => sections.filter((s) => s.column === "sidebar").sort((a, b) => a.order - b.order),
    [sections]
  );
  const main = useMemo(
    () => sections.filter((s) => s.column === "main").sort((a, b) => a.order - b.order),
    [sections]
  );

  const snapshot: CvConfig = useMemo(
    () => ({
      ...initial,
      name,
      theme,
      header,
      sections: [...withOrder(sidebar, "sidebar"), ...withOrder(main, "main")],
    }),
    [initial, name, theme, header, sidebar, main]
  );

  const patchSection = (id: string, next: CvSection) => {
    setSections((prev) => prev.map((s) => (s.id === id ? next : s)));
  };

  const replaceColumn = (column: CvSection["column"], next: CvSection[]) => {
    setSections((prev) => [
      ...prev.filter((s) => s.column !== column),
      ...withOrder(next, column),
    ]);
  };

  const addSection = () => {
    const block = createSection(newType, sections);
    setSections((prev) => [...prev, block]);
    setSelectedId(block.id);
  };

  const save = async () => {
    setBusy(true);
    try {
      await onSave({
        name: name.trim() || "Mi CV",
        locale: initial.locale,
        theme,
        header,
        sections: snapshot.sections,
      });
    } finally {
      setBusy(false);
    }
  };

  const translate = async () => {
    setBusy(true);
    try {
      await onSave({
        name: name.trim() || "Mi CV",
        locale: initial.locale,
        theme,
        header,
        sections: snapshot.sections,
      });
      await onTranslate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ alignSelf: "flex-start" }}>
        Volver a mis CVs
      </Button>

      <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
        <Stack spacing={2} flex={live ? 1 : 1} minWidth={0}>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                  <TextField
                    label="Nombre del documento"
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <Button variant="contained" disabled={busy} onClick={save}>
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TranslateIcon />}
                    disabled={busy || initial.locale === "en"}
                    onClick={translate}
                  >
                    Traducir a inglés
                  </Button>
                  <Button
                    variant={live ? "contained" : "outlined"}
                    color="secondary"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => setLive((v) => !v)}
                  >
                    {live ? "Ocultar preview" : "Ver PDF en vivo"}
                  </Button>
                  <Button
                    color="error"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm("¿Eliminar este CV?")) void onDelete();
                    }}
                  >
                    Eliminar
                  </Button>
                </Stack>
                {initial.locale === "en" ? (
                  <Typography variant="caption" color="text.secondary">
                    Esta es la versión en inglés.
                  </Typography>
                ) : null}

                <Typography variant="subtitle2">Foto de perfil</Typography>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Avatar
                    src={header.photoDataUrl || undefined}
                    alt={header.fullName || "Foto"}
                    sx={{ width: 72, height: 72 }}
                  />
                  <Button component="label" variant="outlined" size="small">
                    {header.photoDataUrl ? "Cambiar foto" : "Agregar foto"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (!file) return;
                        void compressProfilePhoto(file)
                          .then((photoDataUrl) =>
                            setHeader((prev) => ({ ...prev, photoDataUrl, showPhoto: true }))
                          )
                          .catch(() => undefined);
                      }}
                    />
                  </Button>
                  {header.photoDataUrl ? (
                    <>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={header.showPhoto}
                            onChange={(e) => setHeader({ ...header, showPhoto: e.target.checked })}
                          />
                        }
                        label="Mostrar en el CV"
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setHeader({ ...header, photoDataUrl: "", showPhoto: false })}
                      >
                        Quitar
                      </Button>
                    </>
                  ) : null}
                </Stack>

                <Typography variant="subtitle2">Cabecera</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
                  {(
                    [
                      ["fullName", "Nombre completo"],
                      ["role", "Cargo"],
                      ["location", "Ubicación"],
                      ["phone", "Teléfono"],
                      ["email", "Correo"],
                    ] as const
                  ).map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      size="small"
                      value={header[key]}
                      onChange={(e) => setHeader({ ...header, [key]: e.target.value })}
                      sx={{ flex: 1, minWidth: 160 }}
                    />
                  ))}
                </Stack>

                <style>{cvFontFaceCss()}</style>
                <Typography variant="subtitle2">Tipo de letra</Typography>
                <TextField
                  select
                  size="small"
                  label="Fuente"
                  value={theme.fontFamily}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  sx={{ maxWidth: 320 }}
                >
                  {CV_FONTS.map((font) => (
                    <MenuItem key={font.id} value={font.id} sx={{ fontFamily: font.css, fontSize: 16 }}>
                      {font.label}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="subtitle2">Colores recomendados</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {CV_PALETTES.map((palette) => {
                    const selected =
                      palette.theme.sidebarBg === theme.sidebarBg &&
                      palette.theme.accent === theme.accent &&
                      palette.theme.heading === theme.heading;
                    return (
                      <Button
                        key={palette.id}
                        size="small"
                        variant={selected ? "contained" : "outlined"}
                        onClick={() =>
                          setTheme({
                            ...palette.theme,
                            fontFamily: theme.fontFamily || palette.theme.fontFamily,
                          })
                        }
                        sx={{ textTransform: "none", pr: 1.5 }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                          {([palette.theme.sidebarBg, palette.theme.accent, palette.theme.heading, palette.theme.pageBg] as const).map(
                            (color, i) => (
                              <Box
                                key={`${palette.id}-${i}`}
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  bgcolor: color,
                                  border: "1px solid rgba(0,0,0,0.2)",
                                }}
                              />
                            )
                          )}
                          {palette.name}
                        </Box>
                      </Button>
                    );
                  })}
                </Stack>

                <Typography variant="subtitle2">Personalizar colores</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {THEME_FIELDS.map(({ key, label }) => (
                    <TextField
                      key={key}
                      label={label}
                      type="color"
                      size="small"
                      value={hexOr(theme[key], "#000000")}
                      onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                      sx={{ width: 140 }}
                    />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" spacing={1} mb={2}>
                  <TextField
                    select
                    size="small"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as CvSectionType)}
                    sx={{ flex: 1 }}
                  >
                    {SECTION_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {SECTION_LABELS[t]}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button startIcon={<AddIcon />} onClick={addSection}>
                    Sección
                  </Button>
                </Stack>
                <CvSectionList
                  title="Barra izquierda"
                  sections={sidebar}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onReorder={(next) => replaceColumn("sidebar", next)}
                  onToggle={(id) =>
                    setSections((prev) =>
                      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
                    )
                  }
                  onDelete={(id) => {
                    setSections((prev) => prev.filter((s) => s.id !== id));
                    if (selectedId === id) setSelectedId(null);
                  }}
                />
                <Box mt={2}>
                  <CvSectionList
                    title="Columna principal"
                    sections={main}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onReorder={(next) => replaceColumn("main", next)}
                    onToggle={(id) =>
                      setSections((prev) =>
                        prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
                      )
                    }
                    onDelete={(id) => {
                      setSections((prev) => prev.filter((s) => s.id !== id));
                      if (selectedId === id) setSelectedId(null);
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                {selected ? (
                  <CvSectionEditor
                    section={selected}
                    onChange={(next) => patchSection(selected.id, next)}
                  />
                ) : (
                  <Typography color="text.secondary">Elige una sección para editarla.</Typography>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Stack>

        {live ? (
          <Box sx={{ width: { xs: "100%", lg: 420 }, flexShrink: 0, minHeight: 640 }}>
            <CvPreview config={snapshot} height={640} />
          </Box>
        ) : null}
      </Stack>
    </Stack>
  );
}
