/** Etiquetas en español para estados estándar del tablero (nombres API en inglés). */
export function statusLabelEs(apiName: string): string {
  const n = apiName.toLowerCase().trim();
  if (n === "to do") return "Por hacer";
  if (n === "in progress") return "En curso";
  if (n === "done") return "Hechas";
  return apiName;
}
