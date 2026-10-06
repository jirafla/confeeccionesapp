import { prisma } from "@/lib/prisma";
import Link from "next/link";

import SearchInput from "@/components/SearchInput";
import LotesFilter from "@/components/LotesFilter";
import EmptyState from "@/components/EmptyState";

export default async function Lotes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const query = await searchParams;
  const q = query.q || "";
  const estado = query.estado || "";

  const lotes = await prisma.lote.findMany({
    where: {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Lotes de Producción</h1>
        <Link 
          href="/lotes/nuevo" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center w-full sm:w-auto shrink-0"
        >
          + Nuevo Lote
        </Link>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Buscar por referencia, prenda o taller..." />
        </div>
        <LotesFilter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {lotes.map((lote) => (
          <div key={lote.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-start gap-4">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Ref {lote.numeroLote}</p>
                <h2 className="text-lg font-bold text-slate-900 mt-1">{lote.tipoPrenda}</h2>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md 
                  ${lote.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 
                    lote.estado === 'CANCELADO' ? 'bg-slate-200 text-slate-600' :
                    lote.estado === 'DEMORADO' ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'}`}>
                  {lote.estado.replace("_", " ")}
                </span>
                {lote.pagado && (
                  <span className="px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase rounded-md bg-blue-50 text-blue-700">
                    PAGADO
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-5 flex-grow grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 font-medium text-xs">Taller</p>
                <p className="text-slate-900 font-medium truncate mt-0.5">{lote.taller.nombre}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium text-xs">Cant. / Precio</p>
                <p className="text-slate-900 font-medium mt-0.5">{lote.cantidad} <span className="text-slate-400 font-normal">x</span> ${lote.precioUnitario}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium text-xs">Fecha Inicio</p>
                <p className="text-slate-900 font-medium mt-0.5">{lote.fechaInicio.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium text-xs">Entrega</p>
                <p className="text-slate-900 font-medium mt-0.5">{lote.fechaEntregaPactada.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-gray-100 mt-auto">
               <Link href={`/lotes/${lote.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center justify-center gap-1 w-full">
                  Gestionar Lote <span aria-hidden="true">&rarr;</span>
               </Link>
            </div>
          </div>
        ))}
        
        {lotes.length === 0 && (
          <div className="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-900 font-semibold">No se encontraron lotes</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              {q ? "Prueba buscar con otro nombre, número o código." : "Aún no hay lotes registrados en el sistema."}
            </p>
            {!q && <Link href="/lotes/nuevo" className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">Crear el primer lote</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
