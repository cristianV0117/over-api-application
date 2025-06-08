"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unauthorized");

        const data = await res.json();
        setUser(data);
        setAuthorized(true);
      } catch (err) {
        console.log(err);
        setUser(null);
        setAuthorized(false);
        router.push("/"); // 👈 Redirige si no está autorizado
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return { authorized, loading, user };
}
