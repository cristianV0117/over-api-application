"use client";

import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function DashboardPage() {
  const { authorized, loading, user } = useAuthGuard();

  if (loading) return <div className="text-white p-4">Validando sesión...</div>;
  if (!authorized) return null; // ya se redirige desde el hook

  return (
    <div className="text-white p-4">
      <h1 className="display-4">Dashboard</h1>
      <p>
        Bienvenido, <strong>{user?.name}</strong> ({user?.email})
      </p>
    </div>
  );
}
