const MONTHS_ES = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
const MONTHS_EN = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

export function parseYearMonth(value: string | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return new Date(year, month - 1, 1);
}

export function formatYearMonth(value: string | undefined, locale: "es" | "en" = "es"): string {
  const date = parseYearMonth(value);
  if (!date) return value?.trim() || "";
  const months = locale === "en" ? MONTHS_EN : MONTHS_ES;
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDuration(
  startMonth: string | undefined,
  endMonth: string | undefined,
  current: boolean,
  locale: "es" | "en" = "es"
): string {
  const from = parseYearMonth(startMonth);
  const to = current ? new Date() : parseYearMonth(endMonth);
  if (!from || !to) return "";
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
  if (months < 1) months = 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (locale === "en") {
    const yearPart = years ? `${years} yr${years === 1 ? "" : "s"}` : "";
    const monthPart = rest ? `${rest} mo${rest === 1 ? "" : "s"}` : "";
    return [yearPart, monthPart].filter(Boolean).join(" ");
  }
  const yearPart = years ? `${years} año${years === 1 ? "" : "s"}` : "";
  const monthPart = rest ? `${rest} mes${rest === 1 ? "" : "es"}` : "";
  return [yearPart, monthPart].filter(Boolean).join(" ");
}

export function formatDateRange(
  startMonth: string | undefined,
  endMonth: string | undefined,
  current: boolean,
  fallbackStart: string | undefined,
  fallbackEnd: string | undefined,
  locale: "es" | "en" = "es"
): string {
  const start = formatYearMonth(startMonth, locale) || fallbackStart || "";
  const end = current
    ? locale === "en"
      ? "Present"
      : "Actualidad"
    : formatYearMonth(endMonth, locale) || fallbackEnd || "";
  return [start, end].filter(Boolean).join(" — ");
}

export function jobDuration(
  item: {
    startMonth?: string;
    endMonth?: string;
    current?: boolean;
    duration?: string;
    start?: string;
    end?: string;
  },
  locale: "es" | "en" = "es"
): string {
  return (
    formatDuration(item.startMonth, item.endMonth, Boolean(item.current), locale) ||
    item.duration ||
    ""
  );
}
