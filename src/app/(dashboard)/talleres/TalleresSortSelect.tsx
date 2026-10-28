"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";

export default function TalleresSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "desc";
  const soloDestacados = searchParams.get("destacados") === "1";

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/talleres");
  };

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <button
        type="button"
        onClick={() => updateParam("destacados", soloDestacados ? null : "1")}
        className={`h-11 px-3.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-all shrink-0 cursor-pointer border ${
          soloDestacados
            ? "bg-amber-400 border-amber-400 text-slate-950 shadow-sm shadow-amber-400/20"
            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        title="Filtrar solo talleres destacados"
      >
        <Star className={`w-4 h-4 ${soloDestacados ? "fill-current text-slate-950" : "text-amber-500"}`} />
        <span>Destacados</span>
      </button>

      <select 
        value={sort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="flex-1 sm:w-52 h-11 px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
      >
        <option value="desc">Más asignaciones</option>
        <option value="asc">Menos asignaciones (Libres)</option>
      </select>
    </div>
  );
}
