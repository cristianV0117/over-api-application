"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "react-toastify";

export function useLogout() {
  const router = useRouter();

  return useCallback(() => {
    localStorage.removeItem("token");
    toast.success("Sesión cerrada");
    setTimeout(() => router.push("/"), 500);
  }, [router]);
}
