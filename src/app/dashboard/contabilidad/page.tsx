"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  createExpenseCategory,
  createFinanceExpense,
  createFinanceIncome,
  createIncomeCategory,
  createRecurringExpense,
  createRecurringIncome,
  deleteExpenseCategory,
  deleteFinanceExpense,
  deleteFinanceIncome,
  deleteIncomeCategory,
  deleteRecurringExpense,
  deleteRecurringIncome,
  formatCop,
  getFinanceSummary,
  listExpenseCategories,
  listIncomeCategories,
  listRecurringExpenses,
  listRecurringIncomes,
  putFinanceLiquidity,
  type ExpenseCategory,
  type FinanceExpense,
  type FinanceIncomeLine,
  type FinanceRecurringRule,
  type FinanceSummary,
  type IncomeCategory,
  updateExpenseCategory,
  updateFinanceExpense,
  updateFinanceIncome,
  updateIncomeCategory,
  updateRecurringExpense,
  updateRecurringIncome,
} from "@/lib/api/contabilidad";

const MONTHS = [
  { v: 1, label: "Enero" },
  { v: 2, label: "Febrero" },
  { v: 3, label: "Marzo" },
  { v: 4, label: "Abril" },
  { v: 5, label: "Mayo" },
  { v: 6, label: "Junio" },
  { v: 7, label: "Julio" },
  { v: 8, label: "Agosto" },
  { v: 9, label: "Septiembre" },
  { v: 10, label: "Octubre" },
  { v: 11, label: "Noviembre" },
  { v: 12, label: "Diciembre" },
];

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function toYmdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function recurringExpenseForMonth(
  ruleId: string,
  expenses: FinanceExpense[]
): FinanceExpense | undefined {
  return expenses.find((e) => e.isRecurring && e.recurringRuleId === ruleId);
}

function recurringIncomeForMonth(
  ruleId: string,
  incomes: FinanceIncomeLine[]
): FinanceIncomeLine | undefined {
  return incomes.find((e) => e.isRecurring && e.recurringRuleId === ruleId);
}

export default function ContabilidadPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    []
  );
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const [incCatDialogOpen, setIncCatDialogOpen] = useState(false);
  const [incCatName, setIncCatName] = useState("");
  const [editingIncCat, setEditingIncCat] = useState<IncomeCategory | null>(
    null
  );

  const [expCatDialogOpen, setExpCatDialogOpen] = useState(false);
  const [expCatName, setExpCatName] = useState("");
  const [editingExpCat, setEditingExpCat] = useState<ExpenseCategory | null>(
    null
  );

  const [incDialogOpen, setIncDialogOpen] = useState(false);
  const [editingInc, setEditingInc] = useState<FinanceIncomeLine | null>(null);
  const [incCategoryId, setIncCategoryId] = useState("");
  const [incAmount, setIncAmount] = useState("");
  const [incDate, setIncDate] = useState("");
  const [incNotes, setIncNotes] = useState("");

  const [expDialogOpen, setExpDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<FinanceExpense | null>(null);
  const [expCategoryId, setExpCategoryId] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [expNotes, setExpNotes] = useState("");

  const [recurringRules, setRecurringRules] = useState<FinanceRecurringRule[]>([]);
  const [recDialogOpen, setRecDialogOpen] = useState(false);
  const [editingRec, setEditingRec] = useState<FinanceRecurringRule | null>(null);
  const [recCategoryId, setRecCategoryId] = useState("");
  const [recAmount, setRecAmount] = useState("");
  const [recDay, setRecDay] = useState("1");
  const [recLabel, setRecLabel] = useState("");
  const [recNotes, setRecNotes] = useState("");
  const [recActive, setRecActive] = useState(true);

  const [recurringIncomeRules, setRecurringIncomeRules] = useState<
    FinanceRecurringRule[]
  >([]);
  const [recIncDialogOpen, setRecIncDialogOpen] = useState(false);
  const [editingRecInc, setEditingRecInc] = useState<FinanceRecurringRule | null>(
    null
  );
  const [recIncCategoryId, setRecIncCategoryId] = useState("");
  const [recIncAmount, setRecIncAmount] = useState("");
  const [recIncDay, setRecIncDay] = useState("1");
  const [recIncLabel, setRecIncLabel] = useState("");
  const [recIncNotes, setRecIncNotes] = useState("");
  const [recIncActive, setRecIncActive] = useState(true);

  const [liquidityDialogOpen, setLiquidityDialogOpen] = useState(false);
  const [liquidityRows, setLiquidityRows] = useState<
    { label: string; amount: string }[]
  >([{ label: "", amount: "" }]);

  const loadIncomeCategories = useCallback(async () => {
    setIncomeCategories(await listIncomeCategories());
  }, []);

  const loadExpenseCategories = useCallback(async () => {
    setExpenseCategories(await listExpenseCategories());
  }, []);

  const loadRecurringRules = useCallback(async () => {
    setRecurringRules(await listRecurringExpenses());
  }, []);

  const loadRecurringIncomeRules = useCallback(async () => {
    setRecurringIncomeRules(await listRecurringIncomes());
  }, []);

  const loadSummary = useCallback(async () => {
    setSummary(await getFinanceSummary({ year, month }));
  }, [year, month]);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSummary(),
        loadIncomeCategories(),
        loadExpenseCategories(),
        loadRecurringRules(),
        loadRecurringIncomeRules(),
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [
    loadSummary,
    loadIncomeCategories,
    loadExpenseCategories,
    loadRecurringRules,
    loadRecurringIncomeRules,
  ]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const openNewIncCat = () => {
    setEditingIncCat(null);
    setIncCatName("");
    setIncCatDialogOpen(true);
  };

  const openEditIncCat = (c: IncomeCategory) => {
    setEditingIncCat(c);
    setIncCatName(c.name);
    setIncCatDialogOpen(true);
  };

  const saveIncCat = async () => {
    const name = incCatName.trim();
    if (!name) return;
    try {
      if (editingIncCat) {
        await updateIncomeCategory(editingIncCat.id, name);
        toast.success("Categoría de ingreso actualizada");
      } else {
        await createIncomeCategory(name);
        toast.success("Categoría de ingreso creada");
      }
      setIncCatDialogOpen(false);
      await loadIncomeCategories();
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeIncCat = async (c: IncomeCategory) => {
    if (!confirm(`¿Eliminar categoría de ingreso «${c.name}»?`)) return;
    try {
      await deleteIncomeCategory(c.id);
      toast.success("Categoría eliminada");
      await loadIncomeCategories();
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  const openNewExpCat = () => {
    setEditingExpCat(null);
    setExpCatName("");
    setExpCatDialogOpen(true);
  };

  const openEditExpCat = (c: ExpenseCategory) => {
    setEditingExpCat(c);
    setExpCatName(c.name);
    setExpCatDialogOpen(true);
  };

  const saveExpCat = async () => {
    const name = expCatName.trim();
    if (!name) return;
    try {
      if (editingExpCat) {
        await updateExpenseCategory(editingExpCat.id, name);
        toast.success("Categoría actualizada");
      } else {
        await createExpenseCategory(name);
        toast.success("Categoría creada");
      }
      setExpCatDialogOpen(false);
      await loadExpenseCategories();
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeExpCat = async (c: ExpenseCategory) => {
    if (!confirm(`¿Eliminar categoría «${c.name}»?`)) return;
    try {
      await deleteExpenseCategory(c.id);
      toast.success("Categoría eliminada");
      await loadExpenseCategories();
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  };

  const openNewIncome = () => {
    setEditingInc(null);
    setIncCategoryId(incomeCategories[0]?.id ?? "");
    setIncAmount("");
    const today = new Date();
    const isCurrent =
      today.getFullYear() === year && today.getMonth() + 1 === month;
    const d = isCurrent ? today : new Date(year, month - 1, 1);
    setIncDate(toYmdLocal(d));
    setIncNotes("");
    setIncDialogOpen(true);
  };

  const openEditIncome = (row: FinanceIncomeLine) => {
    setEditingInc(row);
    setIncCategoryId(row.categoryId);
    setIncAmount(String(row.amount));
    const od = new Date(row.receivedAt);
    setIncDate(
      `${od.getUTCFullYear()}-${String(od.getUTCMonth() + 1).padStart(2, "0")}-${String(od.getUTCDate()).padStart(2, "0")}`
    );
    setIncNotes(row.notes ?? "");
    setIncDialogOpen(true);
  };

  const saveIncome = async () => {
    const amount = Number(incAmount.replace(/\./g, "").replace(/,/g, ""));
    if (!incCategoryId || Number.isNaN(amount) || amount < 0 || !incDate) {
      toast.error("Completa categoría, monto y fecha");
      return;
    }
    const [y, mo, da] = incDate.split("-").map(Number);
    const receivedAt = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0)).toISOString();
    try {
      if (editingInc) {
        await updateFinanceIncome(editingInc.id, {
          categoryId: incCategoryId,
          amount,
          receivedAt,
          notes: incNotes.trim() || undefined,
        });
        toast.success("Ingreso actualizado");
      } else {
        await createFinanceIncome({
          categoryId: incCategoryId,
          amount,
          receivedAt,
          notes: incNotes.trim() || undefined,
        });
        toast.success("Ingreso registrado");
      }
      setIncDialogOpen(false);
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeIncome = async (row: FinanceIncomeLine) => {
    if (!confirm("¿Eliminar este ingreso?")) return;
    try {
      await deleteFinanceIncome(row.id);
      toast.success("Ingreso eliminado");
      await loadSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const openNewExpense = () => {
    setEditingExp(null);
    setExpCategoryId(expenseCategories[0]?.id ?? "");
    setExpAmount("");
    const today = new Date();
    const isCurrent =
      today.getFullYear() === year && today.getMonth() + 1 === month;
    const d = isCurrent ? today : new Date(year, month - 1, 1);
    setExpDate(toYmdLocal(d));
    setExpNotes("");
    setExpDialogOpen(true);
  };

  const openEditExpense = (e: FinanceExpense) => {
    setEditingExp(e);
    setExpCategoryId(e.categoryId);
    setExpAmount(String(e.amount));
    const od = new Date(e.occurredAt);
    setExpDate(
      `${od.getUTCFullYear()}-${String(od.getUTCMonth() + 1).padStart(2, "0")}-${String(od.getUTCDate()).padStart(2, "0")}`
    );
    setExpNotes(e.notes ?? "");
    setExpDialogOpen(true);
  };

  const saveExpense = async () => {
    const amount = Number(expAmount.replace(/\./g, "").replace(/,/g, ""));
    if (!expCategoryId || Number.isNaN(amount) || amount < 0 || !expDate) {
      toast.error("Completa categoría, monto y fecha");
      return;
    }
    const [y, mo, da] = expDate.split("-").map(Number);
    const occurredAt = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0)).toISOString();
    try {
      if (editingExp) {
        await updateFinanceExpense(editingExp.id, {
          categoryId: expCategoryId,
          amount,
          occurredAt,
          notes: expNotes.trim() || undefined,
        });
        toast.success("Gasto actualizado");
      } else {
        await createFinanceExpense({
          categoryId: expCategoryId,
          amount,
          occurredAt,
          notes: expNotes.trim() || undefined,
        });
        toast.success("Gasto registrado");
      }
      setExpDialogOpen(false);
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeExpense = async (e: FinanceExpense) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    try {
      await deleteFinanceExpense(e.id);
      toast.success("Gasto eliminado");
      await loadSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const toggleExpensePaid = async (row: FinanceExpense, paid: boolean) => {
    try {
      if (row.isRecurring) {
        await updateFinanceExpense(row.id, { paid }, { year, month });
      } else {
        await updateFinanceExpense(row.id, { paid });
      }
      toast.success(paid ? "Marcado como pagado" : "Marcado como pendiente");
      await loadSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const openNewRec = () => {
    setEditingRec(null);
    setRecCategoryId(expenseCategories[0]?.id ?? "");
    setRecAmount("");
    setRecDay("5");
    setRecLabel("");
    setRecNotes("");
    setRecActive(true);
    setRecDialogOpen(true);
  };

  const openEditRec = (r: FinanceRecurringRule) => {
    setEditingRec(r);
    setRecCategoryId(r.categoryId);
    setRecAmount(String(r.amount));
    setRecDay(String(r.dayOfMonth));
    setRecLabel(r.label ?? "");
    setRecNotes(r.notes ?? "");
    setRecActive(r.isActive);
    setRecDialogOpen(true);
  };

  const saveRec = async () => {
    const amount = Number(recAmount.replace(/\./g, "").replace(/,/g, ""));
    const day = Number(recDay);
    if (!recCategoryId || Number.isNaN(amount) || amount < 0 || Number.isNaN(day) || day < 1 || day > 31) {
      toast.error("Completa categoría, monto (COP) y día del mes (1–31)");
      return;
    }
    try {
      if (editingRec) {
        await updateRecurringExpense(editingRec.id, {
          categoryId: recCategoryId,
          amount,
          dayOfMonth: day,
          label: recLabel.trim() || undefined,
          notes: recNotes.trim() || undefined,
          isActive: recActive,
        });
        toast.success("Gasto recurrente actualizado");
      } else {
        await createRecurringExpense({
          categoryId: recCategoryId,
          amount,
          dayOfMonth: day,
          label: recLabel.trim() || undefined,
          notes: recNotes.trim() || undefined,
          isActive: recActive,
        });
        toast.success("Gasto recurrente creado: se aplicará en todos los meses");
      }
      setRecDialogOpen(false);
      await Promise.all([loadRecurringRules(), loadSummary()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeRec = async (r: FinanceRecurringRule) => {
    if (!confirm(`¿Eliminar el gasto recurrente «${r.label || r.categoryName || "sin nombre"}»?`)) return;
    try {
      await deleteRecurringExpense(r.id);
      toast.success("Regla eliminada");
      await Promise.all([loadRecurringRules(), loadSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const toggleRecActive = async (r: FinanceRecurringRule, active: boolean) => {
    try {
      await updateRecurringExpense(r.id, { isActive: active });
      await Promise.all([loadRecurringRules(), loadSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const toggleIncomeReceived = async (row: FinanceIncomeLine, received: boolean) => {
    if (!row.isRecurring) return;
    try {
      await updateFinanceIncome(row.id, { received }, { year, month });
      toast.success(received ? "Marcado como cobrado" : "Marcado como pendiente");
      await loadSummary();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    }
  };

  const openNewRecInc = () => {
    setEditingRecInc(null);
    setRecIncCategoryId(incomeCategories[0]?.id ?? "");
    setRecIncAmount("");
    setRecIncDay("5");
    setRecIncLabel("");
    setRecIncNotes("");
    setRecIncActive(true);
    setRecIncDialogOpen(true);
  };

  const openEditRecInc = (r: FinanceRecurringRule) => {
    setEditingRecInc(r);
    setRecIncCategoryId(r.categoryId);
    setRecIncAmount(String(r.amount));
    setRecIncDay(String(r.dayOfMonth));
    setRecIncLabel(r.label ?? "");
    setRecIncNotes(r.notes ?? "");
    setRecIncActive(r.isActive);
    setRecIncDialogOpen(true);
  };

  const saveRecInc = async () => {
    const amount = Number(recIncAmount.replace(/\./g, "").replace(/,/g, ""));
    const day = Number(recIncDay);
    if (
      !recIncCategoryId ||
      Number.isNaN(amount) ||
      amount < 0 ||
      Number.isNaN(day) ||
      day < 1 ||
      day > 31
    ) {
      toast.error("Completa categoría, monto (COP) y día del mes (1–31)");
      return;
    }
    try {
      if (editingRecInc) {
        await updateRecurringIncome(editingRecInc.id, {
          categoryId: recIncCategoryId,
          amount,
          dayOfMonth: day,
          label: recIncLabel.trim() || undefined,
          notes: recIncNotes.trim() || undefined,
          isActive: recIncActive,
        });
        toast.success("Ingreso recurrente actualizado");
      } else {
        await createRecurringIncome({
          categoryId: recIncCategoryId,
          amount,
          dayOfMonth: day,
          label: recIncLabel.trim() || undefined,
          notes: recIncNotes.trim() || undefined,
          isActive: recIncActive,
        });
        toast.success("Ingreso recurrente creado: se aplicará en todos los meses");
      }
      setRecIncDialogOpen(false);
      await Promise.all([loadRecurringIncomeRules(), loadSummary()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const removeRecInc = async (r: FinanceRecurringRule) => {
    if (
      !confirm(
        `¿Eliminar el ingreso recurrente «${r.label || r.categoryName || "sin nombre"}»?`
      )
    )
      return;
    try {
      await deleteRecurringIncome(r.id);
      toast.success("Regla eliminada");
      await Promise.all([loadRecurringIncomeRules(), loadSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const toggleRecIncActive = async (r: FinanceRecurringRule, active: boolean) => {
    try {
      await updateRecurringIncome(r.id, { isActive: active });
      await Promise.all([loadRecurringIncomeRules(), loadSummary()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const openConfigureLiquidity = () => {
    const acc = summary?.liquidity?.accounts ?? [];
    setLiquidityRows(
      acc.length > 0
        ? acc.map((a) => ({ label: a.label, amount: String(a.amount) }))
        : [{ label: "", amount: "" }]
    );
    setLiquidityDialogOpen(true);
  };

  const saveLiquidity = async () => {
    const accounts = liquidityRows
      .map((r) => ({
        label: r.label.trim(),
        amount:
          Number(String(r.amount).replace(/\./g, "").replace(/,/g, "")) || 0,
      }))
      .filter((r) => r.label.length > 0);
    try {
      await putFinanceLiquidity({ accounts });
      toast.success("Saldos guardados");
      setLiquidityDialogOpen(false);
      await loadSummary();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    }
  };

  const remaining = summary?.remaining ?? 0;
  const remainingColor = remaining >= 0 ? "success.main" : "error.main";

  const incomes = summary?.incomes ?? [];
  const expenses = summary?.expenses ?? [];

  const expensesByCategory = useMemo(() => {
    const list = summary?.expenses ?? [];
    const map = new Map<string, FinanceExpense[]>();
    for (const row of list) {
      const key = row.categoryName?.trim() || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    for (const rows of map.values()) {
      rows.sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
      );
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === "Sin categoría") return 1;
      if (b === "Sin categoría") return -1;
      return a.localeCompare(b, "es", { sensitivity: "base" });
    });
    return { map, keys };
  }, [summary]);

  const incomesByCategory = useMemo(() => {
    const list = summary?.incomes ?? [];
    const map = new Map<string, FinanceIncomeLine[]>();
    for (const row of list) {
      const key = row.categoryName?.trim() || "Sin categoría";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    for (const rows of map.values()) {
      rows.sort(
        (a, b) =>
          new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
      );
    }
    const keys = [...map.keys()].sort((a, b) => {
      if (a === "Sin categoría") return 1;
      if (b === "Sin categoría") return -1;
      return a.localeCompare(b, "es", { sensitivity: "base" });
    });
    return { map, keys };
  }, [summary]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight={800}>
          Contabilidad personal
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            aria-label="Mes anterior"
            onClick={() => {
              const { year: y, month: m } = shiftMonth(year, month, -1);
              setYear(y);
              setMonth(m);
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Mes</InputLabel>
            <Select
              label="Mes"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {MONTHS.map((x) => (
                <MenuItem key={x.v} value={x.v}>
                  {x.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="Año"
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ width: 100 }}
            inputProps={{ min: 2000, max: 2100 }}
          />
          <IconButton
            aria-label="Mes siguiente"
            onClick={() => {
              const { year: y, month: m } = shiftMonth(year, month, 1);
              setYear(y);
              setMonth(m);
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {summary && (
        <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total ingresos (suma del mes)
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {formatCop(summary.income)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Salario, freelancers, otros… por categoría abajo
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Total gastos
                </Typography>
                <Typography variant="h5" fontWeight={800}>
                  {formatCop(summary.totalExpenses)}
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                flex: 1,
                borderColor: remainingColor,
                borderWidth: 1,
                borderStyle: "solid",
              }}
            >
              <CardContent>
                <Typography color="text.secondary" variant="body2">
                  Disponible
                </Typography>
                <Typography variant="h5" fontWeight={800} color={remainingColor}>
                  {formatCop(summary.remaining)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ingresos − gastos del mes (UTC)
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Card
            sx={{
              mb: 3,
              borderColor: "primary.main",
              borderWidth: 1,
              borderStyle: "solid",
            }}
            variant="outlined"
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <AccountBalanceWalletOutlinedIcon
                    color="primary"
                    sx={{ mt: 0.5, fontSize: 36 }}
                  />
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total en tus cuentas (saldos reales)
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {formatCop(summary.liquidity?.total ?? 0)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 0.5, maxWidth: 560 }}
                    >
                      Suma de lo que tienes en bancos, Nequi, Daviplata… Tú lo actualizas a mano; no es lo mismo
                      que «ingresos del mes» (que solo suma movimientos registrados).
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={openConfigureLiquidity}
                >
                  Configurar o agregar cuentas
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Ingresos por categoría
              </Typography>
              {summary.incomeBreakdown.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Registra ingresos para ver el desglose.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {summary.incomeBreakdown.map((b) => {
                    const pct =
                      summary.income > 0
                        ? Math.round((b.total / summary.income) * 100)
                        : 0;
                    return (
                      <Box key={b.categoryId}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">{b.categoryName}</Typography>
                          <Chip
                            size="small"
                            label={`${pct}% · ${formatCop(b.total)}`}
                          />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{ mt: 0.5, height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
            <Paper sx={{ p: 2, flex: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Gastos por categoría
              </Typography>
              {summary.expenseBreakdown.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sin gastos este mes.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {summary.expenseBreakdown.map((b) => {
                    const pct =
                      summary.totalExpenses > 0
                        ? Math.round((b.total / summary.totalExpenses) * 100)
                        : 0;
                    return (
                      <Box key={b.categoryId}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">{b.categoryName}</Typography>
                          <Chip
                            size="small"
                            label={`${pct}% · ${formatCop(b.total)}`}
                          />
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{ mt: 0.5, height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
            alignItems="flex-start"
          >
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Paper sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Categorías de ingreso
                  </Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={openNewIncCat}>
                    Nueva
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Sueldo, honorarios, rentas, otros…
                </Typography>
                <List dense disablePadding>
                  {incomeCategories.map((c) => (
                    <ListItem
                      key={c.id}
                      secondaryAction={
                        <Stack direction="row">
                          <IconButton
                            size="small"
                            onClick={() => openEditIncCat(c)}
                            aria-label="Editar"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeIncCat(c)}
                            aria-label="Eliminar"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                      sx={{ pr: 10 }}
                    >
                      <ListItemText primary={c.name} />
                    </ListItem>
                  ))}
                  {incomeCategories.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Crea tipos de ingreso para registrar movimientos.
                    </Typography>
                  )}
                </List>
              </Paper>
              <Paper sx={{ p: 2 }}>
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
                      Ingresos recurrentes
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      «Cobrado» · {MONTHS.find((x) => x.v === month)?.label} {year}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={openNewRecInc}
                    disabled={incomeCategories.length === 0}
                  >
                    Agregar
                  </Button>
                </Stack>
                <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Activo</TableCell>
                        <TableCell>Etiqueta</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="center">Día</TableCell>
                        <TableCell align="center">Cobrado</TableCell>
                        <TableCell align="right">Acc.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recurringIncomeRules.map((r) => {
                        const syntheticInc = r.isActive
                          ? recurringIncomeForMonth(r.id, incomes)
                          : undefined;
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Switch
                                size="small"
                                checked={r.isActive}
                                onChange={(_, v) => toggleRecIncActive(r, v)}
                                inputProps={{ "aria-label": "Activo ingreso recurrente" }}
                              />
                            </TableCell>
                            <TableCell>{r.label || "—"}</TableCell>
                            <TableCell>{r.categoryName ?? "—"}</TableCell>
                            <TableCell align="right">{formatCop(r.amount)}</TableCell>
                            <TableCell align="center">{r.dayOfMonth}</TableCell>
                            <TableCell align="center" padding="checkbox">
                              {syntheticInc ? (
                                <Checkbox
                                  checked={!!syntheticInc.received}
                                  onChange={(_, v) => toggleIncomeReceived(syntheticInc, v)}
                                  size="small"
                                  color="success"
                                  inputProps={{
                                    "aria-label": `${r.label || r.categoryName || "Ingreso recurrente"} cobrado`,
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  title={
                                    r.isActive
                                      ? undefined
                                      : "Activa la regla para incluirla en el mes y poder marcar cobro"
                                  }
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => openEditRecInc(r)}
                                aria-label="Editar ingreso recurrente"
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => removeRecInc(r)}
                                aria-label="Eliminar ingreso recurrente"
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {recurringIncomeRules.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Sin reglas. Se listarán en ingresos del mes.
                  </Typography>
                )}
              </Paper>

              <Paper sx={{ p: 2, width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Ingresos del mes
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={openNewIncome}
                    disabled={incomeCategories.length === 0}
                  >
                    Registrar ingreso
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Agrupados por categoría. Expandí cada bloque para ver y editar los movimientos.
                </Typography>
                {incomes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No hay ingresos registrados en este mes.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {incomesByCategory.keys.map((categoryName) => {
                      const rows = incomesByCategory.map.get(categoryName)!;
                      const subtotal = rows.reduce((s, r) => s + r.amount, 0);
                      return (
                        <Accordion
                          key={categoryName}
                          disableGutters
                          defaultExpanded={false}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            "&:before": { display: "none" },
                            boxShadow: "none",
                            overflow: "hidden",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon fontSize="small" />}
                            sx={{
                              minHeight: 48,
                              px: 1.5,
                              bgcolor: "action.hover",
                              "& .MuiAccordionSummary-content": { my: 1, alignItems: "center", gap: 1 },
                            }}
                          >
                            <Typography fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
                              {categoryName}
                            </Typography>
                            <Chip size="small" label={`${rows.length} ítem${rows.length === 1 ? "" : "s"}`} />
                            <Typography variant="body2" fontWeight={700} color="primary" sx={{ flexShrink: 0 }}>
                              {formatCop(subtotal)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, px: 0, pb: 0 }}>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Detalle</TableCell>
                                    <TableCell align="center">Cobrado</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                    <TableCell align="right" width={100}>
                                      Acciones
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {rows.map((row) => (
                                    <TableRow key={row.id}>
                                      <TableCell>
                                        {new Date(row.receivedAt).toLocaleDateString("es-CO")}
                                        {row.isRecurring && (
                                          <Chip
                                            label="Recurrente"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            sx={{
                                              ml: 1,
                                              mt: 0.5,
                                              height: 22,
                                              display: "block",
                                              width: "fit-content",
                                            }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {row.label
                                          ? `${row.label} · ${row.categoryName ?? ""}`
                                          : row.categoryName ?? "—"}
                                      </TableCell>
                                      <TableCell align="center" padding="checkbox">
                                        {row.isRecurring ? (
                                          <Checkbox
                                            checked={!!row.received}
                                            onChange={(_, v) => toggleIncomeReceived(row, v)}
                                            size="small"
                                            color="success"
                                            inputProps={{
                                              "aria-label": `Ingreso ${row.label || row.categoryName || ""} cobrado`,
                                            }}
                                          />
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">
                                            —
                                          </Typography>
                                        )}
                                      </TableCell>
                                      <TableCell align="right">{formatCop(row.amount)}</TableCell>
                                      <TableCell align="right">
                                        {!row.isRecurring ? (
                                          <>
                                            <IconButton size="small" onClick={() => openEditIncome(row)}>
                                              <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => removeIncome(row)}>
                                              <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                          </>
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">
                                            Editar en recurrentes
                                          </Typography>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Stack>

            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Paper sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Categorías de gasto
                  </Typography>
                  <Button size="small" startIcon={<AddIcon />} onClick={openNewExpCat}>
                    Nueva
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Suscripciones, hogar, hormiga…
                </Typography>
                <List dense disablePadding>
                  {expenseCategories.map((c) => (
                    <ListItem
                      key={c.id}
                      secondaryAction={
                        <Stack direction="row">
                          <IconButton
                            size="small"
                            onClick={() => openEditExpCat(c)}
                            aria-label="Editar"
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => removeExpCat(c)}
                            aria-label="Eliminar"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                      sx={{ pr: 10 }}
                    >
                      <ListItemText primary={c.name} />
                    </ListItem>
                  ))}
                  {expenseCategories.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Crea una categoría para registrar gastos.
                    </Typography>
                  )}
                </List>
              </Paper>
              <Paper sx={{ p: 2 }}>
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
                      Gastos recurrentes
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      «Pagado» · {MONTHS.find((x) => x.v === month)?.label} {year}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openNewRec}
                    disabled={expenseCategories.length === 0}
                  >
                    Agregar
                  </Button>
                </Stack>
                <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Activo</TableCell>
                        <TableCell>Etiqueta</TableCell>
                        <TableCell>Categoría</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="center">Día</TableCell>
                        <TableCell align="center">Pagado</TableCell>
                        <TableCell align="right">Acc.</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recurringRules.map((r) => {
                        const syntheticRow = r.isActive
                          ? recurringExpenseForMonth(r.id, expenses)
                          : undefined;
                        return (
                          <TableRow key={r.id}>
                            <TableCell>
                              <Switch
                                size="small"
                                checked={r.isActive}
                                onChange={(_, v) => toggleRecActive(r, v)}
                                inputProps={{ "aria-label": "Activo" }}
                              />
                            </TableCell>
                            <TableCell>{r.label || "—"}</TableCell>
                            <TableCell>{r.categoryName ?? "—"}</TableCell>
                            <TableCell align="right">{formatCop(r.amount)}</TableCell>
                            <TableCell align="center">{r.dayOfMonth}</TableCell>
                            <TableCell align="center" padding="checkbox">
                              {syntheticRow ? (
                                <Checkbox
                                  checked={!!syntheticRow.paid}
                                  onChange={(_, v) => toggleExpensePaid(syntheticRow, v)}
                                  size="small"
                                  color="success"
                                  inputProps={{
                                    "aria-label": `${r.label || r.categoryName || "Recurrente"} pagado`,
                                  }}
                                />
                              ) : (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  title={
                                    r.isActive
                                      ? undefined
                                      : "Activa la regla para incluirla en el mes y poder marcarla como pagada"
                                  }
                                >
                                  —
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton size="small" onClick={() => openEditRec(r)} aria-label="Editar">
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => removeRec(r)} aria-label="Eliminar">
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                {recurringRules.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Sin reglas. Aparecerán en gastos del mes.
                  </Typography>
                )}
              </Paper>

              <Paper sx={{ p: 2, width: "100%" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Gastos del mes
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={openNewExpense}
                    disabled={expenseCategories.length === 0}
                  >
                    Registrar gasto
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                  Agrupados por categoría. Expandí cada bloque para ver y editar los movimientos.
                </Typography>
                {expenses.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No hay gastos en este mes.
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {expensesByCategory.keys.map((categoryName) => {
                      const rows = expensesByCategory.map.get(categoryName)!;
                      const subtotal = rows.reduce((s, r) => s + r.amount, 0);
                      return (
                        <Accordion
                          key={categoryName}
                          disableGutters
                          defaultExpanded={false}
                          sx={{
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            "&:before": { display: "none" },
                            boxShadow: "none",
                            overflow: "hidden",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon fontSize="small" />}
                            sx={{
                              minHeight: 48,
                              px: 1.5,
                              bgcolor: "action.hover",
                              "& .MuiAccordionSummary-content": { my: 1, alignItems: "center", gap: 1 },
                            }}
                          >
                            <Typography fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
                              {categoryName}
                            </Typography>
                            <Chip size="small" label={`${rows.length} ítem${rows.length === 1 ? "" : "s"}`} />
                            <Typography variant="body2" fontWeight={700} color="primary" sx={{ flexShrink: 0 }}>
                              {formatCop(subtotal)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0, px: 0, pb: 0 }}>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Detalle</TableCell>
                                    <TableCell align="center">Pagado</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                    <TableCell align="right" width={100}>
                                      Acciones
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {rows.map((row) => (
                                    <TableRow key={row.id}>
                                      <TableCell>
                                        {new Date(row.occurredAt).toLocaleDateString("es-CO")}
                                        {row.isRecurring && (
                                          <Chip
                                            label="Recurrente"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            sx={{ ml: 1, mt: 0.5, height: 22, display: "block", width: "fit-content" }}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {row.label
                                          ? `${row.label} · ${row.categoryName ?? ""}`
                                          : row.categoryName ?? "—"}
                                      </TableCell>
                                      <TableCell align="center" padding="checkbox">
                                        <Checkbox
                                          checked={!!row.paid}
                                          onChange={(_, v) => toggleExpensePaid(row, v)}
                                          size="small"
                                          color="success"
                                          inputProps={{
                                            "aria-label": `Gasto ${row.label || row.categoryName || ""} pagado`,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell align="right">{formatCop(row.amount)}</TableCell>
                                      <TableCell align="right">
                                        {!row.isRecurring ? (
                                          <>
                                            <IconButton size="small" onClick={() => openEditExpense(row)}>
                                              <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => removeExpense(row)}>
                                              <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                          </>
                                        ) : (
                                          <Typography variant="caption" color="text.secondary">
                                            Editar en recurrentes
                                          </Typography>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                )}
              </Paper>
            </Stack>
          </Stack>
        </>
      )}

      <Dialog
        open={incCatDialogOpen}
        onClose={() => setIncCatDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {editingIncCat ? "Editar categoría de ingreso" : "Nueva categoría de ingreso"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={incCatName}
            onChange={(e) => setIncCatName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncCatDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveIncCat} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={expCatDialogOpen}
        onClose={() => setExpCatDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {editingExpCat ? "Editar categoría de gasto" : "Nueva categoría de gasto"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            value={expCatName}
            onChange={(e) => setExpCatName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpCatDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveExpCat} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={incDialogOpen} onClose={() => setIncDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingInc ? "Editar ingreso" : "Registrar ingreso"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría de ingreso</InputLabel>
              <Select
                label="Categoría de ingreso"
                value={incCategoryId}
                onChange={(e) => setIncCategoryId(e.target.value)}
              >
                {incomeCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Monto (COP)"
              type="text"
              value={incAmount}
              onChange={(e) => setIncAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Fecha de ingreso"
              type="date"
              value={incDate}
              onChange={(e) => setIncDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notas (opcional)"
              value={incNotes}
              onChange={(e) => setIncNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIncDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveIncome} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={expDialogOpen} onClose={() => setExpDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingExp ? "Editar gasto" : "Registrar gasto"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                label="Categoría"
                value={expCategoryId}
                onChange={(e) => setExpCategoryId(e.target.value)}
              >
                {expenseCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Monto (COP)"
              type="text"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Fecha"
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notas (opcional)"
              value={expNotes}
              onChange={(e) => setExpNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveExpense} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={recDialogOpen} onClose={() => setRecDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingRec ? "Editar gasto recurrente" : "Nuevo gasto recurrente"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría de gasto</InputLabel>
              <Select
                label="Categoría de gasto"
                value={recCategoryId}
                onChange={(e) => setRecCategoryId(e.target.value)}
              >
                {expenseCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Etiqueta (ej. Gimnasio)"
              value={recLabel}
              onChange={(e) => setRecLabel(e.target.value)}
              fullWidth
              helperText="Para reconocerlo en el listado mensual"
            />
            <TextField
              label="Monto mensual (COP)"
              type="text"
              value={recAmount}
              onChange={(e) => setRecAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Día del mes en que aplica (1–31)"
              type="number"
              value={recDay}
              onChange={(e) => setRecDay(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 31 }}
              helperText="En meses más cortos se usa el último día disponible"
            />
            <TextField
              label="Notas (opcional)"
              value={recNotes}
              onChange={(e) => setRecNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Activo</Typography>
              <Switch
                checked={recActive}
                onChange={(_, v) => setRecActive(v)}
                color="primary"
              />
              <Typography variant="caption" color="text.secondary">
                Si está apagado, no se cuenta en los meses hasta que lo reactives
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveRec} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={recIncDialogOpen}
        onClose={() => setRecIncDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingRecInc ? "Editar ingreso recurrente" : "Nuevo ingreso recurrente"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Categoría de ingreso</InputLabel>
              <Select
                label="Categoría de ingreso"
                value={recIncCategoryId}
                onChange={(e) => setRecIncCategoryId(e.target.value)}
              >
                {incomeCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Etiqueta (ej. Nómina)"
              value={recIncLabel}
              onChange={(e) => setRecIncLabel(e.target.value)}
              fullWidth
              helperText="Para reconocerlo en el listado mensual"
            />
            <TextField
              label="Monto mensual (COP)"
              type="text"
              value={recIncAmount}
              onChange={(e) => setRecIncAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Día del mes en que aplica (1–31)"
              type="number"
              value={recIncDay}
              onChange={(e) => setRecIncDay(e.target.value)}
              fullWidth
              inputProps={{ min: 1, max: 31 }}
              helperText="En meses más cortos se usa el último día disponible"
            />
            <TextField
              label="Notas (opcional)"
              value={recIncNotes}
              onChange={(e) => setRecIncNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2">Activo</Typography>
              <Switch
                checked={recIncActive}
                onChange={(_, v) => setRecIncActive(v)}
                color="primary"
              />
              <Typography variant="caption" color="text.secondary">
                Si está apagado, no se cuenta en los meses hasta que lo reactives
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRecIncDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveRecInc} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={liquidityDialogOpen}
        onClose={() => setLiquidityDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Saldos por cuenta</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Indica cuánto tienes hoy en cada sitio. El total de arriba es la suma
            de estas filas.
          </Typography>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {liquidityRows.map((row, idx) => (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} key={idx} alignItems="flex-start">
                <TextField
                  label="Nombre (ej. Banco BBVA)"
                  value={row.label}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLiquidityRows((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, label: v } : p))
                    );
                  }}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Saldo COP"
                  value={row.amount}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLiquidityRows((prev) =>
                      prev.map((p, i) => (i === idx ? { ...p, amount: v } : p))
                    );
                  }}
                  size="small"
                  sx={{ minWidth: { sm: 160 } }}
                />
                <IconButton
                  aria-label="Quitar fila"
                  size="small"
                  onClick={() =>
                    setLiquidityRows((prev) =>
                      prev.filter((_, i) => i !== idx)
                    )
                  }
                  sx={{ mt: { xs: 0, sm: 0.5 } }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() =>
                setLiquidityRows((prev) => [
                  ...prev,
                  { label: "", amount: "" },
                ])
              }
            >
              Agregar cuenta
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLiquidityDialogOpen(false)}>Cancelar</Button>
          <Button onClick={saveLiquidity} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
