import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, FileImage, FileText } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";

export default async function Referencias({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";

  const referencias = await prisma.referencia.findMany({
    where: {
      empresaId: empresa.id,
      ...(q ? {
        codigo: { contains: q, mode: 'insensitive' }
      } : {})
    },
    include: {
      _count: {
        select: { ordenes: true }
      }
    },
    orderBy: { codigo: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Catálogo de Referencias</h1>
        <Link 
          href="/referencias/nuevo" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center w-full sm:w-auto shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Referencia
        </Link>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <form className="flex-1" method="GET">
          <input 
            type="text" 
            name="q"
            defaultValue={q}
            placeholder="Buscar por código..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referencias.map((ref) => (
          <div key={ref.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all flex flex-col">
            <div className="aspect-video bg-slate-50 relative flex items-center justify-center border-b border-gray-100">
              {ref.disenoArchivoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ref.disenoArchivoUrl} alt={ref.codigo} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <FileImage className="w-10 h-10 mb-2" />
                  <span className="text-xs font-medium">Sin diseño a mano</span>
                </div>
              )}
              
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                ${ref.precioBase.toLocaleString()}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 mb-2">{ref.codigo}</h2>
              
              <div className="mt-auto pt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {ref._count.ordenes} órdenes
                </span>
                
                {ref.optitexArchivoUrl ? (
                  <a href={ref.optitexArchivoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors">
                    <FileText className="w-3.5 h-3.5" /> Optitex
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Sin archivo optitex</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {referencias.length === 0 && (
          <div className="col-span-full">
            <EmptyState 
              title="Sin referencias"
              description={q ? "No encontramos referencias con esa búsqueda." : "Añade tu primera referencia al catálogo."}
              actionLabel="Crear Referencia"
              actionHref="/referencias/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
