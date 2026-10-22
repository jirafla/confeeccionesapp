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

export type InsumoItem = {
  nombre: string;
  tipo: string; // "UNIDAD" | "MEDIDA"
  cantidad: number;
  porColor?: boolean; // true por defecto ("Al tono de la prenda"), false si es "Estándar / Color único"
};

/** Parsea el string JSON de insumos de una referencia */
export function parseInsumos(insumosDetalles: string | null | undefined): InsumoItem[] {
  if (!insumosDetalles) return [];
  try {
    const parsed = JSON.parse(insumosDetalles);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((i) => i && typeof i === "object")
        .map((i) => ({
          nombre: String(i.nombre || "Insumo"),
          tipo: String(i.tipo || "UNIDAD"),
          cantidad: typeof i.cantidad === "number" ? i.cantidad : parseFloat(i.cantidad) || 0,
          porColor: i.porColor !== undefined ? Boolean(i.porColor) : true,
        }));
    }
  } catch {
    // Si no es JSON válido
  }
  return [];
}

/** Parsea el JSON de colores personalizados de insumos en una orden */
export function parseInsumosColores(raw: string | null | undefined): Record<string, string> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    // Ignorar si no es JSON válido
  }
  return {};
}

export type InsumoColorKey = string; // `${insumoIndex}__${varianteIndex}`

export function getInsumoColorKey(insumoIdx: number, varianteIdx: number): InsumoColorKey {
  return `${insumoIdx}__${varianteIdx}`;
}

export type DesgloseColorInsumo = {
  varianteIdx: number;
  variantePrenda: string;
  prendas: number;
  colorInsumo: string;
  cantidadInsumo: number;
};

export type DesgloseInsumoOrden = {
  insumoIdx: number;
  nombre: string;
  tipo: string;
  unidadLabel: string;
  consumoUnitario: number;
  porColor: boolean;
  totalCantidad: number;
  porVariante: DesgloseColorInsumo[];
  agrupadoPorColor: { color: string; cantidad: number }[];
};

/**
 * Calcula la parametrización de insumos según las variantes de color de la orden.
 * Por defecto cada insumo con `porColor !== false` hereda el color de la variante (ej. 15 Rojas -> 15 Elásticos Rojos),
 * permitiendo sobreescribir el color mediante `overrides`.
 */
export function calcularDesgloseInsumos(
  insumos: InsumoItem[],
  variantes: { cantidad: number | null; detalle: string }[],
  cantidadTotalOrden: number,
  overrides: Record<string, string> = {}
): DesgloseInsumoOrden[] {
  const variantesValidas = variantes.filter((v) => v.detalle.trim() && (v.cantidad ?? 0) > 0);

  return insumos.map((insumo, insumoIdx) => {
    const unidadLabel = insumo.tipo === "UNIDAD" ? "uds" : "m/cm";
    const esPorColor = insumo.porColor !== false;
    const totalCantidad = Number((cantidadTotalOrden * insumo.cantidad).toFixed(2));

    if (!esPorColor || variantesValidas.length === 0) {
      return {
        insumoIdx,
        nombre: insumo.nombre,
        tipo: insumo.tipo,
        unidadLabel,
        consumoUnitario: insumo.cantidad,
        porColor: esPorColor,
        totalCantidad,
        porVariante: [],
        agrupadoPorColor: totalCantidad > 0 ? [{ color: "Estándar", cantidad: totalCantidad }] : [],
      };
    }

    const porVariante: DesgloseColorInsumo[] = variantesValidas.map((v, vIdx) => {
      const key = getInsumoColorKey(insumoIdx, vIdx);
      const overrideColor = overrides[key]?.trim();
      const colorInsumo = overrideColor || v.detalle.trim();
      const prendas = v.cantidad || 0;
      const cantidadInsumo = Number((prendas * insumo.cantidad).toFixed(2));
      return {
        varianteIdx: vIdx,
        variantePrenda: v.detalle.trim(),
        prendas,
        colorInsumo,
        cantidadInsumo,
      };
    });

    // Agrupar cantidades si dos variantes usan el mismo color de insumo
    const mapaColores = new Map<string, { color: string; cantidad: number }>();
    for (const item of porVariante) {
      const normKey = item.colorInsumo.toLowerCase();
      const actual = mapaColores.get(normKey);
      if (actual) {
        actual.cantidad = Number((actual.cantidad + item.cantidadInsumo).toFixed(2));
      } else {
        mapaColores.set(normKey, { color: item.colorInsumo, cantidad: item.cantidadInsumo });
      }
    }

    return {
      insumoIdx,
      nombre: insumo.nombre,
      tipo: insumo.tipo,
      unidadLabel,
      consumoUnitario: insumo.cantidad,
      porColor: true,
      totalCantidad,
      porVariante,
      agrupadoPorColor: Array.from(mapaColores.values()),
    };
  });
}

/** Genera un resumen legible de insumos parametrizados para entregar al taller */
export function formatearResumenInsumos(desglose: DesgloseInsumoOrden[]): string {
  if (desglose.length === 0) return "";
  return desglose
    .map((d) => {
      if (d.agrupadoPorColor.length === 0) {
        return `${d.nombre}: ${d.totalCantidad} ${d.unidadLabel}`;
      }
      const partes = d.agrupadoPorColor.map((c) =>
        c.color === "Estándar"
          ? `${c.cantidad} ${d.unidadLabel}`
          : `${c.cantidad} ${d.unidadLabel} ${c.color}`
      );
      return `${d.nombre}: ${partes.join(", ")}`;
    })
    .join(" | ");
}
