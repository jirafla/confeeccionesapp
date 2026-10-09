"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { updateOrdenEstado } from "./ordenesActions";

export async function createAsignacion(ordenId: string, formData: FormData) {
  const { empresa } = await requireAuth();

  const tallerId = formData.get("tallerId") as string;
  const cantidadAsignada = parseInt(formData.get("cantidadAsignada") as string);
  const precioUnitario = parseFloat(formData.get("precioUnitario") as string);
  const fechaEnvio = new Date(formData.get("fechaEnvio") as string);
  const fechaEntregaEsperada = new Date(formData.get("fechaEntregaEsperada") as string);
  const insumosEntregados = formData.get("insumosEntregados") as string;

  if (!tallerId || isNaN(cantidadAsignada) || isNaN(precioUnitario)) {
    return { error: "Campos obligatorios incompletos o inválidos." };
  }

  // 1. Validar que la orden pertenece a la empresa
  const orden = await prisma.ordenProduccion.findUnique({
    where: { id: ordenId, empresaId: empresa.id },
    include: { asignaciones: true }
  });

  if (!orden) return { error: "Orden no encontrada." };

  // 2. Validar Suma Exacta
  const asignadoActual = orden.asignaciones.reduce((sum, a) => sum + a.cantidadAsignada, 0);
  if (asignadoActual + cantidadAsignada > orden.cantidadTotal) {
    return { 
      error: `La cantidad supera la orden original. Faltan por asignar solo ${orden.cantidadTotal - asignadoActual} prendas.`
    };
  }

  // 3. Crear Asignación
  await prisma.asignacion.create({
    data: {
      ordenId,
      tallerId,
      cantidadAsignada,
      precioUnitario,
      fechaEnvio,
      fechaEntregaEsperada,
      insumosEntregados,
      empresaId: empresa.id
    }
  });

  // 4. Mover la orden a "CONFECCION" si estaba en DISENO o CORTE
  if (orden.estado !== "CONFECCION" && orden.estado !== "ENTREGADO") {
    await prisma.ordenProduccion.update({
      where: { id: ordenId },
      data: { estado: "CONFECCION" }
    });
  }

  revalidatePath(`/ordenes/${ordenId}`);
}

export async function conciliarAsignacion(asignacionId: string, formData: FormData) {
  const { empresa } = await requireAuth();

  const cantidadBuena = parseInt(formData.get("cantidadBuena") as string);
  const reprocesos = parseInt(formData.get("reprocesos") as string);

  if (isNaN(cantidadBuena) || isNaN(reprocesos)) {
    return { error: "Debe ingresar números válidos." };
  }

  const asignacion = await prisma.asignacion.findUnique({
    where: { id: asignacionId, empresaId: empresa.id }
  });

  if (!asignacion) return { error: "Asignación no encontrada." };

  // Validar Cuadre Matemático
  if (cantidadBuena + reprocesos !== asignacion.cantidadAsignada) {
    return { 
      error: `Descuadre: La suma de ropa buena (${cantidadBuena}) y reprocesos (${reprocesos}) debe ser igual a la cantidad que se le entregó al taller (${asignacion.cantidadAsignada}).` 
    };
  }

  await prisma.asignacion.update({
    where: { id: asignacionId },
    data: {
      cantidadBuena,
      reprocesos,
      estadoLote: "ENTREGADO"
    }
  });

  revalidatePath(`/ordenes/${asignacion.ordenId}`);
  revalidatePath(`/talleres/${asignacion.tallerId}`);
}
