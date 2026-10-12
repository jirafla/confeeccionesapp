export type RolUsuario = "ADMIN" | "SUPERVISOR" | "OPERADOR";

export const ROLES_INFO: Record<
  RolUsuario,
  { label: string; description: string; badge: string }
> = {
  ADMIN: {
    label: "Administrador",
    description: "Control total: costos, usuarios, configuración y eliminación de registros.",
    badge: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  },
  SUPERVISOR: {
    label: "Supervisor",
    description: "Ve precios, pagos y calculadora de costos. Gestiona producción sin eliminar registros ni administrar usuarios.",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  OPERADOR: {
    label: "Operador",
    description: "Enfoque operativo: gestiona cortes, envíos y recepción de talleres. No ve precios ni calculadora de costos.",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
};

export function canViewCosts(rol?: string | null): boolean {
  return rol === "ADMIN" || rol === "SUPERVISOR";
}

export function canDelete(rol?: string | null): boolean {
  return rol === "ADMIN";
}

export function canManageUsers(rol?: string | null): boolean {
  return rol === "ADMIN";
}

export function getRoleInfo(rol?: string | null) {
  if (rol && rol in ROLES_INFO) {
    return ROLES_INFO[rol as RolUsuario];
  }
  return {
    label: rol || "Operador",
    description: "",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  };
}
