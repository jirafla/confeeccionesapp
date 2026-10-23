import { Check, Scissors, Factory, PackageCheck } from "lucide-react";

const ESTADOS = [
  { id: "CORTE", label: "Corte", icon: Scissors },
  { id: "CONFECCION", label: "Confección", icon: Factory },
  { id: "ENTREGADO", label: "Entregado", icon: PackageCheck }
];

// Timeline de solo lectura: los cambios de estado se hacen con los botones de acción.
export default function OrdenTracking({ estadoActual }: { estadoActual: string }) {
  const currentIndex = Math.max(0, ESTADOS.findIndex(e => e.id === estadoActual));
  const finalizado = estadoActual === "ENTREGADO";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-3 py-3.5 sm:px-8 sm:py-4">
      <ol className="flex items-center">
        {ESTADOS.map((e, index) => {
          const isCompleted = index < currentIndex || (finalizado && index === currentIndex);
          const isCurrent = index === currentIndex && !finalizado;
          const isLast = index === ESTADOS.length - 1;
          const Icon = e.icon;

          return (
            <li key={e.id} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2.5 w-20 sm:w-auto shrink-0">
                <div className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/20' :
                    isCurrent ? 'bg-white border-blue-600 text-blue-600 ring-4 ring-blue-100' :
                    'bg-slate-50 border-slate-200 text-slate-400'}`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] sm:text-xs font-bold uppercase tracking-wide text-center
                  ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {e.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-1 -mt-4 sm:mt-0 mx-1 sm:mx-4 rounded-full bg-slate-100 overflow-hidden">
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

