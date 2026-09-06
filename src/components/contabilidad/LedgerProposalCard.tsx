"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  createExpenseCategory,
  createFinanceExpense,
  createFinanceIncome,
  createIncomeCategory,
  createRecurringExpense,
  createRecurringIncome,
  formatCop,
  listExpenseCategories,
  listIncomeCategories,
  type ExtractedLedger,
} from "@/lib/api/contabilidad";

function toUtcNoon(day: string): string {
  const [y, mo, da] = day.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, da, 12, 0, 0)).toISOString();
}

function foldName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function findId(
  cats: Array<{ id: string; name: string }>,
  name: string
): string | undefined {
  const key = foldName(name);
  return cats.find((c) => foldName(c.name) === key)?.id;
}

function formatDay(day: string) {
  const [y, m, d] = day.split("-");
  if (!y || !m || !d) return day;
  return `${d}/${m}/${y.slice(2)}`;
}

type RowKey = `${"e" | "i" | "ce" | "ci" | "re" | "ri"}-${number}`;

type Props = {
  ledger: ExtractedLedger;
  onSaved?: () => Promise<void> | void;
};

export default function LedgerProposalCard({ ledger, onSaved }: Props) {
  const allKeys = useMemo(() => {
    const keys: RowKey[] = [];
    ledger.expenseCategories.forEach((_, i) => keys.push(`ce-${i}`));
    ledger.incomeCategories.forEach((_, i) => keys.push(`ci-${i}`));
    ledger.expenses.forEach((_, i) => keys.push(`e-${i}`));
    ledger.incomes.forEach((_, i) => keys.push(`i-${i}`));
    ledger.recurringExpenses.forEach((_, i) => keys.push(`re-${i}`));
    ledger.recurringIncomes.forEach((_, i) => keys.push(`ri-${i}`));
    return keys;
  }, [ledger]);

  const [selected, setSelected] = useState<Set<RowKey>>(() => new Set(allKeys));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (key: RowKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const count = selected.size;
  const total =
    ledger.expenses.length +
    ledger.incomes.length +
    ledger.expenseCategories.length +
    ledger.incomeCategories.length +
    ledger.recurringExpenses.length +
    ledger.recurringIncomes.length;

  const save = async () => {
    if (count === 0) {
      toast.error("Seleccioná al menos un ítem");
      return;
    }
    setSaving(true);
    try {
      const expenseCats = [...(await listExpenseCategories())];
      const incomeCats = [...(await listIncomeCategories())];

      const ensureExpense = async (name: string) => {
        const existing = findId(expenseCats, name);
        if (existing) return existing;
        const created = await createExpenseCategory(name.trim().slice(0, 80));
        expenseCats.push(created);
        return created.id;
      };
      const ensureIncome = async (name: string) => {
        const existing = findId(incomeCats, name);
        if (existing) return existing;
        const created = await createIncomeCategory(name.trim().slice(0, 80));
        incomeCats.push(created);
        return created.id;
      };

      let created = 0;
      for (const [i, row] of ledger.expenseCategories.entries()) {
        if (!selected.has(`ce-${i}`)) continue;
        await ensureExpense(row.name);
        created += 1;
      }
      for (const [i, row] of ledger.incomeCategories.entries()) {
        if (!selected.has(`ci-${i}`)) continue;
        await ensureIncome(row.name);
        created += 1;
      }
      for (const [i, row] of ledger.expenses.entries()) {
        if (!selected.has(`e-${i}`)) continue;
        const categoryId = await ensureExpense(row.categoryName);
        await createFinanceExpense({
          categoryId,
          amount: row.amount,
          occurredAt: toUtcNoon(row.date),
          notes: row.notes || undefined,
        });
        created += 1;
      }
      for (const [i, row] of ledger.incomes.entries()) {
        if (!selected.has(`i-${i}`)) continue;
        const categoryId = await ensureIncome(row.categoryName);
        await createFinanceIncome({
          categoryId,
          amount: row.amount,
          receivedAt: toUtcNoon(row.date),
          notes: row.notes || undefined,
        });
        created += 1;
      }
      for (const [i, row] of ledger.recurringExpenses.entries()) {
        if (!selected.has(`re-${i}`)) continue;
        const categoryId = await ensureExpense(row.categoryName);
        await createRecurringExpense({
          categoryId,
          amount: row.amount,
          dayOfMonth: row.dayOfMonth,
          label: row.label || undefined,
          notes: row.notes || undefined,
          isActive: true,
        });
        created += 1;
      }
      for (const [i, row] of ledger.recurringIncomes.entries()) {
        if (!selected.has(`ri-${i}`)) continue;
        const categoryId = await ensureIncome(row.categoryName);
        await createRecurringIncome({
          categoryId,
          amount: row.amount,
          dayOfMonth: row.dayOfMonth,
          label: row.label || undefined,
          notes: row.notes || undefined,
          isActive: true,
        });
        created += 1;
      }

      setSaved(true);
      toast.success(`Se guardaron ${created} ítems en tu contabilidad`);
      await onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  if (total === 0) return null;

  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        Extraído del documento. Revisá y guardá lo que corresponda.
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.75, mb: 1 }}>
        {ledger.expenses.length ? (
          <Chip size="small" label={`${ledger.expenses.length} gastos`} />
        ) : null}
        {ledger.incomes.length ? (
          <Chip size="small" label={`${ledger.incomes.length} ingresos`} />
        ) : null}
        {ledger.expenseCategories.length + ledger.incomeCategories.length ? (
          <Chip
            size="small"
            label={`${ledger.expenseCategories.length + ledger.incomeCategories.length} categorías nuevas`}
          />
        ) : null}
        {ledger.recurringExpenses.length + ledger.recurringIncomes.length ? (
          <Chip
            size="small"
            label={`${ledger.recurringExpenses.length + ledger.recurringIncomes.length} recurrentes`}
          />
        ) : null}
      </Stack>

      <Stack spacing={0.25} sx={{ maxHeight: 320, overflow: "auto" }}>
        {ledger.expenseCategories.map((row, i) => (
          <Row
            key={`ce-${i}`}
            checked={selected.has(`ce-${i}`)}
            onToggle={() => toggle(`ce-${i}`)}
            disabled={saved}
            left="Nueva cat. gasto"
            mid={row.name}
            right=""
          />
        ))}
        {ledger.incomeCategories.map((row, i) => (
          <Row
            key={`ci-${i}`}
            checked={selected.has(`ci-${i}`)}
            onToggle={() => toggle(`ci-${i}`)}
            disabled={saved}
            left="Nueva cat. ingreso"
            mid={row.name}
            right=""
          />
        ))}
        {ledger.expenses.map((row, i) => (
          <Row
            key={`e-${i}`}
            checked={selected.has(`e-${i}`)}
            onToggle={() => toggle(`e-${i}`)}
            disabled={saved}
            left={formatDay(row.date)}
            mid={`${row.notes || "Gasto"} · ${row.categoryName}`}
            right={formatCop(row.amount)}
          />
        ))}
        {ledger.incomes.map((row, i) => (
          <Row
            key={`i-${i}`}
            checked={selected.has(`i-${i}`)}
            onToggle={() => toggle(`i-${i}`)}
            disabled={saved}
            left={formatDay(row.date)}
            mid={`${row.notes || "Ingreso"} · ${row.categoryName}`}
            right={`+ ${formatCop(row.amount)}`}
          />
        ))}
        {ledger.recurringExpenses.map((row, i) => (
          <Row
            key={`re-${i}`}
            checked={selected.has(`re-${i}`)}
            onToggle={() => toggle(`re-${i}`)}
            disabled={saved}
            left={`Rec. día ${row.dayOfMonth}`}
            mid={`${row.label || row.notes || "Gasto"} · ${row.categoryName}`}
            right={formatCop(row.amount)}
          />
        ))}
        {ledger.recurringIncomes.map((row, i) => (
          <Row
            key={`ri-${i}`}
            checked={selected.has(`ri-${i}`)}
            onToggle={() => toggle(`ri-${i}`)}
            disabled={saved}
            left={`Rec. día ${row.dayOfMonth}`}
            mid={`${row.label || row.notes || "Ingreso"} · ${row.categoryName}`}
            right={`+ ${formatCop(row.amount)}`}
          />
        ))}
      </Stack>

      {saved ? (
        <Chip
          size="small"
          color="success"
          label="Guardado en tu contabilidad"
          sx={{ mt: 1 }}
        />
      ) : (
        <Button
          size="small"
          variant="contained"
          sx={{ mt: 1.25 }}
          disabled={saving || count === 0}
          onClick={() => void save()}
        >
          {saving
            ? "Guardando…"
            : `Guardar seleccionados (${count})`}
        </Button>
      )}
    </Box>
  );
}

function Row({
  checked,
  onToggle,
  disabled,
  left,
  mid,
  right,
}: {
  checked: boolean;
  onToggle: () => void;
  disabled: boolean;
  left: string;
  mid: string;
  right: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        py: 0.25,
        opacity: disabled && !checked ? 0.5 : 1,
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
        sx={{ p: 0.25 }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ minWidth: 72, flexShrink: 0 }}
      >
        {left}
      </Typography>
      <Typography variant="caption" noWrap sx={{ flex: 1 }}>
        {mid}
      </Typography>
      {right ? (
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ flexShrink: 0, pl: 1 }}
        >
          {right}
        </Typography>
      ) : null}
    </Stack>
  );
}
