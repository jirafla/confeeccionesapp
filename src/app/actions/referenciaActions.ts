"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'; // need to install uuid or just use crypto

export async function createReferencia(formData: FormData) {
  const { empresa } = await requireAuth();

  const codigo = formData.get("codigo") as string;
  const precioBase = parseFloat(formData.get("precioBase") as string);
  
  const disenoFile = formData.get("disenoArchivo") as File | null;
  const optitexFile = formData.get("optitexArchivo") as File | null;

  if (!codigo || isNaN(precioBase)) return { error: "Campos inválidos" };

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
      precioBase,
      disenoArchivoUrl,
      optitexArchivoUrl,
      empresaId: empresa.id
    }
  });

  redirect("/referencias");
}
