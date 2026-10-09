"use client";

import { Search } from "lucide-react";

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
  return (
    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center flex-1 border-b md:border-b-0 md:border-r border-gray-100 pb-2 md:pb-0 px-2">
        <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
        <form className="flex-1" method="GET" id="search-form">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por cliente o referencia..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none"
          />
          {clienteId && <input type="hidden" name="cliente" value={clienteId} />}
          {estadoFiltro && <input type="hidden" name="estado" value={estadoFiltro} />}
        </form>
      </div>

      <div className="flex gap-2">
        <form method="GET">
          {q && <input type="hidden" name="q" value={q} />}
          {estadoFiltro && <input type="hidden" name="estado" value={estadoFiltro} />}
          <select
            name="cliente"
            value={clienteId}
            onChange={(e) => e.target.form?.submit()}
            className="text-sm bg-slate-50 border-none rounded-xl font-medium text-slate-700 focus:ring-0 py-2 pl-3 pr-8 w-full sm:w-40"
          >
            <option value="">Todos los clientes</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </form>

        <form method="GET">
          {q && <input type="hidden" name="q" value={q} />}
          {clienteId && <input type="hidden" name="cliente" value={clienteId} />}
          <select
            name="estado"
            value={estadoFiltro}
            onChange={(e) => e.target.form?.submit()}
            className="text-sm bg-slate-50 border-none rounded-xl font-medium text-slate-700 focus:ring-0 py-2 pl-3 pr-8 w-full sm:w-36"
          >
            <option value="">Todos los estados</option>
            <option value="CORTE">Corte</option>
            <option value="CONFECCION">Confección</option>
            <option value="ENTREGADO">Entregado</option>
          </select>
        </form>
      </div>
    </div>
  );
}
