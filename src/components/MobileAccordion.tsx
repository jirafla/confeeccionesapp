"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function MobileAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sm:hidden bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
        >
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-sm">{title}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              {isOpen ? "Toca para ocultar detalles técnicos" : "Toca para ver foto, telas e insumos"}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              {isOpen ? "Ocultar" : "Ver detalle"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>
        {isOpen && (
          <div className="border-t border-slate-100">
            {children}
          </div>
        )}
      </div>

      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {children}
      </div>
    </>
  );
}
