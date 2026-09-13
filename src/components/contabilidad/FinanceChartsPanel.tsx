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
import { usePreferences } from "@/context/preferencesContext";
import { monthLabel } from "@/i18n";

type Props = { year: number; month: number };

export default function FinanceChartsPanel({ year, month }: Props) {
  const { t, locale } = usePreferences();
  const [data, setData] = useState<FinanceOverview | null>(null);

  useEffect(() => {
    setData(null);
    getFinanceOverview({ year, month, months: 12 })
      .then(setData)
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : t("finance.chartsError"))
      );
  }, [year, month, t]);

  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const labels = data.months.map((m) => `${monthLabel(m.month, locale, true)} ${String(m.year).slice(2)}`);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {t("finance.chartsHint")}
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {t("finance.incomeVsExpense")}
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
            {t("finance.expensesThisMonth")}
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
            {t("finance.incomesThisMonth")}
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
            {t("finance.availableMonthly")}
          </Typography>
          <CashflowArea
            color={CHART_COLORS.CASH}
            labels={labels}
            values={data.months.map((m) => m.remaining)}
          />
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {t("finance.expenseMix")}
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
          {t("finance.surplusDeficit")}
        </Typography>
        <SurplusDeficitBars
          labels={labels}
          values={data.months.map((m) => m.remaining)}
        />
      </Paper>
    </Stack>
  );
}
