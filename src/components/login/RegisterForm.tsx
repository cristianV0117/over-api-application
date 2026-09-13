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
import { usePreferences } from "@/context/preferencesContext";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { t } = usePreferences();

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
          : data.message || t("register.fail");
        toast.error(message);
        return;
      }

      localStorage.setItem("token", data.token);
      toast.success(t("register.success"));
      router.push("/dashboard");
    } catch (error) {
      console.error("Error al registrarse", error);
      toast.error(t("login.serverError"));
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
            {t("register.title")}
          </Typography>
        </Stack>

        <TextField
          label={t("common.name")}
          type="text"
          id="name"
          placeholder={t("profile.namePh")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          autoComplete="name"
        />

        <TextField
          label={t("common.email")}
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
          label={t("common.password")}
          type={showPassword ? "text" : "password"}
          id="password"
          helperText={t("register.passwordHint")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
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
          {t("register.submit")}
        </Button>

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t("register.haveAccount")}{" "}
          <Link component={NextLink} href="/" color="primary" underline="hover">
            {t("register.login")}
          </Link>
        </Typography>
      </Stack>
    </Paper>
  );
}
