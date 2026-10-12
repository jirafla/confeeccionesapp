import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Calendar, Scissors, Factory, PackageCheck, Shirt, CheckCircle2 } from "lucide-react";
import CalculadoraCostos from "../CalculadoraCostos";
import { nombreOrden, parseTelas, parseInsumos } from "@/lib/ordenes";
import { canViewCosts } from "@/lib/permissions";

const fmtFecha = (d: Date | null) => d ? d.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : 'Pendiente';

export default async function ResumenOrden({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, empresa } = await requireAuth();
  const mostrarPrecios = canViewCosts(user.rol);

  const orden = await prisma.ordenProduccion.findFirst({
    where: { id, empresaId: empresa.id },
    include: {
      cliente: true,
      referencia: true,
      asignaciones: {
        include: { taller: true }
      }
    }
  });

  if (!orden) notFound();

  const telas = parseTelas(orden.referencia.telasDetalles);
  const insumos = parseInsumos(orden.referencia.insumosDetalles);

  const asignadas = orden.asignaciones.filter(a => !a.esReproceso).reduce((sum, a) => sum + a.cantidadAsignada, 0);
  const buenas = orden.asignaciones.reduce((sum, a) => sum + (a.cantidadBuena || 0), 0);
  const reprocesos = orden.asignaciones.reduce((sum, a) => sum + (a.reprocesos || 0), 0);

  // Calcular las fechas
  const fechaCorte = orden.createdAt;
  
  // Buscar la fecha del primer lote enviado a taller
  let fechaConfeccion: Date | null = null;
  if (orden.asignaciones.length > 0) {
    fechaConfeccion = orden.asignaciones.reduce((earliest, a) => 
      a.fechaEnvio < earliest ? a.fechaEnvio : earliest, 
      orden.asignaciones[0].fechaEnvio
    );
  }

  const fechaEntrega = orden.fechaEntregado || null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PackageCheck className="w-8 h-8 text-emerald-500" />
              Resumen de Producción
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-bold text-slate-700">{nombreOrden(orden)}</span>
              <span className="text-slate-300">•</span>
              {orden.cliente.nombre}
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-sm rounded-full ring-1 ring-emerald-200">
            Completada
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
        <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" /> Línea de Tiempo
        </h2>
        
        <div className="relative border-l-2 border-slate-100 ml-3 sm:ml-4 space-y-8 pb-4">
          {/* Paso 1: Corte */}
          <div className="relative pl-6 sm:pl-8">
            <span className="absolute -left-[17px] bg-white ring-4 ring-white rounded-full">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                <Scissors className="w-4 h-4 text-blue-600" />
              </div>
            </span>
            <h3 className="font-bold text-slate-900 text-base">Inició Producción (Corte)</h3>
            <p className="text-sm text-slate-500 mt-0.5">Se creó la orden y se programó el corte de las prendas.</p>
            <p className="text-xs font-bold text-blue-600 mt-1.5">{fmtFecha(fechaCorte)}</p>
          </div>

          {/* Paso 2: Confección */}
          <div className="relative pl-6 sm:pl-8">
            <span className="absolute -left-[17px] bg-white ring-4 ring-white rounded-full">
              <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                <Factory className="w-4 h-4 text-indigo-600" />
              </div>
            </span>
            <h3 className="font-bold text-slate-900 text-base">Confección en Talleres</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {fechaConfeccion 
                ? `Se despachó el primer lote a confección. (Total de lotes: ${orden.asignaciones.length})` 
                : "No se registraron envíos a talleres."}
            </p>
            {fechaConfeccion && (
              <p className="text-xs font-bold text-indigo-600 mt-1.5">{fmtFecha(fechaConfeccion)}</p>
            )}
          </div>

          {/* Paso 3: Entrega */}
          <div className="relative pl-6 sm:pl-8">
            <span className="absolute -left-[17px] bg-white ring-4 ring-white rounded-full">
              <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </span>
            <h3 className="font-bold text-slate-900 text-base">Entrega al Cliente</h3>
            <p className="text-sm text-slate-500 mt-0.5">Producción finalizada y marcada como entregada.</p>
            <p className="text-xs font-bold text-emerald-600 mt-1.5">{fmtFecha(fechaEntrega)}</p>
          </div>
        </div>
      </div>

      {/* Resultados de Producción */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Pedido</p>
          <p className="text-2xl font-black text-slate-900">{orden.cantidadTotal}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm text-center">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Recibidas Bien</p>
          <p className="text-2xl font-black text-emerald-700">{buenas}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm text-center">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Reprocesos</p>
          <p className="text-2xl font-black text-amber-700">{reprocesos}</p>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm text-center">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Mermas</p>
          <p className="text-2xl font-black text-rose-700">{Math.max(0, asignadas - buenas)}</p>
        </div>
      </div>

      {/* Calculadora de Costos */}
      {mostrarPrecios && (
        <CalculadoraCostos
          ordenId={orden.id}
          telas={telas}
          insumos={insumos}
          costoCorte={orden.precioCorte || 0}
          costoConfeccion={orden.asignaciones.reduce((sum, a) => sum + (a.cantidadAsignada * a.precioUnitario) - (a.descuentoReproceso || 0), 0)}
          cantidadBuenas={buenas}
          costosGuardados={orden.costosMateriales}
        />
      )}
    </div>
  );
}
