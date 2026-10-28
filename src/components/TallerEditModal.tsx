"use client";

import { useState } from "react";
import { updateTallerAction } from "@/app/actions/tallerActions";
import { toast } from "sonner";
import { X } from "lucide-react";
import TallerAtributosFields from "./TallerAtributosFields";
import ModalPortal from "./ModalPortal";

export default function TallerEditModal({ taller }: { taller: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
      >
        Editar Información
      </button>

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white flex justify-between items-center p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Editar Taller</h2>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                action={async (formData) => {
                  try {
                    await updateTallerAction(taller.id, formData);
                    toast.success("Taller actualizado exitosamente");
                    setIsOpen(false);
                  } catch {
                    toast.error("Error al actualizar el taller");
                  }
                }} 
                className="p-5 sm:p-6 space-y-4"
              >
                <div>
                  <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
                  <input type="text" name="nombre" id="nombre" defaultValue={taller.nombre} required className="block w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-1.5">Teléfono</label>
                  <input type="text" name="telefono" id="telefono" defaultValue={taller.telefono || ""} className="block w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                </div>

                <div>
                  <label htmlFor="direccion" className="block text-sm font-semibold text-slate-700 mb-1.5">Dirección</label>
                  <textarea name="direccion" id="direccion" rows={2} defaultValue={taller.direccion || ""} className="block w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all" />
                </div>

                <TallerAtributosFields
                  defaultDestacado={Boolean(taller.destacado)}
                  defaultCapacidad={taller.capacidad}
                />

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto px-4 py-2.5 font-semibold text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer">
                    Guardar Cambios
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
