import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Factory, CheckCircle2, PlayCircle, Scissors, PackageCheck, Calendar, Shirt, User } from "lucide-react";
import ConciliarLoteModal from "./ConciliarLoteModal";
import OrdenTracking from "./OrdenTracking";
import ImageLightbox from "@/components/ImageLightbox";
import AsignarTallerModal from "./AsignarTallerModal";
import BotonAvanzarEstado from "./BotonAvanzarEstado";
import EntregarClienteModal from "./EntregarClienteModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { nombreOrden, estadoOrden, parseVariantes } from "@/lib/ordenes";

const fmtFecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
const fmtDinero = (n: number) => `$${n.toLocaleString("es-CO")}`;

export default async function OrdenDetail({ params }: { params: Promise<{ id: string }> }) {
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

  const nombre = nombreOrden(orden);
  const estado = estadoOrden(orden.estado);
  const variantes = parseVariantes(orden.coloresDetalles);

  const asignadas = orden.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0);
  const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
  const reprocesos = orden.asignaciones.reduce((sum, a) => sum + (a.reprocesos || 0), 0);
  const lotesPendientes = orden.asignaciones.filter(a => a.estadoLote !== 'ENTREGADO').length;
  const pendientesPorAsignar = orden.cantidadTotal - asignadas;
  const pctAsignado = Math.round((asignadas / orden.cantidadTotal) * 100);
  const pctRecibido = Math.round((buenas / orden.cantidadTotal) * 100);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/ordenes" className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Orden de producción</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{nombre}</h1>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${estado.badge}`}>{estado.label}</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5 truncate">{orden.cliente.nombre} · {orden.cantidadTotal} prendas</p>
          </div>
        </div>

        {orden.asignaciones.length === 0 && (
          <div className="shrink-0">
            <DeleteConfirmModal
              action={async () => {
                "use server";
                const { deleteOrden } = await import("@/app/actions/ordenesActions");
                await deleteOrden(orden.id);
              }}
              title={`¿Eliminar orden ${nombre}?`}
              description="Esta acción no se puede deshacer."
              buttonText="Eliminar"
              iconOnly={true}
            />
          </div>
        )}
      </div>

      <OrdenTracking estadoActual={orden.estado} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* COLUMNA IZQUIERDA: INFO */}
        <div className="lg:col-span-1 space-y-5 sm:space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-[4/3] bg-slate-50 relative flex items-center justify-center border-b border-slate-100 overflow-hidden">
              {orden.referencia.disenoArchivoUrl ? (
                <ImageLightbox src={orden.referencia.disenoArchivoUrl} alt="Diseño" className="w-full h-full" />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <Shirt className="w-10 h-10 mb-1" />
                  <span className="text-xs font-medium">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Referencia</p>
                  <Link href={`/referencias/${orden.referencia.id}`} className="font-semibold text-blue-600 hover:underline">
                    {orden.referencia.codigo}
                  </Link>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Creada</p>
                  <p className="font-semibold text-slate-900 text-sm">{fmtFecha(orden.createdAt)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cliente</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" />{orden.cliente.nombre}</p>
                </div>
              </div>

              {orden.estado !== 'CORTE' && variantes.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Variantes</p>
                  <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                    {variantes.map((v, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="text-slate-700">{v.detalle}</span>
                        {v.cantidad !== null && <span className="font-bold text-slate-900">{v.cantidad}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-900 mb-4">Progreso</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-slate-600">Asignado a talleres</span>
                  <span className={pendientesPorAsignar === 0 ? "text-emerald-600" : "text-blue-600"}>{asignadas} / {orden.cantidadTotal}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full ${pendientesPorAsignar === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(pctAsignado, 100)}%` }}></div>
                </div>
                {pendientesPorAsignar > 0 && orden.estado !== 'CORTE' && (
                  <p className="text-xs text-amber-600 font-medium mt-1.5">Faltan {pendientesPorAsignar} prendas por asignar.</p>
                )}
              </div>
              <div>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-slate-600">Recibido de talleres</span>
                  <span className={buenas === orden.cantidadTotal ? "text-emerald-600" : "text-indigo-600"}>{buenas} / {orden.cantidadTotal}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(pctRecibido, 100)}%` }}></div>
                </div>
                {reprocesos > 0 && <p className="text-xs text-amber-600 font-medium mt-1.5">{reprocesos} prendas en reproceso.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: ETAPA ACTUAL */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {orden.estado === 'CORTE' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Scissors className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-slate-900">Etapa de Corte</h3>
                  <p className="text-sm text-slate-500">Prendas a cortar por variante. Cuando la tela esté cortada, envía la orden a confección.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {variantes.map((v, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <p className="text-2xl sm:text-3xl font-black text-slate-900">{v.cantidad ?? "—"}</p>
                    <p className="text-sm font-medium text-slate-600 truncate" title={v.detalle}>{v.detalle}</p>
                  </div>
                ))}
                <div className="bg-blue-600 rounded-xl p-4 text-white">
                  <p className="text-2xl sm:text-3xl font-black">{orden.cantidadTotal}</p>
                  <p className="text-sm font-medium text-blue-100">Total</p>
                </div>
              </div>

              <div className="flex justify-end">
                <BotonAvanzarEstado ordenId={orden.id} siguienteEstado="CONFECCION" label="Enviar a Confección" />
              </div>
            </div>
          )}

          {orden.estado === 'ENTREGADO' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                <PackageCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">Entregada al cliente</h3>
                <p className="text-sm text-emerald-700">
                  {buenas} prendas entregadas a {orden.cliente.nombre}
                  {orden.fechaEntregado && <> el {fmtFecha(orden.fechaEntregado)}</>}.
                </p>
              </div>
            </div>
          )}

          {orden.estado === 'CONFECCION' && orden.asignaciones.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900">¿Listo para despachar?</h3>
                <p className="text-sm text-slate-500">
                  {lotesPendientes > 0
                    ? `${lotesPendientes} lote(s) aún en talleres.`
                    : "Todos los lotes fueron recibidos. Ya puedes entregar al cliente."}
                </p>
              </div>
              <EntregarClienteModal
                ordenId={orden.id}
                nombre={nombre}
                cliente={orden.cliente.nombre}
                buenas={buenas}
                reprocesos={reprocesos}
                cantidadTotal={orden.cantidadTotal}
                lotesPendientes={lotesPendientes}
                sinAsignar={pendientesPorAsignar}
              />
            </div>
          )}

          {(orden.estado === 'CONFECCION' || orden.estado === 'ENTREGADO') && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 sm:px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Factory className="w-5 h-5 text-slate-400" />
                  Lotes en talleres <span className="text-slate-400 font-medium">({orden.asignaciones.length})</span>
                </h2>
                {orden.estado === 'CONFECCION' && pendientesPorAsignar > 0 && orden.asignaciones.length > 0 && (
                  <AsignarTallerModal ordenId={orden.id} talleres={talleres} pendientes={pendientesPorAsignar} />
                )}
              </div>

              {orden.asignaciones.length === 0 ? (
                <div className="p-10 sm:p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <PlayCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">No hay talleres asignados</h3>
                  <p className="text-sm text-slate-500 max-w-sm">Asigna el primer lote de prendas a un taller para comenzar la confección.</p>
                  <AsignarTallerModal ordenId={orden.id} talleres={talleres} pendientes={pendientesPorAsignar} isFirst={true} />
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {orden.asignaciones.map((asig) => {
                    const recibido = asig.estadoLote === 'ENTREGADO';
                    return (
                      <div key={asig.id} className="p-4 sm:p-5">
                        <div className="flex justify-between items-start gap-3 mb-3">
                          <div className="min-w-0">
                            <Link href={`/talleres/${asig.tallerId}`} className="font-bold text-slate-900 text-base sm:text-lg hover:text-blue-600 truncate block">
                              {asig.taller.nombre}
                            </Link>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5">
                              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Envío {fmtFecha(asig.fechaEnvio)}</span>
                              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-500" /> Pactada {fmtFecha(asig.fechaEntregaEsperada)}</span>
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full shrink-0 ${recibido ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                            {recibido ? 'Recibido' : 'En taller'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm p-3 sm:p-4 bg-slate-50 rounded-xl">
                          <div>
                            <p className="text-slate-500 text-[11px] font-bold uppercase mb-0.5">Asignadas</p>
                            <p className="font-bold text-slate-900">{asig.cantidadAsignada} uds</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[11px] font-bold uppercase mb-0.5">Precio U.</p>
                            <p className="font-bold text-slate-900">{fmtDinero(asig.precioUnitario)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[11px] font-bold uppercase mb-0.5">Total pago</p>
                            <p className="font-bold text-indigo-700">{fmtDinero(asig.cantidadAsignada * asig.precioUnitario)}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-[11px] font-bold uppercase mb-0.5">Recibidas</p>
                            {recibido ? (
                              <p className="flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle2 className="w-4 h-4" /> {asig.cantidadBuena}
                                {(asig.reprocesos ?? 0) > 0 && <span className="text-amber-600 text-xs font-semibold">+{asig.reprocesos} rep.</span>}
                              </p>
                            ) : (
                              <p className="font-semibold text-slate-400">Pendiente</p>
                            )}
                          </div>
                        </div>

                        {asig.insumosEntregados && (
                          <p className="text-xs text-slate-500 mt-2"><span className="font-semibold">Insumos:</span> {asig.insumosEntregados}</p>
                        )}

                        {!recibido && (
                          <div className="mt-3 flex justify-end">
                            <ConciliarLoteModal asignacion={asig} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
