"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="text-white p-4">
      <p className="text-secondary">Redirigiendo al dashboard...</p>
    </div>
  );
}
