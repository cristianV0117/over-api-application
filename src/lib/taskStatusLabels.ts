import type { Locale } from "@/i18n/types";
import { statusLabel } from "@/i18n";

/** @deprecated usa statusLabel(name, locale) */
export function statusLabelEs(apiName: string, locale: Locale = "es"): string {
  return statusLabel(apiName, locale);
}
