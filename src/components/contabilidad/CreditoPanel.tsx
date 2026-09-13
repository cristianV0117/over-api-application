"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FinanceDebtsPanel from "@/components/contabilidad/FinanceDebtsPanel";
import { usePreferences } from "@/context/preferencesContext";
import { monthLabel } from "@/i18n";
import { CreditForecastChart } from "@/components/contabilidad/InteractiveCharts";
import {
  formatCop,
  getDebtForecast,
  listFinanceDebts,
  type DebtForecast,
  type FinanceDebt,
} from "@/lib/api/contabilidad";

function formatPayoff(
  isoMonth: string | null,
  neverPays: boolean,
  neverLabel: string,
  monthName: (n: number) => string
) {
  if (neverPays || !isoMonth) return neverLabel;
  const [y, m] = isoMonth.split("-");
  return `${monthName(Number(m))} ${y}`;
}

export default function CreditoPanel() {
  const { t, locale } = usePreferences();
  const [debts, setDebts] = useState<FinanceDebt[]>([]);
  const [forecast, setForecast] = useState<DebtForecast | null>(null);
  const [debtId, setDebtId] = useState("all");
  const [extra, setExtra] = useState("0");
  const [loading, setLoading] = useState(true);

  const extraNum = Number(extra.replace(/\./g, "").replace(/,/g, "")) || 0;

  const loadDebts = useCallback(async () => {
    setDebts(await listFinanceDebts());
  }, []);

  const loadForecast = useCallback(async () => {
    const data = await getDebtForecast({
      extraMonthly: extraNum,
      debtId: debtId === "all" ? undefined : debtId,
    });
    setForecast(data);
  }, [debtId, extraNum]);

  useEffect(() => {
    loadDebts()
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : t("credit.loadError"))
      )
      .finally(() => setLoading(false));
  }, [loadDebts, t]);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      loadForecast().catch((e) =>
        toast.error(e instanceof Error ? e.message : t("credit.forecastError"))
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [loadForecast, loading, t]);

  const selected = useMemo(() => {
    if (!forecast?.items.length) return null;
    if (debtId === "all" && forecast.items.length > 1) return null;
    return forecast.items[0];
  }, [forecast, debtId]);

  const linePoints = useMemo(() => {
    if (selected) {
      return selected.schedule.map((s) => ({
        label: s.date,
        value: s.balance,
      }));
    }
    const longest = forecast?.items.reduce(
      (a, b) => (b.schedule.length > a.length ? b.schedule : a),
      [] as DebtForecast["items"][number]["schedule"]
    );
    if (!longest?.length) return [];
    return longest.map((step, i) => ({
      label: step.date,
      value: (forecast?.items ?? []).reduce(
        (sum, item) => sum + (item.schedule[i]?.balance ?? 0),
        0
      ),
    }));
  }, [forecast, selected]);

  const onChanged = async () => {
    await loadDebts();
    await loadForecast();
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("credit.intro")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FinanceDebtsPanel debts={debts} onChanged={onChanged} />
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
        >
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>{t("credit.study")}</InputLabel>
            <Select
              label={t("credit.study")}
              value={debtId}
              onChange={(e) => setDebtId(e.target.value)}
            >
              <MenuItem value="all">{t("credit.allActive")}</MenuItem>
              {debts
                .filter((d) => d.isActive)
                .map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            label={t("credit.extra")}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            helperText={t("credit.extraHelp")}
            sx={{ minWidth: 220 }}
          />
        </Stack>
      </Paper>

      {forecast && forecast.items.length > 0 ? (
        <>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stat
              title={t("credit.pending")}
              value={formatCop(forecast.totalBalance)}
            />
            <Stat
              title={t("credit.monthInstallments")}
              value={formatCop(forecast.totalInstallment)}
            />
            <Stat
              title={
                selected
                  ? t("credit.payoffDate")
                  : t("credit.firstToEnd")
              }
              value={
                selected
                  ? formatPayoff(
                      selected.payoffDate,
                      selected.neverPays,
                      t("credit.neverPays"),
                      (n) => monthLabel(n, locale)
                    )
                  : formatPayoff(
                      [...forecast.items].sort((a, b) => a.months - b.months)[0]
                        ?.payoffDate ?? null,
                      forecast.items.every((i) => i.neverPays),
                      t("credit.neverPays"),
                      (n) => monthLabel(n, locale)
                    )
              }
            />
            <Stat
              title={t("credit.interestLeft")}
              value={formatCop(
                forecast.items.reduce((s, i) => s + i.totalInterest, 0)
              )}
            />
          </Stack>

          {selected ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {selected.name}
              {selected.creditor ? ` · ${selected.creditor}` : ""} · cuota{" "}
              {formatCop(selected.installmentAmount)}
              {extraNum > 0 ? ` + extra ${formatCop(extraNum)}` : ""} ·{" "}
              {selected.interestRate}% {selected.interestRateType} ·{" "}
              {selected.neverPays
                ? "la cuota no cubre el interés"
                : `${selected.months} meses restantes`}
            </Typography>
          ) : null}

          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              {t("credit.projected")}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              {t("credit.projectedHint")}
            </Typography>
            <CreditForecastChart
              labels={linePoints.map((p) => p.label)}
              balance={linePoints.map((p) => p.value)}
              interest={
                selected
                  ? selected.schedule.map((s) => s.interest)
                  : undefined
              }
              principal={
                selected
                  ? selected.schedule.map((s) => s.principal)
                  : undefined
              }
            />
          </Paper>

          {selected ? (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t("credit.scheduleTitle")}
                {extraNum > 0 ? t("credit.plusExtra") : ""})
              </Typography>
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Mes</TableCell>
                      <TableCell align="right">Pago</TableCell>
                      <TableCell align="right">Interés</TableCell>
                      <TableCell align="right">Capital</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.schedule.map((row) => (
                      <TableRow key={row.month}>
                        <TableCell>{row.month}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell align="right">
                          {formatCop(row.payment)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCop(row.interest)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCop(row.principal)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCop(row.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mt: 1 }}
              >
                Total a pagar {formatCop(selected.totalPaid)} · de eso{" "}
                {formatCop(selected.totalInterest)} son intereses.
              </Typography>
            </Paper>
          ) : (
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {t("credit.summary")}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Crédito</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell align="right">Cuota</TableCell>
                      <TableCell>Termina</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {forecast.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">
                          {formatCop(item.balance)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCop(item.installmentAmount)}
                        </TableCell>
                        <TableCell>
                          {formatPayoff(
                            item.payoffDate,
                            item.neverPays,
                            t("credit.neverPays"),
                            (n) => monthLabel(n, locale)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      ) : (
        !loading && (
          <Typography variant="body2" color="text.secondary">
            {t("credit.empty")}
          </Typography>
        )
      )}
    </Box>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 160 }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
