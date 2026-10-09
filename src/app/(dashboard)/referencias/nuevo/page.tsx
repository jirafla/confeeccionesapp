"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createReferencia } from "@/app/actions/referenciaActions";
import { toast } from "sonner";

export default function NuevaReferencia() {
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/referencias" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Nueva Referencia</h1>
      </div>
      
      <form action={async (formData) => {
        setIsPending(true);
        const res = await createReferencia(formData);
        setIsPending(false);
        if (res?.error) toast.error(res.error);
      }} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        <div>
          <label htmlFor="codigo" className="block text-sm font-semibold text-slate-700 mb-2">Código o Nombre de Referencia <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="codigo" 
            id="codigo" 
            required 
            placeholder="Ej. REF-001 Camiseta Básica"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="precioBase" className="block text-sm font-semibold text-slate-700 mb-2">Precio Base de Confección ($) <span className="text-red-500">*</span></label>
          <input 
            type="number" 
            name="precioBase" 
            id="precioBase" 
            required 
            placeholder="Ej. 2500"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
          <p className="text-xs text-slate-500 mt-1">Este precio será el sugerido al asignar talleres.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label htmlFor="disenoArchivo" className="block text-sm font-semibold text-slate-700 mb-2">Archivo Diseño a Mano (Imagen)</label>
            <input 
              type="file" 
              name="disenoArchivo" 
              id="disenoArchivo" 
              accept="image/*"
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="optitexArchivo" className="block text-sm font-semibold text-slate-700 mb-2">Archivo Optitex (PDF/ZIP)</label>
            <input 
              type="file" 
              name="optitexArchivo" 
              id="optitexArchivo" 
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link 
            href="/referencias"
            className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Referencia"}
          </button>
        </div>
      </form>
    </div>
  );
}
