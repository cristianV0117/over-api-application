"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  createFinanceDebt,
  deleteFinanceDebt,
  formatCop,
  updateFinanceDebt,
  type FinanceDebt,
  type FinanceDebtWrite,
  type FinanceInterestRateType,
} from "@/lib/api/contabilidad";

const emptyForm = {
  name: "",
  creditor: "",
  balance: "",
  principal: "",
  interestRate: "",
  interestRateType: "NM" as FinanceInterestRateType,
  installmentAmount: "",
  dayOfMonth: "1",
  totalInstallments: "",
  paidInstallments: "0",
  notes: "",
  isActive: true,
};

type FormState = typeof emptyForm;

function debtToForm(d: FinanceDebt): FormState {
  return {
    name: d.name,
    creditor: d.creditor,
    balance: String(d.balance),
    principal: String(d.principal || ""),
    interestRate: String(d.interestRate),
    interestRateType: d.interestRateType,
    installmentAmount: String(d.installmentAmount),
    dayOfMonth: String(d.dayOfMonth),
    totalInstallments:
      d.totalInstallments != null ? String(d.totalInstallments) : "",
    paidInstallments: String(d.paidInstallments || 0),
    notes: d.notes,
    isActive: d.isActive,
  };
}

function formToWrite(form: FormState): FinanceDebtWrite {
  return {
    name: form.name.trim(),
    creditor: form.creditor.trim(),
    balance: Number(form.balance),
    principal: form.principal ? Number(form.principal) : Number(form.balance),
    interestRate: Number(form.interestRate),
    interestRateType: form.interestRateType,
    installmentAmount: Number(form.installmentAmount),
    dayOfMonth: Number(form.dayOfMonth) || 1,
    totalInstallments: form.totalInstallments
      ? Number(form.totalInstallments)
      : null,
    paidInstallments: Number(form.paidInstallments) || 0,
    notes: form.notes.trim(),
    isActive: form.isActive,
  };
}

type Props = {
  debts: FinanceDebt[];
  onChanged: () => Promise<void> | void;
};

export default function FinanceDebtsPanel({ debts, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceDebt | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (d: FinanceDebt) => {
    setEditing(d);
    setForm(debtToForm(d));
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.balance || !form.installmentAmount) {
      toast.error("Nombre, saldo y cuota son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const data = formToWrite(form);
      if (editing) await updateFinanceDebt(editing.id, data);
      else await createFinanceDebt(data);
      toast.success(editing ? "Deuda actualizada" : "Deuda creada");
      setOpen(false);
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: FinanceDebt) => {
    if (!confirm(`¿Eliminar “${d.name}”?`)) return;
    try {
      await deleteFinanceDebt(d.id);
      toast.success("Deuda eliminada");
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  const totalBalance = debts
    .filter((d) => d.isActive)
    .reduce((s, d) => s + d.balance, 0);

  return (
    <>
      <Paper sx={{ p: 2, width: "100%", minWidth: 0, maxWidth: "100%" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={1}
          sx={{ mb: 1 }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Créditos y deudas
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Tasa, cuota y saldo para que el asistente arme un plan de pago.
              {debts.length > 0
                ? ` Saldo activo: ${formatCop(totalBalance)}`
                : ""}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNew}
          >
            Nueva
          </Button>
        </Stack>
        {debts.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Todavía no hay créditos. Agregá uno o mandale un pantallazo al
            asistente.
          </Typography>
        ) : (
          <TableContainer sx={{ width: "100%", overflow: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Activo</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Acreedor</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                  <TableCell align="right">Cuota</TableCell>
                  <TableCell>Tasa</TableCell>
                  <TableCell align="center">Cuotas</TableCell>
                  <TableCell align="right">Acc.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {debts.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={d.isActive}
                        onChange={(_, v) =>
                          updateFinanceDebt(d.id, { isActive: v })
                            .then(onChanged)
                            .catch((e) =>
                              toast.error(
                                e instanceof Error ? e.message : "Error"
                              )
                            )
                        }
                      />
                    </TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.creditor || "—"}</TableCell>
                    <TableCell align="right">{formatCop(d.balance)}</TableCell>
                    <TableCell align="right">
                      {formatCop(d.installmentAmount)}
                    </TableCell>
                    <TableCell>
                      {d.interestRate}% {d.interestRateType}
                    </TableCell>
                    <TableCell align="center">
                      {d.totalInstallments
                        ? `${d.paidInstallments}/${d.totalInstallments}`
                        : d.paidInstallments || "—"}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(d)}
                        aria-label="Editar deuda"
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => remove(d)}
                        aria-label="Eliminar deuda"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editing ? "Editar deuda" : "Nueva deuda"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Banco / acreedor"
              fullWidth
              value={form.creditor}
              onChange={(e) =>
                setForm((f) => ({ ...f, creditor: e.target.value }))
              }
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Saldo restante"
                type="number"
                fullWidth
                value={form.balance}
                onChange={(e) =>
                  setForm((f) => ({ ...f, balance: e.target.value }))
                }
              />
              <TextField
                label="Monto original"
                type="number"
                fullWidth
                value={form.principal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, principal: e.target.value }))
                }
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Cuota mensual"
                type="number"
                fullWidth
                value={form.installmentAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, installmentAmount: e.target.value }))
                }
              />
              <TextField
                label="Tasa (%)"
                type="number"
                fullWidth
                value={form.interestRate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, interestRate: e.target.value }))
                }
              />
              <FormControl fullWidth>
                <InputLabel>Tipo de tasa</InputLabel>
                <Select
                  label="Tipo de tasa"
                  value={form.interestRateType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      interestRateType: e.target
                        .value as FinanceInterestRateType,
                    }))
                  }
                >
                  <MenuItem value="NM">N.M. (mensual)</MenuItem>
                  <MenuItem value="EA">E.A. (anual)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Día de cobro"
                type="number"
                fullWidth
                value={form.dayOfMonth}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dayOfMonth: e.target.value }))
                }
                inputProps={{ min: 1, max: 31 }}
              />
              <TextField
                label="Cuotas totales"
                type="number"
                fullWidth
                value={form.totalInstallments}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalInstallments: e.target.value }))
                }
              />
              <TextField
                label="Cuotas pagadas"
                type="number"
                fullWidth
                value={form.paidInstallments}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paidInstallments: e.target.value }))
                }
              />
            </Stack>
            <TextField
              label="Notas"
              fullWidth
              multiline
              minRows={2}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Switch
                checked={form.isActive}
                onChange={(_, v) => setForm((f) => ({ ...f, isActive: v }))}
              />
              <Typography variant="body2">Activa</Typography>
              <Chip
                size="small"
                label={
                  form.interestRateType === "NM"
                    ? "Nominal mensual"
                    : "Efectiva anual"
                }
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={save} variant="contained" disabled={saving}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
