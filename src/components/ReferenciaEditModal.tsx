"use client";

import { useState } from "react";
import { updateReferencia } from "@/app/actions/referenciaActions";
import { toast } from "sonner";
import { X, Edit2 } from "lucide-react";

export default function ReferenciaEditModal({ referencia }: { referencia: { id: string; codigo: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Editar Referencia"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-slate-900">Editar Referencia</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              setIsPending(true);
              const res = await updateReferencia(referencia.id, formData);
              setIsPending(false);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Referencia actualizada.");
                setIsOpen(false);
              }
            }} className="p-5 sm:p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Código de Referencia <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="codigo" 
                  required 
                  defaultValue={referencia.codigo}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
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
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
