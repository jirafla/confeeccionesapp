import { FileSpreadsheet } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function Reportes() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Reportes</h1>
          <p className="text-slate-500 mt-1">Módulo en construcción.</p>
        </div>
      </div>
      
      <EmptyState 
        icon={FileSpreadsheet}
        title="Módulo en Construcción"
        description="Los reportes estarán disponibles una vez completemos la actualización de la arquitectura."
      />
    </div>
  );
}
