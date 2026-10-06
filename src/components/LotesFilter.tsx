"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function LotesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentEstado = searchParams.get("estado") || "";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set("estado", e.target.value);
    } else {
      params.delete("estado");
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <select 
      value={currentEstado}
      onChange={handleChange}
      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto p-2.5 outline-none"
    >
      <option value="">Todos los estados</option>
      <option value="EN_PROCESO">En Proceso</option>
      <option value="DEMORADO">Demorado</option>
      <option value="ENTREGADO">Entregado</option>
      <option value="CANCELADO">Cancelado</option>
    </select>
  );
}
