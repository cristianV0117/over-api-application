"use client";

import ReactMarkdown from "react-markdown";
import Box from "@mui/material/Box";

type Props = {
  content: string;
};

export default function MarkdownBubble({ content }: Props) {
  return (
    <Box
      sx={{
        wordBreak: "break-word",
        fontSize: "0.875rem",
        lineHeight: 1.55,
        "& :first-of-type": { mt: 0 },
        "& :last-child": { mb: 0 },
        "& h1, & h2, & h3, & h4": {
          fontWeight: 800,
          letterSpacing: "-0.01em",
          mt: 1.75,
          mb: 0.75,
        },
        "& h1": { fontSize: "1.15rem" },
        "& h2": { fontSize: "1.05rem" },
        "& h3, & h4": { fontSize: "0.95rem" },
        "& p": { my: 0.9 },
        "& strong": { fontWeight: 800 },
        "& em": { fontStyle: "italic" },
        "& ul, & ol": { my: 0.75, pl: 2.5 },
        "& li": { mb: 0.35 },
        "& hr": {
          border: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          my: 1.5,
        },
        "& a": { color: "primary.light" },
        "& code": {
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.8em",
          px: 0.5,
          py: 0.15,
          borderRadius: 0.75,
          bgcolor: "rgba(255,255,255,0.06)",
        },
        "& pre": {
          my: 1,
          p: 1.25,
          overflowX: "auto",
          borderRadius: 1,
          bgcolor: "rgba(0,0,0,0.28)",
        },
        "& pre code": { p: 0, bgcolor: "transparent" },
        "& blockquote": {
          m: 0,
          my: 1,
          pl: 1.5,
          borderLeft: "3px solid",
          borderColor: "primary.main",
          color: "text.secondary",
        },
      }}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </Box>
  );
}
