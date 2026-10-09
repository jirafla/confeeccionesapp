import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";
import ImageLightbox from "@/components/ImageLightbox";
import OrdenesFiltros from "@/components/OrdenesFiltros";
import { nombreOrden, estadoOrden } from "@/lib/ordenes";
import type { Prisma } from "@prisma/client";

export default async function Ordenes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cliente?: string; estado?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = (query.q || "").trim();
  const clienteId = query.cliente || "";
  const estadoFiltro = query.estado || "";

  const clientes = await prisma.cliente.findMany({
    where: { empresaId: empresa.id },
    orderBy: { nombre: 'asc' }
  });

  // Permite buscar por nombre de orden: "5370-2" => referencia 5370, consecutivo 2
  const textoFiltros: Prisma.OrdenProduccionWhereInput[] = [];
  if (q) {
    textoFiltros.push(
      { cliente: { nombre: { contains: q, mode: 'insensitive' } } },
      { referencia: { codigo: { contains: q, mode: 'insensitive' } } }
    );
    const match = q.match(/^(.+)-(\d+)$/);
    if (match) {
      textoFiltros.push({
        referencia: { codigo: { equals: match[1], mode: 'insensitive' } },
        consecutivo: parseInt(match[2])
      });
    }
  }

  const ordenes = await prisma.ordenProduccion.findMany({
    where: {
      empresaId: empresa.id,
      ...(clienteId ? { clienteId } : {}),
      ...(estadoFiltro ? { estado: estadoFiltro } : {}),
      ...(textoFiltros.length ? { OR: textoFiltros } : {})
    },
    include: {
      cliente: true,
      referencia: true,
      asignaciones: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Órdenes</h1>
          <p className="text-sm text-slate-500">{ordenes.length} {ordenes.length === 1 ? "orden" : "órdenes"}</p>
        </div>
        <Link
          href="/ordenes/nuevo"
          className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nueva Orden</span><span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      <OrdenesFiltros
        q={q}
        clienteId={clienteId}
        estadoFiltro={estadoFiltro}
        clientes={clientes}
      />

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {ordenes.map((orden) => {
          const asignadas = orden.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0);
          const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
          const pct = Math.round(((orden.estado === 'CORTE' ? 0 : buenas) / orden.cantidadTotal) * 100);
          const estado = estadoOrden(orden.estado);

          return (
            <Link key={orden.id} href={`/ordenes/${orden.id}`} className="block group">
              <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/70 group-hover:border-blue-300 group-hover:shadow-md transition-all">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    {orden.referencia.disenoArchivoUrl ? (
                      <ImageLightbox src={orden.referencia.disenoArchivoUrl} alt="" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-400 font-bold uppercase">{orden.referencia.codigo.slice(0, 4)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {nombreOrden(orden)}
                      </h2>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${estado.badge}`}>{estado.label}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium truncate">{orden.cliente.nombre}</p>

                    {/* Progreso compacto en móvil */}
                    <div className="sm:hidden mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-1.5 rounded-full ${estado.dot}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">{orden.cantidadTotal} uds</span>
                    </div>
                  </div>

                  <div className="hidden sm:block w-52 shrink-0">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-500">Asignadas</span>
                      <span className="text-slate-900">{asignadas} / {orden.cantidadTotal}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(Math.round((asignadas / orden.cantidadTotal) * 100), 100)}%` }}></div>
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 text-right">{buenas} recibidas de talleres</p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                </div>
              </div>
            </Link>
          );
        })}

        {ordenes.length === 0 && (
          <EmptyState
            title="Sin órdenes"
            description={q || clienteId || estadoFiltro ? "No encontramos órdenes con esos filtros." : "Aún no has registrado ninguna orden de producción."}
            actionLabel="Nueva Orden"
            actionHref="/ordenes/nuevo"
          />
        )}
      </div>
    </div>
  );
}
