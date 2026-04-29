"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";

interface ForgotPasswordModalProps {
  show: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  show,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, name: "Usuario" }),
        }
      );

      if (!res.ok) throw new Error("Error al enviar el correo");

      toast.info("Revisa tu bandeja de correo");
      setEmail("");
      onClose();
    } catch (err) {
      toast.error("No se pudo enviar el enlace");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogTitle sx={{ pr: 6 }}>
        Recuperar contraseña
        <IconButton
          aria-label="cerrar"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <TextField
            label="Correo electrónico"
            type="email"
            id="forgotEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@correo.com"
            required
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Enviando…" : "Enviar enlace"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
