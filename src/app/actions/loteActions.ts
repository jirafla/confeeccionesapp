"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createLote(formData: FormData) {
  await prisma.lote.create({
    data: {
      numeroLote: formData.get("referencia") as string,
      tipoPrenda: formData.get("tipoPrenda") as string,
      cantidad: parseInt(formData.get("cantidad") as string),
      precioUnitario: parseFloat(formData.get("precioUnitario") as string),
      fechaInicio: new Date(formData.get("fechaInicio") as string),
      fechaEntregaPactada: new Date(formData.get("fechaEntregaPactada") as string),
      tallerId: formData.get("tallerId") as string,
      insumosEntregados: formData.get("insumosEntregados") as string,
    }
  });

  redirect("/lotes");
}

export async function searchReferencias(query: string) {
  if (!query || query.length < 2) return [];
  
  // Get unique references that match the query
  const lotes = await prisma.lote.findMany({
    where: {
      numeroLote: {
        contains: query
      }
    },
    select: {
      numeroLote: true,
      tipoPrenda: true
    }
  });

  const unique: {numeroLote: string, tipoPrenda: string}[] = [];
  const seen = new Set();
  for (const item of lotes) {
    if (!seen.has(item.numeroLote)) {
      seen.add(item.numeroLote);
      unique.push(item);
    }
  }
  
  return unique.slice(0, 5);
}

export async function updateLoteCompletoAction(id: string, formData: FormData) {
  await prisma.lote.update({
    where: { id },
    data: {
      numeroLote: formData.get("referencia") as string,
      tipoPrenda: formData.get("tipoPrenda") as string,
      cantidad: parseInt(formData.get("cantidad") as string),
      precioUnitario: parseFloat(formData.get("precioUnitario") as string),
      fechaInicio: new Date(formData.get("fechaInicio") as string),
      fechaEntregaPactada: new Date(formData.get("fechaEntregaPactada") as string),
      tallerId: formData.get("tallerId") as string,
      insumosEntregados: formData.get("insumosEntregados") as string,
    }
  });

  revalidatePath(`/lotes/${id}`);
}
