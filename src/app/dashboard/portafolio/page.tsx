"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { toast } from "react-toastify";
import PortfolioBuilder from "@/components/portfolio/PortfolioBuilder";
import PortfolioList from "@/components/portfolio/PortfolioList";
import type { PortfolioConfig, PortfolioSummary } from "@/lib/portfolio/types";
import {
  createPortfolio,
  deletePortfolio,
  fetchMyPortfolios,
  fetchPortfolio,
  publishPortfolio,
  savePortfolio,
  unpublishPortfolio,
} from "@/lib/api/portfolio";

type View = "list" | "edit";

export default function PortafolioPage() {
  const [view, setView] = useState<View>("list");
  const [items, setItems] = useState<PortfolioSummary[]>([]);
  const [config, setConfig] = useState<PortfolioConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    const list = await fetchMyPortfolios();
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
      const full = await fetchPortfolio(id);
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
      const created = await createPortfolio();
      setItems((prev) => [
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          published: created.published,
          publicUrl: created.publicUrl,
          blockCount: created.sections.length,
          updatedAt: created.updatedAt,
        },
        ...prev,
      ]);
      setConfig(created);
      setView("edit");
      toast.success("Portafolio creado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear");
    } finally {
      setBusyId(null);
    }
  };

  const handlePublishFromList = async (id: string) => {
    setBusyId(id);
    try {
      await publishPortfolio(id);
      await loadList();
      toast.success("Portafolio publicado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al publicar");
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpublishFromList = async (id: string) => {
    setBusyId(id);
    try {
      await unpublishPortfolio(id);
      await loadList();
      toast.success("Portafolio despublicado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteFromList = async (id: string) => {
    const item = items.find((p) => p.id === id);
    if (!window.confirm(`¿Eliminar "${item?.name ?? "este portafolio"}"?`)) return;
    setBusyId(id);
    try {
      await deletePortfolio(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Portafolio eliminado");
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

    const portfolioId = config.id;

    return (
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Editar portafolio
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Cuadrícula bento · publica en <strong>/{config.slug}</strong>
        </Typography>
        <PortfolioBuilder
          initial={config}
          onBack={backToList}
          onSave={async (payload) => {
            const next = await savePortfolio(portfolioId, payload);
            setConfig(next);
            toast.success("Portafolio guardado");
            return next;
          }}
          onPublish={async () => {
            const next = await publishPortfolio(portfolioId);
            setConfig(next);
            toast.success(`Publicado en ${next.publicUrl ?? next.slug}`);
            return next;
          }}
          onUnpublish={async () => {
            const next = await unpublishPortfolio(portfolioId);
            setConfig(next);
            toast.success("Portafolio despublicado");
            return next;
          }}
          onDelete={async () => {
            await deletePortfolio(portfolioId);
            toast.success("Portafolio eliminado");
            await backToList();
          }}
        />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Portafolio
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Crea y gestiona varios portafolios. Cada uno se publica en su propia URL. CristianDev no se modifica.
      </Typography>
      <PortfolioList
        items={items}
        busyId={busyId}
        onCreate={handleCreate}
        onEdit={openEdit}
        onPublish={handlePublishFromList}
        onUnpublish={handleUnpublishFromList}
        onDelete={handleDeleteFromList}
      />
    </Box>
  );
}
