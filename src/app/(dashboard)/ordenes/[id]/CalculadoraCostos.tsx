"use client";

import { useState } from "react";
import { toast } from "sonner";
import { guardarCostosMateriales } from "@/app/actions/ordenesActions";
import { Calculator, Save } from "lucide-react";
import { getInsumoUnidadLabel } from "@/lib/ordenes";

type Tela = { nombre: string; tipo: string; promedio: number };
type Insumo = { nombre: string; tipo: string; unidadMedida?: "cm" | "m"; cantidad: number };

export default function CalculadoraCostos({
  ordenId,
  telas,
  insumos,
  costoCorte,
  costoConfeccion,
  cantidadBuenas,
  costosGuardados
}: {
  ordenId: string;
  telas: Tela[];
  insumos: Insumo[];
  costoCorte: number;
  costoConfeccion: number;
  cantidadBuenas: number;
  costosGuardados: string | null;
}) {
  // Parse saved costs
  const saved = costosGuardados ? JSON.parse(costosGuardados) : { telas: {}, insumos: {} };
  
  const [preciosTelas, setPreciosTelas] = useState<Record<string, number>>(saved.telas || {});
  const [preciosInsumos, setPreciosInsumos] = useState<Record<string, number>>(saved.insumos || {});
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    const data = JSON.stringify({ telas: preciosTelas, insumos: preciosInsumos });
    const res = await guardarCostosMateriales(ordenId, data);
    setIsPending(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Análisis de costos guardado");
  };

  const fmt = (val: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  // Math
  const totalCorte = costoCorte;
  const unitarioCorte = cantidadBuenas > 0 ? totalCorte / cantidadBuenas : 0;

  const totalConfeccion = costoConfeccion;
  const unitarioConfeccion = cantidadBuenas > 0 ? totalConfeccion / cantidadBuenas : 0;

  // Tela cost per garment = promedio * precio
  const unitarioTelas = telas.reduce((sum, t) => sum + (t.promedio * (preciosTelas[t.nombre] || 0)), 0);
  const totalTelas = unitarioTelas * cantidadBuenas;

  // Insumo cost per garment = cantidad * precio
  const unitarioInsumos = insumos.reduce((sum, i) => sum + (i.cantidad * (preciosInsumos[i.nombre] || 0)), 0);
  const totalInsumos = unitarioInsumos * cantidadBuenas;

  const unitarioTotal = unitarioCorte + unitarioConfeccion + unitarioTelas + unitarioInsumos;
  const granTotal = unitarioTotal * cantidadBuenas;

  const inputCls = "w-24 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-semibold";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-blue-600" />
          </div>
          Análisis de Costos
        </h2>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isPending ? "Guardando..." : "Guardar Costos"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Mano de Obra</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Corte</span>
                <span className="font-black text-slate-900">{fmt(unitarioCorte)} <span className="text-[10px] text-slate-400 uppercase font-bold">/ ud</span></span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Confección</span>
                <span className="font-black text-slate-900">{fmt(unitarioConfeccion)} <span className="text-[10px] text-slate-400 uppercase font-bold">/ ud</span></span>
              </div>
            </div>
          </section>

          {(telas.length > 0 || insumos.length > 0) && (
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Materiales</h3>
              <div className="space-y-3">
                {telas.map(t => {
                  const val = preciosTelas[t.nombre] || 0;
                  const unitCosto = val * t.promedio;
                  return (
                    <div key={t.nombre} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{t.nombre}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase">{t.tipo} · {t.promedio}m / ud</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">$</span>
                          <input 
                            type="number" 
                            min="0"
                            placeholder="Precio mt"
                            value={val || ""}
                            onChange={e => setPreciosTelas({...preciosTelas, [t.nombre]: Number(e.target.value)})}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500 font-semibold">Costo por prenda</span>
                        <span className="text-sm font-black text-blue-700">{fmt(unitCosto)}</span>
                      </div>
                    </div>
                  );
                })}

                {insumos.map(i => {
                  const val = preciosInsumos[i.nombre] || 0;
                  const unitCosto = val * i.cantidad;
                  const unidadLabel = getInsumoUnidadLabel(i);
                  return (
                    <div key={i.nombre} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{i.nombre}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase">{i.cantidad} {unidadLabel} / ud</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-semibold">$</span>
                          <input 
                            type="number" 
                            min="0"
                            placeholder={`Precio ${unidadLabel}`}
                            value={val || ""}
                            onChange={e => setPreciosInsumos({...preciosInsumos, [i.nombre]: Number(e.target.value)})}
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500 font-semibold">Costo por prenda</span>
                        <span className="text-sm font-black text-blue-700">{fmt(unitCosto)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div>
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg sticky top-24">
            <h3 className="font-bold text-blue-100 mb-6 uppercase tracking-wider text-sm">Resumen de Costos</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-sm">Mano de Obra</span>
                <span className="font-semibold text-lg">{fmt(unitarioCorte + unitarioConfeccion)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-sm">Materiales</span>
                <span className="font-semibold text-lg">{fmt(unitarioTelas + unitarioInsumos)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-500/50 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-blue-200 text-sm font-medium">Costo Total por Prenda</span>
                <span className="text-3xl font-black">{fmt(unitarioTotal)}</span>
              </div>
              {cantidadBuenas > 0 && (
                <p className="text-right text-blue-200 text-xs font-semibold">
                  Basado en {cantidadBuenas} prendas buenas
                </p>
              )}
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-sm font-semibold">Inversión Total Producción</span>
                <span className="text-xl font-black">{fmt(granTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
