import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2, Users, UserPlus, ShieldCheck } from "lucide-react";
import UpdateEmpresaForm from "./UpdateEmpresaForm";
import InvitarColaboradorForm from "./InvitarColaboradorForm";
import EquipoList from "./EquipoList";
import { canManageUsers, getRoleInfo } from "@/lib/permissions";

export default async function Configuracion() {
  const { user, empresa } = await requireAuth();
  const esAdmin = canManageUsers(user.rol);
  const myRole = getRoleInfo(user.rol);

  const [usuarios, invitacionesPendientes] = await Promise.all([
    prisma.usuario.findMany({
      where: { empresaId: empresa.id },
      orderBy: { createdAt: "asc" },
    }),
    esAdmin
      ? prisma.invitacion.findMany({
          where: {
            empresaId: empresa.id,
            estado: "PENDIENTE",
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Configuración</h1>
          <p className="text-sm text-slate-500">Administra tu empresa, invitaciones y permisos de tu equipo.</p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-slate-500">Tu rol:</span>
          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${myRole.badge}`}>
            {myRole.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="space-y-5 sm:space-y-6">
          <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Datos de la Empresa</h2>
                <p className="text-xs text-slate-500">Información general de la organización</p>
              </div>
            </div>

            {esAdmin ? (
              <UpdateEmpresaForm empresa={empresa} />
            ) : (
              <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400 block">Nombre</span>
                  <span className="font-semibold text-slate-900">{empresa.nombre}</span>
                </div>
                {empresa.nit && (
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 block">NIT</span>
                    <span className="font-semibold text-slate-900">{empresa.nit}</span>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Miembros del Equipo</h2>
                  <p className="text-xs text-slate-500">Colaboradores con acceso activo</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
                {usuarios.length}
              </span>
            </div>

            <EquipoList
              usuarios={usuarios}
              currentUserId={user.id}
              esAdmin={esAdmin}
            />
          </section>
        </div>

        {esAdmin && (
          <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5 h-fit">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Invitar Colaborador</h2>
                <p className="text-xs text-slate-500">
                  Envía una invitación con rol preasignado para que cree su contraseña
                </p>
              </div>
            </div>

            <InvitarColaboradorForm
              invitacionesPendientes={invitacionesPendientes}
              empresaNombre={empresa.nombre}
            />
          </section>
        )}
      </div>
    </div>
  );
}
