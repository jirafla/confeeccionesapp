"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-slate-200 shadow-sm my-6">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">
        Hubo un problema al cargar esta sección
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-4">
        {error.message || "Ocurrió un error inesperado al renderizar los datos del panel."}
      </p>
      {error.digest && (
        <code className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg mb-6 font-mono">
          Digest: {error.digest}
        </code>
      )}
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}
