"use client";

import { useState } from "react";
import { marcarOrdenEntregada } from "@/app/actions/ordenesActions";
import { toast } from "sonner";
import { PackageCheck, X, AlertTriangle } from "lucide-react";

export default function EntregarClienteModal({
  ordenId,
  nombre,
  cliente,
  buenas,
  reprocesos,
  cantidadTotal,
  lotesPendientes,
  sinAsignar,
}: {
  ordenId: string;
  nombre: string;
  cliente: string;
  buenas: number;
  reprocesos: number;
  cantidadTotal: number;
  lotesPendientes: number;
  sinAsignar: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const bloqueado = lotesPendientes > 0 || buenas === 0;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
      >
        <PackageCheck className="w-4 h-4" /> Entregar al cliente
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-emerald-600" /> Entregar orden {nombre}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Confirma que las prendas fueron despachadas a <span className="font-semibold text-slate-900">{cliente}</span>.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-700">{buenas}</p>
                  <p className="text-[10px] font-bold uppercase text-emerald-600">Buenas</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-amber-700">{reprocesos}</p>
                  <p className="text-[10px] font-bold uppercase text-amber-600">Reprocesos</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-slate-700">{cantidadTotal}</p>
                  <p className="text-[10px] font-bold uppercase text-slate-500">Pedido</p>
                </div>
              </div>

              {lotesPendientes > 0 && (
                <div className="flex gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Hay {lotesPendientes} lote(s) aún en talleres. Recíbelos antes de entregar.</span>
                </div>
              )}
              {lotesPendientes === 0 && sinAsignar > 0 && (
                <div className="flex gap-2 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Quedan {sinAsignar} prendas sin asignar. Se entregará la orden de forma parcial.</span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 p-5 pt-0">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 font-medium text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={bloqueado || isPending}
                onClick={async () => {
                  setIsPending(true);
                  const res = await marcarOrdenEntregada(ordenId);
                  setIsPending(false);
                  if (res?.error) toast.error(res.error);
                  else {
                    toast.success(`Orden ${nombre} entregada al cliente.`);
                    setIsOpen(false);
                  }
                }}
                className="bg-emerald-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? "Guardando..." : "Confirmar entrega"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
