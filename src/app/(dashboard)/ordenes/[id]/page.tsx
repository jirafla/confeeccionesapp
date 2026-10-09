import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Factory, CheckCircle2, AlertTriangle, PlayCircle } from "lucide-react";
import ConciliarLoteModal from "./ConciliarLoteModal";
import OrdenTracking from "./OrdenTracking";
import ImageLightbox from "@/components/ImageLightbox";
import AsignarTallerModal from "./AsignarTallerModal";
import BotonAvanzarEstado from "./BotonAvanzarEstado";

export default async function OrdenDetail({ params }: { params: { id: string } }) {
  const { empresa } = await requireAuth();
  const { id } = await params;

  const orden = await prisma.ordenProduccion.findUnique({
    where: { id, empresaId: empresa.id },
    include: {
      cliente: true,
      referencia: true,
      asignaciones: {
        include: { taller: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!orden) return <div className="p-8 text-center text-slate-500">Orden no encontrada.</div>;

  const talleres = await prisma.taller.findMany({
    where: { empresaId: empresa.id },
    orderBy: { nombre: 'asc' }
  });

  const asignadas = orden.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0);
  const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
  const pendientesPorAsignar = orden.cantidadTotal - asignadas;
  const pctAsignado = Math.round((asignadas / orden.cantidadTotal) * 100);
  const pctEntregado = Math.round((buenas / orden.cantidadTotal) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/ordenes" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Detalle de Orden</h1>
      </div>

      <OrdenTracking ordenId={orden.id} estadoActual={orden.estado} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INFO DE LA ORDEN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-50 relative flex items-center justify-center border-b border-gray-100 overflow-hidden">
              {orden.referencia.disenoArchivoUrl ? (
                <ImageLightbox src={orden.referencia.disenoArchivoUrl} alt="Diseño" className="w-full h-full" />
              ) : (
                <span className="text-slate-400 font-medium">Sin imagen</span>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-semibold text-slate-900">{orden.cliente.nombre}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Referencia</p>
                <p className="font-semibold text-slate-900">{orden.referencia.codigo}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Detalles / Instrucciones</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {orden.coloresDetalles || "Sin detalles específicos."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Progreso Global</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-600">Asignado a Talleres</span>
                  <span className={pendientesPorAsignar === 0 ? "text-emerald-600" : "text-blue-600"}>
                    {asignadas} / {orden.cantidadTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${pendientesPorAsignar === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pctAsignado, 100)}%` }}></div>
                </div>
                {pendientesPorAsignar > 0 && (
                  <p className="text-xs text-amber-600 font-medium mt-1">Faltan {pendientesPorAsignar} piezas por asignar.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="text-slate-600">Entregado con Éxito</span>
                  <span className={buenas === orden.cantidadTotal ? "text-emerald-600" : "text-indigo-600"}>
                    {buenas} / {orden.cantidadTotal}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(pctEntregado, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ASIGNACIONES (LOTES) */}
        <div className="lg:col-span-2 space-y-6">
          {orden.estado === 'DISENO' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Etapa de Diseño / Preparación</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                La orden acaba de ser creada. Revisa los detalles, cantidades y variables antes de pasarla al equipo de corte.
              </p>
              
              <div className="w-full text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">Cantidades por Variante:</h4>
                <ul className="space-y-2">
                  {orden.coloresDetalles.split(',').map((line, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {line.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              <BotonAvanzarEstado ordenId={orden.id} siguienteEstado="CORTE" label="Enviar a Corte" />
            </div>
          )}

          {orden.estado === 'CORTE' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Etapa de Corte</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                Revisa las piezas que deben cortarse. Cuando la tela esté lista y cortada para ser despachada a los talleres, haz clic para avanzar a la etapa de Confección.
              </p>
              
              <div className="w-full text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2">
                <h4 className="font-bold text-slate-700 mb-3 uppercase text-xs tracking-wider">Cantidades por Variante:</h4>
                <ul className="space-y-2">
                  {orden.coloresDetalles.split(',').map((line, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {line.trim()}
                    </li>
                  ))}
                </ul>
              </div>

              <BotonAvanzarEstado ordenId={orden.id} siguienteEstado="CONFECCION" label="Mover a Confección" />
            </div>
          )}

          {(orden.estado === 'CONFECCION' || orden.estado === 'ENTREGADO') && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-slate-400" />
                  Lotes en Talleres ({orden.asignaciones.length})
                </h2>
                {pendientesPorAsignar > 0 && (
                  <AsignarTallerModal 
                    ordenId={orden.id} 
                    talleres={talleres} 
                    precioSugerido={orden.referencia.precioBase} 
                    pendientes={pendientesPorAsignar} 
                  />
                )}
              </div>
              
              {orden.asignaciones.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">No hay talleres asignados</h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6">Asigna el primer lote de prendas a un taller para comenzar con la confección.</p>
                  
                  <AsignarTallerModal 
                    ordenId={orden.id} 
                    talleres={talleres} 
                    precioSugerido={orden.referencia.precioBase} 
                    pendientes={pendientesPorAsignar} 
                    isFirst={true}
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orden.asignaciones.map((asig) => (
                    <div key={asig.id} className="p-5 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{asig.taller.nombre}</h3>
                          <p className="text-sm text-slate-500 font-medium">Envío: {asig.fechaEnvio.toLocaleDateString()} • Esperado: {asig.fechaEntregaEsperada.toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg
                          ${asig.estadoLote === 'ENTREGADO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {asig.estadoLote}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-4 p-4 bg-slate-100/50 rounded-xl border border-slate-100">
                        <div className="flex-1 min-w-[100px]">
                          <p className="text-slate-500 text-xs font-bold uppercase mb-0.5">Asignadas</p>
                          <p className="font-bold text-slate-900">{asig.cantidadAsignada} uds</p>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <p className="text-slate-500 text-xs font-bold uppercase mb-0.5">Precio U.</p>
                          <p className="font-bold text-slate-900">${asig.precioUnitario}</p>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <p className="text-slate-500 text-xs font-bold uppercase mb-0.5">Total Pago</p>
                          <p className="font-bold text-indigo-700">${asig.cantidadAsignada * asig.precioUnitario}</p>
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <p className="text-slate-500 text-xs font-bold uppercase mb-0.5">Entregadas</p>
                          {asig.estadoLote === 'ENTREGADO' ? (
                             <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                               <CheckCircle2 className="w-4 h-4" />
                               {asig.cantidadBuena} buenas
                               {asig.reprocesos! > 0 && <span className="text-amber-500 text-xs ml-1">({asig.reprocesos} rep)</span>}
                             </div>
                          ) : (
                            <p className="font-semibold text-slate-400">Pendiente...</p>
                          )}
                        </div>
                      </div>

                      {asig.estadoLote === 'ASIGNADO' && (
                        <div className="mt-4 flex justify-end">
                          <ConciliarLoteModal asignacion={asig} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
