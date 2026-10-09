import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DownloadReport from "@/components/DownloadReport";
import SearchInput from "@/components/SearchInput";
import LotesFilter from "@/components/LotesFilter";
import EmptyState from "@/components/EmptyState";

import { requireAuth } from "@/lib/auth";

export default async function Reportes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";
  const estado = query.estado || "";

  const lotes = await prisma.lote.findMany({
    where: {
      empresaId: empresa.id,
      AND: [
        q ? {
          OR: [
            { numeroLote: { contains: q } },
            { tipoPrenda: { contains: q } },
            { taller: { nombre: { contains: q } } }
          ]
        } : {},
        estado ? { estado } : {}
      ]
    },
    include: { taller: true },
    orderBy: { createdAt: 'desc' }
  });

  const totalPrendasEntregadas = lotes
    .filter(l => l.estado === "ENTREGADO")
    .reduce((acc, l) => acc + l.cantidad, 0);

  const totalPrendasEnProceso = lotes
    .filter(l => l.estado !== "ENTREGADO" && l.estado !== "CANCELADO")
    .reduce((acc, l) => acc + l.cantidad, 0);

  // Prepare data for download
  const downloadData = lotes.map(l => ({
    lote: l.numeroLote,
    prenda: l.tipoPrenda,
    taller: l.taller.nombre,
    cantidad: l.cantidad,
    precioUnitario: l.precioUnitario,
    total: l.cantidad * l.precioUnitario,
    estado: l.estado.replace("_", " "),
    pago: l.pagado ? "PAGADO" : "PENDIENTE",
    fechaPactada: l.fechaEntregaPactada.toLocaleDateString()
  }));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reporte de Producción</h1>
        <DownloadReport data={downloadData} />
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Buscar por referencia, prenda o taller..." />
        </div>
        <LotesFilter />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-green-800 font-semibold text-sm uppercase tracking-wider">Total Entregadas</h2>
          <p className="text-4xl font-bold text-green-900 mt-3">{totalPrendasEntregadas} <span className="text-lg font-normal text-green-700">prendas</span></p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-2xl shadow-sm">
          <h2 className="text-amber-800 font-semibold text-sm uppercase tracking-wider">En Proceso / Demora</h2>
          <p className="text-4xl font-bold text-amber-900 mt-3">{totalPrendasEnProceso} <span className="text-lg font-normal text-amber-700">prendas</span></p>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-2xl border border-gray-100 overflow-hidden -mx-4 sm:mx-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref / Prenda</th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Taller</th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Total ($)</th>
                <th scope="col" className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {lotes.map((lote) => (
                <tr key={lote.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <Link href={`/lotes/${lote.id}`} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                        Ref {lote.numeroLote}
                      </Link>
                      <span className="text-sm text-slate-500">{lote.tipoPrenda}</span>
                      <span className="text-xs text-slate-400 sm:hidden mt-1">{lote.taller.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium hidden sm:table-cell">
                    {lote.taller.nombre}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold text-right">
                    {lote.cantidad}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-600 text-right hidden sm:table-cell">
                    ${(lote.cantidad * lote.precioUnitario).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] sm:text-xs font-bold uppercase tracking-wide rounded-md 
                        ${lote.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 
                          lote.estado === 'CANCELADO' ? 'bg-slate-200 text-slate-600' :
                          lote.estado === 'DEMORADO' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}`}>
                        {lote.estado.replace("_", " ")}
                      </span>
                      {lote.pagado && (
                        <span className="px-2.5 py-0.5 inline-flex text-[10px] font-bold uppercase tracking-wide rounded text-blue-600 bg-blue-50">
                          Pagado
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lotes.length === 0 && (
          <EmptyState 
            title="Sin resultados" 
            description="No se encontraron lotes que coincidan con los filtros aplicados." 
            actionLabel="Nuevo Lote" 
            actionHref="/lotes/nuevo" 
          />
        )}
      </div>
    </div>
  );
}
