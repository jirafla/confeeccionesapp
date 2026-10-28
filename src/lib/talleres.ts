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
