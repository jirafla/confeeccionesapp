import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users, Search } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";

export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";

  const clientes = await prisma.cliente.findMany({
    where: {
      empresaId: empresa.id,
      ...(q ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { telefono: { contains: q, mode: 'insensitive' } }
        ]
      } : {})
    },
    include: {
      _count: {
        select: { ordenes: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clientes</h1>
        <Link 
          href="/clientes/nuevo" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center w-full sm:w-auto shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Cliente
        </Link>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <form className="flex-1" method="GET">
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o teléfono..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {clientes.map((cliente) => (
          <div key={cliente.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-slate-900 truncate pr-2">{cliente.nombre}</h2>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 whitespace-nowrap">
                {cliente._count.ordenes} {cliente._count.ordenes === 1 ? 'orden' : 'órdenes'}
              </span>
            </div>
            
            <div className="space-y-2 mt-auto text-sm text-slate-500">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {cliente.telefono || "Sin teléfono"}
              </p>
            </div>
          </div>
        ))}
        
        {clientes.length === 0 && (
          <div className="col-span-full">
            <EmptyState 
              title="No hay clientes"
              description={q ? "No encontramos clientes con esa búsqueda." : "Aún no tienes clientes registrados."}
              actionLabel="Registrar Cliente"
              actionHref="/clientes/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
