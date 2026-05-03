/**
 * Activa la pantalla de mantenimiento en toda la app.
 *
 * En `.env` o en el host (Railway, etc.):
 *   MAINTENANCE_MODE=true
 *
 * También se admite `NEXT_PUBLIC_MAINTENANCE_MODE` (mismo comportamiento).
 * Valores considerados verdadero: `true`, `1`, `yes` (sin distinguir mayúsculas).
 */
export function isMaintenanceMode(): boolean {
  const raw = (
    process.env.MAINTENANCE_MODE ??
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE ??
    ""
  )
    .toLowerCase()
    .trim();
  return raw === "true" || raw === "1" || raw === "yes";
}
