import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2, Users, KeySquare } from "lucide-react";
import UpdateEmpresaForm from "./UpdateEmpresaForm";

export default async function Configuracion() {
  const { user, empresa } = await requireAuth();

  const usuarios = await prisma.usuario.findMany({
    where: { empresaId: empresa.id }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Administra tu empresa y los usuarios de tu equipo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <Building2 className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Datos de la Empresa</h2>
          </div>
          
          <UpdateEmpresaForm empresa={empresa} />

          <div className="pt-4 border-t border-slate-100">
            <p className="text-sm font-semibold text-gray-700 mb-2">ID de Invitación</p>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <KeySquare className="w-4 h-4 text-slate-400" />
              <code className="text-sm text-slate-700 flex-1 select-all">{empresa.id}</code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Comparte este ID con tus empleados para que se unan a tu empresa al registrarse.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-600 mb-4">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-gray-900">Usuarios del Equipo</h2>
          </div>

          <div className="space-y-3">
            {usuarios.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{u.email}</p>
                  <p className="text-xs text-gray-500">{u.rol}</p>
                </div>
                {u.id === user.id && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">Tú</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
