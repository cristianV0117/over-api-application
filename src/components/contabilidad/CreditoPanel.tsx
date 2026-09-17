"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
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
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FinanceDebtsPanel from "@/components/contabilidad/FinanceDebtsPanel";
import { usePreferences } from "@/context/preferencesContext";
import { monthLabel } from "@/i18n";
import { CreditForecastChart } from "@/components/contabilidad/InteractiveCharts";
import {
  deleteDebtPayment,
  formatCop,
  getDebtForecast,
  listFinanceDebts,
  upsertDebtPayment,
  type DebtForecast,
  type DebtForecastStep,
  type FinanceDebt,
} from "@/lib/api/contabilidad";

function parseMoney(raw: string): number {
  return Number(raw.replace(/\./g, "").replace(/,/g, "")) || 0;
}

function parseYm(date: string): { year: number; month: number } | null {
  const [year, month] = date.split("-").map(Number);
  if (!year || !month) return null;
  return { year, month };
}

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
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingDate, setSavingDate] = useState<string | null>(null);

  const extraNum = parseMoney(extra);

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

  useEffect(() => {
    setDrafts({});
  }, [selected?.id]);

  const savePayment = async (
    row: DebtForecastStep,
    amount: number,
    cleared = false
  ) => {
    if (!selected) return;
    const ym = parseYm(row.date);
    if (!ym) return;
    setSavingDate(row.date);
    try {
      if (cleared || amount <= 0) {
        if (row.paid) {
          await deleteDebtPayment(selected.id, ym.year, ym.month);
          toast.success(t("credit.paymentCleared"));
        }
      } else {
        await upsertDebtPayment(selected.id, {
          year: ym.year,
          month: ym.month,
          amount,
        });
        toast.success(t("credit.paymentSaved"));
      }
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[row.date];
        return next;
      });
      await onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("credit.paymentError"));
    } finally {
      setSavingDate(null);
    }
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
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                {t("credit.scheduleHint")}
              </Typography>
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">{t("credit.paid")}</TableCell>
                      <TableCell>#</TableCell>
                      <TableCell>Mes</TableCell>
                      <TableCell align="right">{t("credit.actualPayment")}</TableCell>
                      <TableCell align="right">{t("credit.interest")}</TableCell>
                      <TableCell align="right">{t("credit.principal")}</TableCell>
                      <TableCell align="right">
                        {t("credit.extraPrincipal")}
                      </TableCell>
                      <TableCell align="right">{t("credit.balance")}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selected.schedule.map((row) => {
                      const paid = !!row.paid;
                      const draft = drafts[row.date];
                      const display =
                        draft ?? (paid ? String(row.payment) : "");
                      const extraCapital = row.extraPrincipal ?? 0;
                      const busy = savingDate === row.date;
                      return (
                        <TableRow
                          key={`${row.month}-${row.date}`}
                          sx={{
                            bgcolor: paid ? "action.selected" : undefined,
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={paid}
                              disabled={busy}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const amount =
                                    parseMoney(display) ||
                                    selected.installmentAmount;
                                  void savePayment(row, amount);
                                } else {
                                  void savePayment(row, 0, true);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{row.month}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right" sx={{ minWidth: 140 }}>
                            <TextField
                              size="small"
                              value={display}
                              disabled={busy}
                              placeholder={String(selected.installmentAmount)}
                              onChange={(e) =>
                                setDrafts((prev) => ({
                                  ...prev,
                                  [row.date]: e.target.value,
                                }))
                              }
                              onBlur={() => {
                                const amount = parseMoney(display);
                                if (!paid && !amount) return;
                                if (paid && amount === row.payment) return;
                                if (amount > 0) void savePayment(row, amount);
                              }}
                              onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                (e.target as HTMLInputElement).blur();
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {formatCop(row.interest)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCop(row.principal)}
                          </TableCell>
                          <TableCell align="right">
                            {extraCapital > 0 ? formatCop(extraCapital) : "—"}
                          </TableCell>
                          <TableCell align="right">
                            {formatCop(row.balance)}
                          </TableCell>
                          <TableCell>
                            {paid ? (
                              <Tooltip title={t("credit.clearPayment")}>
                                <span>
                                  <IconButton
                                    size="small"
                                    disabled={busy}
                                    onClick={() =>
                                      void savePayment(row, 0, true)
                                    }
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 1 }}
              >
                {t("credit.pickOne")}
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
