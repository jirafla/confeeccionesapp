'use client'

import { useState } from "react";
import { toast } from "sonner";
import { updateEmpresaAction } from "./actions";

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nombre</label>
        <input type="text" name="nombre" defaultValue={empresa.nombre} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">NIT / Documento</label>
        <input type="text" name="nit" defaultValue={empresa.nit || ""} className={inputCls} />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
