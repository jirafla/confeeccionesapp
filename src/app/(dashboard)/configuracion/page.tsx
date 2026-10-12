import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2, Users, KeySquare } from "lucide-react";
import UpdateEmpresaForm from "./UpdateEmpresaForm";
import CopyButton from "@/components/CopyButton";

export default async function Configuracion() {
  const { user, empresa } = await requireAuth();

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: empresa.id }
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-sm text-slate-500">Administra tu empresa y los usuarios de tu equipo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-slate-900">Datos de la Empresa</h2>
          </div>

          <UpdateEmpresaForm empresa={empresa} />

          <div className="pt-5 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-2">ID de Invitación</p>
            <div className="flex items-center gap-2 bg-slate-50 p-2 pl-3 rounded-xl border border-slate-200">
              <KeySquare className="w-4 h-4 text-slate-400 shrink-0" />
              <code className="text-xs sm:text-sm text-slate-700 flex-1 truncate select-all">{empresa.id}</code>
              <CopyButton value={empresa.id} />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Comparte este ID con tus empleados para que se unan a tu empresa al registrarse.
            </p>
          </div>
        </section>

        <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-bold text-slate-900">Usuarios del Equipo</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">{usuarios.length}</span>
          </div>

          <ul className="space-y-2">
            {usuarios.map(u => (
              <li key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 uppercase shrink-0">
                  {u.email.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{u.email}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{u.rol}</p>
                </div>
                {u.id === user.id && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-[11px] font-bold rounded-full">Tú</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
