"use client";

import { useState } from "react";
import { createAsignacion } from "@/app/actions/asignacionActions";
import { toast } from "sonner";
import { Factory, X, Plus, Sparkles, Trash2, RotateCcw } from "lucide-react";
import { InsumoItem, getInsumoUnidadLabel } from "@/lib/ordenes";
import ModalPortal from "@/components/ModalPortal";

type FilaInsumoLote = {
  id: string;
  nombre: string;
  unidad: string;
  consumoUnitario: number | null;
  cantidad: string;
  editadoManual: boolean;
};

function construirFilasIniciales(insumos: InsumoItem[], cantPrendas: number): FilaInsumoLote[] {
  return insumos.map((ins, idx) => {
    const unidad = getInsumoUnidadLabel(ins);
    const totalCalculado = Number((cantPrendas * ins.cantidad).toFixed(2));
    return {
      id: `ref-${idx}`,
      nombre: ins.nombre,
      unidad,
      consumoUnitario: ins.cantidad,
      cantidad: String(totalCalculado),
      editadoManual: false,
    };
  });
}

export default function AsignarTallerModal({
  ordenId,
  talleres,
  pendientes,
  isFirst = false,
  mostrarPrecios = true,
  insumos = [],
}: {
  ordenId: string;
  talleres: any[];
  pendientes: number;
  isFirst?: boolean;
  mostrarPrecios?: boolean;
  insumos?: InsumoItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [cantidadLote, setCantidadLote] = useState<string>(String(pendientes));
  const [filasInsumos, setFilasInsumos] = useState<FilaInsumoLote[]>(() =>
    construirFilasIniciales(insumos, pendientes)
  );

  const abrirModal = () => {
    setCantidadLote(String(pendientes));
    setFilasInsumos(construirFilasIniciales(insumos, pendientes));
    setIsOpen(true);
  };

  const cantPrendasNum = Math.max(0, parseInt(cantidadLote) || 0);

  const handleCantidadLoteChange = (nuevoValor: string) => {
    setCantidadLote(nuevoValor);
    const num = Math.max(0, parseInt(nuevoValor) || 0);
    setFilasInsumos((prev) =>
      prev.map((fila) => {
        if (fila.consumoUnitario !== null && !fila.editadoManual) {
          return {
            ...fila,
            cantidad: String(Number((num * fila.consumoUnitario).toFixed(2))),
          };
        }
        return fila;
      })
    );
  };

  const restaurarCalculoAutomatico = () => {
    setFilasInsumos(construirFilasIniciales(insumos, cantPrendasNum));
  };

  const hayCambiosManuales =
    filasInsumos.length !== insumos.length ||
    filasInsumos.some((f) => f.editadoManual);

  return (
    <>
      {isFirst ? (
        <button 
          onClick={abrirModal}
          className="mt-6 bg-blue-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
        >
          <Factory className="w-5 h-5" /> Asignar Primer Taller
        </button>
      ) : (
        <button 
          onClick={abrirModal}
          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Asignar Nuevo Lote
        </button>
      )}

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 bg-white flex justify-between items-center p-4 sm:px-6 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Factory className="w-5 h-5 text-blue-500" />
                Nueva Asignación a Taller
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hidden sm:block">
                  Quedan {pendientes} por asignar
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form
              action={async (formData) => {
                setIsPending(true);
                const resumenInsumos = filasInsumos
                  .filter((f) => f.nombre.trim() && (parseFloat(f.cantidad) || 0) > 0)
                  .map((f) => `${f.nombre.trim()}: ${Number(parseFloat(f.cantidad).toFixed(2))} ${f.unidad}`)
                  .join(" | ");
                formData.set("insumosEntregados", resumenInsumos);

                const res = await createAsignacion(ordenId, formData);
                setIsPending(false);
                if (res?.error) toast.error(res.error);
                else {
                  toast.success("Lote asignado al taller correctamente.");
                  setIsOpen(false);
                }
              }}
              className="p-5 sm:p-6 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Seleccionar Taller <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tallerId"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Seleccione...</option>
                    {talleres.map((t) => {
                      const capLabel =
                        t.capacidad === "ALTA"
                          ? " · Cap. Alta"
                          : t.capacidad === "MEDIA"
                          ? " · Cap. Media"
                          : t.capacidad === "BAJA"
                          ? " · Cap. Baja"
                          : "";
                      return (
                        <option key={t.id} value={t.id}>
                          {t.destacado ? `★ ${t.nombre}` : t.nombre}
                          {capLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-slate-700">
                      Cantidad a Asignar <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Máx: {pendientes} uds
                    </span>
                  </div>
                  <input 
                    type="number" 
                    name="cantidadAsignada" 
                    required 
                    min={1}
                    max={pendientes}
                    value={cantidadLote}
                    onChange={(e) => handleCantidadLoteChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 py-2.5 px-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                </div>

                {mostrarPrecios ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Precio Unitario Confección <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="precioUnitario" 
                      required 
                      placeholder="Ej. 3500"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" 
                    />
                  </div>
                ) : (
                  <input type="hidden" name="precioUnitario" value="0" />
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Envío</label>
                  <input 
                    type="date" 
                    name="fechaEnvio" 
                    required 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                </div>

                <div className={mostrarPrecios ? "sm:col-span-2" : ""}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Fecha Entrega Pactada <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="fechaEntregaEsperada" 
                    required 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 text-sm py-2.5 px-3 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none" 
                  />
                </div>
              </div>

              {/* SECCIÓN DE INSUMOS CALCULADOS AUTOMÁTICAMENTE SEGÚN LA CANTIDAD ASIGNADA */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Insumos a Entregar para {cantPrendasNum} {cantPrendasNum === 1 ? "prenda" : "prendas"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Se calculan automáticamente según las {cantPrendasNum} prendas asignadas a este taller. Puedes editar las cantidades o agregar insumos.
                    </p>
                  </div>
                  {insumos.length > 0 && hayCambiosManuales && (
                    <button
                      type="button"
                      onClick={restaurarCalculoAutomatico}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Recalcular ({cantPrendasNum} uds)
                    </button>
                  )}
                </div>

                {filasInsumos.length === 0 ? (
                  <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center">
                    No hay insumos registrados para este lote. Puedes agregar uno con el botón de abajo.
                  </div>
                ) : (
                  <div className="bg-slate-50/70 rounded-xl border border-slate-200/90 divide-y divide-slate-200/70 overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 px-3.5 py-2 bg-slate-100/80 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-6 sm:col-span-7">Insumo / Detalle</div>
                      <div className="col-span-5 sm:col-span-4 text-center">Cantidad a Entregar</div>
                      <div className="col-span-1"></div>
                    </div>

                    {filasInsumos.map((fila, idx) => {
                      const esperadoAuto =
                        fila.consumoUnitario !== null
                          ? Number((cantPrendasNum * fila.consumoUnitario).toFixed(2))
                          : null;
                      const valorActual = parseFloat(fila.cantidad) || 0;
                      const fueModificado =
                        fila.editadoManual && esperadoAuto !== null && valorActual !== esperadoAuto;

                      return (
                        <div key={fila.id} className="grid grid-cols-12 gap-2 items-center px-3 sm:px-3.5 py-2.5 bg-white">
                          <div className="col-span-6 sm:col-span-7 min-w-0">
                            <input
                              type="text"
                              value={fila.nombre}
                              onChange={(e) => {
                                const next = [...filasInsumos];
                                next[idx] = { ...fila, nombre: e.target.value };
                                setFilasInsumos(next);
                              }}
                              placeholder="Nombre del insumo (ej. Botón, Hilo...)"
                              className="w-full font-semibold text-slate-800 bg-transparent border border-transparent focus:border-slate-200 focus:bg-slate-50 rounded-lg px-2 py-1 text-xs sm:text-sm outline-none truncate"
                            />
                            {fila.consumoUnitario !== null && (
                              <span className="block text-[10px] font-semibold text-slate-400 px-2 -mt-0.5">
                                {fila.consumoUnitario} {fila.unidad}/prenda × {cantPrendasNum} uds = {esperadoAuto} {fila.unidad}
                              </span>
                            )}
                          </div>

                          <div className="col-span-5 sm:col-span-4 flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={fila.cantidad}
                              onChange={(e) => {
                                const next = [...filasInsumos];
                                next[idx] = {
                                  ...fila,
                                  cantidad: e.target.value,
                                  editadoManual: true,
                                };
                                setFilasInsumos(next);
                              }}
                              placeholder="0"
                              className={`w-20 sm:w-24 rounded-lg border px-2 py-1.5 text-xs sm:text-sm font-black text-center outline-none transition-all ${
                                fueModificado
                                  ? "border-amber-400 bg-amber-50/70 text-amber-900 focus:ring-2 focus:ring-amber-200"
                                  : "border-slate-200 bg-slate-50 text-indigo-700 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                              }`}
                            />
                            {fila.consumoUnitario === null ? (
                              <select
                                value={fila.unidad}
                                onChange={(e) => {
                                  const next = [...filasInsumos];
                                  next[idx] = { ...fila, unidad: e.target.value };
                                  setFilasInsumos(next);
                                }}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-1.5 text-xs font-bold text-slate-600 outline-none"
                              >
                                <option value="uds">uds</option>
                                <option value="cm">cm</option>
                                <option value="m">m</option>
                              </select>
                            ) : (
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md shrink-0">
                                {fila.unidad}
                              </span>
                            )}
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setFilasInsumos(filasInsumos.filter((_, i) => i !== idx))}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Quitar insumo de este lote"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setFilasInsumos([
                      ...filasInsumos,
                      {
                        id: `extra-${Date.now()}`,
                        nombre: "",
                        unidad: "uds",
                        consumoUnitario: null,
                        cantidad: "",
                        editadoManual: true,
                      },
                    ])
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar insumo adicional
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 font-semibold text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || cantPrendasNum <= 0}
                  className="bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {isPending ? "Guardando..." : `Asignar ${cantPrendasNum} Prendas`}
                </button>
              </div>
            </form>
          </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
