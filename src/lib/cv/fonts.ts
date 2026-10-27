import { Font } from "@react-pdf/renderer";

export type CvFontId =
  | "calibri"
  | "arial"
  | "times"
  | "georgia"
  | "cambria"
  | "garamond"
  | "comic"
  | "courier"
  | "helvetica";

export const CV_FONTS: {
  id: CvFontId;
  label: string;
  family: string;
  css: string;
  regular?: string;
  bold?: string;
  builtIn?: boolean;
}[] = [
  { id: "calibri", label: "Calibri", family: "Carlito", css: "Carlito, Calibri, sans-serif", regular: "/fonts/cv/carlito-400.woff", bold: "/fonts/cv/carlito-700.woff" },
  { id: "arial", label: "Arial", family: "Arimo", css: "Arimo, Arial, Helvetica, sans-serif", regular: "/fonts/cv/arimo-400.woff", bold: "/fonts/cv/arimo-700.woff" },
  { id: "times", label: "Times New Roman", family: "Tinos", css: 'Tinos, "Times New Roman", Times, serif', regular: "/fonts/cv/tinos-400.woff", bold: "/fonts/cv/tinos-700.woff" },
  { id: "georgia", label: "Georgia", family: "Gelasio", css: "Gelasio, Georgia, serif", regular: "/fonts/cv/gelasio-400.woff", bold: "/fonts/cv/gelasio-700.woff" },
  { id: "cambria", label: "Cambria", family: "Caladea", css: "Caladea, Cambria, serif", regular: "/fonts/cv/caladea-400.woff", bold: "/fonts/cv/caladea-700.woff" },
  { id: "garamond", label: "Garamond", family: "EBGaramond", css: 'EBGaramond, Garamond, "Times New Roman", serif', regular: "/fonts/cv/ebgaramond-400.woff", bold: "/fonts/cv/ebgaramond-700.woff" },
  { id: "comic", label: "Comic Sans MS", family: "ComicNeue", css: 'ComicNeue, "Comic Sans MS", cursive', regular: "/fonts/cv/comicneue-400.woff", bold: "/fonts/cv/comicneue-700.woff" },
  { id: "helvetica", label: "Helvetica", family: "Helvetica", css: "Helvetica, Arial, sans-serif", builtIn: true },
  { id: "courier", label: "Courier New", family: "Courier", css: '"Courier New", Courier, monospace', builtIn: true },
];

export function cvFontFaceCss() {
  return CV_FONTS.filter((f) => f.regular && f.bold)
    .map(
      (f) =>
        `@font-face{font-family:'${f.family}';src:url('${f.regular}') format('woff');font-weight:400;font-style:normal;font-display:swap;}` +
        `@font-face{font-family:'${f.family}';src:url('${f.bold}') format('woff');font-weight:700;font-style:normal;font-display:swap;}`
    )
    .join("");
}

let registered = false;

export function ensureCvFonts() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  for (const font of CV_FONTS) {
    if (font.builtIn || !font.regular || !font.bold) continue;
    const origin = window.location.origin;
    Font.register({
      family: font.family,
      fonts: [
        { src: `${origin}${font.regular}`, fontWeight: 400 },
        { src: `${origin}${font.bold}`, fontWeight: 700 },
      ],
    });
  }
}

export function fontFamilyOf(id: string | undefined): string {
  return CV_FONTS.find((f) => f.id === id)?.family ?? "Carlito";
}
