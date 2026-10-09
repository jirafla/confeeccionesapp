"use client";

import { useState } from "react";
import { updateReferencia } from "@/app/actions/referenciaActions";
import { toast } from "sonner";
import { X, Edit2, ImageIcon, FileText, Upload } from "lucide-react";
import TelasInputList, { TelaInputItem } from "./TelasInputList";
import { parseTelas } from "@/lib/ordenes";

type Ref = { 
  id: string; 
  codigo: string; 
  nombrePrenda?: string | null;
  telasDetalles?: string | null;
  disenoArchivoUrl: string | null; 
  optitexArchivoUrl: string | null;
};

export default function ReferenciaEditModal({ referencia, variant = "icon" }: { referencia: Ref; variant?: "icon" | "button" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [optitexName, setOptitexName] = useState<string | null>(null);

  const initialTelasParsed = parseTelas(referencia.telasDetalles);
  const [telas, setTelas] = useState<TelaInputItem[]>(
    initialTelasParsed.length > 0
      ? initialTelasParsed.map((t) => ({ nombre: t.nombre, tipo: t.tipo, promedio: t.promedio }))
      : [{ nombre: "Tela 1", tipo: "", promedio: "" }]
  );

  const cerrar = () => {
    setIsOpen(false);
    setPreview(null);
    setOptitexName(null);
  };

  const imagen = preview ?? referencia.disenoArchivoUrl;

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar referencia"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Edit2 className="w-4 h-4" /> Editar
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={cerrar}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white flex justify-between items-center p-5 border-b border-slate-100 z-10">
              <h3 className="font-bold text-lg text-slate-900">Editar referencia</h3>
              <button onClick={cerrar} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                setIsPending(true);

                const telasValidas = telas
                  .filter((t) => t.tipo.trim() || t.promedio !== "")
                  .map((t) => ({
                    nombre: t.nombre.trim() || "Tela",
                    tipo: t.tipo.trim(),
                    promedio: typeof t.promedio === "number" ? t.promedio : parseFloat(t.promedio) || 0
                  }));

                formData.set("telasDetalles", JSON.stringify(telasValidas));

                const res = await updateReferencia(referencia.id, formData);
                setIsPending(false);
                if (res?.error) toast.error(res.error);
                else {
                  toast.success("Referencia actualizada.");
                  cerrar();
                }
              }}
              className="p-5 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Código de referencia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    required
                    defaultValue={referencia.codigo}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Nombre de la prenda
                  </label>
                  <input
                    type="text"
                    name="nombrePrenda"
                    defaultValue={referencia.nombrePrenda || ""}
                    placeholder="Ej. Vestido con cuello"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Telas */}
              <div className="border-t border-slate-100 pt-2">
                <TelasInputList telas={telas} onChange={setTelas} />
              </div>

              {/* Imagen */}
              <div className="border-t border-slate-100 pt-3">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Imagen del diseño</label>
                <label className="group relative flex items-center gap-4 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-colors">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
                    {imagen ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imagen} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-blue-600 flex items-center gap-1.5">
                      <Upload className="w-4 h-4" /> {referencia.disenoArchivoUrl ? "Cambiar imagen" : "Subir imagen"}
                    </p>
                    <p className="text-xs text-slate-500">{preview ? "Nueva imagen seleccionada" : "JPG, PNG o WEBP"}</p>
                  </div>
                  <input
                    type="file"
                    name="disenoArchivo"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setPreview(f ? URL.createObjectURL(f) : null);
                    }}
                  />
                </label>
              </div>

              {/* Optitex */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Archivo Optitex</label>
                <label className="flex items-center gap-4 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 cursor-pointer transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-indigo-600 flex items-center gap-1.5">
                      <Upload className="w-4 h-4" /> {referencia.optitexArchivoUrl ? "Reemplazar archivo" : "Subir archivo"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {optitexName ?? (referencia.optitexArchivoUrl ? "Ya tiene un archivo cargado" : "PDF, ZIP, DXF...")}
                    </p>
                  </div>
                  <input
                    type="file"
                    name="optitexArchivo"
                    className="sr-only"
                    onChange={(e) => setOptitexName(e.target.files?.[0]?.name ?? null)}
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cerrar}
                  className="px-4 py-2.5 font-medium text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
