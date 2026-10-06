"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTallerAction(id: string, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;
  const direccion = formData.get("direccion") as string;

  if (!nombre) return;

  await prisma.taller.update({
    where: { id },
    data: { nombre, telefono, direccion }
  });

  revalidatePath(`/talleres/${id}`);
}
