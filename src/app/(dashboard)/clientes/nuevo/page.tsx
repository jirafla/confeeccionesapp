import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createCliente } from "@/app/actions/clienteActions";

export default async function NuevoCliente() {
  const { empresa } = await requireAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <Link
          href="/clientes"
          title="Volver a clientes"
          aria-label="Volver a clientes"
          className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Volver</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Registrar Cliente</h1>
          <p className="text-sm text-slate-500">Agrega un nuevo cliente o marca comercial para asociarlo a tus órdenes.</p>
        </div>
      </div>
      
      <form action={async (formData) => {
        "use server";
        await createCliente(formData);
      }} className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Cliente / Empresa <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="nombre" 
            id="nombre" 
            required 
            placeholder="Ej. Comercializadora Moda"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-2">Teléfono / Contacto</label>
          <input 
            type="text" 
            name="telefono" 
            id="telefono" 
            placeholder="Ej. 300 123 4567"
            className="block w-full rounded-xl border border-slate-200 bg-slate-50 focus:bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Link 
            href="/clientes"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
          >
            Guardar Cliente
          </button>
        </div>
      </form>
    </div>
  );
}
