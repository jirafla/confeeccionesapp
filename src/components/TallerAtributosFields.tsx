"use client";

import { useState } from "react";
import { Star, SignalLow, SignalMedium, SignalHigh, X } from "lucide-react";

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
    desc: "Lotes medianos",
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

export default function TallerAtributosFields({
  defaultDestacado = false,
  defaultCapacidad = "",
}: {
  defaultDestacado?: boolean;
  defaultCapacidad?: string | null;
}) {
  const [destacado, setDestacado] = useState<boolean>(defaultDestacado);
  const [capacidad, setCapacidad] = useState<string>(defaultCapacidad || "");

  return (
    <div className="space-y-5 pt-2 border-t border-slate-100">
      <input type="hidden" name="destacado" value={destacado ? "true" : "false"} />
      <input type="hidden" name="capacidad" value={capacidad} />

      {/* Opción 1: Taller Destacado */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Prioridad / Destacado <span className="text-xs font-normal text-slate-400">(Opcional)</span>
        </label>
        <button
          type="button"
          onClick={() => setDestacado((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            destacado
              ? "border-amber-400 bg-amber-50/70 text-amber-950 ring-2 ring-amber-200/70"
              : "border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100/70"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                destacado ? "bg-amber-400 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-400"
              }`}
            >
              <Star className={`w-4 h-4 ${destacado ? "fill-current" : ""}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight">
                {destacado ? "Taller Destacado" : "Marcar como taller destacado"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Resalta este taller con estrella para identificarlo rápido.
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
              destacado ? "bg-amber-200/70 text-amber-900" : "bg-slate-200/70 text-slate-600"
            }`}
          >
            {destacado ? "Sí ★" : "No"}
          </span>
        </button>
      </div>

      {/* Opción 2: Capacidad de Trabajo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-slate-700">
            Capacidad de Trabajo <span className="text-xs font-normal text-slate-400">(Opcional)</span>
          </label>
          {capacidad && (
            <button
              type="button"
              onClick={() => setCapacidad("")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3 h-3" /> Sin especificar
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {CAPACIDAD_OPCIONES.map((op) => {
            const isSelected = capacidad === op.id;
            const Icon = op.icon;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setCapacidad(isSelected ? "" : op.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? op.activeCls
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isSelected ? "stroke-[2.5]" : "text-slate-400"}`} />
                <span className="text-xs sm:text-sm font-bold leading-tight">{op.label}</span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">{op.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
