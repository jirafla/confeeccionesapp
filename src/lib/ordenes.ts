// Utilidades compartidas para Órdenes de Producción (sin dependencias de servidor)

/** Nombre visible de la orden: <codigo referencia>-<consecutivo>. Ej: 5370-1 */
export function nombreOrden(orden: { consecutivo: number; referencia: { codigo: string } }) {
  return `${orden.referencia.codigo}-${orden.consecutivo}`;
}

export const ESTADOS_ORDEN: Record<string, { label: string; badge: string; dot: string }> = {
  CORTE: { label: "Corte", badge: "bg-orange-50 text-orange-700 ring-1 ring-orange-200", dot: "bg-orange-500" },
  CONFECCION: { label: "Confección", badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200", dot: "bg-blue-500" },
  ENTREGADO: { label: "Entregado", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200", dot: "bg-emerald-500" },
};

export function estadoOrden(estado: string) {
  return ESTADOS_ORDEN[estado] ?? { label: estado, badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
}

/** Convierte "35x Negro M, 20x Blanco S" en [{ cantidad: 35, detalle: "Negro M" }, ...] */
export function parseVariantes(coloresDetalles: string | null | undefined) {
  return (coloresDetalles || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((linea) => {
      const m = linea.match(/^(\d+)\s*x\s*(.+)$/i);
      return m ? { cantidad: parseInt(m[1]), detalle: m[2].trim() } : { cantidad: null as number | null, detalle: linea };
    });
}

/** Fuerza la descarga de un archivo público de Supabase Storage */
export function downloadUrl(url: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=`;
}

export type TelaItem = {
  nombre: string;
  tipo: string;
  promedio: number;
};

/** Parsea el string JSON de telas de una referencia */
export function parseTelas(telasDetalles: string | null | undefined): TelaItem[] {
  if (!telasDetalles) return [];
  try {
    const parsed = JSON.parse(telasDetalles);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((t) => t && typeof t === "object")
        .map((t) => ({
          nombre: String(t.nombre || "Tela"),
          tipo: String(t.tipo || ""),
          promedio: typeof t.promedio === "number" ? t.promedio : parseFloat(t.promedio) || 0,
        }));
    }
  } catch {
    // Si no es JSON válido
  }
  return [];
}
