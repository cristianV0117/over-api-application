"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import {
  breadcrumbPath,
  createDriveFolder,
  deleteDriveNode,
  fetchDriveFileBlob,
  findNode,
  isDriveImage,
  listDriveTree,
  renameDriveNode,
  uploadDriveFile,
  type DriveNode,
} from "@/lib/api/files";
import { usePreferences } from "@/context/preferencesContext";

const MAX_SIZE = 12 * 1024 * 1024;
const ACCEPT_FILES =
  "image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip";
const ACCEPT_IMAGES = "image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif";

function formatSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileGlyph({
  node,
  size = 28,
}: {
  node: DriveNode;
  size?: number;
}) {
  if (node.kind === "folder") {
    return <FolderOutlinedIcon sx={{ fontSize: size, color: "primary.main" }} />;
  }
  const mime = node.mimeType ?? "";
  const name = node.name.toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) {
    return <PictureAsPdfOutlinedIcon sx={{ fontSize: size, color: "error.main" }} />;
  }
  if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|avif|heic|heif|tiff?)$/.test(name)) {
    return <ImageOutlinedIcon sx={{ fontSize: size, color: "info.main" }} />;
  }
  if (mime.includes("sheet") || mime.includes("excel") || /\.(xlsx?|csv)$/.test(name)) {
    return <TableChartOutlinedIcon sx={{ fontSize: size, color: "success.main" }} />;
  }
  if (mime.includes("word") || /\.(docx?|txt)$/.test(name)) {
    return <DescriptionOutlinedIcon sx={{ fontSize: size, color: "text.secondary" }} />;
  }
  return <InsertDriveFileOutlinedIcon sx={{ fontSize: size, color: "text.secondary" }} />;
}

function DriveImageThumb({ id, alt }: { id: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchDriveFileBlob(id)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (failed || !url) {
    return (
      <Box
        sx={{
          width: 72,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          bgcolor: "action.hover",
        }}
      >
        {failed ? (
          <ImageOutlinedIcon sx={{ fontSize: 32, color: "info.main" }} />
        ) : (
          <CircularProgress size={18} />
        )}
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      sx={{
        width: 72,
        height: 72,
        objectFit: "cover",
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    />
  );
}

function FolderTree({
  nodes,
  currentId,
  expanded,
  onToggle,
  onSelect,
}: {
  nodes: DriveNode[];
  currentId: string | null;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string | null) => void;
}) {
  const folders = nodes.filter((n) => n.kind === "folder");
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
      {folders.map((folder) => {
        const open = expanded.has(folder.id);
        const selected = currentId === folder.id;
        const nestedFolders = folder.children.filter((c) => c.kind === "folder");
        return (
          <Box component="li" key={folder.id}>
            <Box
              onClick={() => onSelect(folder.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.25,
                py: 0.55,
                px: 0.75,
                borderRadius: 1.5,
                cursor: "pointer",
                bgcolor: selected ? "action.selected" : "transparent",
                "&:hover": { bgcolor: selected ? "action.selected" : "action.hover" },
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(folder.id);
                }}
                sx={{
                  p: 0.25,
                  visibility: nestedFolders.length ? "visible" : "hidden",
                }}
              >
                {open ? (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
              {open || selected ? (
                <FolderOpenOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              ) : (
                <FolderOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
              )}
              <Typography variant="body2" noWrap fontWeight={selected ? 700 : 500}>
                {folder.name}
              </Typography>
            </Box>
            {open && nestedFolders.length > 0 && (
              <Box sx={{ pl: 2 }}>
                <FolderTree
                  nodes={folder.children}
                  currentId={currentId}
                  expanded={expanded}
                  onToggle={onToggle}
                  onSelect={onSelect}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default function ArchivosPage() {
  const { t } = usePreferences();
  const uploadRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [tree, setTree] = useState<DriveNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [nameDialog, setNameDialog] = useState<
    | { mode: "create" }
    | { mode: "rename"; id: string; name: string }
    | null
  >(null);
  const [nameValue, setNameValue] = useState("");
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    node: DriveNode;
  } | null>(null);
  const [preview, setPreview] = useState<{
    node: DriveNode;
    url: string;
  } | null>(null);

  const load = async () => {
    const next = await listDriveTree();
    setTree(next);
  };

  useEffect(() => {
    load()
      .catch((e) =>
        toast.error(e instanceof Error ? e.message : t("files.loadError"))
      )
      .finally(() => setLoading(false));
  }, []);

  const crumbs = useMemo(
    () => breadcrumbPath(tree, currentId),
    [tree, currentId]
  );
  const current = findNode(tree, currentId);
  const items = current ? current.children : tree;

  useEffect(() => {
    if (currentId && !findNode(tree, currentId)) setCurrentId(null);
  }, [tree, currentId]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openFolder = (id: string | null) => {
    setCurrentId(id);
    if (id) {
      setExpanded((prev) => {
        const next = new Set(prev);
        for (const node of breadcrumbPath(tree, id)) next.add(node.id);
        next.add(id);
        return next;
      });
    }
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("files.actionFail"));
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFolder = async () => {
    const name = nameValue.trim();
    if (!name) return;
    await run(async () => {
      const created = await createDriveFolder(name, currentId);
      toast.success(t("files.folderCreated"));
      setNameDialog(null);
      setExpanded((prev) => new Set(prev).add(created.id));
    });
  };

  const handleRename = async () => {
    if (!nameDialog || nameDialog.mode !== "rename") return;
    const name = nameValue.trim();
    if (!name) return;
    await run(async () => {
      await renameDriveNode(nameDialog.id, name);
      toast.success(t("files.renamed"));
      setNameDialog(null);
    });
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > MAX_SIZE);
    if (tooBig) {
      toast.error(t("files.fileTooBig"));
      return;
    }
    await run(async () => {
      for (const file of files) {
        await uploadDriveFile(file, currentId);
      }
      toast.success(
        files.length === 1 ? t("files.uploaded") : t("files.uploadedMany")
      );
    });
  };

  const handleDelete = async (node: DriveNode) => {
    const ok = window.confirm(
      node.kind === "folder" ? t("files.deleteFolderConfirm") : t("files.deleteFileConfirm")
    );
    if (!ok) return;
    await run(async () => {
      await deleteDriveNode(node.id);
      if (currentId === node.id) setCurrentId(node.parentId);
      toast.success(t("files.deleted"));
    });
  };

  const handleOpen = async (node: DriveNode) => {
    if (node.kind === "folder") {
      openFolder(node.id);
      return;
    }
    try {
      const blob = await fetchDriveFileBlob(node.id);
      const url = URL.createObjectURL(blob);
      if (isDriveImage(node)) {
        setPreview((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { node, url };
        });
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("files.openFail"));
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {t("files.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("files.subtitle")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            startIcon={<CreateNewFolderOutlinedIcon />}
            onClick={() => {
              setNameValue("");
              setNameDialog({ mode: "create" });
            }}
            disabled={busy}
          >
            {t("files.newFolder")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateOutlinedIcon />}
            onClick={() => imageUploadRef.current?.click()}
            disabled={busy}
          >
            {t("files.uploadImage")}
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadFileOutlinedIcon />}
            onClick={() => uploadRef.current?.click()}
            disabled={busy}
          >
            {t("files.upload")}
          </Button>
          <input
            ref={uploadRef}
            type="file"
            hidden
            multiple
            accept={ACCEPT_FILES}
            onChange={(e) => {
              if (e.target.files) void handleUploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <input
            ref={imageUploadRef}
            type="file"
            hidden
            multiple
            accept={ACCEPT_IMAGES}
            onChange={(e) => {
              if (e.target.files) void handleUploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
          minHeight: { md: 560 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderRight: { md: "1px solid" },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: "divider",
            p: 1.5,
            bgcolor: "action.hover",
          }}
        >
          <Box
            onClick={() => openFolder(null)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.85,
              mb: 1,
              borderRadius: 1.5,
              cursor: "pointer",
              bgcolor: currentId === null ? "background.paper" : "transparent",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <FolderOpenOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={700}>
              {t("files.root")}
            </Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            <FolderTree
              nodes={tree}
              currentId={currentId}
              expanded={expanded}
              onToggle={toggleExpanded}
              onSelect={openFolder}
            />
          )}
        </Box>

        <Box
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) {
              void handleUploadFiles(e.dataTransfer.files);
            }
          }}
          sx={{
            position: "relative",
            p: 2,
            bgcolor: dragging ? "action.selected" : "background.paper",
          }}
        >
          <Breadcrumbs sx={{ mb: 2 }} separator={<ChevronRightIcon sx={{ fontSize: 16 }} />}>
            <Link
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => openFolder(null)}
              sx={{ fontWeight: 600, fontSize: 14 }}
            >
              {t("files.root")}
            </Link>
            {crumbs.map((crumb, idx) =>
              idx === crumbs.length - 1 ? (
                <Typography key={crumb.id} color="text.primary" fontWeight={700} fontSize={14}>
                  {crumb.name}
                </Typography>
              ) : (
                <Link
                  key={crumb.id}
                  component="button"
                  underline="hover"
                  color="inherit"
                  onClick={() => openFolder(crumb.id)}
                  sx={{ fontWeight: 600, fontSize: 14 }}
                >
                  {crumb.name}
                </Link>
              )
            )}
          </Breadcrumbs>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                px: 2,
                border: "1px dashed",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <FolderOutlinedIcon sx={{ fontSize: 42, color: "text.disabled", mb: 1 }} />
              <Typography fontWeight={700}>{t("files.emptyTitle")}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mx: "auto", mt: 0.5 }}>
                {t("files.emptyBody")}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
                gap: 1.25,
              }}
            >
              {items.map((node) => (
                <Paper
                  key={node.id}
                  variant="outlined"
                  onClick={() => void handleOpen(node)}
                  sx={{
                    p: 1.25,
                    borderRadius: 2.5,
                    cursor: "pointer",
                    position: "relative",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 1,
                    },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 0.25 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenu({ anchor: e.currentTarget, node });
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Stack alignItems="center" spacing={1} sx={{ pb: 1 }}>
                    {isDriveImage(node) ? (
                      <DriveImageThumb id={node.id} alt={node.name} />
                    ) : (
                      <FileGlyph node={node} size={36} />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      textAlign="center"
                      sx={{
                        width: "100%",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        wordBreak: "break-word",
                      }}
                    >
                      {node.name}
                    </Typography>
                    {node.kind === "file" && (
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(node.size)}
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}

          {dragging && (
            <Box
              sx={{
                position: "absolute",
                inset: 8,
                border: "2px dashed",
                borderColor: "primary.main",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(124, 58, 237, 0.08)",
                pointerEvents: "none",
              }}
            >
              <Typography fontWeight={700}>{t("files.dropHere")}</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      <Menu
        open={Boolean(menu)}
        anchorEl={menu?.anchor}
        onClose={() => setMenu(null)}
      >
        {menu?.node.kind === "file" && (
          <MenuItem
            onClick={() => {
              const node = menu.node;
              setMenu(null);
              void handleOpen(node);
            }}
          >
            <VisibilityOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
            {t("files.open")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            if (!menu) return;
            setNameValue(menu.node.name);
            setNameDialog({ mode: "rename", id: menu.node.id, name: menu.node.name });
            setMenu(null);
          }}
        >
          <DriveFileRenameOutlineOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          {t("files.rename")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            const node = menu?.node;
            setMenu(null);
            if (node) void handleDelete(node);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          {t("files.delete")}
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(nameDialog)}
        onClose={() => setNameDialog(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {nameDialog?.mode === "rename" ? t("files.rename") : t("files.newFolder")}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label={t("files.name")}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (nameDialog?.mode === "rename") void handleRename();
                else void handleCreateFolder();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNameDialog(null)}>{t("files.cancel")}</Button>
          <Button
            variant="contained"
            disabled={!nameValue.trim() || busy}
            onClick={() =>
              nameDialog?.mode === "rename" ? void handleRename() : void handleCreateFolder()
            }
          >
            {t("files.save")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(preview)}
        onClose={() => {
          if (preview?.url) URL.revokeObjectURL(preview.url);
          setPreview(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
          <Typography component="span" fontWeight={700} noWrap sx={{ flex: 1 }}>
            {preview?.node.name ?? t("files.preview")}
          </Typography>
          <IconButton
            onClick={() => {
              if (preview?.url) URL.revokeObjectURL(preview.url);
              setPreview(null);
            }}
          >
            <CloseOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: "flex", justifyContent: "center", pb: 3 }}>
          {preview && (
            <Box
              component="img"
              src={preview.url}
              alt={preview.node.name}
              onError={() => {
                window.open(preview.url, "_blank", "noopener,noreferrer");
              }}
              sx={{
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
