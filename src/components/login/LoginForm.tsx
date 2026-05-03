"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import LoginIcon from "@mui/icons-material/Login";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ForgotPasswordModal from "@/components/login/ForgotPasswordModal";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message[0]
          : data.message || "Credenciales incorrectas";
        toast.error(message);
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success("Inicio de sesión exitoso");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión", error);
      toast.error("Error en el servidor");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
  };

  return (
    <>
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
            <LoginIcon color="primary" />
            <Typography variant="h5" fontWeight={700}>
              Iniciar sesión
            </Typography>
          </Stack>

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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
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

          <Box textAlign="right">
            <Link
              component="button"
              type="button"
              variant="body2"
              onClick={() => setShowForgotModal(true)}
              sx={{ cursor: "pointer", border: "none", background: "none", font: "inherit" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
            Ingresar
          </Button>

          <Divider sx={{ color: "text.secondary" }}>o</Divider>

          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="large"
            fullWidth
            onClick={handleGoogleLogin}
            sx={{ borderColor: "divider" }}
          >
            Continuar con Google
          </Button>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            ¿No tienes cuenta?{" "}
            <Link component={NextLink} href="/register" color="primary" underline="hover">
              Regístrate
            </Link>
          </Typography>
        </Stack>
      </Paper>

      <ForgotPasswordModal
        show={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
    </>
  );
}
