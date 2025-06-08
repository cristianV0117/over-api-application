"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.replace("/dashboard");
    } else {
      router.replace("/");
    }
  }, [router]);

  return <p className="text-white p-4">Validando sesión de Google...</p>;
}
