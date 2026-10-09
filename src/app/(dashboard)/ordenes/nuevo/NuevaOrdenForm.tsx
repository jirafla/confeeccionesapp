"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createOrden } from "@/app/actions/ordenesActions";
import { toast } from "sonner";

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

  const [detalles, setDetalles] = useState([{ color: "", cantidad: "" }]);

  if (clientes.length === 0 || referencias.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center py-12">
        <h2 className="text-xl font-bold">Faltan datos previos</h2>
        <p className="text-slate-500">Para crear una orden, necesitas tener al menos un Cliente y una Referencia en el sistema.</p>
      </div>
    );
  }

  const cantidadTotal = detalles.reduce((sum, d) => sum + (parseInt(d.cantidad) || 0), 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/ordenes" className="text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Crear Orden</h1>
      </div>
      
      <form action={async (formData) => {
        setIsPending(true);
        // Construir string de detalles
        const lineas = detalles.filter(d => d.color && d.cantidad).map(d => `${d.cantidad}x ${d.color}`);
        formData.set("coloresDetalles", lineas.join(", "));
        formData.set("cantidadTotal", cantidadTotal.toString());
        
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
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              className="block w-full rounded-lg border-slate-200 bg-slate-50 text-sm py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
              <p className="text-xs text-slate-500">Agrega los colores/tallas y su respectiva cantidad.</p>
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
                  placeholder="Ej. Color Negro Talla M"
                  value={detalle.color}
                  onChange={(e) => {
                    const newDetalles = [...detalles];
                    newDetalles[index].color = e.target.value;
                    setDetalles(newDetalles);
                  }}
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 text-sm py-2"
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
                  className="w-24 rounded-lg border-slate-200 bg-slate-50 text-sm py-2 text-center"
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
