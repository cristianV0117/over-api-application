"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import type { CvSummary } from "@/lib/cv/types";

type Props = {
  items: CvSummary[];
  busyId: string | null;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function CvList({ items, busyId, onCreate, onEdit, onDelete }: Props) {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Mis CVs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Arma el PDF, cambia secciones y colores, y genera una versión en inglés.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
          Nuevo CV
        </Button>
      </Stack>

      {items.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" mb={2}>
            Aún no tienes CVs. Crea el primero para empezar.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>
            Crear CV
          </Button>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Idioma</TableCell>
                <TableCell>Secciones</TableCell>
                <TableCell>Actualizado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const busy = busyId === item.id;
                return (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{item.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={item.locale === "en" ? "EN" : "ES"} />
                    </TableCell>
                    <TableCell>{item.sectionCount}</TableCell>
                    <TableCell>
                      {new Date(item.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <span>
                          <IconButton size="small" disabled={busy} onClick={() => onEdit(item.id)}>
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            disabled={busy}
                            onClick={() => onDelete(item.id)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  );
}
