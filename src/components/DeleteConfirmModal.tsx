"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

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

  if (!isOpen) {
    if (iconOnly) {
      return (
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title={title}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      );
    }
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        {buttonText}
      </button>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        
        <form action={async (formData) => {
          try {
            await action(formData);
            toast.success("Eliminado exitosamente");
          } catch {
            toast.error("Ocurrió un error al eliminar");
          }
        }} className="flex gap-3">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all shadow-sm"
          >
            Sí, eliminar
          </button>
        </form>
      </div>
    </>
  );
}
