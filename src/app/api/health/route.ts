import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

// Diagnóstico de producción: verifica variables de entorno, sesión y conexión a la base de datos.
// No expone contraseñas ni claves, solo su presencia y los mensajes de error.
export async function GET() {
  const result: Record<string, unknown> = {
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_pgbouncer: process.env.DATABASE_URL?.includes("pgbouncer=true") ?? false,
      DATABASE_URL_port: process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] ?? null,
      DIRECT_URL: !!process.env.DIRECT_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    result.auth = error ? { ok: false, error: error.message } : { ok: true, userId: data.user?.id ?? null };

    if (data.user) {
      try {
        const dbUser = await prisma.usuario.findUnique({ where: { id: data.user.id } });
        result.usuarioEnDB = dbUser ? { ok: true, rol: dbUser.rol, empresaId: dbUser.empresaId } : { ok: false, error: "El usuario no existe en la tabla Usuario" };
      } catch (e: any) {
        result.usuarioEnDB = { ok: false, error: e?.message };
      }
    }
  } catch (e: any) {
    result.auth = { ok: false, error: e?.message };
  }

  try {
    const empresas = await prisma.empresa.count();
    const talleres = await prisma.taller.count();
    const ordenes = await prisma.ordenProduccion.count();
    const invitaciones = await prisma.invitacion.count();
    result.db = { ok: true, empresas, talleres, ordenes, invitaciones };
  } catch (e: any) {
    result.db = { ok: false, error: e?.message };
  }

  return NextResponse.json(result);
}
