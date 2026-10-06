import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LoteForm from "@/components/LoteForm";

export default async function NuevoLote() {
  const talleres = await prisma.taller.findMany({ orderBy: { nombre: 'asc' } });

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center space-x-4">
        <Link href="/lotes" className="text-slate-400 hover:text-slate-900 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Nuevo Lote de Producción</h1>
      </div>
      
      <LoteForm talleres={talleres} />
    </div>
  );
}
