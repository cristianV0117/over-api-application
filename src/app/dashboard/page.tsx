"use client";
import { useUser } from "@/context/userContext";

export default function DashboardPage() {
  const user = useUser();

  return (
    <div className="text-white p-4">
      <h1 className="display-4">Dashboard</h1>
      <p>
        Bienvenido, <strong>{user?.name}</strong> ({user?.email})
      </p>
    </div>
  );
}
