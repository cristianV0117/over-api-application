import type { Locale } from "./types";
import es, { type MessageKey } from "./messages/es";
import en from "./messages/en";

const dictionaries: Record<Locale, Record<MessageKey, string>> = { es, en };

export type { MessageKey };

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const template = dictionaries[locale][key] ?? dictionaries.es[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

export function statusLabel(apiName: string, locale: Locale): string {
  const n = apiName.toLowerCase().trim();
  if (n === "to do") return translate(locale, "status.todo");
  if (n === "in progress") return translate(locale, "status.progress");
  if (n === "done") return translate(locale, "status.done");
  return apiName;
}

export function monthLabel(month: number, locale: Locale, short = false): string {
  const key = (short
    ? `month.short.${month}`
    : `month.${month}`) as MessageKey;
  return translate(locale, key);
}
