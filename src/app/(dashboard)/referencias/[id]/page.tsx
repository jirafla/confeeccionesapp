import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  ImageIcon, 
  Shirt, 
  ChevronRight, 
  Plus,
  Layers,
  Sparkles
} from "lucide-react";
import ImageLightbox from "@/components/ImageLightbox";
import ReferenciaEditModal from "@/components/ReferenciaEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { nombreOrden, estadoOrden, downloadUrl, parseTelas } from "@/lib/ordenes";

export default async function ReferenciaDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { empresa } = await requireAuth();
  const { id } = await params;

  const referencia = await prisma.referencia.findUnique({
    where: { id, empresaId: empresa.id },
    include: {
      ordenes: {
        include: { cliente: true, asignaciones: true },
        orderBy: { consecutivo: 'desc' }
      }
    }
  });

  if (!referencia) notFound();

  const ordenes = referencia.ordenes.map(o => ({ ...o, referencia }));
  const totalPrendas = ordenes.reduce((s, o) => s + o.cantidadTotal, 0);
  const activas = ordenes.filter(o => o.estado !== 'ENTREGADO').length;
  const entregadas = ordenes.length - activas;
  const telas = parseTelas(referencia.telasDetalles);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/referencias" className="mt-1 p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referencia</p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{referencia.codigo}</h1>
              {referencia.nombrePrenda && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  {referencia.nombrePrenda}
                </span>
              )}
            </div>
            {referencia.nombrePrenda && (
              <p className="text-sm text-slate-500 mt-0.5">{referencia.nombrePrenda}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ReferenciaEditModal referencia={referencia} variant="button" />
          {ordenes.length === 0 && (
            <DeleteConfirmModal
              action={async () => {
                "use server";
                const { deleteReferencia } = await import("@/app/actions/referenciaActions");
                await deleteReferencia(referencia.id);
              }}
              title="¿Eliminar referencia?"
              description={`Estás a punto de eliminar la referencia ${referencia.codigo}.`}
              iconOnly={true}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* IZQUIERDA: IMAGEN + TELAS + ARCHIVOS */}
        <div className="space-y-5">
          {/* Imagen */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="aspect-square bg-slate-50 flex items-center justify-center">
              {referencia.disenoArchivoUrl ? (
                <ImageLightbox src={referencia.disenoArchivoUrl} alt={referencia.codigo} className="w-full h-full" />
              ) : (
                <div className="flex flex-col items-center text-slate-300">
                  <Shirt className="w-14 h-14 mb-2" />
                  <span className="text-sm font-medium">Sin imagen</span>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta de Telas y Consumo Promedio */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                Telas y Consumo
              </h3>
              <span className="text-xs text-slate-400 font-medium">{telas.length} {telas.length === 1 ? 'tela' : 'telas'}</span>
            </div>

            {telas.length === 0 ? (
              <p className="text-xs text-slate-400 px-1 py-2">
                No hay telas registradas para esta referencia. Puedes agregarlas haciendo clic en &quot;Editar&quot;.
              </p>
            ) : (
              <div className="space-y-2">
                {telas.map((tela, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] font-bold uppercase text-slate-400 block">{tela.nombre}</span>
                      <p className="font-semibold text-slate-800 truncate">{tela.tipo || "Sin tipo especificado"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-indigo-600 text-base">{tela.promedio}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1">mts/pda</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archivos */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">Archivos</h3>
            <ArchivoFila
              icon={<ImageIcon className="w-5 h-5 text-blue-500" />}
              titulo="Imagen del diseño"
              url={referencia.disenoArchivoUrl}
              color="blue"
            />
            <ArchivoFila
              icon={<FileText className="w-5 h-5 text-indigo-500" />}
              titulo="Archivo Optitex"
              url={referencia.optitexArchivoUrl}
              color="indigo"
            />
          </div>
        </div>

        {/* DERECHA: ÓRDENES */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <Stat valor={ordenes.length} label="Órdenes" />
            <Stat valor={activas} label="Activas" />
            <Stat valor={totalPrendas} label="Prendas" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900">
                Órdenes de esta referencia <span className="text-slate-400 font-medium">({ordenes.length})</span>
              </h2>
              <Link href="/ordenes/nuevo" className="text-sm font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Nueva
              </Link>
            </div>

            {ordenes.length === 0 ? (
              <p className="p-10 text-center text-sm text-slate-500">Aún no hay órdenes para esta referencia.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {ordenes.map((o) => {
                  const estado = estadoOrden(o.estado);
                  const buenas = o.asignaciones.reduce((s, a) => s + (a.cantidadBuena || 0), 0);
                  return (
                    <li key={o.id}>
                      <Link href={`/ordenes/${o.id}`} className="flex items-center gap-3 sm:gap-4 p-4 sm:px-5 hover:bg-slate-50 transition-colors group">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="text-sm font-black text-slate-600">#{o.consecutivo}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 group-hover:text-blue-600">{nombreOrden(o)}</span>
                            <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${estado.badge}`}>{estado.label}</span>
                          </div>
                          <p className="text-sm text-slate-500 truncate">
                            {o.cliente.nombre} · {o.createdAt.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900">{o.cantidadTotal}</p>
                          <p className="text-[11px] text-slate-500">{o.estado === 'CORTE' ? 'uds' : `${buenas} recib.`}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {entregadas > 0 && (
            <p className="text-xs text-slate-400 text-center">{entregadas} {entregadas === 1 ? "orden entregada" : "órdenes entregadas"} al cliente.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ valor, label }: { valor: number; label: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4">
      <p className="text-2xl sm:text-3xl font-black text-slate-900">{valor.toLocaleString("es-CO")}</p>
      <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ArchivoFila({ icon, titulo, url, color }: { icon: React.ReactNode; titulo: string; url: string | null; color: "blue" | "indigo" }) {
  const btn = color === "blue"
    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100";
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl">
      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{titulo}</p>
        <p className="text-xs text-slate-400">{url ? "Disponible" : "No cargado"}</p>
      </div>
      {url ? (
        <a href={downloadUrl(url)} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${btn}`}>
          <Download className="w-4 h-4" /> Descargar
        </a>
      ) : (
        <span className="text-xs text-slate-300 px-3">—</span>
      )}
    </div>
  );
}
