/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/datatables.ts
import $ from "jquery";

// Expone jQuery globalmente (solo en el cliente)
if (typeof window !== "undefined") {
  (window as any).$ = $;
  (window as any).jQuery = $;
}

import "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
