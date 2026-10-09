"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createOrden(formData: FormData) {
  const { empresa } = await requireAuth();

  const clienteId = formData.get("clienteId") as string;
  const referenciaId = formData.get("referenciaId") as string;
  const cantidadTotal = parseInt(formData.get("cantidadTotal") as string);
  const coloresDetalles = formData.get("coloresDetalles") as string;

  if (!clienteId || !referenciaId || isNaN(cantidadTotal)) {
    return { error: "Campos obligatorios incompletos." };
  }

  await prisma.ordenProduccion.create({
    data: {
      clienteId,
      referenciaId,
      cantidadTotal,
      coloresDetalles,
      estado: "DISENO",
      empresaId: empresa.id
    }
  });

  redirect("/ordenes");
}

export async function updateOrdenEstado(id: string, estado: string) {
  const { empresa } = await requireAuth();

  const orden = await prisma.ordenProduccion.findUnique({
    where: { id, empresaId: empresa.id },
    include: {
      asignaciones: true
    }
  });

  if (!orden) return { error: "Orden no encontrada." };

  if (estado === "CONFECCION") {
    if (orden.asignaciones.length === 0) {
      return { error: "No puedes pasar a confección sin haber asignado piezas a ningún taller." };
    }
  }

  await prisma.ordenProduccion.update({
    where: { id },
    data: { estado }
  });
}
