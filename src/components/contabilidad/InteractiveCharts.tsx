"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ApexOptions } from "apexcharts";
import { formatCop } from "@/lib/api/contabilidad";

const ApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 280,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Cargando gráfica…
      </Typography>
    </Box>
  ),
});

export const CHART_COLORS = {
  INCOME: "#22c55e",
  EXPENSE: "#f43f5e",
  CREDIT: "#a78bfa",
  CASH: "#38bdf8",
  DEFICIT: "#f59e0b",
};

const SLICE = [
  "#f43f5e",
  "#a78bfa",
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#e879f9",
  "#fb7185",
  "#2dd4bf",
];

function compactCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function emptyState(text = "Sin datos") {
  return (
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  );
}

function baseOptions(overrides: ApexOptions = {}): ApexOptions {
  return {
    theme: { mode: "dark" },
    chart: {
      background: "transparent",
      foreColor: "#94a3b8",
      fontFamily: "inherit",
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      animations: { enabled: true, speed: 550 },
      zoom: { enabled: true, type: "x" },
      redrawOnParentResize: true,
      redrawOnWindowResize: true,
    },
    grid: {
      borderColor: "rgba(255,255,255,0.08)",
      strokeDashArray: 3,
      padding: { left: 8, right: 8 },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      y: { formatter: (v) => formatCop(Number(v ?? 0)) },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "12px",
      labels: { colors: "#cbd5e1" },
      markers: { size: 8 },
    },
    xaxis: {
      labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
      axisBorder: { color: "rgba(255,255,255,0.08)" },
      axisTicks: { color: "rgba(255,255,255,0.08)" },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px" },
        formatter: (v) => compactCop(Number(v ?? 0)),
      },
    },
    ...overrides,
  };
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, []);
  if (!ready) {
    return <Box sx={{ width: "100%", minWidth: 0, height: 280 }} />;
  }
  return <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>{children}</Box>;
}

export function IncomeExpenseCombo({
  labels,
  income,
  expenses,
  remaining,
}: {
  labels: string[];
  income: number[];
  expenses: number[];
  remaining: number[];
}) {
  if (!labels.length) return emptyState();
  const options = baseOptions({
    chart: {
      ...baseOptions().chart,
      type: "line",
      stacked: false,
    },
    stroke: { width: [0, 0, 3], curve: "smooth" },
    plotOptions: { bar: { columnWidth: "52%", borderRadius: 4 } },
    colors: [CHART_COLORS.INCOME, CHART_COLORS.EXPENSE, CHART_COLORS.CASH],
    xaxis: { ...baseOptions().xaxis, categories: labels },
    markers: { size: [0, 0, 4], hover: { size: 7 } },
    fill: {
      type: ["solid", "solid", "solid"],
      opacity: [0.92, 0.92, 1],
    },
  });
  return (
    <ChartFrame>
      <ApexChart
        type="line"
        height={320}
        width="100%"
        options={options}
        series={[
          { name: "Ingresos", type: "column", data: income },
          { name: "Gastos", type: "column", data: expenses },
          { name: "Disponible", type: "line", data: remaining },
        ]}
      />
    </ChartFrame>
  );
}

export function CategoryBars({
  rows,
  color,
}: {
  rows: { label: string; value: number }[];
  color: string;
}) {
  if (!rows.length) return emptyState();
  const options = baseOptions({
    chart: { ...baseOptions().chart, type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 5,
        barHeight: rows.length > 6 ? "68%" : "52%",
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    colors: rows.map((_, i) => (i === 0 ? color : SLICE[i % SLICE.length])),
    xaxis: {
      ...baseOptions().xaxis,
      categories: rows.map((r) => r.label),
    },
    yaxis: { labels: { style: { colors: "#cbd5e1", fontSize: "12px" }, maxWidth: 140 } },
    dataLabels: {
      enabled: true,
      formatter: (v) => compactCop(Number(v ?? 0)),
      style: { colors: ["#e2e8f0"], fontSize: "11px", fontWeight: 700 },
      offsetX: 6,
    },
    legend: { show: false },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => formatCop(Number(v ?? 0)) },
    },
    grid: { ...baseOptions().grid, xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  });
  return (
    <ChartFrame>
      <ApexChart
        type="bar"
        height={Math.max(240, rows.length * 42)}
        width="100%"
        options={options}
        series={[{ name: "Total", data: rows.map((r) => r.value) }]}
      />
    </ChartFrame>
  );
}

export function CashflowArea({
  labels,
  values,
  color = CHART_COLORS.CASH,
}: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  if (values.length < 2) {
    return emptyState("Hace falta más de un mes para graficar.");
  }
  const options = baseOptions({
    chart: { ...baseOptions().chart, type: "area" },
    colors: [color],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.6,
        opacityFrom: 0.45,
        opacityTo: 0.04,
        stops: [0, 90, 100],
      },
    },
    markers: { size: 4, hover: { size: 7 }, strokeWidth: 0 },
    xaxis: { ...baseOptions().xaxis, categories: labels },
    annotations:
      values.some((v) => v < 0)
        ? {
            yaxis: [
              {
                y: 0,
                borderColor: "rgba(245, 158, 11, 0.7)",
                strokeDashArray: 4,
                label: {
                  text: "Cero",
                  style: { color: "#0f172a", background: "#f59e0b" },
                },
              },
            ],
          }
        : undefined,
  });
  return (
    <ChartFrame>
      <ApexChart
        type="area"
        height={300}
        width="100%"
        options={options}
        series={[{ name: "Disponible", data: values }]}
      />
    </ChartFrame>
  );
}

export function ExpenseDonut({
  rows,
}: {
  rows: { label: string; value: number }[];
}) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!total) return emptyState();
  const options = baseOptions({
    chart: { ...baseOptions().chart, type: "donut", toolbar: { show: false } },
    labels: rows.map((r) => r.label),
    colors: SLICE,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        expandOnClick: true,
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { color: "#e2e8f0", fontSize: "13px" },
            value: {
              color: "#f8fafc",
              fontWeight: 700,
              formatter: (v) => formatCop(Number(v)),
            },
            total: {
              show: true,
              label: "Total mes",
              color: "#94a3b8",
              formatter: () => formatCop(total),
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: { colors: "#cbd5e1" },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Number(val).toFixed(0)}%`,
      style: { fontSize: "11px", fontWeight: 700 },
    },
    tooltip: {
      theme: "dark",
      y: { formatter: (v) => formatCop(Number(v ?? 0)) },
    },
  });
  return (
    <ChartFrame>
      <ApexChart
        type="donut"
        height={340}
        width="100%"
        options={options}
        series={rows.map((r) => r.value)}
      />
    </ChartFrame>
  );
}

export function SurplusDeficitBars({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  if (!labels.length) return emptyState();
  const options = baseOptions({
    chart: { ...baseOptions().chart, type: "bar" },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "55%",
        colors: {
          ranges: [
            { from: -1e15, to: -0.01, color: CHART_COLORS.DEFICIT },
            { from: 0, to: 1e15, color: CHART_COLORS.CASH },
          ],
        },
      },
    },
    xaxis: { ...baseOptions().xaxis, categories: labels },
    annotations: {
      yaxis: [
        {
          y: 0,
          borderColor: "rgba(148,163,184,0.5)",
          strokeDashArray: 4,
        },
      ],
    },
  });
  return (
    <ChartFrame>
      <ApexChart
        type="bar"
        height={300}
        width="100%"
        options={options}
        series={[{ name: "Ingresos − gastos", data: values }]}
      />
    </ChartFrame>
  );
}

export function CreditForecastChart({
  labels,
  balance,
  interest,
  principal,
}: {
  labels: string[];
  balance: number[];
  interest?: number[];
  principal?: number[];
}) {
  if (balance.length < 2) {
    return emptyState("Hace falta más de un mes para graficar.");
  }
  const hasBreakdown = Boolean(interest?.length && principal?.length);
  const options = baseOptions({
    chart: {
      ...baseOptions().chart,
      type: hasBreakdown ? "line" : "area",
    },
    colors: hasBreakdown
      ? [CHART_COLORS.CREDIT, "#f59e0b", "#22c55e"]
      : [CHART_COLORS.CREDIT],
    stroke: {
      width: hasBreakdown ? [3, 0, 0] : 3,
      curve: "smooth",
    },
    plotOptions: { bar: { columnWidth: "55%", borderRadius: 2 } },
    fill: hasBreakdown
      ? { type: ["gradient", "solid", "solid"], opacity: [0.35, 0.85, 0.85] }
      : {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.55,
            opacityFrom: 0.42,
            opacityTo: 0.05,
          },
        },
    markers: { size: hasBreakdown ? [3, 0, 0] : 3, hover: { size: 6 } },
    xaxis: {
      ...baseOptions().xaxis,
      categories: labels,
      tickAmount: Math.min(12, labels.length),
    },
  });
  const series = hasBreakdown
    ? [
        { name: "Saldo", type: "area" as const, data: balance },
        { name: "Interés", type: "column" as const, data: interest ?? [] },
        { name: "Capital", type: "column" as const, data: principal ?? [] },
      ]
    : [{ name: "Saldo proyectado", type: "area" as const, data: balance }];

  return (
    <ChartFrame>
      <ApexChart
        type={hasBreakdown ? "line" : "area"}
        height={340}
        width="100%"
        options={options}
        series={series}
      />
    </ChartFrame>
  );
}
