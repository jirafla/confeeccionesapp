"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ModalPortal from "./ModalPortal";

export default function DeleteConfirmModal({ 
  action, 
  title, 
  description,
  buttonText = "Eliminar",
  iconOnly = false
}: { 
  action: (formData: FormData) => void | Promise<void>, 
  title: string, 
  description: string,
  buttonText?: string,
  iconOnly?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {iconOnly ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title={title}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          {buttonText}
        </button>
      )}

      {isOpen && (
        <ModalPortal>
          <div 
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">{description}</p>
              
              <form action={async (formData) => {
                try {
                  await action(formData);
                  toast.success("Eliminado exitosamente");
                  setIsOpen(false);
                } catch {
                  toast.error("Ocurrió un error al eliminar");
                }
              }} className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all shadow-sm cursor-pointer"
                >
                  Sí, eliminar
                </button>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
