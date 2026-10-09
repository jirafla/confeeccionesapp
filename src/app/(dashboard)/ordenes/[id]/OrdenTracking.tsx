"use client";

import { Check } from "lucide-react";

const ESTADOS = [
  { id: "CORTE", label: "Corte" },
  { id: "CONFECCION", label: "Confección" },
  { id: "ENTREGADO", label: "Entregado a Cliente" }
];

export default function OrdenTracking({ 
  estadoActual 
}: { 
  estadoActual: string; 
}) {
  const currentIndex = ESTADOS.findIndex(e => e.id === estadoActual);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
      <h3 className="font-bold text-slate-900 mb-6">Seguimiento de Producción</h3>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden sm:block z-0 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 hidden sm:block z-0 rounded-full transition-all duration-500" 
          style={{ width: `${(currentIndex / (ESTADOS.length - 1)) * 100}%` }}
        ></div>

        {ESTADOS.map((e, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div
              key={e.id}
              className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto mb-4 sm:mb-0 text-left sm:text-center"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors
                ${isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 
                  isCurrent ? 'bg-white border-blue-500 text-blue-600 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 
                  'bg-white border-slate-200 text-slate-300'}`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider
                ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                {e.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
