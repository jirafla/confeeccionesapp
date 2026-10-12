"use client";

import { Plus, Trash2 } from "lucide-react";

export type InsumoInputItem = {
  nombre: string;
  tipo: string; // "UNIDAD" | "MEDIDA"
  cantidad: string | number;
};

export default function InsumosInputList({
  insumos,
  onChange,
}: {
  insumos: InsumoInputItem[];
  onChange: (insumos: InsumoInputItem[]) => void;
}) {
  const handleUpdate = (index: number, field: keyof InsumoInputItem, value: string) => {
    const updated = [...insumos];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    onChange([...insumos, { nombre: "", tipo: "UNIDAD", cantidad: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(insumos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Insumos (Opcional)
          </label>
          <p className="text-xs text-slate-500">
            Registra los insumos adicionales por prenda (botones, cierres, hilos, etc).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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
        {insumos.map((insumo, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
          >
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={insumo.nombre}
                onChange={(e) => handleUpdate(idx, "nombre", e.target.value)}
                placeholder="Nombre (ej. Botón, Cierre)"
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
                <option value="MEDIDA">Por Tamaño/Medida</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-36 shrink-0">
              <div className="relative flex-1">
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
              <span className="text-xs text-slate-400 font-semibold w-6 text-center">
                {insumo.tipo === "UNIDAD" ? "uds" : "m/cm"}
              </span>

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
        ))}
      </div>
    </div>
  );
}
