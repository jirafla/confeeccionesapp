import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Plus, 
  Factory, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  ArrowRight,
  Shirt,
  Calendar,
  AlertCircle
} from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import { requireAuth } from "@/lib/auth";
import { nombreOrden, estadoOrden } from "@/lib/ordenes";

const fmtFecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

export default async function Home() {
  const { empresa } = await requireAuth();

  // 1. Talleres con sus asignaciones
  const talleres = await prisma.taller.findMany({
    where: { empresaId: empresa.id },
    include: {
      asignaciones: {
        include: { orden: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  const totalTalleres = talleres.length;
  // Talleres que tienen al menos un lote activo en confección
  const talleresConOrdenes = talleres.filter(t => 
    t.asignaciones.some(a => a.estadoLote === "ASIGNADO" && a.orden.estado !== "ENTREGADO")
  ).length;
  const talleresSinOrdenes = totalTalleres - talleresConOrdenes;

  // Total lotes actualmente en talleres
  const totalLotesEnConfeccion = talleres.reduce(
    (acc, t) => acc + t.asignaciones.filter(a => a.estadoLote === "ASIGNADO").length, 
    0
  );

  // 2. Órdenes de producción
  const ordenes = await prisma.ordenProduccion.findMany({
    where: { empresaId: empresa.id },
    include: {
      cliente: true,
      referencia: true,
      asignaciones: {
        include: { taller: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalPrendas = ordenes.reduce((acc, o) => acc + o.cantidadTotal, 0);
  
  const prendasAsignadas = ordenes.reduce((acc, o) => 
    acc + o.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0), 0);

  const prendasBuenas = ordenes.reduce((acc, o) => 
    acc + o.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0), 0);

  const porcentajeCompletado = totalPrendas === 0 ? 0 : Math.round((prendasBuenas / totalPrendas) * 100);
  const porcentajeAsignado = totalPrendas === 0 ? 0 : Math.round((prendasAsignadas / totalPrendas) * 100);

  const ordenesActivas = ordenes.filter(o => o.estado !== "ENTREGADO").length;

  // Órdenes entregadas al cliente para el historial
  const ordenesEntregadas = ordenes.filter(o => o.estado === "ENTREGADO");

  // Data for charts
  const ordenesPorEstado = [
    { name: "Corte", value: ordenes.filter(o => o.estado === "CORTE").length, fill: "#f97316" },
    { name: "Confección", value: ordenes.filter(o => o.estado === "CONFECCION").length, fill: "#3b82f6" },
    { name: "Entregado", value: ordenes.filter(o => o.estado === "ENTREGADO").length, fill: "#22c55e" }
  ].filter(item => item.value > 0);

  const datosProduccion = [
    { name: "Prendas", total: totalPrendas, pagado: prendasBuenas }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-sm text-slate-500 mt-1">Resumen de producción, estado de talleres y entregas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link 
            href="/ordenes/nuevo" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Orden
          </Link>
          <Link 
            href="/talleres" 
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Factory className="w-4 h-4 text-slate-400" /> Ver Talleres
          </Link>
        </div>
      </div>

      {/* SECCIÓN 1: KPIS DE TALLERES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Factory className="w-4 h-4 text-indigo-600" />
            Estado de Talleres
          </h2>
          <Link href="/talleres" className="text-xs font-semibold text-blue-600 hover:underline">
            Gestionar talleres →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Talleres</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Factory className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalTalleres}</p>
              <p className="text-xs text-slate-500 mt-1">Talleres registrados</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-sm bg-gradient-to-br from-white to-blue-50/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Con Órdenes</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-blue-600">{talleresConOrdenes}</p>
              <p className="text-xs text-blue-700 font-medium mt-1">
                Con lotes en confección
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sin Órdenes</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">{talleresSinOrdenes}</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Disponibles para asignar
              </p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lotes en Taller</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalLotesEnConfeccion}</p>
              <p className="text-xs text-slate-500 mt-1">Lotes activos confeccionándose</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: KPIS DE PRODUCCIÓN */}
      <div>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Avance de Producción
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avance Entregas</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{porcentajeCompletado}%</p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${porcentajeCompletado}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prendas Asignadas</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">
              {prendasAsignadas} <span className="text-xs font-bold text-slate-400">/ {totalPrendas}</span>
            </p>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${porcentajeAsignado}%` }}></div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prendas Buenas</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">
              {prendasBuenas} <span className="text-xs font-bold text-slate-400">uds</span>
            </p>
            <p className="text-xs text-slate-500 mt-2">Recibidas con calidad</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Órdenes Activas</p>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{ordenesActivas}</p>
            <p className="text-xs text-slate-500 mt-2">{ordenesEntregadas.length} órdenes entregadas</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: GRÁFICOS */}
      <DashboardCharts lotesPorEstado={ordenesPorEstado} datosProduccion={datosProduccion} />

      {/* SECCIÓN 4: HISTORIAL DE ENTREGADOS EN TABLA */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              Historial de Órdenes Entregadas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Registro histórico de prendas y lotes que ya fueron finalizados y entregados al cliente.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shrink-0">
            {ordenesEntregadas.length} {ordenesEntregadas.length === 1 ? "orden entregada" : "órdenes entregadas"}
          </span>
        </div>

        {ordenesEntregadas.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">Aún no hay órdenes entregadas</p>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Cuando completes la confección de una orden y presiones &quot;Entregar al cliente&quot;, quedará registrada en esta tabla con su fecha y prendas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Orden</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Referencia</th>
                  <th className="py-3 px-4">Prendas</th>
                  <th className="py-3 px-4 hidden md:table-cell">Talleres</th>
                  <th className="py-3 px-4">Fecha Entrega</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordenesEntregadas.map((orden) => {
                  const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
                  const talleresNombres = Array.from(new Set(orden.asignaciones.map(a => a.taller.nombre)));
                  const fecha = orden.fechaEntregado || orden.updatedAt;

                  return (
                    <tr key={orden.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-black text-slate-900 whitespace-nowrap">
                        <Link href={`/ordenes/${orden.id}`} className="hover:text-blue-600 transition-colors">
                          {nombreOrden(orden)}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {orden.cliente.nombre}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        <Link href={`/referencias/${orden.referencia.id}`} className="hover:text-blue-600 hover:underline flex items-center gap-1.5">
                          <Shirt className="w-3.5 h-3.5 text-slate-400" />
                          {orden.referencia.codigo}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-700">{buenas}</span>
                        <span className="text-xs text-slate-400"> / {orden.cantidadTotal} uds</span>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {talleresNombres.length > 0 ? (
                            talleresNombres.map((tn, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                {tn}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {fmtFecha(fecha)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link 
                          href={`/ordenes/${orden.id}`} 
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          Ver orden <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
