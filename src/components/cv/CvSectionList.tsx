"use client";

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
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import InsertPageBreakOutlinedIcon from "@mui/icons-material/InsertPageBreakOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { CvSection } from "@/lib/cv/types";

type Props = {
  title: string;
  sections: CvSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (next: CvSection[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleBreak?: (id: string) => void;
};

function SortableRow({
  section,
  selected,
  onSelect,
  onToggle,
  onDelete,
  onToggleBreak,
}: {
  section: CvSection;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onToggleBreak?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });
  return (
    <ListItemButton
      ref={setNodeRef}
      selected={selected}
      onClick={onSelect}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: section.visible ? 1 : 0.5,
        borderRadius: 1,
        mb: 0.5,
      }}
    >
      <ListItemIcon sx={{ minWidth: 28 }} {...attributes} {...listeners}>
        <DragIndicatorIcon fontSize="small" sx={{ cursor: "grab" }} />
      </ListItemIcon>
      <ListItemText
        primary={section.title}
        secondary={
          [
            (section.scale ?? 100) !== 100 ? `${section.scale}%` : "",
            section.breakBefore ? "Hoja nueva" : "",
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        primaryTypographyProps={{ variant: "body2", noWrap: true }}
        secondaryTypographyProps={{ variant: "caption" }}
      />
      {onToggleBreak ? (
        <IconButton
          size="small"
          color={section.breakBefore ? "primary" : "default"}
          title={section.breakBefore ? "Quitar salto de hoja" : "Empezar en una hoja nueva"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBreak();
          }}
        >
          <InsertPageBreakOutlinedIcon fontSize="small" />
        </IconButton>
      ) : null}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {section.visible ? (
          <VisibilityOutlinedIcon fontSize="small" />
        ) : (
          <VisibilityOffOutlinedIcon fontSize="small" />
        )}
      </IconButton>
      <IconButton
        size="small"
        color="error"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </ListItemButton>
  );
}

export default function CvSectionList({
  title,
  sections,
  selectedId,
  onSelect,
  onReorder,
  onToggle,
  onDelete,
  onToggleBreak,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <Stack>
      <Typography variant="overline" color="text.secondary">
        {title}
      </Typography>
      {onToggleBreak ? (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          Arrastra para reordenar. El icono de hoja manda la sección a una página nueva.
        </Typography>
      ) : null}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <List dense disablePadding>
            {sections.map((section) => (
              <SortableRow
                key={section.id}
                section={section}
                selected={selectedId === section.id}
                onSelect={() => onSelect(section.id)}
                onToggle={() => onToggle(section.id)}
                onDelete={() => onDelete(section.id)}
                onToggleBreak={onToggleBreak ? () => onToggleBreak(section.id) : undefined}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>
    </Stack>
  );
}
