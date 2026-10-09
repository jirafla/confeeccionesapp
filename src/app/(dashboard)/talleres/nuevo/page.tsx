import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import { requireAuth } from "@/lib/auth";

export default async function NuevoTaller() {
  const { empresa } = await requireAuth();

  async function createTaller(formData: FormData) {
    "use server";
    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;
    const direccion = formData.get("direccion") as string;

    if (!nombre) return;

    await prisma.taller.create({
      data: {
        nombre,
        telefono,
        direccion,
        empresaId: empresa.id
      }
    });

    redirect("/talleres");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/talleres" className="text-slate-400 hover:text-slate-900 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Registrar Taller</h1>
      </div>
      
      <form action={createTaller} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Taller <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="nombre" 
            id="nombre" 
            required 
            placeholder="Ej. Confecciones La Estrella"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
          <input 
            type="text" 
            name="telefono" 
            id="telefono" 
            placeholder="Ej. +57 300 123 4567"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-semibold text-slate-700 mb-2">Dirección</label>
          <textarea 
            name="direccion" 
            id="direccion" 
            rows={3}
            placeholder="Dirección completa del taller"
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
          />
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link 
            href="/talleres"
            className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm"
          >
            Guardar Taller
          </button>
        </div>
      </form>
    </div>
  );
}
