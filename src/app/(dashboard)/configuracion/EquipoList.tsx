"use client";

import { useState } from "react";
import { cambiarRolUsuarioAction, eliminarUsuarioEquipoAction } from "./actions";
import { getRoleInfo, RolUsuario } from "@/lib/permissions";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

type UsuarioItem = {
  id: string;
  email: string;
  nombre: string | null;
  rol: string;
};

export default function EquipoList({
  usuarios,
  currentUserId,
  esAdmin,
}: {
  usuarios: UsuarioItem[];
  currentUserId: string;
  esAdmin: boolean;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <ul className="space-y-2.5">
      {usuarios.map((u) => {
        const isSelf = u.id === currentUserId;
        const roleInfo = getRoleInfo(u.rol);

        return (
          <li
            key={u.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 uppercase shrink-0">
                {(u.nombre || u.email).charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {u.nombre || u.email}
                  </p>
                  {isSelf && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 ring-1 ring-blue-200 text-[10px] font-bold rounded-full">
                      Tú
                    </span>
                  )}
                </div>
                {u.nombre && (
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 shrink-0">
              {esAdmin && !isSelf ? (
                <>
                  <select
                    disabled={loadingId === u.id}
                    value={u.rol}
                    onChange={async (e) => {
                      const nuevoRol = e.target.value as RolUsuario;
                      setLoadingId(u.id);
                      const res = await cambiarRolUsuarioAction(u.id, nuevoRol);
                      setLoadingId(null);
                      if (res?.error) toast.error(res.error);
                      else toast.success(`Rol actualizado a ${getRoleInfo(nuevoRol).label}`);
                    }}
                    className="text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:border-blue-500 outline-none"
                  >
                    <option value="OPERADOR">Operador</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  <button
                    type="button"
                    disabled={loadingId === u.id}
                    onClick={async () => {
                      if (!confirm(`¿Eliminar a ${u.nombre || u.email} del equipo?`)) return;
                      setLoadingId(u.id);
                      const res = await eliminarUsuarioEquipoAction(u.id);
                      setLoadingId(null);
                      if (res?.error) toast.error(res.error);
                      else toast.success("Colaborador eliminado del equipo");
                    }}
                    title="Eliminar del equipo"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${roleInfo.badge}`}>
                  {roleInfo.label}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
