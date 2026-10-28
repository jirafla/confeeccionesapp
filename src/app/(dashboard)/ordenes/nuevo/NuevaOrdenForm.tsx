"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Sparkles, RotateCcw } from "lucide-react";
import { createOrden } from "@/app/actions/ordenesActions";
import { toast } from "sonner";
import {
  parseInsumos,
  calcularDesgloseInsumos,
  getInsumoColorKey,
} from "@/lib/ordenes";

export default function NuevaOrden({
  clientesPromise,
  referenciasPromise,
}: {
  clientesPromise: Promise<any[]>;
  referenciasPromise: Promise<any[]>;
}) {
  const clientes = use(clientesPromise);
  const referencias = use(referenciasPromise);
  const [isPending, setIsPending] = useState(false);

  const [selectedReferenciaId, setSelectedReferenciaId] = useState("");
  const [detalles, setDetalles] = useState([{ color: "", cantidad: "" }]);
  const [insumosOverrides, setInsumosOverrides] = useState<Record<string, string>>({});

  if (clientes.length === 0 || referencias.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <h2 className="text-xl font-bold">Faltan datos previos</h2>
        <p className="text-slate-500">Para crear una orden, necesitas tener al menos un Cliente y una Referencia en el sistema.</p>
      </div>
    );
  }

  const cantidadTotal = detalles.reduce((sum, d) => sum + (parseInt(d.cantidad) || 0), 0);

  const referenciaActual = referencias.find((r) => r.id === selectedReferenciaId);
  const insumosReferencia = parseInsumos(referenciaActual?.insumosDetalles);

  const variantesParaCalculo = detalles.map((d) => ({
    cantidad: parseInt(d.cantidad) || 0,
    detalle: d.color.trim(),
  }));

  const desgloseInsumos = calcularDesgloseInsumos(
    insumosReferencia,
    variantesParaCalculo,
    cantidadTotal,
    insumosOverrides
  );

  const setColorInsumo = (insumoIdx: number, varianteIdx: number, valor: string, defaultColor: string) => {
    const key = getInsumoColorKey(insumoIdx, varianteIdx);
    setInsumosOverrides((prev) => {
      const next = { ...prev };
      if (!valor.trim() || valor.trim() === defaultColor.trim()) {
        delete next[key];
      } else {
        next[key] = valor;
      }
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <Link
          href="/ordenes"
          title="Volver a órdenes"
          aria-label="Volver a órdenes"
          className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Volver</span>
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Crear Orden</h1>
          <p className="text-sm text-slate-500">Configura el cliente, la referencia, los colores del pedido y el corte.</p>
        </div>
      </div>
      
      <form action={async (formData) => {
        setIsPending(true);
        const lineas = detalles.filter(d => d.color && d.cantidad).map(d => `${d.cantidad}x ${d.color}`);
        formData.set("coloresDetalles", lineas.join(", "));
        formData.set("cantidadTotal", cantidadTotal.toString());
        if (Object.keys(insumosOverrides).length > 0) {
          formData.set("insumosColores", JSON.stringify(insumosOverrides));
        }
        
        const res = await createOrden(formData);
        setIsPending(false);
        if (res?.error) toast.error(res.error);
      }} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="clienteId" className="block text-sm font-semibold text-slate-700 mb-2">Cliente <span className="text-red-500">*</span></label>
            <select 
              name="clienteId" 
              id="clienteId" 
              required 
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="referenciaId" className="block text-sm font-semibold text-slate-700 mb-2">Referencia (Prenda) <span className="text-red-500">*</span></label>
            <select 
              name="referenciaId" 
              id="referenciaId" 
              required 
              value={selectedReferenciaId}
              onChange={(e) => {
                setSelectedReferenciaId(e.target.value);
                setInsumosOverrides({});
              }}
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Selecciona una referencia</option>
              {referencias.map(r => (
                <option key={r.id} value={r.id}>
                  {r.codigo}{r.nombrePrenda ? ` — ${r.nombrePrenda}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-slate-900">Variantes y Cantidades</h3>
              <p className="text-xs text-slate-500">Agrega los colores/tallas y su respectiva cantidad (ej. Rojo, Verde).</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total a producir</span>
              <p className="text-2xl font-black text-blue-600">{cantidadTotal}</p>
            </div>
          </div>

          <div className="space-y-3">
            {detalles.map((detalle, index) => (
              <div key={index} className="flex items-center gap-3">
                <input 
                  type="text" 
                  required
                  placeholder="Ej. Rojo o Negro Talla M"
                  value={detalle.color}
                  onChange={(e) => {
                    const newDetalles = [...detalles];
                    newDetalles[index].color = e.target.value;
                    setDetalles(newDetalles);
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 text-sm py-2 px-3"
                />
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="Cant."
                  value={detalle.cantidad}
                  onChange={(e) => {
                    const newDetalles = [...detalles];
                    newDetalles[index].cantidad = e.target.value;
                    setDetalles(newDetalles);
                  }}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 text-sm py-2 text-center"
                />
                <button 
                  type="button"
                  onClick={() => setDetalles(detalles.filter((_, i) => i !== index))}
                  disabled={detalles.length === 1}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button"
            onClick={() => setDetalles([...detalles, { color: "", cantidad: "" }])}
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar fila
          </button>
        </div>

        {/* SECCIÓN AUTOMÁTICA DE INSUMOS PARAMETRIZADOS POR COLOR */}
        {selectedReferenciaId && insumosReferencia.length > 0 && (
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Insumos Parametrizados para esta Orden
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Por defecto cada insumo toma el mismo color de la prenda. Puedes cambiar el color si una variante lleva otro tono.
                </p>
              </div>
              {Object.keys(insumosOverrides).length > 0 && (
                <button
                  type="button"
                  onClick={() => setInsumosOverrides({})}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar al tono
                </button>
              )}
            </div>

            {cantidadTotal === 0 ? (
              <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center">
                Ingresa los colores y cantidades de prendas arriba para calcular automáticamente los insumos por color.
              </div>
            ) : (
              <div className="space-y-3">
                {desgloseInsumos.map((ins) => (
                  <div
                    key={ins.insumoIdx}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{ins.nombre}</span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          ({ins.consumoUnitario} {ins.unidadLabel}/prenda)
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full">
                        Total: {ins.totalCantidad} {ins.unidadLabel}
                      </span>
                    </div>

                    {ins.porColor && ins.porVariante.length > 0 ? (
                      <div className="space-y-2">
                        {ins.porVariante.map((pv) => {
                          const key = getInsumoColorKey(ins.insumoIdx, pv.varianteIdx);
                          const valorInput = insumosOverrides[key] !== undefined ? insumosOverrides[key] : pv.variantePrenda;
                          const esPersonalizado =
                            insumosOverrides[key] !== undefined &&
                            insumosOverrides[key].trim().toLowerCase() !== pv.variantePrenda.toLowerCase();

                          return (
                            <div
                              key={pv.varianteIdx}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white border border-slate-200/80 rounded-lg px-3 py-2 text-xs"
                            >
                              <div className="flex items-center gap-2 text-slate-600">
                                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                  {pv.prendas}x {pv.variantePrenda}
                                </span>
                                <span>→</span>
                                <span className="font-bold text-indigo-700">
                                  {pv.cantidadInsumo} {ins.unidadLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-400">Color insumo:</span>
                                <input
                                  type="text"
                                  value={valorInput}
                                  onChange={(e) =>
                                    setColorInsumo(ins.insumoIdx, pv.varianteIdx, e.target.value, pv.variantePrenda)
                                  }
                                  placeholder={pv.variantePrenda}
                                  className={`w-36 rounded-md border px-2.5 py-1 text-xs font-semibold outline-none transition-all ${
                                    esPersonalizado
                                      ? "border-amber-300 bg-amber-50/60 text-amber-900 focus:border-amber-500"
                                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-500 focus:bg-white"
                                  }`}
                                />
                              </div>
                            </div>
                          );
                        })}

                        {/* Resumen agrupado cuando varias filas comparten color o para lectura rápida */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Alistar:
                          </span>
                          {ins.agrupadoPorColor.map((ag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs font-bold bg-white border border-indigo-100 text-indigo-950 px-2.5 py-0.5 rounded-md shadow-2xs"
                            >
                              <span className="text-indigo-600">{ag.cantidad} {ins.unidadLabel}</span>
                              <span>{ag.color}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Insumo estándar (color único): se requieren{" "}
                        <span className="font-bold text-slate-800">
                          {ins.totalCantidad} {ins.unidadLabel}
                        </span>{" "}
                        para las {cantidadTotal} prendas.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link 
            href="/ordenes"
            className="px-6 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button 
            type="submit"
            disabled={isPending || cantidadTotal === 0}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear Orden"}
          </button>
        </div>
      </form>
    </div>
  );
}
