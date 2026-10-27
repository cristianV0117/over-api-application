"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { CvColumn, CvSection } from "@/lib/cv/types";
import { SECTION_LABELS } from "@/lib/cv/types";

type Props = {
  section: CvSection;
  onChange: (next: CvSection) => void;
};

function listOf<T>(value: unknown, fallback: T): T[] {
  return Array.isArray(value) ? (value as T[]) : [fallback];
}

export default function CvSectionEditor({ section, onChange }: Props) {
  const setConfig = (key: string, value: unknown) => {
    onChange({ ...section, config: { ...section.config, [key]: value } });
  };
  const { type, config } = section;

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        {SECTION_LABELS[type]}
      </Typography>
      <TextField
        label="Título de sección"
        size="small"
        fullWidth
        value={section.title}
        onChange={(e) => onChange({ ...section, title: e.target.value })}
      />
      <TextField
        select
        label="Columna"
        size="small"
        value={section.column}
        onChange={(e) => onChange({ ...section, column: e.target.value as CvColumn })}
      >
        <MenuItem value="sidebar">Barra izquierda</MenuItem>
        <MenuItem value="main">Columna principal</MenuItem>
      </TextField>

      {(type === "about" || type === "custom") && (
        <TextField
          label="Texto"
          fullWidth
          multiline
          minRows={4}
          value={String(config.text ?? "")}
          onChange={(e) => setConfig("text", e.target.value)}
        />
      )}

      {type === "personal" && (
        <ItemList
          items={listOf<{ label: string; value: string }>(config.items, { label: "", value: "" })}
          onChange={(items) => setConfig("items", items)}
          blank={{ label: "", value: "" }}
          fields={[
            { key: "label", label: "Etiqueta" },
            { key: "value", label: "Valor" },
          ]}
        />
      )}

      {type === "links" && (
        <ItemList
          items={listOf<{ label: string; url: string }>(config.items, { label: "", url: "" })}
          onChange={(items) => setConfig("items", items)}
          blank={{ label: "", url: "" }}
          fields={[
            { key: "label", label: "Nombre" },
            { key: "url", label: "URL" },
          ]}
        />
      )}

      {type === "education" && (
        <ItemList
          items={listOf<{ title: string; place: string; year: string; detail: string }>(config.items, {
            title: "",
            place: "",
            year: "",
            detail: "",
          })}
          onChange={(items) => setConfig("items", items)}
          blank={{ title: "", place: "", year: "", detail: "" }}
          fields={[
            { key: "title", label: "Título" },
            { key: "place", label: "Lugar" },
            { key: "year", label: "Año" },
            { key: "detail", label: "Detalle", multiline: true },
          ]}
        />
      )}

      {type === "skills" && (
        <ItemList
          items={listOf<string>(config.items, "").map((x) => (typeof x === "string" ? x : String(x)))}
          onChange={(items) => setConfig("items", items)}
          blank=""
          primitive
        />
      )}

      {type === "languages" && (
        <ItemList
          items={listOf<{ name: string; level: string }>(config.items, { name: "", level: "" })}
          onChange={(items) => setConfig("items", items)}
          blank={{ name: "", level: "" }}
          fields={[
            { key: "name", label: "Idioma" },
            { key: "level", label: "Nivel" },
          ]}
        />
      )}

      {type === "courses" && (
        <ItemList
          items={listOf<{ title: string; date: string }>(config.items, { title: "", date: "" })}
          onChange={(items) => setConfig("items", items)}
          blank={{ title: "", date: "" }}
          fields={[
            { key: "title", label: "Curso" },
            { key: "date", label: "Fecha" },
          ]}
        />
      )}

      {type === "experience" && (
        <ItemList
          items={listOf<{
            company: string;
            role: string;
            location: string;
            start: string;
            end: string;
            duration: string;
            description: string;
          }>(config.items, {
            company: "",
            role: "",
            location: "",
            start: "",
            end: "",
            duration: "",
            description: "",
          })}
          onChange={(items) => setConfig("items", items)}
          blank={{
            company: "",
            role: "",
            location: "",
            start: "",
            end: "",
            duration: "",
            description: "",
          }}
          fields={[
            { key: "company", label: "Empresa" },
            { key: "role", label: "Cargo" },
            { key: "location", label: "Lugar" },
            { key: "start", label: "Inicio" },
            { key: "end", label: "Fin" },
            { key: "duration", label: "Duración" },
            { key: "description", label: "Descripción", multiline: true },
          ]}
        />
      )}
    </Stack>
  );
}

function ItemList<T>({
  items,
  onChange,
  blank,
  fields,
  primitive,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: T;
  fields?: { key: string; label: string; multiline?: boolean }[];
  primitive?: boolean;
}) {
  return (
    <Stack spacing={1.5}>
      {items.map((item, i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
          <Stack spacing={1} flex={1}>
            {primitive ? (
              <TextField
                size="small"
                fullWidth
                label={`Ítem ${i + 1}`}
                value={String(item ?? "")}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = e.target.value as T;
                  onChange(next);
                }}
              />
            ) : (
              fields?.map((f) => (
                <TextField
                  key={f.key}
                  size="small"
                  fullWidth
                  multiline={f.multiline}
                  minRows={f.multiline ? 3 : undefined}
                  label={f.label}
                  value={String((item as Record<string, string>)[f.key] ?? "")}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...(item as object), [f.key]: e.target.value } as T;
                    onChange(next);
                  }}
                />
              ))
            )}
          </Stack>
          <IconButton size="small" color="error" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, blank])}>
        Agregar
      </Button>
    </Stack>
  );
}
