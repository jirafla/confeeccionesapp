"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

/** Sube un archivo al bucket público `referencias` y devuelve su URL pública (o null si no hay archivo). */
async function subirArchivo(empresaId: string, file: File | null, tipo: "diseno" | "optitex") {
  if (!file || file.size === 0) return null;

  const supabase = await createClient();
  const ext = file.name.split('.').pop();
  const fileName = `${empresaId}/${Date.now()}-${tipo}.${ext}`;

  const { error } = await supabase.storage.from('referencias').upload(fileName, file);
  if (error) throw new Error(`No se pudo subir el archivo (${tipo}): ${error.message}`);

  return supabase.storage.from('referencias').getPublicUrl(fileName).data.publicUrl;
}

export async function createReferencia(formData: FormData) {
  const { empresa } = await requireAuth();

  const codigo = (formData.get("codigo") as string)?.trim();
  if (!codigo) return { error: "El código es requerido." };

  let disenoArchivoUrl: string | null = null;
  let optitexArchivoUrl: string | null = null;
  try {
    disenoArchivoUrl = await subirArchivo(empresa.id, formData.get("disenoArchivo") as File | null, "diseno");
    optitexArchivoUrl = await subirArchivo(empresa.id, formData.get("optitexArchivo") as File | null, "optitex");
  } catch (e) {
    return { error: (e as Error).message };
  }

  await prisma.referencia.create({
    data: {
      codigo,
      disenoArchivoUrl,
      optitexArchivoUrl,
      empresaId: empresa.id
    }
  });

  redirect("/referencias");
}

export async function updateReferencia(id: string, formData: FormData) {
  const { empresa } = await requireAuth();

  const codigo = (formData.get("codigo") as string)?.trim();
  if (!codigo) return { error: "El código es requerido." };

  const data: { codigo: string; disenoArchivoUrl?: string; optitexArchivoUrl?: string } = { codigo };
  try {
    const diseno = await subirArchivo(empresa.id, formData.get("disenoArchivo") as File | null, "diseno");
    const optitex = await subirArchivo(empresa.id, formData.get("optitexArchivo") as File | null, "optitex");
    // Solo se reemplaza el archivo si el usuario sube uno nuevo
    if (diseno) data.disenoArchivoUrl = diseno;
    if (optitex) data.optitexArchivoUrl = optitex;
  } catch (e) {
    return { error: (e as Error).message };
  }

  await prisma.referencia.update({
    where: { id, empresaId: empresa.id },
    data
  });

  revalidatePath("/referencias");
  revalidatePath(`/referencias/${id}`);
  revalidatePath("/ordenes");
  return { success: true };
}

export async function deleteReferencia(id: string) {
  const { empresa } = await requireAuth();

  const ref = await prisma.referencia.findUnique({
    where: { id, empresaId: empresa.id },
    include: { _count: { select: { ordenes: true } } }
  });

  if (ref && ref._count.ordenes > 0) {
    return { error: "No se puede eliminar porque tiene órdenes asociadas." };
  }

  await prisma.referencia.delete({
    where: { id, empresaId: empresa.id }
  });

  redirect("/referencias");
}
