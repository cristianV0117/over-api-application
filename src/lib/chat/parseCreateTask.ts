/**
 * Parsea un mensaje del usuario para detectar intención de crear tarea.
 * Ejemplos: "crea una tarea: Revisar PRs", "crear tarea Revisar PRs", "crea tarea Titulo. Descripción aquí"
 */
export function parseCreateTaskIntent(
  text: string
): { title: string; description?: string } | null {
  const trimmed = text.trim();
  const match = trimmed.match(
    /crea(?:r)?\s+(?:una?\s+)?(?:la\s+)?tarea\s*:?\s*(.+)/i
  );
  if (!match || !match[1]) return null;

  const rest = match[1].trim();
  if (!rest) return null;

  // Si hay punto y espacio o salto de línea, primera parte = título, resto = descripción
  const dotSplit = rest.split(/\.\s+/);
  const title = dotSplit[0].trim();
  const description =
    dotSplit.length > 1 ? dotSplit.slice(1).join(". ").trim() : undefined;

  return { title, description };
}
