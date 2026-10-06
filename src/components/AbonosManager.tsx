"use client";

import { useState } from "react";
import { addAbonoAction, deleteAbonoAction } from "@/app/actions/abonoActions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AbonosManager({ 
  loteId, 
  abonos, 
  totalPagar 
}: { 
  loteId: string, 
  abonos: any[], 
  totalPagar: number 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const totalAbonado = abonos.reduce((acc, a) => acc + a.monto, 0);
  const saldoPendiente = totalPagar - totalAbonado;
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 pb-2">
        <h2 className="text-lg font-bold text-slate-900">Pagos y Abonos</h2>
        <span className="text-sm font-semibold text-slate-500">Total: ${totalPagar.toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <p className="text-xs font-medium text-green-700 uppercase">Abonado</p>
          <p className="text-xl font-bold text-green-900 mt-1">${totalAbonado.toLocaleString()}</p>
        </div>
        <div className={`p-4 rounded-xl border ${saldoPendiente <= 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
          <p className={`text-xs font-medium uppercase ${saldoPendiente <= 0 ? 'text-slate-500' : 'text-red-700'}`}>Saldo Pendiente</p>
          <p className={`text-xl font-bold mt-1 ${saldoPendiente <= 0 ? 'text-slate-900' : 'text-red-900'}`}>
            ${Math.max(0, saldoPendiente).toLocaleString()}
          </p>
        </div>
      </div>

      {abonos.length > 0 ? (
        <ul className="space-y-3">
          {abonos.map((abono) => (
            <li key={abono.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-gray-100 transition-colors">
              <div>
                <p className="font-bold text-slate-900">${abono.monto.toLocaleString()}</p>
                <div className="flex gap-2 items-center mt-1">
                  <p className="text-xs text-slate-500">{new Date(abono.fecha).toLocaleDateString()}</p>
                  {abono.nota && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{abono.nota}</span>}
                </div>
              </div>
              <button 
                onClick={async () => {
                  try {
                    await deleteAbonoAction(abono.id, loteId);
                    toast.success("Abono eliminado");
                  } catch (e) {
                    toast.error("Error al eliminar abono");
                  }
                }}
                className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Eliminar abono"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 text-center italic py-4">No hay abonos registrados.</p>
      )}

      {isAdding ? (
        <form 
          action={async (formData) => {
            try {
              await addAbonoAction(loteId, formData);
              toast.success("Abono registrado exitosamente");
              setIsAdding(false);
            } catch (error) {
              toast.error("El monto es inválido");
            }
          }}
          className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Monto ($)</label>
            <input type="number" name="monto" required min="1" step="0.01" max={saldoPendiente > 0 ? saldoPendiente : undefined} defaultValue={saldoPendiente > 0 ? saldoPendiente : ""} className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nota (opcional)</label>
            <input type="text" name="nota" placeholder="Ej: Transferencia, Efectivo..." className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-gray-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">Guardar</button>
          </div>
        </form>
      ) : (
        saldoPendiente > 0 && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full border-2 border-dashed border-gray-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 py-3 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2"
          >
            + Registrar Abono
          </button>
        )
      )}
    </div>
  );
}
