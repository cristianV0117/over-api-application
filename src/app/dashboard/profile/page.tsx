"use client";

import { useEffect, useState } from "react";
import { useUser, useSetUser } from "@/context/userContext";
import {
  getProfile,
  updateProfile,
  avatarUrl,
} from "@/lib/api/profile";
import { toast } from "react-toastify";

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
    return <p className="text-secondary">Cargando perfil...</p>;
  }

  return (
    <div className="text-white">
      <h1 className="display-6 mb-4">Editar perfil</h1>

      <div
        className="rounded p-4"
        style={{ backgroundColor: "#1B1F22", maxWidth: "400px" }}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-center">
            <label className="d-block mb-2 small text-secondary">
              Foto de perfil
            </label>
            <div className="position-relative d-inline-block">
              <img
                src={avatarPreview || avatarUrl(contextUser?.avatarUrl)}
                alt="Avatar"
                className="rounded-circle"
                style={{ width: 96, height: 96, objectFit: "cover" }}
              />
              <label
                className="position-absolute bottom-0 end-0 rounded-circle bg-primary d-flex align-items-center justify-content-center text-white cursor-pointer"
                style={{
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-camera-fill small" />
                <input
                  type="file"
                  accept="image/*"
                  className="d-none"
                  onChange={handleAvatarChange}
                  aria-label="Subir foto"
                />
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="profileName" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="profileName"
              className="form-control bg-dark text-white border-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary">Email</label>
            <input
              type="text"
              className="form-control bg-dark text-secondary border-secondary"
              value={contextUser?.email ?? ""}
              readOnly
              disabled
            />
            <small className="text-secondary">El email no se puede cambiar</small>
          </div>

          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#702CF4", color: "white" }}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
