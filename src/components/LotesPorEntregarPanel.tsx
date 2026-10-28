"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Factory,
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getContactoLinks } from "@/lib/talleres";

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

function calcularEstadoEntrega(fechaIso: string) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const meta = new Date(fechaIso);
  meta.setHours(0, 0, 0, 0);

  const diffDays = Math.round((meta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  const fechaCorta = meta.toLocaleDateString("es-CO", { day: "2-digit", month: "short" });

  if (diffDays < 0) {
    const dias = Math.abs(diffDays);
    return {
      diffDays,
      urgente: true,
      badge: dias === 1 ? "Vencido hace 1 día" : `Vencido hace ${dias} días`,
      badgeCls: "bg-rose-100 text-rose-800 border-rose-200",
      rowCls: "border-rose-200/80 bg-rose-50/30 hover:border-rose-300",
      dotCls: "bg-rose-500",
      fraseAccion: dias === 1 ? "debía entregar ayer" : `debía entregar hace ${dias} días`,
      fechaCorta,
    };
  }

  if (diffDays === 0) {
    return {
      diffDays,
      urgente: true,
      badge: "Debe entregar HOY",
      badgeCls: "bg-amber-100 text-amber-900 border-amber-300",
      rowCls: "border-amber-200/90 bg-amber-50/40 hover:border-amber-300",
      dotCls: "bg-amber-500 animate-pulse",
      fraseAccion: "debe entregar HOY",
      fechaCorta,
    };
  }

  if (diffDays === 1) {
    return {
      diffDays,
      urgente: true,
      badge: "Entrega mañana",
      badgeCls: "bg-amber-50 text-amber-800 border-amber-200",
      rowCls: "border-amber-200/60 bg-white hover:border-amber-300",
      dotCls: "bg-amber-400",
      fraseAccion: "debe entregar mañana",
      fechaCorta,
    };
  }

  return {
    diffDays,
    urgente: false,
    badge: `En ${diffDays} días (${fechaCorta})`,
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    rowCls: "border-slate-200/80 bg-white hover:border-blue-300",
    dotCls: "bg-emerald-500",
    fraseAccion: `debe entregar el ${fechaCorta}`,
    fechaCorta,
  };
}

export default function LotesPorEntregarPanel({
  lotes,
}: {
  lotes: LotePendienteDashboard[];
}) {
  const [filtro, setFiltro] = useState<"TODOS" | "URGENTES" | "PROXIMOS">("TODOS");

  const lotesConEstado = lotes.map((l) => ({
    ...l,
    estado: calcularEstadoEntrega(l.fechaEntregaEsperada),
  }));

  const urgentesCount = lotesConEstado.filter((l) => l.estado.diffDays <= 1).length;
  const proximosCount = lotesConEstado.filter((l) => l.estado.diffDays > 1).length;

  const lotesFiltrados = lotesConEstado.filter((l) => {
    if (filtro === "URGENTES") return l.estado.diffDays <= 1;
    if (filtro === "PROXIMOS") return l.estado.diffDays > 1;
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Lotes por Entregar por Taller
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
              {lotes.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Seguimiento de entregas pactadas con cada taller ordenadas por fecha de compromiso.
          </p>
        </div>

        {lotes.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => setFiltro("TODOS")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtro === "TODOS"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Todos ({lotes.length})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("URGENTES")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtro === "URGENTES"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white text-rose-700 border border-rose-200 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Hoy / Vencidos ({urgentesCount})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("PROXIMOS")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filtro === "PROXIMOS"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Próximos ({proximosCount})
            </button>
          </div>
        )}
      </div>

      {lotesFiltrados.length === 0 ? (
        <div className="p-8 sm:p-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 text-sm">
            {lotes.length === 0
              ? "No hay lotes pendientes en talleres"
              : "No hay lotes en este filtro"}
          </p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {lotes.length === 0
              ? "Cuando asignes prendas a un taller, verás aquí qué referencia y qué taller debe entregar cada día."
              : "Cambia el filtro superior para ver el resto de los lotes activos."}
          </p>
        </div>
      ) : (
        <div className="p-3.5 sm:p-5 grid grid-cols-1 gap-3">
          {lotesFiltrados.map((lote) => {
            const { estado } = lote;
            const contacto = getContactoLinks(lote.tallerTelefono);
            const waText = encodeURIComponent(
              `Hola ${lote.tallerNombre}, te escribimos para consultar por la entrega del lote de la Ref. ${lote.ordenNombre} (${lote.cantidadAsignada} uds).`
            );

            return (
              <div
                key={lote.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${estado.rowCls}`}
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${estado.badgeCls}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${estado.dotCls}`} />
                      {estado.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-bold">
                      {lote.cantidadAsignada} uds
                    </span>
                    {lote.esReproceso && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold uppercase">
                        Reproceso
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium truncate">
                      Cliente: <strong className="text-slate-600">{lote.clienteNombre}</strong>
                    </span>
                  </div>

                  {/* Frase explícita solicitada: "La referencia X el taller Y debe entregar hoy" */}
                  <p className="text-sm sm:text-base text-slate-800 leading-snug">
                    La referencia{" "}
                    <Link
                      href={`/ordenes/${lote.ordenId}`}
                      className="font-black text-blue-700 hover:underline"
                    >
                      {lote.ordenNombre}
                    </Link>
                    {lote.prendaNombre ? (
                      <span className="text-slate-500 font-medium"> ({lote.prendaNombre})</span>
                    ) : null}{" "}
                    con el taller{" "}
                    <Link
                      href={`/talleres/${lote.tallerId}`}
                      className="font-black text-slate-900 hover:text-blue-600 inline-flex items-center gap-1"
                    >
                      <Factory className="w-3.5 h-3.5 text-slate-400 inline" />
                      {lote.tallerNombre}
                    </Link>{" "}
                    <span
                      className={`font-black ${
                        estado.diffDays < 0
                          ? "text-rose-700 underline decoration-rose-300"
                          : estado.diffDays === 0
                          ? "text-amber-800 underline decoration-amber-400"
                          : "text-slate-900"
                      }`}
                    >
                      {estado.fraseAccion}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                  {contacto && (
                    <a
                      href={`${contacto.whatsappHref}?text=${waText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Consultar entrega por WhatsApp"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  <Link
                    href={`/ordenes/${lote.ordenId}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <span>Recibir / Ver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
