"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TranslateIcon from "@mui/icons-material/Translate";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createSection, hexOr } from "@/lib/cv/defaults";
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
  const [theme, setTheme] = useState(initial.theme);
  const [header, setHeader] = useState(initial.header);
  const [sections, setSections] = useState(initial.sections);
  const [selectedId, setSelectedId] = useState<string | null>(initial.sections[0]?.id ?? null);
  const [newType, setNewType] = useState<CvSectionType>("experience");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(true);
  const [preview, setPreview] = useState<CvConfig>(initial);

  const selected = sections.find((s) => s.id === selectedId) ?? null;
  const sidebar = sections.filter((s) => s.column === "sidebar").sort((a, b) => a.order - b.order);
  const main = sections.filter((s) => s.column === "main").sort((a, b) => a.order - b.order);

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

  useEffect(() => {
    const t = window.setTimeout(() => setPreview(snapshot), 400);
    return () => window.clearTimeout(t);
  }, [snapshot]);

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

                <Typography variant="subtitle2">Colores</Typography>
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
            <CvPreview config={preview} height={640} />
          </Box>
        ) : null}
      </Stack>
    </Stack>
  );
}
