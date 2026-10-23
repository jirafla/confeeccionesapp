"use client";

import { Search, Scissors, Shirt, PackageCheck, Layers, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const ESTADOS_TABS = [
  { id: "", label: "Todas", icon: Layers, activeCls: "bg-slate-900 text-white shadow-sm", dotCls: "bg-slate-400" },
  { id: "CORTE", label: "Corte", icon: Scissors, activeCls: "bg-orange-500 text-white shadow-sm shadow-orange-500/20", dotCls: "bg-orange-500" },
  { id: "CONFECCION", label: "Confección", icon: Shirt, activeCls: "bg-blue-600 text-white shadow-sm shadow-blue-600/20", dotCls: "bg-blue-500" },
  { id: "ENTREGADO", label: "Entregado", icon: PackageCheck, activeCls: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20", dotCls: "bg-emerald-500" },
];

export default function OrdenesFiltros({
  q,
  clienteId,
  estadoFiltro,
  clientes,
}: {
  q: string;
  clienteId: string;
  estadoFiltro: string;
  clientes: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navegar = (cambios: Record<string, string>) => {
    const params = new URLSearchParams();
    const valores = { q, cliente: clienteId, estado: estadoFiltro, ...cambios };
    Object.entries(valores).forEach(([k, v]) => v && params.set(k, v));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const hayFiltros = Boolean(q || clienteId || estadoFiltro);

  return (
    <div className="space-y-2.5">
      {/* Píldoras de etapa 1-clic (Mobile + Desktop) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {ESTADOS_TABS.map((tab) => {
          const isActive = estadoFiltro === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navegar({ estado: tab.id })}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? tab.activeCls
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}

        {hayFiltros && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors shrink-0 ml-auto cursor-pointer"
            title="Limpiar filtros"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Buscador y Selector de Cliente */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row sm:items-center gap-2">
        <form
          className="flex items-center flex-1 px-2"
          onSubmit={(e) => {
            e.preventDefault();
            navegar({ q: (new FormData(e.currentTarget).get("q") as string).trim() });
          }}
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 shrink-0" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar orden (5370-1), referencia o cliente..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none py-1.5 sm:py-2"
          />
        </form>

        <div className="flex gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <select
            value={clienteId}
            onChange={(e) => navegar({ cliente: e.target.value })}
            className="w-full sm:w-52 min-w-0 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 py-2 pl-3 pr-8 outline-none truncate"
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

