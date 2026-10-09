import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createOrden } from "@/app/actions/ordenesActions";
import EmptyState from "@/components/EmptyState";

export default async function NuevaOrden() {
  const { empresa } = await requireAuth();

  const [clientes, referencias] = await Promise.all([
    prisma.cliente.findMany({ where: { empresaId: empresa.id }, orderBy: { nombre: 'asc' } }),
    prisma.referencia.findMany({ where: { empresaId: empresa.id }, orderBy: { codigo: 'asc' } })
  ]);

  if (clientes.length === 0 || referencias.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <EmptyState
          title="Faltan datos previos"
          description="Para crear una orden, necesitas tener al menos un Cliente y una Referencia en el sistema."
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/ordenes" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Crear Orden</h1>
      </div>
      
      <form action={createOrden} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clienteId" className="block text-sm font-semibold text-slate-700 mb-2">Cliente <span className="text-red-500">*</span></label>
            <select 
              name="clienteId" 
              id="clienteId" 
              required 
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="referenciaId" className="block text-sm font-semibold text-slate-700 mb-2">Referencia (Prenda) <span className="text-red-500">*</span></label>
            <select 
              name="referenciaId" 
              id="referenciaId" 
              required 
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Selecciona una referencia</option>
              {referencias.map(r => <option key={r.id} value={r.id}>{r.codigo}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="cantidadTotal" className="block text-sm font-semibold text-slate-700 mb-2">Cantidad Total a Producir <span className="text-red-500">*</span></label>
          <input 
            type="number" 
            name="cantidadTotal" 
            id="cantidadTotal" 
            required 
            placeholder="Ej. 1000"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="coloresDetalles" className="block text-sm font-semibold text-slate-700 mb-2">Colores, Tallas y Detalles</label>
          <textarea 
            name="coloresDetalles" 
            id="coloresDetalles" 
            rows={4}
            placeholder="Ej. 500 negras (M, L), 500 blancas (S, M). Empaque individual."
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
          ></textarea>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link 
            href="/ordenes"
            className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            Crear Orden
          </button>
        </div>
      </form>
    </div>
  );
}
