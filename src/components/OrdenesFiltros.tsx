"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

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

  const selectCls = "flex-1 sm:flex-none sm:w-44 min-w-0 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 py-2.5 pl-3 pr-8 outline-none";

  return (
    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col md:flex-row md:items-center gap-2">
      <form
        className="flex items-center flex-1 px-2"
        onSubmit={(e) => {
          e.preventDefault();
          navegar({ q: (new FormData(e.currentTarget).get("q") as string).trim() });
        }}
      >
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar orden (5370-1), referencia o cliente..."
          className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none py-2"
        />
      </form>

      <div className="flex gap-2">
        <select value={clienteId} onChange={(e) => navegar({ cliente: e.target.value })} className={selectCls}>
          <option value="">Todos los clientes</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        <select value={estadoFiltro} onChange={(e) => navegar({ estado: e.target.value })} className={selectCls}>
          <option value="">Todos los estados</option>
          <option value="CORTE">Corte</option>
          <option value="CONFECCION">Confección</option>
          <option value="ENTREGADO">Entregado</option>
        </select>
      </div>
    </div>
  );
}
