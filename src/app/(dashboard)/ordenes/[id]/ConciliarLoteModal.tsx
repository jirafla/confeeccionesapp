"use client";

import { useState } from "react";
import { conciliarAsignacion } from "@/app/actions/asignacionActions";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";

export default function ConciliarLoteModal({ asignacion }: { asignacion: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
      >
        <CheckCircle2 className="w-4 h-4" /> Recibir Producción
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-slate-900">Recibir del Taller</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              setIsPending(true);
              const res = await conciliarAsignacion(asignacion.id, formData);
              setIsPending(false);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Producción recibida correctamente.");
                setIsOpen(false);
              }
            }} className="p-5 space-y-4">
              
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
                <p className="text-sm text-blue-800 font-medium text-center">
                  Se asignaron <span className="font-bold">{asignacion.cantidadAsignada} prendas</span> a este taller.
                </p>
                <p className="text-xs text-blue-600 text-center mt-1">La suma de prendas buenas y reprocesos debe ser exacta.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Prendas Entregadas BUENAS <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="cantidadBuena" 
                  required 
                  defaultValue={asignacion.cantidadAsignada}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Prendas con Defectos (Reprocesos) <span className="text-red-500">*</span></label>
                <input 
                  type="number" 
                  name="reprocesos" 
                  required 
                  defaultValue={0}
                  className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
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
                  className="bg-indigo-600 text-white font-medium text-sm px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Validando..." : "Confirmar Recepción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
