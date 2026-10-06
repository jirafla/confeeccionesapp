"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createLote, searchReferencias } from "@/app/actions/loteActions";

export default function LoteForm({ talleres }: { talleres: any[] }) {
  const [referencia, setReferencia] = useState("");
  const [sugerencias, setSugerencias] = useState<{numeroLote: string, tipoPrenda: string}[]>([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  
  // Auto-fill form fields
  const [tipoPrenda, setTipoPrenda] = useState("");

  useEffect(() => {
    const fetchSugerencias = async () => {
      if (referencia.length >= 2) {
        const results = await searchReferencias(referencia);
        setSugerencias(results);
        setShowSugerencias(true);
      } else {
        setSugerencias([]);
        setShowSugerencias(false);
      }
    };
    
    const debounce = setTimeout(fetchSugerencias, 300);
    return () => clearTimeout(debounce);
  }, [referencia]);

  const selectSugerencia = (sug: {numeroLote: string, tipoPrenda: string}) => {
    setReferencia(sug.numeroLote);
    setTipoPrenda(sug.tipoPrenda);
    setShowSugerencias(false);
  };

  return (
    <form action={createLote} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="referencia" className="block text-sm font-semibold text-slate-700 mb-2">Referencia <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="referencia" 
            id="referencia" 
            required 
            autoComplete="off"
            placeholder="Ej. REF-1045" 
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            onFocus={() => { if(sugerencias.length > 0) setShowSugerencias(true); }}
            onBlur={() => setTimeout(() => setShowSugerencias(false), 200)}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
          />
          
          {showSugerencias && sugerencias.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {sugerencias.map((sug, idx) => (
                <li 
                  key={idx} 
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0"
                  onClick={() => selectSugerencia(sug)}
                >
                  <p className="font-semibold text-slate-900">{sug.numeroLote}</p>
                  <p className="text-xs text-slate-500">{sug.tipoPrenda}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label htmlFor="tipoPrenda" className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Prenda <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            name="tipoPrenda" 
            id="tipoPrenda" 
            required 
            value={tipoPrenda}
            onChange={(e) => setTipoPrenda(e.target.value)}
            placeholder="Ej. Camiseta Polo" 
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="cantidad" className="block text-sm font-semibold text-slate-700 mb-2">Cantidad (unidades) <span className="text-red-500">*</span></label>
          <input type="number" name="cantidad" id="cantidad" required min="1" placeholder="Ej. 100" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>
        <div>
          <label htmlFor="precioUnitario" className="block text-sm font-semibold text-slate-700 mb-2">Precio Unitario ($) <span className="text-red-500">*</span></label>
          <input type="number" step="0.01" name="precioUnitario" id="precioUnitario" required min="0" placeholder="Ej. 15000" className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Inicio <span className="text-red-500">*</span></label>
          <input type="date" name="fechaInicio" id="fechaInicio" required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>
        <div>
          <label htmlFor="fechaEntregaPactada" className="block text-sm font-semibold text-slate-700 mb-2">Fecha Entrega Pactada <span className="text-red-500">*</span></label>
          <input type="date" name="fechaEntregaPactada" id="fechaEntregaPactada" required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <label htmlFor="tallerId" className="block text-sm font-semibold text-slate-700 mb-2">Taller Asignado <span className="text-red-500">*</span></label>
        <select name="tallerId" id="tallerId" required className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
          <option value="">Seleccione un taller...</option>
          {talleres.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        {talleres.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">No hay talleres registrados. <Link href="/talleres/nuevo" className="underline font-medium">Registra uno primero</Link>.</p>
        )}
      </div>

      <div>
        <label htmlFor="insumosEntregados" className="block text-sm font-semibold text-slate-700 mb-2">Insumos Entregados <span className="text-slate-400 font-normal">(Opcional)</span></label>
        <textarea 
          name="insumosEntregados" 
          id="insumosEntregados" 
          rows={3}
          placeholder="Ej. 500 botones, 2 hilos rojos, 150 etiquetas..."
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
        />
      </div>

      <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
        <Link 
          href="/lotes"
          className="px-6 py-3 rounded-xl font-medium text-slate-700 text-center hover:bg-slate-100 transition-colors order-2 sm:order-1"
        >
          Cancelar
        </Link>
        <button 
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm order-1 sm:order-2"
        >
          Guardar Lote
        </button>
      </div>
    </form>
  );
}
