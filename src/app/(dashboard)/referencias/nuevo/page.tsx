"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createReferencia } from "@/app/actions/referenciaActions";
import { toast } from "sonner";
import TelasInputList, { TelaInputItem } from "@/components/TelasInputList";

export default function NuevaReferencia() {
  const [isPending, setIsPending] = useState(false);
  const [telas, setTelas] = useState<TelaInputItem[]>([
    { nombre: "Tela 1", tipo: "", promedio: "" }
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/referencias" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nueva Referencia</h1>
          <p className="text-sm text-slate-500">Registra el código, nombre de prenda, telas requeridas y archivos técnicos.</p>
        </div>
      </div>
      
      <form 
        action={async (formData) => {
          setIsPending(true);

          // Serializar las telas que tengan al menos tipo o promedio
          const telasValidas = telas
            .filter((t) => t.tipo.trim() || t.promedio !== "")
            .map((t) => ({
              nombre: t.nombre.trim() || "Tela",
              tipo: t.tipo.trim(),
              promedio: typeof t.promedio === "number" ? t.promedio : parseFloat(t.promedio) || 0
            }));

          formData.set("telasDetalles", JSON.stringify(telasValidas));

          const res = await createReferencia(formData);
          setIsPending(false);
          if (res?.error) toast.error(res.error);
        }} 
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="codigo" className="block text-sm font-semibold text-slate-700 mb-2">
              Código de Referencia <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="codigo" 
              id="codigo" 
              required 
              placeholder="Ej. 5370 o REF-101"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="nombrePrenda" className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre de la Prenda
            </label>
            <input 
              type="text" 
              name="nombrePrenda" 
              id="nombrePrenda" 
              placeholder="Ej. Vestido con cuello, Blusa kimono..."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* COMPONENTE DINÁMICO DE TELAS */}
        <div className="pt-2 border-t border-slate-100">
          <TelasInputList telas={telas} onChange={setTelas} />
        </div>

        {/* ARCHIVOS ADJUNTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label htmlFor="disenoArchivo" className="block text-sm font-semibold text-slate-700 mb-2">
              Diseño a Mano / Foto (Imagen)
            </label>
            <input 
              type="file" 
              name="disenoArchivo" 
              id="disenoArchivo" 
              accept="image/*"
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="optitexArchivo" className="block text-sm font-semibold text-slate-700 mb-2">
              Archivo Optitex (PDF/ZIP/DXF)
            </label>
            <input 
              type="file" 
              name="optitexArchivo" 
              id="optitexArchivo" 
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-colors"
            />
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-3">
          <Link 
            href="/referencias"
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar Referencia"}
          </button>
        </div>
      </form>
    </div>
  );
}
