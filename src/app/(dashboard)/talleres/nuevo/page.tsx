import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireAuth } from "@/lib/auth";
import TallerAtributosFields from "@/components/TallerAtributosFields";

export default async function NuevoTaller() {
  const { empresa } = await requireAuth();

  async function createTaller(formData: FormData) {
    "use server";
    const nombre = formData.get("nombre") as string;
    const telefono = formData.get("telefono") as string;
    const direccion = formData.get("direccion") as string;
    const destacado = formData.get("destacado") === "true";
    const capacidadRaw = (formData.get("capacidad") as string) || "";
    const capacidad = ["BAJA", "MEDIA", "ALTA"].includes(capacidadRaw) ? capacidadRaw : null;

    if (!nombre) return;

    await prisma.taller.create({
      data: {
        nombre,
        telefono,
        direccion,
        destacado,
        capacidad,
        empresaId: empresa.id
      }
    });

    redirect("/talleres");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Link
          href="/talleres"
          title="Volver a talleres"
          aria-label="Volver a talleres"
          className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Volver</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Registrar Taller</h1>
      </div>
      
      <form action={createTaller} className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
        <div>
          <label htmlFor="nombre" className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Taller <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="nombre" 
            id="nombre" 
            required 
            placeholder="Ej. Confecciones La Estrella"
            className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-2">Teléfono</label>
          <input 
            type="text" 
            name="telefono" 
            id="telefono" 
            placeholder="Ej. +57 300 123 4567"
            className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="direccion" className="block text-sm font-semibold text-slate-700 mb-2">Dirección</label>
          <textarea 
            name="direccion" 
            id="direccion" 
            rows={2}
            placeholder="Dirección completa del taller"
            className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
          />
        </div>

        <TallerAtributosFields />

        <div className="pt-5 mt-5 border-t border-slate-100 flex justify-end gap-3">
          <Link 
            href="/talleres"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            Guardar Taller
          </button>
        </div>
      </form>
    </div>
  );
}
