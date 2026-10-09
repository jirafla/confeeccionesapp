import { Check } from "lucide-react";

const ESTADOS = [
  { id: "CORTE", label: "Corte" },
  { id: "CONFECCION", label: "Confección" },
  { id: "ENTREGADO", label: "Entregado" }
];

// Timeline de solo lectura: los cambios de estado se hacen con los botones de acción.
export default function OrdenTracking({ estadoActual }: { estadoActual: string }) {
  const currentIndex = Math.max(0, ESTADOS.findIndex(e => e.id === estadoActual));
  const finalizado = estadoActual === "ENTREGADO";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-4 py-5 sm:px-8">
      <ol className="flex items-start">
        {ESTADOS.map((e, index) => {
          const isCompleted = index < currentIndex || (finalizado && index === currentIndex);
          const isCurrent = index === currentIndex && !finalizado;
          const isLast = index === ESTADOS.length - 1;

          return (
            <li key={e.id} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center gap-2 w-20 sm:w-24 shrink-0">
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors
                  ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                    isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100' :
                    'bg-white border-slate-200 text-slate-300'}`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-bold">{index + 1}</span>}
                </div>
                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide text-center
                  ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                  {e.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-1 mt-4 -mx-6 sm:-mx-8 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full bg-blue-600 transition-all duration-500 ${index < currentIndex ? "w-full" : "w-0"}`} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
