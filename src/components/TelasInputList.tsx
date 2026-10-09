"use client";

import { Plus, Trash2 } from "lucide-react";

export type TelaInputItem = {
  nombre: string;
  tipo: string;
  promedio: string | number;
};

export default function TelasInputList({
  telas,
  onChange,
}: {
  telas: TelaInputItem[];
  onChange: (telas: TelaInputItem[]) => void;
}) {
  const handleUpdate = (index: number, field: keyof TelaInputItem, value: string) => {
    const updated = [...telas];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleAdd = () => {
    const nextNumber = telas.length + 1;
    onChange([...telas, { nombre: `Tela ${nextNumber}`, tipo: "", promedio: "" }]);
  };

  const handleRemove = (index: number) => {
    if (telas.length <= 1) return;
    onChange(telas.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Telas y Promedio de Consumo
          </label>
          <p className="text-xs text-slate-500">
            Registra los tipos de tela requeridos y el consumo promedio por prenda en metros.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar tela
        </button>
      </div>

      <div className="space-y-2.5">
        {telas.map((tela, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
          >
            <div className="w-full sm:w-28 shrink-0">
              <input
                type="text"
                value={tela.nombre}
                onChange={(e) => handleUpdate(idx, "nombre", e.target.value)}
                placeholder={`Tela ${idx + 1}`}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={tela.tipo}
                onChange={(e) => handleUpdate(idx, "tipo", e.target.value)}
                placeholder="Tipo de tela (ej. Malla, Lino, Dril)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-36 shrink-0">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tela.promedio}
                  onChange={(e) => handleUpdate(idx, "promedio", e.target.value)}
                  placeholder="0.57"
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-900 text-center outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
              <span className="text-xs text-slate-400 font-semibold">mts</span>

              <button
                type="button"
                disabled={telas.length === 1}
                onClick={() => handleRemove(idx)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
                title="Eliminar tela"
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
