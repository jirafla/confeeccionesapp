"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, FileText, Upload } from "lucide-react";
import { createReferencia } from "@/app/actions/referenciaActions";
import { toast } from "sonner";
import TelasInputList, { TelaInputItem } from "@/components/TelasInputList";
import InsumosInputList, { InsumoInputItem } from "@/components/InsumosInputList";

export default function NuevaReferencia() {
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [optitexName, setOptitexName] = useState<string | null>(null);
  const [telas, setTelas] = useState<TelaInputItem[]>([
    { nombre: "Tela 1", tipo: "", promedio: "" }
  ]);
  const [insumos, setInsumos] = useState<InsumoInputItem[]>([]);

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <Link
          href="/referencias"
          title="Volver a referencias"
          aria-label="Volver a referencias"
          className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Volver</span>
        </Link>
        <div className="min-w-0">
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

          const insumosValidos = insumos
            .filter((i) => i.nombre.trim())
            .map((i) => ({
              nombre: i.nombre.trim(),
              tipo: i.tipo,
              unidadMedida: i.unidadMedida === "m" ? "m" : "cm",
              cantidad: typeof i.cantidad === "number" ? i.cantidad : parseFloat(i.cantidad) || 0,
              porColor: i.porColor !== false,
            }));

          formData.set("telasDetalles", JSON.stringify(telasValidas));
          formData.set("insumosDetalles", JSON.stringify(insumosValidos));

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

        {/* COMPONENTE DINÁMICO DE INSUMOS */}
        <div className="pt-2 border-t border-slate-100">
          <InsumosInputList insumos={insumos} onChange={setInsumos} />
        </div>

        {/* ARCHIVOS ADJUNTOS CON VISTA PREVIA */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Diseño / Foto de la Prenda
            </label>
            <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 transition-colors cursor-pointer overflow-hidden">
              {preview ? (
                <div className="w-full h-44 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Vista previa" className="w-full h-full object-contain bg-slate-100" />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Upload className="w-4 h-4" /> Cambiar imagen
                  </div>
                </div>
              ) : (
                <div className="py-7 px-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Subir foto o diseño de la referencia</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG, PNG o WEBP (toca para seleccionar)</p>
                </div>
              )}
              <input
                type="file"
                name="disenoArchivo"
                id="disenoArchivo"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setPreview(URL.createObjectURL(f));
                }}
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Archivo Optitex (PDF / ZIP / DXF)
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 px-4 py-3 cursor-pointer transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {optitexName ?? "Sin archivo Optitex seleccionado"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {optitexName ? "Listo para subir" : "PDF, ZIP, DXF o PDS"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 shrink-0">
                {optitexName ? "Cambiar" : "Elegir archivo"}
              </span>
              <input
                type="file"
                name="optitexArchivo"
                id="optitexArchivo"
                className="sr-only"
                onChange={(e) => setOptitexName(e.target.files?.[0]?.name ?? null)}
              />
            </label>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Link 
            href="/referencias"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Guardando..." : "Guardar Referencia"}
          </button>
        </div>
      </form>
    </div>
  );
}
