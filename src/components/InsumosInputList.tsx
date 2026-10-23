"use client";

import { Plus, Trash2, Palette } from "lucide-react";

export type InsumoInputItem = {
  nombre: string;
  tipo: string; // "UNIDAD" | "MEDIDA"
  unidadMedida?: "cm" | "m"; // Por defecto "cm"
  cantidad: string | number;
  porColor?: boolean; // true = "Al tono (Por color)", false = "Color único / Estándar"
};

export default function InsumosInputList({
  insumos,
  onChange,
}: {
  insumos: InsumoInputItem[];
  onChange: (insumos: InsumoInputItem[]) => void;
}) {
  const handleUpdate = (index: number, field: keyof InsumoInputItem, value: string | boolean) => {
    const updated = [...insumos];
    const nextItem = { ...updated[index], [field]: value };
    if (field === "tipo" && value === "MEDIDA" && !nextItem.unidadMedida) {
      nextItem.unidadMedida = "cm";
    }
    updated[index] = nextItem;
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...insumos, { nombre: "", tipo: "UNIDAD", unidadMedida: "cm", cantidad: "", porColor: true }]);
  };

  const handleRemove = (index: number) => {
    onChange(insumos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Insumos por Prenda (Opcional)
          </label>
          <p className="text-xs text-slate-500">
            Elásticos, cordones, botones, cierres, etc. Por defecto se parametrizan según el color de cada prenda en la orden.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar insumo
        </button>
      </div>

      <div className="space-y-2.5">
        {insumos.length === 0 && (
          <div className="text-sm text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center">
            No se han agregado insumos.
          </div>
        )}
        {insumos.map((insumo, idx) => {
          const esPorColor = insumo.porColor !== false;
          const unidadMedidaActual = insumo.unidadMedida === "m" ? "m" : "cm";
          return (
            <div
              key={idx}
              className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={insumo.nombre}
                    onChange={(e) => handleUpdate(idx, "nombre", e.target.value)}
                    placeholder="Nombre (ej. Elástico, Cordón, Botón)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>

                <div className="w-full sm:w-32 shrink-0">
                  <select
                    value={insumo.tipo}
                    onChange={(e) => handleUpdate(idx, "tipo", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  >
                    <option value="UNIDAD">Por Unidad</option>
                    <option value="MEDIDA">Por Medida</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <div className="relative flex-1 sm:w-20">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={insumo.cantidad}
                      onChange={(e) => handleUpdate(idx, "cantidad", e.target.value)}
                      placeholder="Cant."
                      className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 text-center outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    />
                  </div>
                  {insumo.tipo === "UNIDAD" ? (
                    <span className="text-xs text-slate-400 font-semibold w-10 text-center">
                      uds
                    </span>
                  ) : (
                    <select
                      value={unidadMedidaActual}
                      onChange={(e) => handleUpdate(idx, "unidadMedida", e.target.value)}
                      title="Unidad de medida (Centímetros por defecto o Metros)"
                      className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                    >
                      <option value="cm">cm (Centímetros)</option>
                      <option value="m">m (Metros)</option>
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Eliminar insumo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-500" />
                  Parametrización de color en órdenes:
                </span>
                <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
                  <button
                    type="button"
                    onClick={() => handleUpdate(idx, "porColor", true)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      esPorColor
                        ? "bg-white text-indigo-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Al tono de prenda (Por defecto)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(idx, "porColor", false)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                      !esPorColor
                        ? "bg-white text-slate-800 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Color único / Estándar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
