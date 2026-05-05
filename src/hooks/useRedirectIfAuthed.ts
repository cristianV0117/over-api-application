"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Si hay token válido, redirige al dashboard (páginas públicas: /, /register).
 */
export function useRedirectIfAuthed() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled && res.ok) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        /* ignorar */
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return ready;
}
