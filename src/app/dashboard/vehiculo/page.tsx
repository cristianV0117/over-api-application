"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  createVehicle,
  deleteVehicle,
  deleteVehicleDocument,
  listVehicles,
  openVehicleDocument,
  updateVehicle,
  uploadVehicleDocument,
  type Vehicle,
  type VehicleDocKind,
  type VehicleType,
  type VehicleWrite,
} from "@/lib/api/vehicles";

const DOC_SLOTS: {
  kind: VehicleDocKind;
  title: string;
  hint: string;
}[] = [
  { kind: "soat", title: "SOAT", hint: "Póliza en PDF o foto" },
  { kind: "tecnomecanica", title: "Tecnomecánica", hint: "Revisión en PDF o foto" },
  { kind: "tarjetaPropiedad", title: "Tarjeta de propiedad", hint: "Documento del vehículo" },
  { kind: "licencia", title: "Licencia de conducción", hint: "PDF o foto de la licencia" },
];

type FormState = {
  type: VehicleType;
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  notes: string;
  soatExpiresAt: string;
  technoExpiresAt: string;
  licenseExpiresAt: string;
};

const emptyForm = (): FormState => ({
  type: "moto",
  plate: "",
  brand: "",
  model: "",
  year: "",
  color: "",
  notes: "",
  soatExpiresAt: "",
  technoExpiresAt: "",
  licenseExpiresAt: "",
});

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fromVehicle(v: Vehicle): FormState {
  return {
    type: v.type,
    plate: v.plate,
    brand: v.brand,
    model: v.model,
    year: v.year ? String(v.year) : "",
    color: v.color,
    notes: v.notes,
    soatExpiresAt: toDateInput(v.soatExpiresAt),
    technoExpiresAt: toDateInput(v.technoExpiresAt),
    licenseExpiresAt: toDateInput(v.licenseExpiresAt),
  };
}

function toWrite(form: FormState): VehicleWrite {
  const year = form.year.trim() ? Number(form.year) : undefined;
  return {
    type: form.type,
    plate: form.plate.trim(),
    brand: form.brand.trim(),
    model: form.model.trim(),
    year: Number.isFinite(year) ? year : undefined,
    color: form.color.trim(),
    notes: form.notes.trim(),
    soatExpiresAt: form.soatExpiresAt || null,
    technoExpiresAt: form.technoExpiresAt || null,
    licenseExpiresAt: form.licenseExpiresAt || null,
  };
}

function expiryChip(iso: string | null, label: string) {
  if (!iso) return null;
  const date = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expired = date < today;
  const soon =
    !expired && date.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000;
  return (
    <Chip
      size="small"
      label={`${label}: ${date.toLocaleDateString("es-CO")}`}
      color={expired ? "error" : soon ? "warning" : "success"}
      variant="outlined"
    />
  );
}

export default function VehiculoPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, FormState>>({});

  const load = async () => {
    const list = await listVehicles();
    setVehicles(list);
    setDrafts(Object.fromEntries(list.map((v) => [v.id, fromVehicle(v)])));
  };

  useEffect(() => {
    load()
      .catch((e) => toast.error(e instanceof Error ? e.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.plate.trim()) {
      toast.error("La placa es obligatoria");
      return;
    }
    setCreating(true);
    try {
      const created = await createVehicle(toWrite(createForm));
      setVehicles((prev) => [created, ...prev]);
      setDrafts((prev) => ({ ...prev, [created.id]: fromVehicle(created) }));
      setCreateForm(emptyForm());
      toast.success("Vehículo guardado. Ya puedes adjuntar los PDFs.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (id: string) => {
    const draft = drafts[id];
    if (!draft) return;
    setSavingId(id);
    try {
      const updated = await updateVehicle(id, toWrite(draft));
      setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
      setDrafts((prev) => ({ ...prev, [id]: fromVehicle(updated) }));
      toast.success("Datos actualizados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar este vehículo y sus documentos?")) return;
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast.success("Vehículo eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 920, mx: "auto", width: "100%" }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
        Vehículo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Guarda los datos de tu moto o carro y adjunta SOAT, tecnomecánica,
        tarjeta de propiedad y licencia. Los archivos quedan en el volumen de
        uploads.
      </Typography>

      <Paper component="form" onSubmit={handleCreate} sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <AddOutlinedIcon fontSize="small" />
          <Typography fontWeight={700}>Agregar vehículo</Typography>
        </Stack>
        <VehicleFields
          form={createForm}
          onChange={setCreateForm}
          disabled={creating}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={creating ? <CircularProgress size={16} /> : <AddOutlinedIcon />}
          disabled={creating}
          sx={{ mt: 2 }}
        >
          Guardar vehículo
        </Button>
      </Paper>

      {vehicles.length === 0 ? (
        <Typography color="text.secondary">
          Aún no tienes un vehículo. Agrégalo arriba y luego sube los PDFs.
        </Typography>
      ) : (
        <Stack spacing={2.5}>
          {vehicles.map((vehicle) => {
            const draft = drafts[vehicle.id] ?? fromVehicle(vehicle);
            return (
              <Paper key={vehicle.id} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    {vehicle.type === "moto" ? (
                      <TwoWheelerOutlinedIcon color="primary" />
                    ) : (
                      <DirectionsCarOutlinedIcon color="primary" />
                    )}
                    <Typography fontWeight={800}>{vehicle.plate}</Typography>
                    <Chip
                      size="small"
                      label={vehicle.type === "moto" ? "Moto" : "Carro"}
                    />
                    {expiryChip(vehicle.soatExpiresAt, "SOAT")}
                    {expiryChip(vehicle.technoExpiresAt, "Tecno")}
                    {expiryChip(vehicle.licenseExpiresAt, "Licencia")}
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SaveOutlinedIcon />}
                      disabled={savingId === vehicle.id}
                      onClick={() => void handleSave(vehicle.id)}
                    >
                      Guardar
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => void handleDelete(vehicle.id)}
                      aria-label="Eliminar vehículo"
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <VehicleFields
                  form={draft}
                  onChange={(next) =>
                    setDrafts((prev) => ({ ...prev, [vehicle.id]: next }))
                  }
                  disabled={savingId === vehicle.id}
                />

                <Typography fontWeight={700} sx={{ mt: 2.5, mb: 1.5 }}>
                  Documentos
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {DOC_SLOTS.map((slot) => (
                    <DocumentCard
                      key={slot.kind}
                      vehicle={vehicle}
                      kind={slot.kind}
                      title={slot.title}
                      hint={slot.hint}
                      onUpdated={(next) => {
                        setVehicles((prev) =>
                          prev.map((v) => (v.id === next.id ? next : v))
                        );
                        setDrafts((prev) => ({
                          ...prev,
                          [next.id]: fromVehicle(next),
                        }));
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

function VehicleFields({
  form,
  onChange,
  disabled,
}: {
  form: FormState;
  onChange: (next: FormState) => void;
  disabled?: boolean;
}) {
  const set = (patch: Partial<FormState>) => onChange({ ...form, ...patch });
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
        gap: 1.5,
      }}
    >
      <FormControl size="small" fullWidth>
        <InputLabel>Tipo</InputLabel>
        <Select
          label="Tipo"
          value={form.type}
          disabled={disabled}
          onChange={(e) => set({ type: e.target.value as VehicleType })}
        >
          <MenuItem value="moto">Moto</MenuItem>
          <MenuItem value="carro">Carro</MenuItem>
        </Select>
      </FormControl>
      <TextField
        size="small"
        label="Placa"
        value={form.plate}
        disabled={disabled}
        onChange={(e) => set({ plate: e.target.value.toUpperCase() })}
        required
      />
      <TextField
        size="small"
        label="Marca"
        value={form.brand}
        disabled={disabled}
        onChange={(e) => set({ brand: e.target.value })}
      />
      <TextField
        size="small"
        label="Modelo"
        value={form.model}
        disabled={disabled}
        onChange={(e) => set({ model: e.target.value })}
      />
      <TextField
        size="small"
        label="Año"
        type="number"
        value={form.year}
        disabled={disabled}
        onChange={(e) => set({ year: e.target.value })}
      />
      <TextField
        size="small"
        label="Color"
        value={form.color}
        disabled={disabled}
        onChange={(e) => set({ color: e.target.value })}
      />
      <TextField
        size="small"
        label="Vence SOAT"
        type="date"
        value={form.soatExpiresAt}
        disabled={disabled}
        onChange={(e) => set({ soatExpiresAt: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        label="Vence tecnomecánica"
        type="date"
        value={form.technoExpiresAt}
        disabled={disabled}
        onChange={(e) => set({ technoExpiresAt: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        label="Vence licencia"
        type="date"
        value={form.licenseExpiresAt}
        disabled={disabled}
        onChange={(e) => set({ licenseExpiresAt: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        size="small"
        label="Notas"
        value={form.notes}
        disabled={disabled}
        onChange={(e) => set({ notes: e.target.value })}
        sx={{ gridColumn: { md: "1 / -1" } }}
      />
    </Box>
  );
}

function DocumentCard({
  vehicle,
  kind,
  title,
  hint,
  onUpdated,
}: {
  vehicle: Vehicle;
  kind: VehicleDocKind;
  title: string;
  hint: string;
  onUpdated: (v: Vehicle) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const file = vehicle.documents[kind];

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (selected.size > 8 * 1024 * 1024) {
      toast.error("El archivo debe ser menor a 8 MB");
      return;
    }
    setBusy(true);
    try {
      const updated = await uploadVehicleDocument(vehicle.id, kind, selected);
      onUpdated(updated);
      toast.success(`${title} subido`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir");
    } finally {
      setBusy(false);
    }
  };

  const open = async () => {
    setBusy(true);
    try {
      await openVehicleDocument(vehicle.id, kind);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo abrir");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`¿Quitar ${title}?`)) return;
    setBusy(true);
    try {
      const updated = await deleteVehicleDocument(vehicle.id, kind);
      onUpdated(updated);
      toast.success(`${title} eliminado`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo quitar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept="application/pdf,image/jpeg,image/png,image/webp"
        onChange={onFile}
      />
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <PictureAsPdfOutlinedIcon color={file ? "primary" : "disabled"} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={700} variant="body2">
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {file
              ? `${file.fileName} · ${new Date(file.uploadedAt).toLocaleDateString("es-CO")}`
              : hint}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
            <Button
              size="small"
              startIcon={busy ? <CircularProgress size={14} /> : <UploadFileOutlinedIcon />}
              disabled={busy}
              onClick={pick}
            >
              {file ? "Reemplazar" : "Subir"}
            </Button>
            {file ? (
              <>
                <Button
                  size="small"
                  startIcon={<VisibilityOutlinedIcon />}
                  disabled={busy}
                  onClick={() => void open()}
                >
                  Ver
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  disabled={busy}
                  onClick={() => void remove()}
                  aria-label={`Quitar ${title}`}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
