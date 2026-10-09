import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import { requireAuth } from "@/lib/auth";

export default async function Home() {
  const { empresa } = await requireAuth();

  const totalTalleres = await prisma.taller.count({ where: { empresaId: empresa.id } });
  
  const ordenes = await prisma.ordenProduccion.findMany({
    where: { empresaId: empresa.id },
    include: { asignaciones: true }
  });

  const totalPrendas = ordenes.reduce((acc, o) => acc + o.cantidadTotal, 0);
  
  const prendasAsignadas = ordenes.reduce((acc, o) => 
    acc + o.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0), 0);

  const prendasBuenas = ordenes.reduce((acc, o) => 
    acc + o.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0), 0);

  const porcentajeCompletado = totalPrendas === 0 ? 0 : Math.round((prendasBuenas / totalPrendas) * 100);
  const porcentajeAsignado = totalPrendas === 0 ? 0 : Math.round((prendasAsignadas / totalPrendas) * 100);

  const ordenesActivas = ordenes.filter(o => o.estado !== "ENTREGADO").length;

  // Data for charts
  const ordenesPorEstado = [
    { name: "Corte", value: ordenes.filter(o => o.estado === "CORTE").length, fill: "#f97316" }, // orange-500
    { name: "Confección", value: ordenes.filter(o => o.estado === "CONFECCION").length, fill: "#3b82f6" }, // blue-500
    { name: "Entregado", value: ordenes.filter(o => o.estado === "ENTREGADO").length, fill: "#22c55e" } // green-500
  ].filter(item => item.value > 0);

  const datosProduccion = [
    { name: "Prendas", total: totalPrendas, pagado: prendasBuenas }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de producción y estado de talleres.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ordenes/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Nueva Orden
          </Link>
          <Link href="/talleres" className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Ver Talleres
          </Link>
        </div>
      </div>
      
      {/* KPIs en 2 columnas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Avance (Buenas / Total)</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{porcentajeCompletado}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${porcentajeCompletado}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Prendas Asignadas a Talleres</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {prendasAsignadas} <span className="text-sm font-normal text-gray-400">/ {totalPrendas}</span>
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${porcentajeAsignado}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Órdenes Activas</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{ordenesActivas}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Talleres Registrados</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalTalleres}</p>
        </div>
      </div>

      <DashboardCharts lotesPorEstado={ordenesPorEstado} datosProduccion={datosProduccion} />
    </div>
  );
}
