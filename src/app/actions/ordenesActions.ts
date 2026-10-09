"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createOrden(formData: FormData) {
  const { empresa } = await requireAuth();

  const clienteId = formData.get("clienteId") as string;
  const referenciaId = formData.get("referenciaId") as string;
  const cantidadTotal = parseInt(formData.get("cantidadTotal") as string);
  const coloresDetalles = formData.get("coloresDetalles") as string;

  if (!clienteId || !referenciaId || isNaN(cantidadTotal)) {
    return { error: "Campos obligatorios incompletos." };
  }

  // Consecutivo por referencia (5370-1, 5370-2...). Se usa el máximo para no repetir números si se elimina una orden.
  const { _max } = await prisma.ordenProduccion.aggregate({
    where: { referenciaId, empresaId: empresa.id },
    _max: { consecutivo: true },
  });
  const consecutivo = (_max.consecutivo ?? 0) + 1;

  const orden = await prisma.ordenProduccion.create({
    data: {
      clienteId,
      referenciaId,
      consecutivo,
      cantidadTotal,
      coloresDetalles,
      estado: "CORTE",
      empresaId: empresa.id
    }
  });

  redirect(`/ordenes/${orden.id}`);
}

export async function updateOrdenEstado(id: string, estado: string) {
  const { empresa } = await requireAuth();

  const orden = await prisma.ordenProduccion.findUnique({
    where: { id, empresaId: empresa.id },
  });

  if (!orden) return { error: "Orden no encontrada." };

  await prisma.ordenProduccion.update({
    where: { id },
    data: { estado }
  });

  revalidatePath(`/ordenes/${id}`);
  revalidatePath("/ordenes");
}

export async function marcarOrdenEntregada(id: string) {
  const { empresa } = await requireAuth();

  const orden = await prisma.ordenProduccion.findUnique({
    where: { id, empresaId: empresa.id },
    include: { asignaciones: true }
  });

  if (!orden) return { error: "Orden no encontrada." };
  if (orden.estado !== "CONFECCION") return { error: "Solo se pueden entregar órdenes en Confección." };
  if (orden.asignaciones.length === 0) return { error: "La orden no tiene lotes asignados a talleres." };

  const pendientes = orden.asignaciones.filter(a => a.estadoLote !== "ENTREGADO").length;
  if (pendientes > 0) {
    return { error: `Hay ${pendientes} lote(s) pendientes por recibir de los talleres.` };
  }

  await prisma.ordenProduccion.update({
    where: { id },
    data: { estado: "ENTREGADO", fechaEntregado: new Date() }
  });

  revalidatePath(`/ordenes/${id}`);
  revalidatePath("/ordenes");
  revalidatePath("/");
}

export async function deleteOrden(id: string) {
  const { empresa } = await requireAuth();

  const orden = await prisma.ordenProduccion.findUnique({
    where: { id, empresaId: empresa.id },
    include: { _count: { select: { asignaciones: true } } }
  });

  if (!orden) return { error: "Orden no encontrada." };
  if (orden._count.asignaciones > 0) return { error: "No se puede eliminar una orden con lotes asignados." };

  await prisma.ordenProduccion.delete({ where: { id } });
  redirect("/ordenes");
}
