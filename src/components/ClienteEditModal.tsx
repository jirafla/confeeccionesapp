"use client";

import { useState } from "react";
import { updateCliente } from "@/app/actions/clienteActions";
import { toast } from "sonner";
import { X, Edit2 } from "lucide-react";
import ModalPortal from "./ModalPortal";

export default function ClienteEditModal({ cliente }: { cliente: { id: string; nombre: string; telefono: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        title="Editar Cliente"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Editar Cliente</h3>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form action={async (formData) => {
                setIsPending(true);
                const res = await updateCliente(cliente.id, formData);
                setIsPending(false);
                if (res?.error) toast.error(res.error);
                else {
                  toast.success("Cliente actualizado.");
                  setIsOpen(false);
                }
              }} className="p-5 sm:p-6 space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre / Empresa <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="nombre" 
                    required 
                    defaultValue={cliente.nombre}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                  <input 
                    type="text" 
                    name="telefono" 
                    defaultValue={cliente.telefono || ""}
                    placeholder="Ej. 300 123 4567"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 font-semibold text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full sm:w-auto bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                  >
                    {isPending ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
