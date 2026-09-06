"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  createPayLink,
  deletePayLink,
  listPayLinks,
  updatePayLink,
  type PayLink,
} from "@/lib/api/pay-links";

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export default function PayLinksPanel() {
  const [links, setLinks] = useState<PayLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PayLink | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLinks(await listPayLinks());
  };

  useEffect(() => {
    refresh()
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Error al cargar")
      )
      .finally(() => setLoading(false));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setName("");
    setUrl("");
    setNotes("");
    setOpen(true);
  };

  const startEdit = (row: PayLink) => {
    setEditing(row);
    setName(row.name);
    setUrl(row.url);
    setNotes(row.notes ?? "");
    setOpen(true);
  };

  const save = async () => {
    const payload = {
      name: name.trim(),
      url: normalizeUrl(url),
      notes: notes.trim() || undefined,
    };
    if (!payload.name || !payload.url) {
      toast.error("Completá el nombre y la URL");
      return;
    }
    setSaving(true);
    try {
      if (editing) await updatePayLink(editing.id, payload);
      else await createPayLink(payload);
      await refresh();
      setOpen(false);
      toast.success(editing ? "Página actualizada" : "Página guardada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: PayLink) => {
    if (!confirm(`¿Eliminar ${row.name}?`)) return;
    try {
      await deletePayLink(row.id);
      setLinks((prev) => prev.filter((x) => x.id !== row.id));
      toast.success("Página eliminada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Páginas de pago
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Guardá accesos rápidos (Tigo, bancos, servicios) y abrilos en un
            clic.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={startCreate}
        >
          Agregar página
        </Button>
      </Stack>

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Cargando…
        </Typography>
      ) : links.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Todavía no hay páginas. Agregá por ejemplo Tigo y pegá la URL de pago.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
          }}
        >
          {links.map((row) => (
            <Card key={row.id} variant="outlined">
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {row.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ wordBreak: "break-all" }}
                >
                  {row.url}
                </Typography>
                {row.notes ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {row.notes}
                  </Typography>
                ) : null}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<OpenInNewIcon />}
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir
                </Button>
                <IconButton
                  size="small"
                  aria-label={`Editar ${row.name}`}
                  onClick={() => startEdit(row)}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label={`Eliminar ${row.name}`}
                  onClick={() => void remove(row)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? "Editar página" : "Nueva página de pago"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tigo"
              autoFocus
              fullWidth
            />
            <TextField
              label="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.tigo.com.co/..."
              fullWidth
            />
            <TextField
              label="Nota (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Plan hogar, vencimiento, etc."
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={() => void save()}
            disabled={saving}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
