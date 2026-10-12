"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function aceptarInvitacionAction(formData: FormData) {
  const token = (formData.get("token") as string) || "";
  const nombre = ((formData.get("nombre") as string) || "").trim();
  const password = (formData.get("password") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (!token || !nombre || !password) {
    return { error: "Por favor completa todos los campos." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const invitacion = await prisma.invitacion.findUnique({
    where: { token },
    include: { empresa: true },
  });

  if (!invitacion || invitacion.estado !== "PENDIENTE") {
    return { error: "Esta invitación ya fue utilizada o revocada." };
  }

  if (invitacion.expiresAt < new Date()) {
    return { error: "Esta invitación ha expirado. Solicita un nuevo enlace al administrador." };
  }

  const supabase = await createClient();

  // Cerrar sesión previa si hubiera otra cuenta abierta en el mismo navegador
  await supabase.auth.signOut();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: invitacion.email,
    password,
    options: {
      data: {
        nombre,
        empresaId: invitacion.empresaId,
        rol: invitacion.rol,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const authUser = signUpData.user;
  if (!authUser) {
    return { error: "No se pudo crear el usuario de autenticación." };
  }

  await prisma.$transaction([
    prisma.usuario.upsert({
      where: { email: invitacion.email },
      update: {
        id: authUser.id,
        nombre,
        rol: invitacion.rol,
        empresaId: invitacion.empresaId,
      },
      create: {
        id: authUser.id,
        email: invitacion.email,
        nombre,
        rol: invitacion.rol,
        empresaId: invitacion.empresaId,
      },
    }),
    prisma.invitacion.update({
      where: { id: invitacion.id },
      data: {
        estado: "ACEPTADA",
        nombre,
      },
    }),
  ]);

  revalidatePath("/", "layout");
  redirect("/");
}
