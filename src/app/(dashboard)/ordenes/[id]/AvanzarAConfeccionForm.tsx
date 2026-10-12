"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avanzarAConfeccion } from "@/app/actions/ordenesActions";

export default function AvanzarAConfeccionForm({ ordenId, cantidadTotal }: { ordenId: string, cantidadTotal: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [precioCorte, setPrecioCorte] = useState<string>("");
  const router = useRouter();

  async function actionForm(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.append("id", ordenId);
    
    const res = await avanzarAConfeccion(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  const precio = parseFloat(precioCorte) || 0;
  const totalCorte = precio * cantidadTotal;

  return (
    <div className="w-full mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-1">Avanzar a Confección</h3>
      <p className="text-sm text-slate-500 mb-5">
        Confirma que la tela ya fue cortada e ingresa los detalles antes de enviarlo a los talleres.
      </p>

      <form action={actionForm} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Precio de Corte por Prenda (Opcional)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                name="precioCorte"
                step="0.01"
                min="0"
                value={precioCorte}
                onChange={(e) => setPrecioCorte(e.target.value)}
                placeholder="Ej. 1500"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>
            <p className="text-xs text-slate-500">
              {precio > 0 ? (
                <span className="text-indigo-600 font-semibold">Total del corte: ${(totalCorte).toLocaleString("es-CO")}</span>
              ) : (
                "Deja en blanco si no aplica."
              )}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Observaciones (Opcional)</label>
            <textarea
              name="observacionesCorte"
              rows={2}
              placeholder="Rendimiento de la tela, fallas, etc."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
            ></textarea>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button 
            type="submit" 
            disabled={loading} 
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow-sm transition-colors w-full sm:w-auto"
          >
            {loading ? "Guardando..." : "Confirmar y Avanzar"}
          </button>
        </div>
      </form>
    </div>
  );
}
