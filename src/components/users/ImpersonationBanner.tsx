"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser, useSetUser } from "@/context/userContext";
import { adminStopImpersonation } from "@/lib/api/adminUsers";

export default function ImpersonationBanner() {
  const user = useUser();
  const setUser = useSetUser();
  const router = useRouter();
  const imp = user?.impersonation;
  if (!imp) return null;

  const handleStop = async () => {
    try {
      const { token } = await adminStopImpersonation();
      localStorage.setItem("token", token);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar tu perfil");
      const data = await res.json();
      setUser(data);
      toast.success("Sesión restaurada como administrador");
      router.push("/dashboard/users");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al salir");
    }
  };

  return (
    <Box
      role="status"
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.5,
        borderBottom: 1,
        borderColor: "divider",
        background:
          "linear-gradient(90deg, rgba(124, 58, 237, 0.22) 0%, rgba(201, 75, 109, 0.18) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1.25} sx={{ flex: 1, minWidth: 0 }}>
          <VisibilityIcon
            sx={{ color: "primary.light", flexShrink: 0, mt: 0.35 }}
            fontSize="small"
            aria-hidden
          />
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ fontWeight: 600, lineHeight: 1.45 }}
            >
              Modo infiltración: estás viendo la app como{" "}
              <Box component="span" sx={{ color: "primary.light", wordBreak: "break-word" }}>
                {user?.name}
              </Box>
            </Typography>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ lineHeight: 1.5, wordBreak: "break-word" }}
            >
              Usuario: {user?.email}
            </Typography>
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ lineHeight: 1.5, wordBreak: "break-word" }}
            >
              Tu cuenta admin: {imp.impersonatorName}
              {imp.impersonatorEmail ? ` · ${imp.impersonatorEmail}` : ""}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleStop}
          sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Volver a mi cuenta admin
        </Button>
      </Stack>
    </Box>
  );
}
