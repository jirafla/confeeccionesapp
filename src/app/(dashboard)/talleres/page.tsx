import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Phone, MapPin, Factory, ChevronRight, Star } from "lucide-react";

import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import TalleresSortSelect from "./TalleresSortSelect";
import { getCapacidadInfo } from "@/components/TallerAtributosFields";

import { requireAuth } from "@/lib/auth";

export default async function Talleres({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; destacados?: string }>;
}) {
  const { empresa } = await requireAuth();
  const query = await searchParams;
  const q = query.q || "";
  const sort = query.sort === "asc" ? "asc" : "desc";
  const soloDestacados = query.destacados === "1";

  const talleres = await prisma.taller.findMany({
    where: {
      empresaId: empresa.id,
      ...(soloDestacados ? { destacado: true } : {}),
      ...(q ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { telefono: { contains: q, mode: "insensitive" } }
        ]
      } : {})
    },
    include: {
      _count: {
        select: { asignaciones: true }
      }
    },
    orderBy: [
      { destacado: "desc" },
      { asignaciones: { _count: sort } }
    ]
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">Talleres</h1>
          <p className="text-sm text-slate-500">{talleres.length} {talleres.length === 1 ? "taller registrado" : "talleres registrados"}</p>
        </div>
        <Link 
          href="/talleres/nuevo" 
          title="Registrar Taller"
          aria-label="Registrar Taller"
          className="bg-blue-600 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center shrink-0 gap-2"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Registrar Taller</span>
        </Link>
      </div>

      <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-slate-200/70 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Buscar por nombre o teléfono..." />
        </div>
        <div className="w-full sm:w-auto shrink-0">
          <TalleresSortSelect />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {talleres.map((taller) => {
          const cap = getCapacidadInfo(taller.capacidad);
          const CapIcon = cap?.icon;
          return (
            <Link href={`/talleres/${taller.id}`} key={taller.id} className="group">
              <div
                className={`bg-white p-4 sm:p-5 rounded-2xl shadow-sm border transition-all flex flex-col h-full ${
                  taller.destacado
                    ? "border-amber-300/90 bg-gradient-to-br from-white via-white to-amber-50/30 hover:border-amber-400 hover:shadow-md"
                    : "border-slate-200/70 hover:shadow-md hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        taller.destacado
                          ? "bg-amber-100 text-amber-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Factory className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors" title={taller.nombre}>
                          {taller.nombre}
                        </h2>
                        {taller.destacado && (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600 shrink-0"
                            title="Taller destacado"
                          >
                            <Star className="w-3 h-3 fill-current" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
                    {taller._count.asignaciones} {taller._count.asignaciones === 1 ? "lote" : "lotes"}
                  </span>
                </div>

                {/* Etiquetas de Destacado y Capacidad (si existen) */}
                {(taller.destacado || cap) && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {taller.destacado && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100/80 text-amber-800">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        Destacado
                      </span>
                    )}
                    {cap && CapIcon && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${cap.badgeCls}`}>
                        <CapIcon className="w-3 h-3" />
                        Capacidad {cap.label}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="space-y-1.5 mt-auto text-sm text-slate-500 pt-2.5 border-t border-slate-100/80">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{taller.telefono || "Sin teléfono"}</span>
                    </p>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0 transition-colors" />
                  </div>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{taller.direccion || "Sin dirección"}</span>
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
        
        {talleres.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No se encontraron talleres"
              description={
                soloDestacados
                  ? "Aún no has marcado talleres como destacados."
                  : q
                  ? "Prueba buscar con otro nombre o teléfono."
                  : "Aún no hay talleres registrados en el sistema."
              }
              actionLabel="Registrar Taller"
              actionHref="/talleres/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
