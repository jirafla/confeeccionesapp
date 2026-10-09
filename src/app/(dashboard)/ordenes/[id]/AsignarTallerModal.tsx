"use client";

import { useState } from "react";
import { createAsignacion } from "@/app/actions/asignacionActions";
import { toast } from "sonner";
import { Factory, X, Plus } from "lucide-react";

export default function AsignarTallerModal({
  ordenId,
  talleres,
  pendientes,
  isFirst = false
}: {
  ordenId: string;
  talleres: any[];
  pendientes: number;
  isFirst?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      {isFirst ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="mt-6 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <Factory className="w-5 h-5" /> Asignar Primer Taller
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Asignar Nuevo Lote
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-500" />
                Nueva Asignación a Taller
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full hidden sm:block">
                  Quedan {pendientes} por asignar
                </span>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form action={async (formData) => {
              setIsPending(true);
              const res = await createAsignacion(ordenId, formData);
              setIsPending(false);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Lote asignado al taller correctamente.");
                setIsOpen(false);
              }
            }} className="p-5 sm:p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Seleccionar Taller <span className="text-red-500">*</span></label>
                  <select name="tallerId" required className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2">
                    <option value="">Seleccione...</option>
                    {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cantidad a Asignar <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="cantidadAsignada" 
                    required 
                    max={pendientes}
                    defaultValue={pendientes}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Unitario Confección <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="precioUnitario" 
                    required 
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Envío</label>
                  <input 
                    type="date" 
                    name="fechaEnvio" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Entrega Pactada <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    name="fechaEntregaEsperada" 
                    required 
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Insumos Entregados (Opcional)</label>
                  <textarea 
                    name="insumosEntregados" 
                    rows={2}
                    placeholder="Ej. Hilos, marquillas, botones..."
                    className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2 resize-none" 
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 font-medium text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-blue-600 text-white font-medium text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Crear Lote de Asignación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
