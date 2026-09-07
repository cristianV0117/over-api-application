"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatCop } from "@/lib/api/contabilidad";

const INCOME = "#22c55e";
const EXPENSE = "#f43f5e";
const CREDIT = "#a78bfa";

export function GroupedBars({
  labels,
  series,
}: {
  labels: string[];
  series: { name: string; color: string; values: number[] }[];
}) {
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const w = Math.max(320, labels.length * 52);
  const h = 200;
  const pad = { t: 12, r: 8, b: 36, l: 8 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const groupW = innerW / labels.length;
  const barW = Math.min(16, (groupW - 8) / series.length);

  return (
    <Box sx={{ overflowX: "auto" }}>
      <svg width={w} height={h} role="img">
        {labels.map((label, i) => {
          const gx = pad.l + i * groupW + groupW / 2;
          return (
            <g key={label}>
              {series.map((s, si) => {
                const v = s.values[i] ?? 0;
                const bh = (v / max) * innerH;
                const x = gx - (series.length * barW) / 2 + si * barW;
                return (
                  <rect
                    key={s.name}
                    x={x}
                    y={pad.t + innerH - bh}
                    width={barW - 2}
                    height={Math.max(0, bh)}
                    fill={s.color}
                    rx={2}
                  >
                    <title>
                      {label} · {s.name}: {formatCop(v)}
                    </title>
                  </rect>
                );
              })}
              <text
                x={gx}
                y={h - 12}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="10"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
      <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
        {series.map((s) => (
          <Typography key={s.name} variant="caption" sx={{ color: s.color }}>
            ● {s.name}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export function HBars({
  rows,
  color,
}: {
  rows: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin datos
      </Typography>
    );
  }
  return (
    <Stack spacing={1}>
      {rows.map((r) => (
        <Box key={r.label}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" noWrap sx={{ maxWidth: "60%" }}>
              {r.label}
            </Typography>
            <Typography variant="caption" fontWeight={700}>
              {formatCop(r.value)}
            </Typography>
          </Stack>
          <Box
            sx={{
              height: 8,
              borderRadius: 1,
              bgcolor: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${Math.max(2, (r.value / max) * 100)}%`,
                height: "100%",
                bgcolor: color,
              }}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
}

export function LinePath({
  points,
  color = CREDIT,
}: {
  points: { label: string; value: number }[];
  color?: string;
}) {
  if (points.length < 2) {
    return (
      <Typography variant="body2" color="text.secondary">
        Hace falta más de un mes para graficar.
      </Typography>
    );
  }
  const w = Math.max(320, points.length * 18);
  const h = 180;
  const pad = { t: 10, r: 10, b: 28, l: 10 };
  const max = Math.max(1, ...points.map((p) => p.value));
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const coords = points.map((p, i) => {
    const x = pad.l + (i / (points.length - 1)) * innerW;
    const y = pad.t + innerH - (p.value / max) * innerH;
    return { x, y, ...p };
  });
  const d = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  return (
    <Box sx={{ overflowX: "auto" }}>
      <svg width={w} height={h} role="img">
        <path d={d} fill="none" stroke={color} strokeWidth={2} />
        {coords.map((c) => (
          <circle key={c.label} cx={c.x} cy={c.y} r={2.5} fill={color}>
            <title>
              {c.label}: {formatCop(c.value)}
            </title>
          </circle>
        ))}
      </svg>
    </Box>
  );
}

const SLICE = ["#f43f5e", "#fb7185", "#a78bfa", "#38bdf8", "#22c55e", "#f59e0b", "#e879f9"];

export function Donut({
  rows,
}: {
  rows: { label: string; value: number }[];
}) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (!total) {
    return (
      <Typography variant="body2" color="text.secondary">
        Sin datos
      </Typography>
    );
  }
  const r = 56;
  const c = 70;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
      <svg width={140} height={140} role="img">
        {rows.map((row, i) => {
          const frac = row.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={row.label}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={SLICE[i % SLICE.length]}
              strokeWidth={16}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-acc * circ}
              transform={`rotate(-90 ${c} ${c})`}
            >
              <title>
                {row.label}: {formatCop(row.value)}
              </title>
            </circle>
          );
          acc += frac;
          return el;
        })}
      </svg>
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        {rows.map((row, i) => (
          <Typography key={row.label} variant="caption" noWrap>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: SLICE[i % SLICE.length],
                mr: 0.75,
              }}
            />
            {row.label} · {formatCop(row.value)} (
            {Math.round((row.value / total) * 100)}%)
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}

export const CHART_COLORS = { INCOME, EXPENSE, CREDIT };
