"use client";

import { useState } from "react";
import { conciliarAsignacion } from "@/app/actions/asignacionActions";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import type { Taller } from "@prisma/client";

export default function ConciliarLoteModal({ asignacion, talleres }: { asignacion: any; talleres: Taller[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // States for the form logic
  const [buenas, setBuenas] = useState(asignacion.cantidadAsignada);
  const [reprocesos, setReprocesos] = useState(0);

  const [accion, setAccion] = useState("INTERNO");
  const [nuevoTallerId, setNuevoTallerId] = useState(talleres[0]?.id || "");
  const [nuevoPrecio, setNuevoPrecio] = useState(0);
  const [descuento, setDescuento] = useState(0);

  const cuadreOk = buenas + reprocesos === asignacion.cantidadAsignada;

  return (
    <>
      <button 
        onClick={() => {
          setBuenas(asignacion.cantidadAsignada);
          setReprocesos(0);
          setIsOpen(true);
        }}
        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
      >
        <CheckCircle2 className="w-4 h-4" /> Recibir Lote
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 shrink-0">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" /> Conciliar Lote
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form action={async (formData) => {
              if (!cuadreOk) {
                toast.error("La suma de buenas y reprocesos no cuadra con lo asignado.");
                return;
              }
              setIsPending(true);
              const res = await conciliarAsignacion(asignacion.id, formData);
              setIsPending(false);
              if (res?.error) toast.error(res.error);
              else {
                toast.success("Producción recibida y conciliada correctamente.");
                setIsOpen(false);
              }
            }} className="p-5 overflow-y-auto space-y-5">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Entregadas al taller:</span>
                <span className="font-black text-lg text-slate-900">{asignacion.cantidadAsignada}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Prendas BUENAS <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="cantidadBuena" 
                    required
                    min="0"
                    value={buenas}
                    onChange={(e) => setBuenas(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm py-2 px-3 font-semibold text-slate-900" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Defectuosas <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="reprocesos" 
                    required 
                    min="0"
                    value={reprocesos}
                    onChange={(e) => setReprocesos(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-200 bg-white text-sm py-2 px-3 font-semibold text-rose-600" 
                  />
                </div>
              </div>

              {!cuadreOk && (
                <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg">
                  La suma ({buenas + reprocesos}) debe ser igual a {asignacion.cantidadAsignada}.
                </p>
              )}

              {reprocesos > 0 && cuadreOk && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                  <h4 className="font-bold text-slate-900 text-sm">¿Qué hacer con las {reprocesos} prendas defectuosas?</h4>
                  
                  {/* Opciones (Radio buttons) */}
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accion === "INTERNO" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input type="radio" name="accionReproceso" value="INTERNO" checked={accion === "INTERNO"} onChange={() => setAccion("INTERNO")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">Ajuste Interno (Arreglar en casa)</p>
                        <p className="text-xs text-slate-500">Se asumen como buenas, pero puedes descontar del pago.</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accion === "MISMO_TALLER" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input type="radio" name="accionReproceso" value="MISMO_TALLER" checked={accion === "MISMO_TALLER"} onChange={() => setAccion("MISMO_TALLER")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">Devolver al mismo taller</p>
                        <p className="text-xs text-slate-500">Crea una asignación de reproceso para que las arreglen.</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${accion === "OTRO_TALLER" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:bg-slate-50"}`}>
                      <input type="radio" name="accionReproceso" value="OTRO_TALLER" checked={accion === "OTRO_TALLER"} onChange={() => setAccion("OTRO_TALLER")} className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-semibold text-sm text-slate-900">Enviar a otro taller</p>
                        <p className="text-xs text-slate-500">Crea una asignación para que un tercero las arregle.</p>
                      </div>
                    </label>
                  </div>

                  {/* Campos dependientes */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    {accion === "INTERNO" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descuento al taller ($)</label>
                        <input 
                          type="number" 
                          name="descuentoReproceso" 
                          value={descuento || ""}
                          onChange={e => setDescuento(Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 bg-white text-sm py-2 px-3 font-medium" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Este valor se descontará del total a pagar por esta asignación.</p>
                      </div>
                    )}

                    {accion === "OTRO_TALLER" && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Seleccionar Taller</label>
                        <select 
                          name="nuevoTallerId"
                          value={nuevoTallerId}
                          onChange={e => setNuevoTallerId(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white text-sm py-2 px-3 font-medium"
                        >
                          <option value="">Selecciona...</option>
                          {talleres.map(t => (
                            <option key={t.id} value={t.id} disabled={t.id === asignacion.tallerId}>{t.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {(accion === "MISMO_TALLER" || accion === "OTRO_TALLER") && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Precio a pagar por el arreglo ($/ud)</label>
                        <input 
                          type="number" 
                          name="nuevoPrecioUnitario" 
                          value={nuevoPrecio || ""}
                          onChange={e => setNuevoPrecio(Number(e.target.value))}
                          placeholder="0 si es gratis"
                          className="w-full rounded-lg border border-slate-200 bg-white text-sm py-2 px-3 font-medium" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-5 border-t border-slate-100 mt-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 font-semibold text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending || !cuadreOk}
                  className="bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Procesando..." : "Confirmar Recepción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
