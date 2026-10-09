import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Shirt, FileText, Download } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";
import ReferenciaEditModal from "@/components/ReferenciaEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { downloadUrl } from "@/lib/ordenes";

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
      ...(q ? { codigo: { contains: q, mode: 'insensitive' } } : {})
    },
    include: {
      _count: { select: { ordenes: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Referencias</h1>
          <p className="text-sm text-slate-500">{referencias.length} {referencias.length === 1 ? "referencia" : "referencias"}</p>
        </div>
        <Link
          href="/referencias/nuevo"
          className="bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center shrink-0 gap-2"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nueva Referencia</span><span className="sm:hidden">Nueva</span>
        </Link>
      </div>

      <form method="GET" className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/70 flex items-center gap-2 px-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por código..."
          className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none py-2"
        />
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {referencias.map((ref) => (
          <div key={ref.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all flex flex-col group">
            <Link href={`/referencias/${ref.id}`} className="block">
              <div className="aspect-square bg-slate-50 relative flex items-center justify-center overflow-hidden">
                {ref.disenoArchivoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={ref.disenoArchivoUrl} alt={ref.codigo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="text-slate-300 flex flex-col items-center">
                    <Shirt className="w-10 h-10 mb-1" />
                    <span className="text-xs font-medium">Sin imagen</span>
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-700 shadow-sm">
                  {ref._count.ordenes} {ref._count.ordenes === 1 ? 'orden' : 'órdenes'}
                </span>
              </div>
              <div className="px-3 sm:px-4 pt-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{ref.codigo}</h2>
              </div>
            </Link>

            <div className="mt-auto flex items-center justify-between gap-1 px-2 sm:px-3 py-2">
              {ref.optitexArchivoUrl ? (
                <a
                  href={downloadUrl(ref.optitexArchivoUrl)}
                  className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-semibold hover:bg-indigo-50 px-2 py-1.5 rounded-lg transition-colors"
                  title="Descargar Optitex"
                >
                  <Download className="w-3.5 h-3.5" /> Optitex
                </a>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-300 px-2"><FileText className="w-3.5 h-3.5" /> —</span>
              )}

              <div className="flex items-center">
                <ReferenciaEditModal referencia={ref} />
                {ref._count.ordenes === 0 && (
                  <DeleteConfirmModal
                    action={async () => {
                      "use server";
                      const { deleteReferencia } = await import("@/app/actions/referenciaActions");
                      await deleteReferencia(ref.id);
                    }}
                    title="¿Eliminar referencia?"
                    description={`Estás a punto de eliminar la referencia ${ref.codigo}.`}
                    buttonText="Eliminar"
                    iconOnly={true}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {referencias.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="Sin referencias"
              description={q ? "No encontramos referencias con esa búsqueda." : "Añade tu primera referencia."}
              actionLabel="Crear Referencia"
              actionHref="/referencias/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
