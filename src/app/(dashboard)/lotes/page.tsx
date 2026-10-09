import Link from "next/link";
import { Plus } from "lucide-react";
import EmptyState from "@/components/EmptyState";

export default async function Lotes() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Órdenes y Asignaciones</h1>
          <p className="text-slate-500 mt-1">Estamos actualizando este módulo a la nueva arquitectura.</p>
        </div>
      </div>
      
      <EmptyState 
        icon={Plus}
        title="Módulo en Construcción"
        description="Estamos adaptando este módulo a las nuevas tablas de Clientes y Referencias."
      />
    </div>
  );
}
