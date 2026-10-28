import { SignalLow, SignalMedium, SignalHigh } from "lucide-react";

export const CAPACIDAD_OPCIONES = [
  {
    id: "BAJA",
    label: "Baja",
    desc: "Lotes pequeños",
    icon: SignalLow,
    activeCls: "border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-200",
    badgeCls: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80",
  },
  {
    id: "MEDIA",
    label: "Media",
    desc: "Volumen medio",
    icon: SignalMedium,
    activeCls: "border-blue-600 bg-blue-50/80 text-blue-900 ring-2 ring-blue-200",
    badgeCls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80",
  },
  {
    id: "ALTA",
    label: "Alta",
    desc: "Gran volumen",
    icon: SignalHigh,
    activeCls: "border-indigo-600 bg-indigo-50/80 text-indigo-900 ring-2 ring-indigo-200",
    badgeCls: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80",
  },
] as const;

export function getCapacidadInfo(capacidad?: string | null) {
  if (!capacidad) return null;
  return CAPACIDAD_OPCIONES.find((c) => c.id === capacidad) || null;
}

export function getEstadoFechaLote(fechaEntregaEsperada: Date | string, estadoLote: string) {
  const fecha = new Date(fechaEntregaEsperada);
  const shortDate = fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

  if (estadoLote === "ENTREGADO") {
    return {
      label: `Pactada: ${shortDate}`,
      shortDate,
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200/80",
      dotClass: "bg-slate-400",
      urgent: false,
    };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const meta = new Date(fecha);
  meta.setHours(0, 0, 0, 0);

  const diffDays = Math.round((meta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const dias = Math.abs(diffDays);
    return {
      label: dias === 1 ? "Vencido hace 1 día" : `Vencido hace ${dias} días`,
      shortDate,
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
      urgent: true,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Vence hoy",
      shortDate,
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
      dotClass: "bg-amber-500",
      urgent: true,
    };
  }

  if (diffDays <= 2) {
    return {
      label: diffDays === 1 ? "Vence mañana" : "Vence en 2 días",
      shortDate,
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80",
      dotClass: "bg-amber-500",
      urgent: true,
    };
  }

  return {
    label: `En tiempo (${shortDate})`,
    shortDate,
    badgeClass: "bg-emerald-50/80 text-emerald-700 border-emerald-200/80",
    dotClass: "bg-emerald-500",
    urgent: false,
  };
}

export function getContactoLinks(telefono?: string | null) {
  if (!telefono) return null;
  const digits = telefono.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const waNumber = digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits;
  return {
    telHref: `tel:${digits}`,
    whatsappHref: `https://wa.me/${waNumber}`,
  };
}
