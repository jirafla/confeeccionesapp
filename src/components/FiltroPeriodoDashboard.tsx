"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const MESES = [
  { num: 1, label: "Enero" },
  { num: 2, label: "Febrero" },
  { num: 3, label: "Marzo" },
  { num: 4, label: "Abril" },
  { num: 5, label: "Mayo" },
  { num: 6, label: "Junio" },
  { num: 7, label: "Julio" },
  { num: 8, label: "Agosto" },
  { num: 9, label: "Septiembre" },
  { num: 10, label: "Octubre" },
  { num: 11, label: "Noviembre" },
  { num: 12, label: "Diciembre" },
];

export default function FiltroPeriodoDashboard({
  mesSeleccionado,
  anioSeleccionado,
  mesActual,
  anioActual,
}: {
  mesSeleccionado: number;
  anioSeleccionado: number;
  mesActual: number;
  anioActual: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const aniosDisponibles: number[] = [];
  const startYear = Math.min(2024, anioActual - 2, anioSeleccionado);
  const endYear = Math.max(anioActual + 1, anioSeleccionado);
  for (let y = endYear; y >= startYear; y--) {
    aniosDisponibles.push(y);
  }

  const cambiarPeriodo = (nuevoMes: number, nuevoAnio: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nuevoMes === mesActual && nuevoAnio === anioActual) {
      params.delete("mes");
      params.delete("anio");
    } else {
      params.set("mes", String(nuevoMes));
      params.set("anio", String(nuevoAnio));
    }
    params.delete("p"); // Reiniciar paginación al cambiar de mes
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const irMesAnterior = () => {
    if (mesSeleccionado === 1) {
      cambiarPeriodo(12, anioSeleccionado - 1);
    } else {
      cambiarPeriodo(mesSeleccionado - 1, anioSeleccionado);
    }
  };

  const irMesSiguiente = () => {
    if (mesSeleccionado === 12) {
      cambiarPeriodo(1, anioSeleccionado + 1);
    } else {
      cambiarPeriodo(mesSeleccionado + 1, anioSeleccionado);
    }
  };

  const esMesActual = mesSeleccionado === mesActual && anioSeleccionado === anioActual;

  return (
    <div className="bg-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <span className="text-slate-900 font-black">Período del Panel e Historial</span>
          <span className="hidden md:inline text-xs font-medium text-slate-400 ml-2">
            (Filtra entregas, gráficos e historial mensual)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
        {!esMesActual && (
          <button
            type="button"
            onClick={() => cambiarPeriodo(mesActual, anioActual)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
            title="Volver al mes actual"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mes actual</span>
          </button>
        )}

        <button
          type="button"
          onClick={irMesAnterior}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
          title="Mes anterior"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <select
          value={mesSeleccionado}
          onChange={(e) => cambiarPeriodo(parseInt(e.target.value), anioSeleccionado)}
          aria-label="Seleccionar mes"
          className="flex-1 sm:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
        >
          {MESES.map((m) => (
            <option key={m.num} value={m.num}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={anioSeleccionado}
          onChange={(e) => cambiarPeriodo(mesSeleccionado, parseInt(e.target.value))}
          aria-label="Seleccionar año"
          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
        >
          {aniosDisponibles.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={irMesSiguiente}
          className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
          title="Mes siguiente"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
