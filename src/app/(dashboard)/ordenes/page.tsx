import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";
import ImageLightbox from "@/components/ImageLightbox";

export default async function Ordenes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cliente?: string; estado?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";
  const clienteId = query.cliente || "";
  const estadoFiltro = query.estado || "";

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
    orderBy: { nombre: 'asc' }
  });

  const ordenes = await prisma.ordenProduccion.findMany({
    where: {
      empresaId: empresa.id,
      ...(clienteId ? { clienteId } : {}),
      ...(estadoFiltro ? { estado: estadoFiltro } : {}),
      ...(q ? {
        OR: [
          { cliente: { nombre: { contains: q, mode: 'insensitive' } } },
          { referencia: { codigo: { contains: q, mode: 'insensitive' } } }
        ]
      } : {})
    },
    include: {
      cliente: true,
      referencia: true,
      asignaciones: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Órdenes de Producción</h1>
        <Link 
          href="/ordenes/nuevo" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center w-full sm:w-auto shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Orden
        </Link>
      </div>

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
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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

      <div className="grid grid-cols-1 gap-4">
        {ordenes.map((orden) => {
          const asignadas = orden.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0);
          const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
          const pctAsignado = Math.round((asignadas / orden.cantidadTotal) * 100);

          return (
            <Link key={orden.id} href={`/ordenes/${orden.id}`} className="block group">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      {orden.referencia.disenoArchivoUrl ? (
                        <ImageLightbox src={orden.referencia.disenoArchivoUrl} alt="" className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <span className="text-xs text-slate-400 font-semibold uppercase">{orden.referencia.codigo.slice(0,3)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {orden.cliente.nombre}
                      </h2>
                      <p className="text-sm text-slate-500 font-medium">{orden.referencia.codigo}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 md:items-center">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Estado</p>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg
                        ${orden.estado === 'DISENO' ? 'bg-purple-100 text-purple-700' :
                          orden.estado === 'CORTE' ? 'bg-orange-100 text-orange-700' :
                          orden.estado === 'CONFECCION' ? 'bg-blue-100 text-blue-700' :
                          'bg-emerald-100 text-emerald-700'}`}>
                        {orden.estado}
                      </span>
                    </div>

                    <div className="w-full sm:w-48 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-600">Asignadas</span>
                        <span className="text-slate-900">{asignadas} / {orden.cantidadTotal}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(pctAsignado, 100)}%` }}></div>
                      </div>
                      <p className="text-[10px] font-medium text-slate-500 text-right">{buenas} entregadas con éxito</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
        
        {ordenes.length === 0 && (
          <div className="col-span-full">
            <EmptyState 
              title="Sin Órdenes"
              description={q ? "No encontramos órdenes con esa búsqueda." : "Aún no has registrado ninguna orden de producción."}
              actionLabel="Nueva Orden"
              actionHref="/ordenes/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
