"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addAbonoAction(loteId: string, formData: FormData) {
  const monto = parseFloat(formData.get("monto") as string);
  const nota = (formData.get("nota") as string) || null;

  if (isNaN(monto) || monto <= 0) {
    throw new Error("Monto inválido");
  }

  await prisma.abono.create({
    data: {
      monto,
      nota,
      loteId
    }
  });

  // Calculate if fully paid
  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: { abonos: true }
  });

  if (lote) {
    const totalAbonado = lote.abonos.reduce((acc, a) => acc + a.monto, 0);
    const totalPagar = lote.cantidad * lote.precioUnitario;
    
    if (totalAbonado >= totalPagar && !lote.pagado) {
      await prisma.lote.update({
        where: { id: loteId },
        data: { pagado: true }
      });
    } else if (totalAbonado < totalPagar && lote.pagado) {
      await prisma.lote.update({
        where: { id: loteId },
        data: { pagado: false }
      });
    }
  }

  revalidatePath(`/lotes/${loteId}`);
}

export async function deleteAbonoAction(abonoId: string, loteId: string) {
  await prisma.abono.delete({
    where: { id: abonoId }
  });
  
  // Recalculate
  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    include: { abonos: true }
  });

  if (lote) {
    const totalAbonado = lote.abonos.reduce((acc, a) => acc + a.monto, 0);
    const totalPagar = lote.cantidad * lote.precioUnitario;
    
    if (totalAbonado < totalPagar && lote.pagado) {
      await prisma.lote.update({
        where: { id: loteId },
        data: { pagado: false }
      });
    }
  }

  revalidatePath(`/lotes/${loteId}`);
}
