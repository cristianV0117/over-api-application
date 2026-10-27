"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import CvBuilder from "@/components/cv/CvBuilder";
import CvList from "@/components/cv/CvList";
import type { CvConfig, CvSummary } from "@/lib/cv/types";
import { createCv, deleteCv, fetchCv, fetchMyCvs, saveCv, translateCv } from "@/lib/api/cv";

type View = "list" | "edit";

export default function CvPage() {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<CvSummary[]>([]);
  const [config, setConfig] = useState<CvConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const list = await fetchMyCvs();
    setItems(list);
    return list;
  }, []);

  useEffect(() => {
    loadList()
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [loadList]);

  const openEdit = async (id: string) => {
    setLoadingEdit(true);
    try {
      const full = await fetchCv(id);
      setConfig(full);
      setView("edit");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al cargar");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleCreate = async () => {
    setBusyId("new");
    try {
      const created = await createCv();
      setItems((prev) => [
        {
          id: created.id,
          name: created.name,
          locale: created.locale,
          sectionCount: created.sections.length,
          updatedAt: created.updatedAt,
        },
        ...prev,
      ]);
      setConfig(created);
      setView("edit");
      toast.success("CV creado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteFromList = async (id: string) => {
    const item = items.find((p) => p.id === id);
    if (!window.confirm(`¿Eliminar "${item?.name ?? "este CV"}"?`)) return;
    setBusyId(id);
    try {
      await deleteCv(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("CV eliminado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setBusyId(null);
    }
  };

  const backToList = async () => {
    setView("list");
    setConfig(null);
    try {
      await loadList();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar lista");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (view === "edit") {
    if (loadingEdit || !config) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }

    const cvId = config.id;

    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Editar CV
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Mueve secciones, cambia colores y mira el PDF a medida que editas.
        </Typography>
        <CvBuilder
          key={config.id}
          initial={config}
          onBack={backToList}
          onSave={async (payload) => {
            const next = await saveCv(cvId, payload);
            setConfig(next);
            toast.success("CV guardado");
            return next;
          }}
          onTranslate={async () => {
            const next = await translateCv(cvId);
            setConfig(next);
            toast.success("Versión en inglés creada");
            return next;
          }}
          onDelete={async () => {
            await deleteCv(cvId);
            toast.success("CV eliminado");
            await backToList();
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>
        CV / PDF
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Genera currículums en PDF con el mismo control que los portafolios.
      </Typography>
      <CvList
        items={items}
        busyId={busyId}
        onCreate={handleCreate}
        onEdit={openEdit}
        onDelete={handleDeleteFromList}
      />
    </Box>
  );
}
