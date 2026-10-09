'use client'

import { useState } from "react";
import { toast } from "sonner";
import { updateEmpresaAction } from "./actions";

export default function UpdateEmpresaForm({ empresa }: { empresa: any }) {
  const [isPending, setIsPending] = useState(false);

  return (
    <form action={async (formData) => {
      setIsPending(true);
      const res = await updateEmpresaAction(formData, empresa.id);
      setIsPending(false);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Empresa actualizada");
      }
    }} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
        <input 
          type="text" 
          name="nombre" 
          defaultValue={empresa.nombre}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">NIT / Documento</label>
        <input 
          type="text" 
          name="nit" 
          defaultValue={empresa.nit || ""}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none" 
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm disabled:opacity-50"
      >
        {isPending ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}
