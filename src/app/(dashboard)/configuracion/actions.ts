'use server'

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateEmpresaAction(formData: FormData, empresaId: string) {
  const { user } = await requireAuth();

  if (user.rol !== "ADMIN") {
    return { error: "No tienes permiso para editar la empresa." }
  }

  const nombre = formData.get("nombre") as string;
  const nit = formData.get("nit") as string;

  if (!nombre) return { error: "El nombre es requerido." }

  try {
    await prisma.empresa.update({
      where: { id: empresaId },
      data: { nombre, nit }
    });
    
    revalidatePath("/configuracion");
  } catch (error: any) {
    return { error: error.message }
  }
}
