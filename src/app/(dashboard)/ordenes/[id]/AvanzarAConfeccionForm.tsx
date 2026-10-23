"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { avanzarAConfeccion } from "@/app/actions/ordenesActions";
import { Plus, Trash2, Scissors, RotateCcw } from "lucide-react";

type VarianteItem = {
  cantidad: number | null;
  detalle: string;
};

export default function AvanzarAConfeccionForm({
  ordenId,
  cantidadTotal,
  variantes = [],
  mostrarPrecios = true,
}: {
  ordenId: string;
  cantidadTotal: number;
  variantes?: VarianteItem[];
  mostrarPrecios?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [precioCorte, setPrecioCorte] = useState<string>("");
  const router = useRouter();

  // Inicializar las filas de unidades cortadas por color con lo pedido originalmente
  const initialFilas =
    variantes.length > 0
      ? variantes.map((v) => ({
          color: v.detalle,
          pedido: v.cantidad ?? 0,
          cortada: String(v.cantidad ?? 0),
        }))
      : [{ color: "Estándar", pedido: cantidadTotal, cortada: String(cantidadTotal) }];

  const [filasCorte, setFilasCorte] = useState(initialFilas);

  const totalRealCortado = filasCorte.reduce(
    (sum, f) => sum + (parseInt(f.cortada) || 0),
    0
  );
  const diferencia = totalRealCortado - cantidadTotal;

  const restaurarCantidadesPedidas = () => {
    setFilasCorte(
      initialFilas.map((f) => ({
        ...f,
        cortada: String(f.pedido),
      }))
    );
  };

  async function actionForm(formData: FormData) {
    if (totalRealCortado <= 0) {
      setError("La cantidad total cortada debe ser mayor a 0.");
      return;
    }

    setLoading(true);
    setError(null);
    formData.append("id", ordenId);

    const lineasCortadas = filasCorte
      .filter((f) => f.color.trim() && (parseInt(f.cortada) || 0) > 0)
      .map((f) => `${parseInt(f.cortada) || 0}x ${f.color.trim()}`);

    formData.set("coloresCortados", lineasCortadas.join(", "));
    formData.set("cantidadTotalCortada", String(totalRealCortado));

    const res = await avanzarAConfeccion(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.refresh();
    }
  }

  const precio = parseFloat(precioCorte) || 0;
  const totalCorte = precio * totalRealCortado;

  return (
    <div className="w-full mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-4 h-4 text-orange-500" />
            Confirmar Unidades Cortadas y Avanzar a Confección
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Por defecto aparecen las unidades del pedido. Si en corte salieron más o menos prendas en algún color, ajústalas aquí.
          </p>
        </div>
        {diferencia !== 0 && (
          <button
            type="button"
            onClick={restaurarCantidadesPedidas}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Igualar al pedido ({cantidadTotal})
          </button>
        )}
      </div>

      <form action={actionForm} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex items-start gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* TABLA DE UNIDADES CORTADAS POR COLOR */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-3.5 py-2.5 bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-6 sm:col-span-6">Color / Variante</div>
            <div className="col-span-3 sm:col-span-3 text-center">Pedido</div>
            <div className="col-span-3 sm:col-span-3 text-center">Real Cortado</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filasCorte.map((fila, idx) => {
              const cantCortada = parseInt(fila.cortada) || 0;
              const cambioColor = fila.pedido > 0 && cantCortada !== fila.pedido;
              return (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center px-3.5 py-2.5 text-sm">
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-2">
                    <input
                      type="text"
                      value={fila.color}
                      onChange={(e) => {
                        const next = [...filasCorte];
                        next[idx].color = e.target.value;
                        setFilasCorte(next);
                      }}
                      placeholder="Color o variante"
                      className="w-full font-semibold text-slate-800 bg-transparent border border-transparent focus:border-slate-200 focus:bg-slate-50 rounded-lg px-2 py-1 text-sm outline-none"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      {fila.pedido > 0 ? `${fila.pedido} uds` : "Extra"}
                    </span>
                  </div>
                  <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={fila.cortada}
                      onChange={(e) => {
                        const next = [...filasCorte];
                        next[idx].cortada = e.target.value;
                        setFilasCorte(next);
                      }}
                      className={`w-20 rounded-lg border px-2 py-1.5 text-sm font-black text-center outline-none transition-all ${
                        cambioColor
                          ? "border-amber-400 bg-amber-50/70 text-amber-900 focus:ring-2 focus:ring-amber-200"
                          : "border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                    {fila.pedido === 0 && filasCorte.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFilasCorte(filasCorte.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-400 hover:text-red-500 rounded"
                        title="Quitar fila"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setFilasCorte([...filasCorte, { color: "", pedido: 0, cortada: "" }])
              }
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar color adicional en corte
            </button>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Cortado:</span>
              <span className="font-black text-base text-slate-900">{totalRealCortado} uds</span>
              {diferencia !== 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    diferencia > 0
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }`}
                >
                  {diferencia > 0 ? `+${diferencia}` : diferencia} vs pedido ({cantidadTotal})
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-1 ${mostrarPrecios ? "sm:grid-cols-2" : ""} gap-5`}>
          {mostrarPrecios && (
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
                  <span className="text-indigo-600 font-semibold">
                    Total del corte ({totalRealCortado} uds): ${totalCorte.toLocaleString("es-CO")}
                  </span>
                ) : (
                  "Deja en blanco si no aplica."
                )}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Observaciones (Opcional)</label>
            <textarea
              name="observacionesCorte"
              rows={2}
              placeholder="Rendimiento de la tela, fallas, paquetes separados, etc."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
            ></textarea>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading || totalRealCortado <= 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 shadow-sm transition-colors w-full sm:w-auto"
          >
            {loading ? "Guardando..." : `Confirmar ${totalRealCortado} Prendas y Avanzar`}
          </button>
        </div>
      </form>
    </div>
  );
}
