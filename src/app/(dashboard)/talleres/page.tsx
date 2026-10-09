import { prisma } from "@/lib/prisma";
import Link from "next/link";

import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";

import { requireAuth } from "@/lib/auth";

export default async function Talleres({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";

  const talleres = await prisma.taller.findMany({
    where: {
      empresaId: empresa.id,
      ...(q ? {
        OR: [
          { nombre: { contains: q } },
          { telefono: { contains: q } }
        ]
      } : {})
    },
    include: {
      _count: {
        select: { lotes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Talleres de Confección</h1>
        <Link 
          href="/talleres/nuevo" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center w-full sm:w-auto shrink-0"
        >
          + Registrar Taller
        </Link>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <SearchInput placeholder="Buscar por nombre o teléfono..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {talleres.map((taller) => (
          <Link href={`/talleres/${taller.id}`} key={taller.id} className="group">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-bold text-slate-900 truncate pr-2 group-hover:text-blue-600 transition-colors">{taller.nombre}</h2>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 whitespace-nowrap">
                  {taller._count.lotes} {taller._count.lotes === 1 ? 'lote' : 'lotes'}
                </span>
              </div>
              
              <div className="space-y-2 mt-auto text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {taller.telefono || "Sin teléfono"}
                </p>
                <p className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="line-clamp-2">{taller.direccion || "Sin dirección"}</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
        
        {talleres.length === 0 && (
          <div className="col-span-full py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 border-dashed flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-slate-900 font-semibold">No se encontraron talleres</p>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              {q ? "Prueba buscar con otro nombre o teléfono." : "Aún no hay talleres registrados en el sistema."}
            </p>
            {!q && <Link href="/talleres/nuevo" className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm">Registrar el primer taller</Link>}
          </div>
        )}
      </div>
    </div>
  );
}
