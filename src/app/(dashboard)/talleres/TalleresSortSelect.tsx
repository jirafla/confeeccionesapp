"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function TalleresSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "desc";

  return (
    <select 
      value={sort}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", e.target.value);
        router.push(`?${params.toString()}`);
      }}
      className="w-full h-11 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 font-medium text-slate-700 cursor-pointer"
    >
      <option value="desc">Más asignaciones</option>
      <option value="asc">Menos asignaciones (Libres)</option>
    </select>
  );
}
