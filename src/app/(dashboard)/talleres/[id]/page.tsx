import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import TallerEditModal from "@/components/TallerEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EmptyState from "@/components/EmptyState";

import { requireAuth } from "@/lib/auth";

export default async function DetalleTaller({ 
  params, 
  searchParams 
}: { 
  params: { id: string };
  searchParams: Promise<{ q?: string }>;
}) {
  const { empresa } = await requireAuth();
  const { id } = await params;
  const { q } = await searchParams;
  const taller = await prisma.taller.findUnique({
    where: { id, empresaId: empresa.id },
    include: {
      asignaciones: {
        include: { 
          orden: {
            include: { referencia: true, cliente: true }
          } 
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!taller) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-medium">Taller no encontrado o no tienes permiso.</p>
        <Link href="/talleres" className="text-blue-600 hover:underline mt-2 inline-block">Volver a Talleres</Link>
      </div>
    );
  }

  const query = q?.toLowerCase() || "";
  const asignacionesFiltradas = taller.asignaciones.filter(a => 
    a.orden.referencia.codigo.toLowerCase().includes(query) || 
    a.orden.cliente.nombre.toLowerCase().includes(query) ||
    a.estadoLote.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/talleres" className="text-slate-400 hover:text-slate-900 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Perfil del Taller
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda - Información y Acciones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{taller.nombre}</h2>
            
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p className="flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {taller.telefono || "Sin teléfono registrado"}
              </p>
              <p className="flex items-start gap-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {taller.direccion || "Sin dirección registrada"}
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <TallerEditModal taller={taller} />
              
              {taller.asignaciones.length === 0 && (
                <DeleteConfirmModal 
                  action={async () => {
                    "use server";
                    await prisma.taller.delete({ where: { id: taller.id } });
                    redirect("/talleres");
                  }}
                  title="¿Eliminar taller?"
                  description={`Estás a punto de eliminar permanentemente a ${taller.nombre}. Esta acción no se puede deshacer.`}
                  buttonText="Eliminar Taller"
                />
              )}
              {taller.asignaciones.length > 0 && (
                 <p className="text-[10px] text-center text-slate-400 mt-2">
                   No puedes eliminar este taller porque tiene asignaciones.
                 </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Lotes Asignados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900">Asignaciones ({taller.asignaciones.length})</h2>
            <form method="GET" className="relative">
              <input 
                type="text" 
                name="q"
                defaultValue={q}
                placeholder="Buscar referencia o estado..." 
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {asignacionesFiltradas.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState 
                    title="No hay asignaciones" 
                    description={q ? "No se encontraron asignaciones que coincidan con tu búsqueda." : "Este taller aún no tiene piezas asignadas."} 
                  />
                </div>
             ) : (
                asignacionesFiltradas.map((asig) => (
                  <Link key={asig.id} href={`/ordenes/${asig.ordenId}`} className="block group">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {asig.orden.referencia.codigo}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm font-medium text-slate-500">{asig.orden.cliente.nombre}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              Envío: {asig.fechaEnvio.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Pactada: {asig.fechaEntregaEsperada.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg shrink-0
                          ${asig.estadoLote === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {asig.estadoLote}
                        </span>
                      </div>

                      <div className="flex gap-6 mt-4 pt-4 border-t border-slate-50">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Asignadas</p>
                          <p className="font-semibold text-slate-800">{asig.cantidadAsignada}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Entregadas</p>
                          <p className="font-semibold text-slate-800">
                            {asig.estadoLote === 'ENTREGADO' ? asig.cantidadBuena : '--'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total a Pagar</p>
                          <p className="font-bold text-indigo-600">${(asig.cantidadAsignada * asig.precioUnitario).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
