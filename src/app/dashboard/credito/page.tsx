"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function CreditoRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/contabilidad");
  }, [router]);
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
}
