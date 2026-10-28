import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, MapPin, Search, Calendar, Factory, Star, MessageCircle } from "lucide-react";
import TallerEditModal from "@/components/TallerEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EmptyState from "@/components/EmptyState";
import { nombreOrden } from "@/lib/ordenes";
import { getCapacidadInfo, getEstadoFechaLote, getContactoLinks } from "@/lib/talleres";

import { requireAuth } from "@/lib/auth";
import { canViewCosts, canDelete } from "@/lib/permissions";

export default async function DetalleTaller({ 
  params, 
  searchParams 
}: { 
  params: { id: string };
  searchParams: Promise<{ q?: string }>;
}) {
  const { user, empresa } = await requireAuth();
  const mostrarPrecios = canViewCosts(user.rol);
  const permiteEliminar = canDelete(user.rol);
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

  const cap = getCapacidadInfo(taller.capacidad);
  const CapIcon = cap?.icon;
  const contacto = getContactoLinks(taller.telefono);

  const query = q?.toLowerCase() || "";
  const asignacionesFiltradas = taller.asignaciones.filter(a => 
    nombreOrden(a.orden).toLowerCase().includes(query) ||
    a.orden.referencia.codigo.toLowerCase().includes(query) || 
    a.orden.cliente.nombre.toLowerCase().includes(query) ||
    a.estadoLote.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0">
        <Link
          href="/talleres"
          title="Volver a talleres"
          aria-label="Volver a talleres"
          className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Volver</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Perfil del Taller</p>
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight truncate" title={taller.nombre}>
              {taller.nombre}
            </h1>
            {taller.destacado && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                Destacado
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Columna Izquierda - Información y Acciones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${taller.destacado ? "bg-amber-100 text-amber-600" : "bg-indigo-50 text-indigo-600"}`}>
                <Factory className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate" title={taller.nombre}>{taller.nombre}</h2>
                {cap && CapIcon && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md text-xs font-bold ${cap.badgeCls}`}>
                    <CapIcon className="w-3.5 h-3.5" />
                    Capacidad {cap.label} ({cap.desc})
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600 mb-5">
              <p className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{taller.telefono || "Sin teléfono registrado"}</span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{taller.direccion || "Sin dirección registrada"}</span>
              </p>
            </div>

            {contacto && (
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                <a
                  href={contacto.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
                <a
                  href={contacto.telHref}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Llamar
                </a>
              </div>
            )}

            <div className="space-y-3 mt-4">
              <TallerEditModal taller={taller} />
              
              {permiteEliminar && taller.asignaciones.length === 0 && (
                <DeleteConfirmModal 
                  action={async () => {
                    "use server";
                    const { user: currentUser, empresa: currentEmpresa } = await requireAuth();
                    if (!canDelete(currentUser.rol)) return;
                    await prisma.taller.delete({ where: { id: taller.id, empresaId: currentEmpresa.id } });
                    redirect("/talleres");
                  }}
                  title="¿Eliminar taller?"
                  description={`Estás a punto de eliminar permanentemente a ${taller.nombre}. Esta acción no se puede deshacer.`}
                  buttonText="Eliminar Taller"
                />
              )}
              {permiteEliminar && taller.asignaciones.length > 0 && (
                 <p className="text-[10px] text-center text-slate-400 mt-2">
                   No puedes eliminar este taller porque tiene asignaciones.
                 </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha - Lotes Asignados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Asignaciones ({taller.asignaciones.length})</h2>
            <form method="GET" className="relative">
              <input 
                type="search" 
                name="q"
                defaultValue={q}
                placeholder="Buscar orden, cliente o estado..." 
                className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
             {asignacionesFiltradas.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState 
                    title="No hay asignaciones" 
                    description={q ? "No se encontraron asignaciones que coincidan con tu búsqueda." : "Este taller aún no tiene piezas asignadas."} 
                  />
                </div>
             ) : (
                asignacionesFiltradas.map((asig) => {
                  const nombre = nombreOrden(asig.orden);
                  const estadoFecha = getEstadoFechaLote(asig.fechaEntregaEsperada, asig.estadoLote);
                  return (
                    <Link key={asig.id} href={`/ordenes/${asig.ordenId}${asig.orden.estado === "ENTREGADO" ? "/resumen" : ""}`} className="block group">
                      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 min-w-0">
                              <span className="text-sm sm:text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors truncate" title={nombre}>
                                {nombre}
                              </span>
                              <span className="text-slate-300 shrink-0">•</span>
                              <span className="text-xs sm:text-sm font-medium text-slate-500 truncate">{asig.orden.cliente.nombre}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1.5">
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                Envío: {asig.fechaEnvio.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                              </p>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${estadoFecha.badgeClass}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${estadoFecha.dotClass}`} />
                                {estadoFecha.label}
                              </span>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full shrink-0
                            ${asig.estadoLote === 'ENTREGADO' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                            {asig.estadoLote === 'ENTREGADO' ? 'Recibido' : 'En taller'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-6 mt-3 pt-3 border-t border-slate-100">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Asignadas</p>
                            <p className="font-bold text-slate-900 text-sm">{asig.cantidadAsignada} uds</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Entregadas</p>
                            <p className="font-bold text-slate-900 text-sm">
                              {asig.estadoLote === 'ENTREGADO' ? `${asig.cantidadBuena} uds` : '--'}
                            </p>
                          </div>
                          {mostrarPrecios && (
                            <div>
                              <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Total a Pagar</p>
                              <p className="font-bold text-indigo-600 text-sm">${(asig.cantidadAsignada * asig.precioUnitario).toLocaleString("es-CO")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
