"use client";

import { useEffect, useState } from "react";
import { useUser, useSetUser } from "@/context/userContext";
import { getProfile, updateProfile, avatarUrl } from "@/lib/api/profile";
import { toast } from "react-toastify";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CircularProgress from "@mui/material/CircularProgress";

export default function ProfilePage() {
  const contextUser = useUser();
  const setUser = useSetUser();
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getProfile();
        setName(profile.name);
        if (profile.avatarUrl) {
          setAvatarPreview(avatarUrl(profile.avatarUrl));
        }
      } catch {
        toast.error("Error al cargar perfil");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 2 MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile({
        name: name.trim() || undefined,
        avatar: avatarFile || undefined,
      });
      setName(updated.name);
      if (updated.avatarUrl) setAvatarPreview(avatarUrl(updated.avatarUrl));
      setAvatarFile(null);
      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        avatarUrl: updated.avatarUrl,
      });
      toast.success("Perfil actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 160px)",
        py: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 520 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Editar perfil
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: "center" }}
        >
          Actualiza tu nombre y foto. El correo queda vinculado a tu cuenta.
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            border: 1,
            borderColor: "divider",
          }}
        >
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
              Foto de perfil
            </Typography>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={avatarPreview || avatarUrl(contextUser?.avatarUrl)}
                alt=""
                sx={{ width: 104, height: 104, border: "3px solid", borderColor: "primary.main" }}
              />
              <IconButton
                component="label"
                color="primary"
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                size="small"
                aria-label="Subir foto"
              >
                <PhotoCamera fontSize="small" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarChange}
                />
              </IconButton>
            </Box>
          </Box>

          <TextField
            label="Nombre"
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            fullWidth
          />

          <TextField
            label="Email"
            value={contextUser?.email ?? ""}
            fullWidth
            disabled
            helperText="El email no se puede cambiar"
          />

          <Button type="submit" variant="contained" color="primary" size="large" disabled={loading} fullWidth>
            {loading ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Stack>
      </Paper>
      </Box>
    </Box>
  );
}
