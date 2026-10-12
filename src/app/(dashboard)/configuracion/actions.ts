'use server'

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { canManageUsers, getRoleInfo } from "@/lib/permissions"
import { headers } from "next/headers"

export async function updateEmpresaAction(formData: FormData, empresaId: string) {
  const { user } = await requireAuth();

  if (!canManageUsers(user.rol)) {
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
    return { success: true };
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function crearInvitacionAction(formData: FormData) {
  const { user, empresa } = await requireAuth();

  if (!canManageUsers(user.rol)) {
    return { error: "Solo un Administrador puede invitar colaboradores." };
  }

  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const nombre = ((formData.get("nombre") as string) || "").trim();
  const rol = ((formData.get("rol") as string) || "OPERADOR").trim().toUpperCase();

  if (!email || !email.includes("@")) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  if (!["ADMIN", "SUPERVISOR", "OPERADOR"].includes(rol)) {
    return { error: "Rol no válido." };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    if (existente.empresaId === empresa.id) {
      return { error: "Este correo ya pertenece a un miembro activo de tu empresa." };
    }
    return { error: "Este correo ya está registrado en otra cuenta." };
  }

  // Revocar invitaciones pendientes previas al mismo correo en esta empresa
  await prisma.invitacion.updateMany({
    where: {
      empresaId: empresa.id,
      email,
      estado: "PENDIENTE",
    },
    data: { estado: "REVOCADA" },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitacion = await prisma.invitacion.create({
    data: {
      email,
      nombre: nombre || null,
      rol,
      empresaId: empresa.id,
      expiresAt,
    },
  });

  // Construir URL absoluta
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const inviteUrl = `${proto}://${host}/invitacion/${invitacion.token}`;

  let emailSent = false;
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const roleInfo = getRoleInfo(rol);
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Confección <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [email],
          subject: `Invitación a unirte a ${empresa.nombre}`,
          html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
              <h2 style="color: #0f172a; margin-top: 0;">Hola${nombre ? ` ${nombre}` : ""},</h2>
              <p style="color: #475569; line-height: 1.6;">
                Has sido invitado(a) a colaborar en <strong>${empresa.nombre}</strong> con el rol de <strong>${roleInfo.label}</strong>.
              </p>
              <div style="margin: 28px 0;">
                <a href="${inviteUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">
                  Aceptar invitación y crear contraseña
                </a>
              </div>
              <p style="color: #64748b; font-size: 12px;">
                O copia y pega este enlace en tu navegador:<br/>
                <a href="${inviteUrl}" style="color: #2563eb;">${inviteUrl}</a>
              </p>
            </div>
          `,
        }),
      });
      emailSent = res.ok;
    } catch {
      emailSent = false;
    }
  }

  revalidatePath("/configuracion");
  return {
    success: true,
    inviteUrl,
    emailSent,
  };
}

export async function revocarInvitacionAction(invitacionId: string) {
  const { user, empresa } = await requireAuth();
  if (!canManageUsers(user.rol)) {
    return { error: "No autorizado." };
  }

  await prisma.invitacion.updateMany({
    where: { id: invitacionId, empresaId: empresa.id },
    data: { estado: "REVOCADA" },
  });

  revalidatePath("/configuracion");
  return { success: true };
}

export async function cambiarRolUsuarioAction(usuarioId: string, nuevoRol: string) {
  const { user, empresa } = await requireAuth();
  if (!canManageUsers(user.rol)) {
    return { error: "Solo un Administrador puede cambiar roles." };
  }

  if (!["ADMIN", "SUPERVISOR", "OPERADOR"].includes(nuevoRol)) {
    return { error: "Rol inválido." };
  }

  if (usuarioId === user.id && nuevoRol !== "ADMIN") {
    return { error: "No puedes quitarte el rol de Administrador a ti mismo." };
  }

  await prisma.usuario.updateMany({
    where: { id: usuarioId, empresaId: empresa.id },
    data: { rol: nuevoRol },
  });

  revalidatePath("/configuracion");
  return { success: true };
}

export async function eliminarUsuarioEquipoAction(usuarioId: string) {
  const { user, empresa } = await requireAuth();
  if (!canManageUsers(user.rol)) {
    return { error: "Solo un Administrador puede eliminar usuarios." };
  }

  if (usuarioId === user.id) {
    return { error: "No puedes eliminar tu propio usuario." };
  }

  await prisma.usuario.deleteMany({
    where: { id: usuarioId, empresaId: empresa.id },
  });

  revalidatePath("/configuracion");
  return { success: true };
}
