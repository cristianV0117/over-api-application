"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import type { PortfolioBlock, PortfolioTheme } from "@/lib/portfolio/types";
import { GRID_COLS, GRID_GAP, GRID_ROW_HEIGHT } from "@/lib/portfolio/types";
import { nextGridRow, prepareBlocksForDisplay } from "@/lib/portfolio/layout";
import PortfolioBlockContent from "./PortfolioBlockContent";

type Props = {
  blocks: Array<Partial<PortfolioBlock> & { id: string; type: string; order: number; config: Record<string, unknown> }>;
  theme: PortfolioTheme;
  compact?: boolean;
};

/** Cuadrícula estática — misma geometría que react-grid-layout en el editor */
export default function PortfolioGridDisplay({ blocks, theme, compact }: Props) {
  const resolved = useMemo(() => prepareBlocksForDisplay(blocks), [blocks]);
  const maxRow = nextGridRow(resolved);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridAutoRows: `${GRID_ROW_HEIGHT}px`,
        gap: `${GRID_GAP}px`,
        width: "100%",
        minHeight: maxRow * GRID_ROW_HEIGHT + Math.max(0, maxRow - 1) * GRID_GAP,
      }}
    >
      {resolved.map((block) => (
        <Box
          key={block.id}
          sx={{
            gridColumn: `${block.x + 1} / span ${block.w}`,
            gridRow: `${block.y + 1} / span ${block.h}`,
            minHeight: 0,
            minWidth: 0,
          }}
        >
          <PortfolioBlockContent block={block} theme={theme} compact={compact} />
        </Box>
      ))}
    </Box>
  );
}
