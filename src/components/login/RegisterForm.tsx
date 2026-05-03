"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message || "No se pudo crear la cuenta";
        toast.error(message);
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success("Cuenta creada. Bienvenido.");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al registrarse", error);
      toast.error("Error en el servidor");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, sm: 4 },
        width: "100%",
        maxWidth: 440,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack spacing={2.5} component="form" onSubmit={handleSubmit}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <PersonAddIcon color="primary" />
          <Typography variant="h5" fontWeight={700}>
            Crear cuenta
          </Typography>
        </Stack>

        <TextField
          label="Nombre"
          type="text"
          id="name"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          autoComplete="name"
        />

        <TextField
          label="Correo electrónico"
          type="email"
          id="email"
          placeholder="usuario@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoComplete="email"
        />

        <TextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          id="password"
          helperText="Mínimo 8 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((p) => !p)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
          Registrarse
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          ¿Ya tienes cuenta?{" "}
          <Link component={NextLink} href="/" color="primary" underline="hover">
            Inicia sesión
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
