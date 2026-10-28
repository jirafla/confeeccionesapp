"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Factory,
  ArrowRight,
  Clock,
  PackageCheck,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import BuscadorHistorial from "./BuscadorHistorial";

export type LotePendienteDashboard = {
  id: string;
  ordenId: string;
  ordenNombre: string;
  prendaNombre: string | null;
  clienteNombre: string;
  tallerId: string;
  tallerNombre: string;
  tallerTelefono: string | null;
  cantidadAsignada: number;
  fechaEnvio: string;
  fechaEntregaEsperada: string;
  esReproceso: boolean;
};

function calcularEstadoLote(fechaIso: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const meta = new Date(fechaIso);
  meta.setHours(0, 0, 0, 0);

  const diffDays = Math.round((meta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const fechaFormateada = meta.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (diffDays < 0) {
    const d = Math.abs(diffDays);
    return {
      label: d === 1 ? "Vencido hace 1 día" : `Vencido hace ${d} días`,
      shortLabel: d === 1 ? "Vencido 1d" : `Vencido ${d}d`,
      pillCls: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80",
      dotCls: "bg-rose-500",
      fechaFormateada,
    };
  }

  if (diffDays === 0) {
    return {
      label: "Debe entregar hoy",
      shortLabel: "Entrega hoy",
      pillCls: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
      dotCls: "bg-amber-500",
      fechaFormateada,
    };
  }

  if (diffDays === 1) {
    return {
      label: "Entrega mañana",
      shortLabel: "Mañana",
      pillCls: "bg-amber-50/70 text-amber-700 ring-1 ring-amber-200/70",
      dotCls: "bg-amber-400",
      fechaFormateada,
    };
  }

  return {
    label: `En ${diffDays} días`,
    shortLabel: `En ${diffDays}d`,
    pillCls: "bg-slate-100 text-slate-600",
    dotCls: "bg-emerald-500",
    fechaFormateada,
  };
}

export default function LotesPorEntregarPanel({
  lotes,
  nombrePeriodo,
  totalHistorial,
  query,
  defaultTab = "LOTES",
  historialContent,
}: {
  lotes: LotePendienteDashboard[];
  nombrePeriodo: string;
  totalHistorial: number;
  query: string;
  defaultTab?: "LOTES" | "HISTORIAL";
  historialContent: React.ReactNode;
}) {
  const [tab, setTab] = useState<"LOTES" | "HISTORIAL">(defaultTab);

  const qNorm = query.trim().toLowerCase();
  const lotesFiltrados = qNorm
    ? lotes.filter(
        (l) =>
          l.ordenNombre.toLowerCase().includes(qNorm) ||
          (l.prendaNombre && l.prendaNombre.toLowerCase().includes(qNorm)) ||
          l.tallerNombre.toLowerCase().includes(qNorm) ||
          l.clienteNombre.toLowerCase().includes(qNorm)
      )
    : lotes;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* CABECERA CON PESTAÑAS Y BUSCADOR */}
      <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-slate-50/50">
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl self-start max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTab("LOTES")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === "LOTES"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className={`w-4 h-4 ${tab === "LOTES" ? "text-blue-600" : "text-slate-400"}`} />
            <span>Lotes por Recibir</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === "LOTES"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {lotesFiltrados.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTab("HISTORIAL")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              tab === "HISTORIAL"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PackageCheck className={`w-4 h-4 ${tab === "HISTORIAL" ? "text-emerald-600" : "text-slate-400"}`} />
            <span>Entregadas ({nombrePeriodo})</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === "HISTORIAL"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-200/80 text-slate-600"
              }`}
            >
              {totalHistorial}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <BuscadorHistorial />
        </div>
      </div>

      {/* CONTENIDO PESTAÑA 1: LOTES POR RECIBIR */}
      {tab === "LOTES" ? (
        lotesFiltrados.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">
              {qNorm ? "No se encontraron lotes con esa búsqueda" : "No hay lotes pendientes por recibir"}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {qNorm
                ? "Intenta buscar con otra referencia, taller o cliente."
                : "Todos los talleres están al día con sus entregas."}
            </p>
          </div>
        ) : (
          <>
            {/* Móvil: lista limpia igual al historial */}
            <ul className="sm:hidden divide-y divide-slate-100">
              {lotesFiltrados.map((lote) => {
                const est = calcularEstadoLote(lote.fechaEntregaEsperada);
                return (
                  <li key={lote.id}>
                    <Link
                      href={`/ordenes/${lote.ordenId}`}
                      className="flex items-center gap-3 p-4 active:bg-slate-50"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Factory className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="font-black text-slate-900 truncate">
                            {lote.ordenNombre}
                          </p>
                          <span className="text-slate-300">•</span>
                          <p className="text-xs font-semibold text-slate-700 truncate">
                            {lote.tallerNombre}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lote.clienteNombre} • Pactada {est.fechaFormateada}
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="font-bold text-slate-900 text-sm">{lote.cantidadAsignada} uds</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${est.pillCls}`}>
                          {est.shortLabel}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Escritorio: tabla limpia igual al historial */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Orden / Referencia</th>
                    <th className="py-3 px-4">Taller</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Prendas</th>
                    <th className="py-3 px-4">Entrega Pactada</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lotesFiltrados.map((lote) => {
                    const est = calcularEstadoLote(lote.fechaEntregaEsperada);
                    return (
                      <tr key={lote.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                          <Link
                            href={`/ordenes/${lote.ordenId}`}
                            className="font-black text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {lote.ordenNombre}
                          </Link>
                          {lote.prendaNombre && (
                            <span className="text-xs text-slate-400 ml-1.5">
                              · {lote.prendaNombre}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                          <Link
                            href={`/talleres/${lote.tallerId}`}
                            className="hover:text-blue-600 inline-flex items-center gap-1.5"
                          >
                            <Factory className="w-3.5 h-3.5 text-slate-400" />
                            {lote.tallerNombre}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {lote.clienteNombre}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {lote.cantidadAsignada} <span className="text-xs font-normal text-slate-400">uds</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {est.fechaFormateada}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${est.pillCls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${est.dotCls}`} />
                            {est.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Link
                            href={`/ordenes/${lote.ordenId}`}
                            title="Ver orden y recibir lote"
                            className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : (
        historialContent
      )}
    </div>
  );
}
