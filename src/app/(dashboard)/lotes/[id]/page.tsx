import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoteEditModal from "@/components/LoteEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import AbonosManager from "@/components/AbonosManager";

import { requireAuth } from "@/lib/auth";

export default async function DetalleLote({ params }: { params: { id: string } }) {
  const { empresa } = await requireAuth();
  const { id } = await params;
  
  const lote = await prisma.lote.findUnique({
    where: { id, empresaId: empresa.id },
    include: { taller: true, abonos: { orderBy: { fecha: 'desc' } } }
  });

  if (!lote) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 font-medium">Lote no encontrado o no tienes permiso.</p>
        <Link href="/lotes" className="text-blue-600 hover:underline mt-2 inline-block">Volver a Lotes</Link>
      </div>
    );
  }

  const talleres = await prisma.taller.findMany({ where: { empresaId: empresa.id }, orderBy: { nombre: 'asc' } });

  async function updateLote(formData: FormData) {
    "use server";
    
    await prisma.lote.update({
      where: { id },
      data: {
        estado: formData.get("estado") as string,
      }
    });

    redirect(`/lotes/${id}`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/lotes" className="text-slate-400 hover:text-slate-900 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Ref {lote.numeroLote}
        </h1>
        <span className={`ml-2 px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-lg 
          ${lote.estado === 'ENTREGADO' ? 'bg-green-100 text-green-700' : 
            lote.estado === 'CANCELADO' ? 'bg-slate-200 text-slate-600' :
            lote.estado === 'DEMORADO' ? 'bg-red-100 text-red-700' : 
            'bg-amber-100 text-amber-700'}`}>
          {lote.estado.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda - Acciones */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{lote.tipoPrenda}</h2>
            
            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <p className="flex items-center gap-3">
                <span className="font-semibold w-24">Taller:</span>
                <Link href={`/talleres/${lote.tallerId}`} className="text-blue-600 hover:underline font-medium">{lote.taller.nombre}</Link>
              </p>
              <p className="flex items-center gap-3">
                <span className="font-semibold w-24">Cantidad:</span>
                {lote.cantidad} uds
              </p>
              <p className="flex items-center gap-3">
                <span className="font-semibold w-24">Precio Un:</span>
                ${lote.precioUnitario}
              </p>
              <p className="flex items-center gap-3">
                <span className="font-semibold w-24">Total:</span>
                ${(lote.cantidad * lote.precioUnitario).toLocaleString()}
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <LoteEditModal lote={lote} talleres={talleres} />
              <DeleteConfirmModal 
                action={async () => {
                  "use server";
                  await prisma.lote.delete({ where: { id } });
                  redirect("/lotes");
                }}
                title="¿Eliminar lote permanentemente?"
                description={`Estás a punto de eliminar el lote Ref ${lote.numeroLote}. Esta acción es irreversible.`}
                buttonText="Eliminar Lote"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha - Detalles y Estados */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha de Inicio</h3>
              <p className="text-base text-slate-900">{lote.fechaInicio.toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fecha Pactada</h3>
              <p className="text-base font-medium text-slate-900">{lote.fechaEntregaPactada.toLocaleDateString()}</p>
            </div>
            <div className="col-span-1 sm:col-span-2 border-t border-gray-50 pt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Insumos Entregados</h3>
              {lote.insumosEntregados ? (
                <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-gray-100">{lote.insumosEntregados}</p>
              ) : (
                <p className="text-slate-400 italic">Ninguno registrado</p>
              )}
            </div>
          </div>

          <form action={updateLote} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">Actualizar Estado</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <div>
                <label htmlFor="estado" className="block text-sm font-semibold text-slate-700 mb-2">Estado de Producción</label>
                <select name="estado" id="estado" defaultValue={lote.estado} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  <option value="EN_PROCESO">En Proceso</option>
                  <option value="DEMORADO">Demorado</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  Guardar Estado
                </button>
              </div>
            </div>
          </form>

          <AbonosManager 
            loteId={lote.id} 
            abonos={lote.abonos} 
            totalPagar={lote.cantidad * lote.precioUnitario} 
          />
        </div>
      </div>
    </div>
  );
}
