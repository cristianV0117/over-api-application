"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getFinanceOverview,
  type FinanceOverview,
} from "@/lib/api/contabilidad";
import {
  CashflowArea,
  CategoryBars,
  CHART_COLORS,
  ExpenseDonut,
  IncomeExpenseCombo,
  SurplusDeficitBars,
} from "@/components/contabilidad/InteractiveCharts";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type Props = { year: number; month: number };

export default function FinanceChartsPanel({ year, month }: Props) {
  const [data, setData] = useState<FinanceOverview | null>(null);

  useEffect(() => {
    setData(null);
    getFinanceOverview({ year, month, months: 12 })
      .then(setData)
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Error en gráficas")
      );
  }, [year, month]);

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const labels = data.months.map(
    (m) => `${MONTHS[m.month - 1]} ${String(m.year).slice(2)}`
  );

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        Pasa el cursor para ver montos en COP. En la leyenda puedes ocultar
        series; usa zoom, pan y descarga desde la barra de la gráfica.
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Ingresos vs gastos (12 meses)
        </Typography>
        <IncomeExpenseCombo
          labels={labels}
          income={data.months.map((m) => m.income)}
          expenses={data.months.map((m) => m.expenses)}
          remaining={data.months.map((m) => m.remaining)}
        />
      </Paper>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Gastos de este mes
          </Typography>
          <CategoryBars
            color={CHART_COLORS.EXPENSE}
            rows={data.expenseBreakdown.map((b) => ({
              label: b.categoryName,
              value: b.total,
            }))}
          />
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Ingresos de este mes
          </Typography>
          <CategoryBars
            color={CHART_COLORS.INCOME}
            rows={data.incomeBreakdown.map((b) => ({
              label: b.categoryName,
              value: b.total,
            }))}
          />
        </Paper>
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Disponible mes a mes
          </Typography>
          <CashflowArea
            color={CHART_COLORS.CASH}
            labels={labels}
            values={data.months.map((m) => m.remaining)}
          />
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Mix de gastos
          </Typography>
          <ExpenseDonut
            rows={data.expenseBreakdown.map((b) => ({
              label: b.categoryName,
              value: b.total,
            }))}
          />
        </Paper>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Ahorro / déficit (ingresos − gastos)
        </Typography>
        <SurplusDeficitBars
          labels={labels}
          values={data.months.map((m) => m.remaining)}
        />
      </Paper>
    </Stack>
  );
}
