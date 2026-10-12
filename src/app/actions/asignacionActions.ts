"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAsignacion(ordenId: string, formData: FormData) {
  const { empresa } = await requireAuth();

  const tallerId = formData.get("tallerId") as string;
  const cantidadAsignada = parseInt(formData.get("cantidadAsignada") as string);
  const precioRaw = formData.get("precioUnitario") as string;
  const precioUnitario = precioRaw ? parseFloat(precioRaw) : 0;
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

  // 2. Validar Suma Exacta (ignorando asignaciones que sean solo reprocesos)
  const asignadoActual = orden.asignaciones
    .filter(a => !a.esReproceso)
    .reduce((sum, a) => sum + a.cantidadAsignada, 0);

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

  // 4. Mover la orden a "CONFECCION"
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

  let cantidadBuena = parseInt(formData.get("cantidadBuena") as string);
  let reprocesos = parseInt(formData.get("reprocesos") as string);

  const accionReproceso = formData.get("accionReproceso") as string;
  const descuentoReproceso = parseFloat(formData.get("descuentoReproceso") as string) || 0;
  
  const nuevoTallerId = formData.get("nuevoTallerId") as string;
  const nuevoPrecioUnitario = parseFloat(formData.get("nuevoPrecioUnitario") as string) || 0;

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
      error: `Descuadre: La suma de ropa buena (${cantidadBuena}) y reprocesos (${reprocesos}) debe ser igual a la cantidad entregada al taller (${asignacion.cantidadAsignada}).` 
    };
  }

  // Lógica de Reprocesos
  let notasReproceso = null;

  if (reprocesos > 0) {
    if (accionReproceso === "INTERNO") {
      cantidadBuena += reprocesos;
      notasReproceso = `Ajuste Interno a ${reprocesos} prendas defectuosas.`;
      reprocesos = 0; 
    } else if (accionReproceso === "MISMO_TALLER" || accionReproceso === "OTRO_TALLER") {
      const destinoId = accionReproceso === "MISMO_TALLER" ? asignacion.tallerId : nuevoTallerId;
      if (!destinoId) return { error: "Debe seleccionar un taller para el reproceso." };
      
      await prisma.asignacion.create({
        data: {
          ordenId: asignacion.ordenId,
          tallerId: destinoId,
          cantidadAsignada: reprocesos,
          precioUnitario: nuevoPrecioUnitario,
          fechaEnvio: new Date(),
          fechaEntregaEsperada: new Date(new Date().setDate(new Date().getDate() + 3)),
          esReproceso: true,
          empresaId: empresa.id
        }
      });
      notasReproceso = `Se enviaron ${reprocesos} prendas a reproceso.`;
    }
  }

  await prisma.asignacion.update({
    where: { id: asignacionId },
    data: {
      cantidadBuena,
      reprocesos,
      estadoLote: "ENTREGADO",
      descuentoReproceso,
      notasReproceso
    }
  });

  revalidatePath(`/ordenes/${asignacion.ordenId}`);
  revalidatePath(`/talleres/${asignacion.tallerId}`);
}
