"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true); // renombrado
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role?: "admin" | "user";
    avatarUrl?: string | null;
    impersonation?: {
      impersonatorId: string;
      impersonatorName: string;
      impersonatorEmail: string | null;
    };
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
        setAuthorized(true);
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
        setAuthorized(false);
        router.replace("/"); // replace en vez de push para evitar ir hacia atrás
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  return { authorized, checking, user, setUser };
}
