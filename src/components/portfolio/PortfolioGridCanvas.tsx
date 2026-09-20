"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Layout, LayoutItem } from "react-grid-layout/legacy";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import type { PortfolioBlock, PortfolioTheme } from "@/lib/portfolio/types";
import { BLOCK_LABELS, GRID_COLS, GRID_GAP, GRID_ROW_HEIGHT } from "@/lib/portfolio/types";
import {
  blocksLayoutSignature,
  blocksToLayout,
  layoutEqual,
  mergeLayoutIntoBlocks,
  prepareBlocksForDisplay,
} from "@/lib/portfolio/layout";
import PortfolioBlockContent from "./PortfolioBlockContent";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ReactGridLayout = dynamic(() => import("react-grid-layout/legacy").then((m) => m.default), { ssr: false });

export type PortfolioGridCanvasHandle = {
  /** Sincroniza el layout visual actual con los bloques (para vista previa / guardar) */
  flushLayout: () => PortfolioBlock[];
};

type Props = {
  blocks: PortfolioBlock[];
  theme: PortfolioTheme;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onLayoutChange: (blocks: PortfolioBlock[]) => void;
  onRemove: (id: string) => void;
};

const PortfolioGridCanvas = forwardRef<PortfolioGridCanvasHandle, Props>(function PortfolioGridCanvas(
  { blocks, theme, selectedId, onSelect, onLayoutChange, onRemove },
  ref
) {
  const measureRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef(blocks);
  const layoutRef = useRef<LayoutItem[]>(blocksToLayout(blocks));
  const interactingRef = useRef(false);
  const widthRef = useRef(900);
  const blocksSignatureRef = useRef(blocksLayoutSignature(blocks));
  const didInitialCompactRef = useRef(false);

  const [width, setWidth] = useState(900);
  const [layout, setLayout] = useState<LayoutItem[]>(() => blocksToLayout(prepareBlocksForDisplay(blocks)));
  const [isInteracting, setIsInteracting] = useState(false);

  blocksRef.current = blocks;
  layoutRef.current = layout;

  useImperativeHandle(
    ref,
    () => ({
      flushLayout: () => {
        const merged = mergeLayoutIntoBlocks(blocksRef.current, layoutRef.current);
        blocksSignatureRef.current = blocksLayoutSignature(merged);
        onLayoutChange(merged);
        return merged;
      },
    }),
    [onLayoutChange]
  );

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const applyWidth = (next: number) => {
      const floored = Math.floor(next);
      if (floored <= 0 || Math.abs(floored - widthRef.current) <= 1) return;
      widthRef.current = floored;
      setWidth(floored);
    };

    applyWidth(el.clientWidth);

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      applyWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (didInitialCompactRef.current) return;
    didInitialCompactRef.current = true;
    const prepared = prepareBlocksForDisplay(blocksRef.current);
    const nextLayout = blocksToLayout(prepared);
    setLayout(nextLayout);
    blocksSignatureRef.current = blocksLayoutSignature(prepared);
    onLayoutChange(prepared);
  }, [onLayoutChange]);

  useEffect(() => {
    const signature = blocksLayoutSignature(blocks);
    if (interactingRef.current || signature === blocksSignatureRef.current) return;
    blocksSignatureRef.current = signature;
    const next = blocksToLayout(blocks);
    setLayout((prev) => (layoutEqual(prev, next) ? prev : next));
  }, [blocks]);

  const commitLayout = useCallback(
    (nextLayout: Layout) => {
      const merged = mergeLayoutIntoBlocks(blocksRef.current, nextLayout);
      const mergedSignature = blocksLayoutSignature(merged);
      if (mergedSignature === blocksLayoutSignature(blocksRef.current)) return;
      blocksSignatureRef.current = mergedSignature;
      onLayoutChange(merged);
    },
    [onLayoutChange]
  );

  const handleLayoutChange = useCallback((nextLayout: Layout) => {
    if (!interactingRef.current) return;
    const copy = [...nextLayout];
    layoutRef.current = copy;
    setLayout((prev) => (layoutEqual(prev, copy) ? prev : copy));
  }, []);

  const handleInteractionStart = useCallback(() => {
    interactingRef.current = true;
    setIsInteracting(true);
  }, []);

  const handleInteractionStop = useCallback(
    (nextLayout: Layout) => {
      interactingRef.current = false;
      setIsInteracting(false);
      const copy = [...nextLayout];
      layoutRef.current = copy;
      setLayout((prev) => (layoutEqual(prev, copy) ? prev : copy));
      commitLayout(nextLayout);
    },
    [commitLayout]
  );

  const gridBg = `
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
  `;
  const colWidth = Math.max(1, (width - GRID_GAP) / GRID_COLS);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        border: `1px solid ${theme.line}`,
        bgcolor: "rgba(0,0,0,0.35)",
        p: 1.5,
        minHeight: 480,
        backgroundImage: gridBg,
        backgroundSize: `${colWidth}px ${GRID_ROW_HEIGHT + GRID_GAP}px`,
        backgroundPosition: `${GRID_GAP / 2}px ${GRID_GAP / 2}px`,
        "& .react-grid-item": {
          transition: isInteracting ? "none" : "transform 0.15s ease",
        },
        "& .react-grid-item.react-grid-placeholder": {
          bgcolor: "rgba(107,47,184,0.22)",
          borderRadius: 2,
          border: "2px dashed rgba(167,139,250,0.55)",
        },
        "& .react-grid-item > .react-resizable": {
          overflow: "visible !important",
        },
        "& .react-resizable-handle": {
          opacity: 0,
          transition: "opacity 0.15s ease",
          zIndex: 20,
        },
        "& .react-grid-item:hover .react-resizable-handle, & .react-grid-item:has([data-selected='true']) .react-resizable-handle": {
          opacity: 1,
        },
        "& .react-resizable-handle-se": {
          width: 16,
          height: 16,
          right: 4,
          bottom: 4,
          background: "rgba(167,139,250,0.95)",
          borderRadius: 4,
          cursor: "se-resize",
        },
        "& .react-resizable-handle-e, & .react-resizable-handle-w": {
          width: 6,
          height: 48,
          top: "50%",
          marginTop: -24,
          cursor: "ew-resize",
          background: "rgba(167,139,250,0.8)",
          borderRadius: 3,
        },
        "& .react-resizable-handle-e": { right: 2 },
        "& .react-resizable-handle-w": { left: 2 },
        "& .react-resizable-handle-s": {
          height: 6,
          width: 48,
          left: "50%",
          marginLeft: -24,
          bottom: 2,
          cursor: "ns-resize",
          background: "rgba(167,139,250,0.8)",
          borderRadius: 3,
        },
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        Arrastra bloques a cualquier celda · estira los bordes para cambiar tamaño · el resto se reacomoda solo
      </Typography>

      <Box ref={measureRef} sx={{ width: "100%" }}>
        <ReactGridLayout
          width={width}
          layout={layout}
          cols={GRID_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          margin={[GRID_GAP, GRID_GAP]}
          containerPadding={[0, 0]}
          compactType="vertical"
          preventCollision={false}
          isDraggable
          isResizable
          resizeHandles={["se", "e", "w", "s"]}
          draggableCancel=".bento-interactive, .MuiIconButton-root, input, textarea, button, a, iframe"
          onLayoutChange={handleLayoutChange}
          onDragStart={handleInteractionStart}
          onResizeStart={handleInteractionStart}
          onDragStop={handleInteractionStop}
          onResizeStop={handleInteractionStop}
        >
          {blocks.map((block) => {
            const selected = block.id === selectedId;
            return (
              <Box key={block.id} data-selected={selected ? "true" : "false"} sx={{ height: "100%", outline: "none" }}>
                <Card
                  variant="outlined"
                  onClick={() => onSelect(block.id)}
                  sx={{
                    height: "100%",
                    cursor: "grab",
                    borderColor: selected ? "primary.main" : "rgba(255,255,255,0.08)",
                    boxShadow: selected ? "0 0 0 2px rgba(107,47,184,0.5)" : "none",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    "&:active": { cursor: "grabbing" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 1,
                      py: 0.5,
                      bgcolor: selected ? "rgba(107,47,184,0.18)" : "rgba(255,255,255,0.04)",
                      borderBottom: `1px solid ${theme.line}`,
                      flexShrink: 0,
                    }}
                  >
                    <StackLabel block={block} />
                    <IconButton
                      className="bento-interactive"
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(block.id);
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                  <Box
                    className={selected ? "bento-interactive" : undefined}
                    sx={{ flex: 1, minHeight: 0, overflow: "auto", pointerEvents: selected ? "auto" : "none" }}
                  >
                    <PortfolioBlockContent block={block} theme={theme} compact />
                  </Box>
                </Card>
              </Box>
            );
          })}
        </ReactGridLayout>
      </Box>
    </Box>
  );
});

export default PortfolioGridCanvas;

function StackLabel({ block }: { block: PortfolioBlock }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
      <OpenWithIcon sx={{ fontSize: 14, color: "text.secondary", flexShrink: 0 }} />
      <Typography variant="caption" fontWeight={700} noWrap>
        {BLOCK_LABELS[block.type]}
      </Typography>
    </Box>
  );
}
