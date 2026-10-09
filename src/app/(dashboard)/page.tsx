import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import DashboardCharts from "@/components/DashboardCharts";
import { requireAuth } from "@/lib/auth";

export default async function Home() {
  const { empresa } = await requireAuth();

  const [totalTalleres, lotes, lotesDemorados] = await Promise.all([
    prisma.taller.count({ where: { empresaId: empresa.id } }),
    prisma.lote.findMany({ where: { empresaId: empresa.id }, include: { abonos: true } }),
    prisma.lote.findMany({
      where: {
        empresaId: empresa.id,
        estado: { not: "ENTREGADO" },
        fechaEntregaPactada: { lt: new Date() }
      },
      include: { taller: true }
    })
  ]);

  const lotesActivos = lotes.filter(l => l.estado !== "ENTREGADO" && l.estado !== "CANCELADO").length;
  
  const totalPrendas = lotes.filter(l => l.estado !== "CANCELADO").reduce((acc, l) => acc + l.cantidad, 0);
  const prendasEntregadas = lotes.filter(l => l.estado === "ENTREGADO").reduce((acc, l) => acc + l.cantidad, 0);
  const porcentajeCompletado = totalPrendas === 0 ? 0 : Math.round((prendasEntregadas / totalPrendas) * 100);
  
  const dineroTotal = lotes.filter(l => l.estado !== "CANCELADO").reduce((acc, l) => acc + (l.cantidad * l.precioUnitario), 0);
  const dineroAbonado = lotes.filter(l => l.estado !== "CANCELADO").reduce((acc, l) => acc + l.abonos.reduce((sum, a) => sum + a.monto, 0), 0);

  // Data for charts
  const lotesPorEstado = [
    { name: "En Proceso", value: lotes.filter(l => l.estado === "EN_PROCESO").length, fill: "#3b82f6" },
    { name: "Demorado", value: lotes.filter(l => l.estado === "DEMORADO").length, fill: "#ef4444" },
    { name: "Entregado", value: lotes.filter(l => l.estado === "ENTREGADO").length, fill: "#22c55e" },
    { name: "Cancelado", value: lotes.filter(l => l.estado === "CANCELADO").length, fill: "#94a3b8" }
  ].filter(item => item.value > 0);

  const datosProduccion = [
    { name: "Finanzas", total: dineroTotal, pagado: dineroAbonado }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen de producción y estado de talleres.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/lotes/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Nuevo Lote
          </Link>
          <Link href="/talleres/nuevo" className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Plus className="w-4 h-4 text-gray-400" /> Nuevo Taller
          </Link>
        </div>
      </div>
      
      {/* KPIs en 2 columnas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Avance Total</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{porcentajeCompletado}%</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${porcentajeCompletado}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Prendas Entregadas</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {prendasEntregadas} <span className="text-sm font-normal text-gray-400">/ {totalPrendas}</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Lotes Activos</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{lotesActivos}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Talleres Activos</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{totalTalleres}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-green-600 uppercase">Total Abonado</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">${dineroAbonado.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-blue-600 uppercase">Deuda / Total Prod.</p>
          <p className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">
            <span className="text-red-500 mr-2">${(dineroTotal - dineroAbonado).toLocaleString()}</span>
            <span className="text-gray-400 font-normal text-sm">/ ${dineroTotal.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <DashboardCharts lotesPorEstado={lotesPorEstado} datosProduccion={datosProduccion} />

      {lotesDemorados.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
             <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
             Lotes Demorados ({lotesDemorados.length})
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <ul className="divide-y divide-gray-100">
              {lotesDemorados.map((lote) => (
                <li key={lote.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <Link href={`/lotes/${lote.id}`} className="block">
                      <p className="text-sm font-semibold text-gray-900">
                        Ref {lote.numeroLote} <span className="font-normal text-gray-500 mx-1">|</span> {lote.tipoPrenda}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                        Taller: {lote.taller.nombre}
                      </p>
                    </Link>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-50 text-red-600 border border-red-100">
                      Demorado (Pactado: {lote.fechaEntregaPactada.toLocaleDateString()})
                    </span>
                    <form action={async () => {
                      "use server";
                      await prisma.lote.update({
                        where: { id: lote.id },
                        data: { estado: "ENTREGADO" }
                      });
                    }}>
                       <button type="submit" className="text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                         Marcar Entregado ✓
                       </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
