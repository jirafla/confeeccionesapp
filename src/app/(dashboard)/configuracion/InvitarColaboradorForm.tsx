"use client";

import { useState } from "react";
import { crearInvitacionAction, revocarInvitacionAction } from "./actions";
import { ROLES_INFO, RolUsuario, getRoleInfo } from "@/lib/permissions";
import { toast } from "sonner";
import { MailPlus, Copy, Check, Trash2, Share2, Link2 } from "lucide-react";

type InvitacionItem = {
  id: string;
  token: string;
  email: string;
  nombre: string | null;
  rol: string;
  expiresAt: Date;
};

export default function InvitarColaboradorForm({
  invitacionesPendientes,
  empresaNombre,
}: {
  invitacionesPendientes: InvitacionItem[];
  empresaNombre: string;
}) {
  const [rolSeleccionado, setRolSeleccionado] = useState<RolUsuario>("OPERADOR");
  const [isPending, setIsPending] = useState(false);
  const [ultimoLink, setUltimoLink] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copiarLink = async (tokenOrUrl: string, isFullUrl = false) => {
    const url = isFullUrl
      ? tokenOrUrl
      : `${window.location.origin}/invitacion/${tokenOrUrl}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(tokenOrUrl);
      toast.success("Enlace de invitación copiado al portapapeles");
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const compartirWhatsApp = (inv: { token: string; nombre?: string | null; rol: string }) => {
    const url = `${window.location.origin}/invitacion/${inv.token}`;
    const roleLabel = getRoleInfo(inv.rol).label;
    const texto = `Hola${inv.nombre ? ` ${inv.nombre}` : ""}, te invito a unirte al equipo de *${empresaNombre}* con el rol de *${roleLabel}*. Ingresa a este enlace para crear tu contraseña: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <form
        action={async (formData) => {
          setIsPending(true);
          setUltimoLink(null);
          formData.set("rol", rolSeleccionado);
          const res = await crearInvitacionAction(formData);
          setIsPending(false);

          if (res?.error) {
            toast.error(res.error);
          } else if (res?.success) {
            setUltimoLink(res.inviteUrl || null);
            if (res.emailSent) {
              toast.success("Invitación creada y enviada por correo electrónico.");
            } else {
              toast.success("Invitación generada. Copia el enlace para compartirlo con el colaborador.");
            }
          }
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Nombre (Opcional)
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej. Laura Gómez"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="colaborador@correo.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Asignar Rol
          </label>
          <div className="grid grid-cols-1 gap-2">
            {(["OPERADOR", "SUPERVISOR", "ADMIN"] as RolUsuario[]).map((rolKey) => {
              const info = ROLES_INFO[rolKey];
              const active = rolSeleccionado === rolKey;
              return (
                <label
                  key={rolKey}
                  onClick={() => setRolSeleccionado(rolKey)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500/20"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="rolRadio"
                    value={rolKey}
                    checked={active}
                    onChange={() => setRolSeleccionado(rolKey)}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{info.label}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${info.badge}`}>
                        {rolKey}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {info.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <MailPlus className="w-4 h-4" />
          {isPending ? "Generando invitación..." : "Invitar Colaborador"}
        </button>
      </form>

      {ultimoLink && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 animate-in fade-in">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-4 h-4" /> Enlace de invitación listo
          </p>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-200">
            <code className="text-xs text-slate-700 flex-1 truncate select-all">{ultimoLink}</code>
            <button
              type="button"
              onClick={() => copiarLink(ultimoLink, true)}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 shrink-0"
            >
              {copiedToken === ultimoLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copiar
            </button>
          </div>
        </div>
      )}

      {invitacionesPendientes.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Invitaciones Pendientes ({invitacionesPendientes.length})
          </h3>
          <ul className="space-y-2">
            {invitacionesPendientes.map((inv) => {
              const roleInfo = getRoleInfo(inv.rol);
              return (
                <li
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {inv.nombre ? `${inv.nombre} (${inv.email})` : inv.email}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${roleInfo.badge}`}>
                        {roleInfo.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Expira el {new Date(inv.expiresAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => copiarLink(inv.token)}
                      title="Copiar link de invitación"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      {copiedToken === inv.token ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => compartirWhatsApp(inv)}
                      title="Compartir por WhatsApp"
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await revocarInvitacionAction(inv.id);
                        if (res?.error) toast.error(res.error);
                        else toast.success("Invitación cancelada");
                      }}
                      title="Cancelar invitación"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
