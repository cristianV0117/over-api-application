"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  getFinanceOverview,
  type FinanceOverview,
} from "@/lib/api/contabilidad";
import {
  CHART_COLORS,
  Donut,
  GroupedBars,
  HBars,
  LinePath,
} from "@/components/contabilidad/SimpleCharts";

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
    getFinanceOverview({ year, month, months: 12 })
      .then(setData)
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : "Error en gráficas")
      );
  }, [year, month]);

  if (!data) return null;

  const labels = data.months.map((m) => `${MONTHS[m.month - 1]} ${String(m.year).slice(2)}`);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Ingresos vs gastos (12 meses)
        </Typography>
        <GroupedBars
          labels={labels}
          series={[
            {
              name: "Ingresos",
              color: CHART_COLORS.INCOME,
              values: data.months.map((m) => m.income),
            },
            {
              name: "Gastos",
              color: CHART_COLORS.EXPENSE,
              values: data.months.map((m) => m.expenses),
            },
          ]}
        />
      </Paper>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Gastos de este mes
          </Typography>
          <HBars
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
          <HBars
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
          <LinePath
            color="#38bdf8"
            points={data.months.map((m) => ({
              label: `${MONTHS[m.month - 1]} ${String(m.year).slice(2)}`,
              value: m.remaining,
            }))}
          />
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Mix de gastos
          </Typography>
          <Donut
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
        <GroupedBars
          labels={labels}
          series={[
            {
              name: "Disponible",
              color: "#38bdf8",
              values: data.months.map((m) => Math.max(0, m.remaining)),
            },
            {
              name: "Déficit",
              color: "#f59e0b",
              values: data.months.map((m) =>
                m.remaining < 0 ? Math.abs(m.remaining) : 0
              ),
            },
          ]}
        />
      </Paper>
    </Stack>
  );
}
