"use client";

import { useState } from "react";
import { aceptarInvitacionAction } from "./actions";
import { toast } from "sonner";
import { ShieldCheck, Lock, User, Mail } from "lucide-react";

export default function AceptarInvitacionForm({
  token,
  email,
  nombreInicial,
  empresaNombre,
  rolLabel,
  rolBadge,
  rolDescription,
}: {
  token: string;
  email: string;
  nombreInicial: string;
  empresaNombre: string;
  rolLabel: string;
  rolBadge: string;
  rolDescription: string;
}) {
  const [isPending, setIsPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        setIsPending(true);
        const res = await aceptarInvitacionAction(formData);
        if (res?.error) {
          toast.error(res.error);
          setIsPending(false);
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="token" value={token} />

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Rol Asignado
          </span>
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${rolBadge}`}>
            {rolLabel}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{rolDescription}</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-4 py-2.5 text-sm text-slate-600 font-medium cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
          Tu Nombre Completo <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="nombre"
            required
            defaultValue={nombreInicial}
            placeholder="Ej. Carlos Ramírez"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
          Crear Contraseña <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
          Confirmar Contraseña <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            placeholder="Repite tu contraseña"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 mt-2"
      >
        {isPending ? "Activando tu cuenta..." : `Unirme a ${empresaNombre}`}
      </button>
    </form>
  );
}
