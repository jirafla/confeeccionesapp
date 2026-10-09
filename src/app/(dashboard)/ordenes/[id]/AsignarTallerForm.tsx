"use client";

import { useState } from "react";
import { createAsignacion } from "@/app/actions/asignacionActions";
import { toast } from "sonner";
import { Factory } from "lucide-react";

export default function AsignarTallerForm({
  ordenId,
  talleres,
  precioSugerido,
  pendientes
}: {
  ordenId: string;
  talleres: any[];
  precioSugerido: number;
  pendientes: number;
}) {
  const [isPending, setIsPending] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Factory className="w-5 h-5 text-blue-500" />
          Nueva Asignación a Taller
        </h2>
        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
          Quedan {pendientes} por asignar
        </span>
      </div>

      <form action={async (formData) => {
        setIsPending(true);
        const res = await createAsignacion(ordenId, formData);
        setIsPending(false);
        if (res?.error) toast.error(res.error);
        else {
          toast.success("Lote asignado al taller correctamente.");
          const form = document.getElementById(`form-asignar-${ordenId}`) as HTMLFormElement;
          if (form) form.reset();
        }
      }} id={`form-asignar-${ordenId}`} className="p-5 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Seleccionar Taller <span className="text-red-500">*</span></label>
            <select name="tallerId" required className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2">
              <option value="">Seleccione...</option>
              {talleres.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cantidad a Asignar <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="cantidadAsignada" 
              required 
              max={pendientes}
              defaultValue={pendientes}
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Precio Unitario Confección <span className="text-red-500">*</span></label>
            <input 
              type="number" 
              name="precioUnitario" 
              required 
              defaultValue={precioSugerido}
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Envío</label>
            <input 
              type="date" 
              name="fechaEnvio" 
              required 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Entrega Pactada</label>
            <input 
              type="date" 
              name="fechaEntregaEsperada" 
              required 
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2" 
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Insumos Entregados (Opcional)</label>
            <textarea 
              name="insumosEntregados" 
              rows={2}
              placeholder="Ej. Hilos, marquillas, botones..."
              className="w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2 resize-none" 
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-blue-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Crear Lote de Asignación"}
          </button>
        </div>
      </form>
    </div>
  );
}
