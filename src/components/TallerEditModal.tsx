"use client";

import { useState } from "react";
import { updateTallerAction } from "@/app/actions/tallerActions";
import { toast } from "sonner";

export default function TallerEditModal({ taller }: { taller: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-sm"
      >
        Editar Información
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white sm:rounded-2xl rounded-t-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
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
          className="p-6 space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900">Editar Taller</h2>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div>
            <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
            <input type="text" name="nombre" id="nombre" defaultValue={taller.nombre} required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-1">Teléfono</label>
            <input type="text" name="telefono" id="telefono" defaultValue={taller.telefono || ""} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-semibold text-slate-700 mb-1">Dirección</label>
            <textarea name="direccion" id="direccion" rows={3} defaultValue={taller.direccion || ""} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="pt-4 mt-4">
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
