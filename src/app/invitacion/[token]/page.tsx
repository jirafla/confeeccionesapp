import { prisma } from "@/lib/prisma";
import { getRoleInfo } from "@/lib/permissions";
import Link from "next/link";
import { Scissors, AlertCircle } from "lucide-react";
import AceptarInvitacionForm from "./AceptarInvitacionForm";

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitacion = await prisma.invitacion.findUnique({
    where: { token },
    include: { empresa: true },
  });

  const expirada = invitacion ? invitacion.expiresAt < new Date() : false;
  const invalida = !invitacion || invitacion.estado !== "PENDIENTE" || expirada;

  if (invalida) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Invitación no disponible</h1>
          <p className="text-sm text-slate-500">
            {expirada
              ? "Este enlace de invitación ha expirado."
              : "Este enlace ya fue utilizado o fue cancelado por el administrador."}
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo(invitacion.rol);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <Scissors className="w-6 h-6" />
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            Invitación de Equipo
          </p>
          <h1 className="text-2xl font-black text-slate-900">
            Únete a {invitacion.empresa.nombre}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configura tu contraseña para ingresar al sistema
          </p>
        </div>

        <AceptarInvitacionForm
          token={invitacion.token}
          email={invitacion.email}
          nombreInicial={invitacion.nombre || ""}
          empresaNombre={invitacion.empresa.nombre}
          rolLabel={roleInfo.label}
          rolBadge={roleInfo.badge}
          rolDescription={roleInfo.description}
        />
      </div>
    </div>
  );
}
