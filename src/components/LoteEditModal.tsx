"use client";

import { useState } from "react";
import { updateLoteCompletoAction } from "@/app/actions/loteActions";
import { toast } from "sonner";

export default function LoteEditModal({ lote, talleres }: { lote: any, talleres: any[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        Editar Lote
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        <form 
          action={async (formData) => {
            try {
              await updateLoteCompletoAction(lote.id, formData);
              toast.success("Lote actualizado correctamente");
              setIsOpen(false);
            } catch (error) {
              toast.error("Error al actualizar el lote");
            }
          }} 
          className="p-6 sm:p-8 space-y-6"
        >
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Editar Información del Lote</h2>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Referencia</label>
              <input type="text" name="referencia" defaultValue={lote.numeroLote} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipo de Prenda</label>
              <input type="text" name="tipoPrenda" defaultValue={lote.tipoPrenda} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Cantidad</label>
              <input type="number" name="cantidad" defaultValue={lote.cantidad} required min="1" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Precio Unitario ($)</label>
              <input type="number" step="0.01" name="precioUnitario" defaultValue={lote.precioUnitario} required min="0" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha de Inicio</label>
              <input type="date" name="fechaInicio" defaultValue={new Date(lote.fechaInicio).toISOString().split('T')[0]} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fecha Pactada</label>
              <input type="date" name="fechaEntregaPactada" defaultValue={new Date(lote.fechaEntregaPactada).toISOString().split('T')[0]} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Taller Asignado</label>
            <select name="tallerId" defaultValue={lote.tallerId} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500">
              {talleres.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Insumos Entregados</label>
            <textarea name="insumosEntregados" rows={2} defaultValue={lote.insumosEntregados || ""} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="pt-2">
            <button type="submit" className="w-full bg-slate-900 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
