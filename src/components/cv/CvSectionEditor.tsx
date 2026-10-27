"use client";

import { type ReactNode, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { formatDateRange, formatDuration } from "@/lib/cv/dates";
import { iconSvg, TECH_ICONS } from "@/lib/cv/techIcons";
import type { CvColumn, CvSection } from "@/lib/cv/types";
import { SECTION_LABELS } from "@/lib/cv/types";

type Props = {
  section: CvSection;
  onChange: (next: CvSection) => void;
};

function listOf<T>(value: unknown, fallback: T): T[] {
  return Array.isArray(value) ? (value as T[]) : [fallback];
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x ?? "").trim()).filter(Boolean);
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
          items={listOf<{
            title: string;
            institution: string;
            place: string;
            year: string;
            detail: string;
          }>(config.items, { title: "", institution: "", place: "", year: "", detail: "" })}
          onChange={(items) => setConfig("items", items)}
          blank={{ title: "", institution: "", place: "", year: "", detail: "" }}
          fields={[
            { key: "title", label: "Título / carrera" },
            { key: "institution", label: "Universidad" },
            { key: "place", label: "Ciudad" },
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

      {type === "icons" && (
        <IconPicker
          selected={listOf<string>(config.items, "").map((x) => String(x))}
          onChange={(items) => setConfig("items", items)}
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
          items={listOf<{ title: string; provider: string; date: string }>(config.items, {
            title: "",
            provider: "",
            date: "",
          })}
          onChange={(items) => setConfig("items", items)}
          blank={{ title: "", provider: "", date: "" }}
          fields={[
            { key: "title", label: "Curso" },
            { key: "provider", label: "Plataforma (Udemy, CodelyTV…)" },
            { key: "date", label: "Fecha" },
          ]}
        />
      )}

      {type === "experience" && (
        <ExperienceList
          items={listOf<ExperienceItem>(config.items, emptyExperience())}
          onChange={(items) => setConfig("items", items)}
        />
      )}

      {type === "projects" && (
        <ProjectList
          items={listOf<ProjectItem>(config.items, emptyProject())}
          onChange={(items) => setConfig("items", items)}
        />
      )}
    </Stack>
  );
}

type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  startMonth?: string;
  endMonth?: string;
  current?: boolean;
  start?: string;
  end?: string;
  duration?: string;
  description: string;
  tags?: string[];
};

function emptyExperience(): ExperienceItem {
  return {
    company: "",
    role: "",
    location: "",
    startMonth: "",
    endMonth: "",
    current: false,
    description: "",
    tags: [],
  };
}

function nextRowId() {
  return `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function SortableRow({
  id,
  children,
  onDelete,
}: {
  id: string;
  children: ReactNode;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      spacing={1}
      alignItems="flex-start"
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        p: 1,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
      }}
    >
      <IconButton size="small" sx={{ cursor: "grab", mt: 0.5 }} {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" />
      </IconButton>
      <Stack spacing={1} flex={1} minWidth={0}>
        {children}
      </Stack>
      <IconButton size="small" color="error" onClick={onDelete}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
}

function SortableRows<T>({
  items,
  onChange,
  renderItem,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
}) {
  const idsRef = useRef<string[]>([]);
  if (idsRef.current.length < items.length) {
    while (idsRef.current.length < items.length) idsRef.current.push(nextRowId());
  }
  const ids = idsRef.current.slice(0, items.length);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    idsRef.current = arrayMove(ids, oldIndex, newIndex);
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  const removeAt = (index: number) => {
    idsRef.current = ids.filter((_, j) => j !== index);
    onChange(items.filter((_, j) => j !== index));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <Stack spacing={1.5}>
          {items.map((item, i) => (
            <SortableRow key={ids[i]} id={ids[i]} onDelete={() => removeAt(i)}>
              {renderItem(item, i)}
            </SortableRow>
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}

function ExperienceList({
  items,
  onChange,
}: {
  items: ExperienceItem[];
  onChange: (next: ExperienceItem[]) => void;
}) {
  const patch = (index: number, next: ExperienceItem) => {
    const list = [...items];
    list[index] = next;
    onChange(list);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Arrastra el ícono para cambiar el orden. El de arriba sale primero en el PDF.
      </Typography>
      <SortableRows
        items={items}
        onChange={onChange}
        renderItem={(item, i) => {
        const duration = formatDuration(item.startMonth, item.endMonth, Boolean(item.current));
        const range = formatDateRange(
          item.startMonth,
          item.endMonth,
          Boolean(item.current),
          item.start,
          item.end
        );
        return (
            <Stack spacing={1}>
              <TextField
                size="small"
                label="Empresa"
                value={item.company ?? ""}
                onChange={(e) => patch(i, { ...item, company: e.target.value })}
              />
              <TextField
                size="small"
                label="Cargo"
                value={item.role ?? ""}
                onChange={(e) => patch(i, { ...item, role: e.target.value })}
              />
              <TextField
                size="small"
                label="Lugar"
                value={item.location ?? ""}
                onChange={(e) => patch(i, { ...item, location: e.target.value })}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <TextField
                  size="small"
                  type="month"
                  label="Fecha de inicio"
                  InputLabelProps={{ shrink: true }}
                  value={item.startMonth ?? ""}
                  onChange={(e) => patch(i, { ...item, startMonth: e.target.value })}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="month"
                  label="Fecha de fin"
                  InputLabelProps={{ shrink: true }}
                  disabled={Boolean(item.current)}
                  value={item.current ? "" : item.endMonth ?? ""}
                  onChange={(e) => patch(i, { ...item, endMonth: e.target.value })}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(item.current)}
                    onChange={(e) => patch(i, { ...item, current: e.target.checked })}
                  />
                }
                label="Trabajo actualmente aquí"
              />
              {range || duration ? (
                <Typography variant="caption" color="text.secondary">
                  {range}
                  {duration ? ` · ${duration}` : ""}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Elige inicio y fin; la duración se calcula sola.
                </Typography>
              )}
              <TextField
                size="small"
                label="Descripción"
                multiline
                minRows={3}
                value={item.description ?? ""}
                onChange={(e) => patch(i, { ...item, description: e.target.value })}
              />
              <TagInput tags={asTags(item.tags)} onChange={(tags) => patch(i, { ...item, tags })} />
            </Stack>
        );
        }}
      />
      <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, emptyExperience()])}>
        Agregar
      </Button>
    </Stack>
  );
}

type ProjectItem = {
  name: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  embedUrl: string;
  tags?: string[];
};

function emptyProject(): ProjectItem {
  return {
    name: "",
    role: "",
    tagline: "",
    description: "",
    url: "",
    embedUrl: "",
    tags: [],
  };
}

function ProjectList({
  items,
  onChange,
}: {
  items: ProjectItem[];
  onChange: (next: ProjectItem[]) => void;
}) {
  const patch = (index: number, next: ProjectItem) => {
    const list = [...items];
    list[index] = next;
    onChange(list);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary">
        Arrastra para reordenar. El PDF muestra nombre, descripción, etiquetas y enlace. El iframe solo se ve aquí
        (un PDF no puede incrustar una web).
      </Typography>
      <SortableRows
        items={items}
        onChange={onChange}
        renderItem={(item, i) => (
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Nombre del proyecto"
              value={item.name ?? ""}
              onChange={(e) => patch(i, { ...item, name: e.target.value })}
            />
            <TextField
              size="small"
              label="Rol"
              value={item.role ?? ""}
              onChange={(e) => patch(i, { ...item, role: e.target.value })}
            />
            <TextField
              size="small"
              label="Frase corta"
              value={item.tagline ?? ""}
              onChange={(e) => patch(i, { ...item, tagline: e.target.value })}
            />
            <TextField
              size="small"
              label="Descripción"
              multiline
              minRows={3}
              value={item.description ?? ""}
              onChange={(e) => patch(i, { ...item, description: e.target.value })}
            />
            <TextField
              size="small"
              label="URL del proyecto"
              value={item.url ?? ""}
              onChange={(e) => patch(i, { ...item, url: e.target.value })}
            />
            <TextField
              size="small"
              label="URL para vista embebida (opcional)"
              value={item.embedUrl ?? ""}
              onChange={(e) => patch(i, { ...item, embedUrl: e.target.value })}
            />
            <TagInput tags={asTags(item.tags)} onChange={(tags) => patch(i, { ...item, tags })} />
            {item.embedUrl ? (
              <Box
                component="iframe"
                src={item.embedUrl}
                title={item.name || "Proyecto"}
                sx={{ width: "100%", height: 180, border: 1, borderColor: "divider", borderRadius: 1 }}
              />
            ) : null}
          </Stack>
        )}
      />
      <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, emptyProject()])}>
        Agregar
      </Button>
    </Stack>
  );
}

function TagInput({ tags, onChange }: { tags: string[]; onChange: (next: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;
    const exists = tags.some((tag) => tag.toLowerCase() === value.toLowerCase());
    if (!exists) onChange([...tags, value]);
    setDraft("");
  };

  return (
    <Stack spacing={0.75}>
      <TextField
        size="small"
        label="Etiquetas de tecnología"
        placeholder="Escribe PHP y pulsa Enter"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => add(draft)}
        helperText="Enter o coma para agregar"
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {tags.map((tag) => (
          <Chip key={tag} size="small" label={tag} onDelete={() => onChange(tags.filter((x) => x !== tag))} />
        ))}
      </Box>
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
      <Typography variant="caption" color="text.secondary">
        Arrastra el ícono para cambiar el orden.
      </Typography>
      <SortableRows
        items={items}
        onChange={onChange}
        renderItem={(item, i) =>
            primitive ? (
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
              <Stack spacing={1}>
              {fields?.map((f) => (
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
              ))}
              </Stack>
            )
        }
      />
      <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, blank])}>
        Agregar
      </Button>
    </Stack>
  );
}

function IconPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        Elige iconos de tecnologías. Los seleccionados aparecen en el PDF.
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {TECH_ICONS.map((icon) => {
          const active = selected.includes(icon.id);
          return (
            <Button
              key={icon.id}
              size="small"
              variant={active ? "contained" : "outlined"}
              onClick={() => toggle(icon.id)}
              sx={{ textTransform: "none", minWidth: 0 }}
              startIcon={
                <Box
                  component="img"
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(iconSvg(icon, active ? "#FFFFFF" : icon.hex))}`}
                  alt=""
                  sx={{ width: 16, height: 16 }}
                />
              }
            >
              {icon.label}
            </Button>
          );
        })}
      </Box>
    </Stack>
  );
}
