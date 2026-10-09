"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function createReferencia(formData: FormData) {
  const { empresa } = await requireAuth();

  const codigo = formData.get("codigo") as string;
  
  const disenoFile = formData.get("disenoArchivo") as File | null;
  const optitexFile = formData.get("optitexArchivo") as File | null;

  if (!codigo) return { error: "El código es requerido." };

  const supabase = await createClient();

  let disenoArchivoUrl = null;
  if (disenoFile && disenoFile.size > 0) {
    const ext = disenoFile.name.split('.').pop();
    const fileName = `${empresa.id}/${Date.now()}-diseno.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('referencias')
      .upload(fileName, disenoFile);
      
    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('referencias').getPublicUrl(fileName);
      disenoArchivoUrl = publicUrlData.publicUrl;
    }
  }

  let optitexArchivoUrl = null;
  if (optitexFile && optitexFile.size > 0) {
    const ext = optitexFile.name.split('.').pop();
    const fileName = `${empresa.id}/${Date.now()}-optitex.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('referencias')
      .upload(fileName, optitexFile);
      
    if (!error && data) {
      const { data: publicUrlData } = supabase.storage.from('referencias').getPublicUrl(fileName);
      optitexArchivoUrl = publicUrlData.publicUrl;
    }
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
  const codigo = formData.get("codigo") as string;
  if (!codigo) return { error: "El código es requerido." };

  await prisma.referencia.update({
    where: { id, empresaId: empresa.id },
    data: { codigo }
  });
  
  redirect("/referencias");
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
