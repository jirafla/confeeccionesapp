"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  X,
  AlertTriangle,
  CalendarClock,
  Clock,
  Scissors,
  CheckCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import ModalPortal from "./ModalPortal";
import type { NotificacionItem } from "@/app/api/notificaciones/route";
import { getContactoLinks } from "@/lib/talleres";

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function dispararNotificacionNativa(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        if (reg.active) {
          reg.active.postMessage({
            type: "SHOW_NOTIFICATION",
            payload,
          });
          return true;
        }
        await reg.showNotification(payload.title, {
          body: payload.body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: payload.tag || `confeccion-${Date.now()}`,
          data: { url: payload.url || "/" },
        });
        return true;
      }
    }
    const n = new Notification(payload.title, {
      body: payload.body,
      icon: "/icon-192.png",
      tag: payload.tag,
    });
    if (payload.url) {
      n.onclick = () => {
        window.focus();
        window.location.href = payload.url!;
      };
    }
    return true;
  } catch {
    return false;
  }
}

export default function NotificationCenter({
  variant = "mobile-header",
  collapsed = false,
}: {
  variant?: "mobile-header" | "sidebar";
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [pushEnabled, setPushEnabled] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/notificaciones", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const items: NotificacionItem[] = data.notificaciones || [];
      setNotificaciones(items);

      // Si el usuario tiene Push activo, enviar notificación nativa para entregas de HOY o VENCIDAS no enviadas hoy
      const todayKey = getTodayKey();
      const enabledLocal = localStorage.getItem("confeccion_push_enabled") === "true";
      if (
        enabledLocal &&
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const pushedKey = `confeccion_pushed_${todayKey}`;
        const pushedRaw = localStorage.getItem(pushedKey);
        const pushedList: string[] = pushedRaw ? JSON.parse(pushedRaw) : [];

        const urgentesNuevas = items.filter(
          (n) => (n.tipo === "HOY" || n.tipo === "VENCIDO") && !pushedList.includes(n.id)
        );

        if (urgentesNuevas.length > 0) {
          const primera = urgentesNuevas[0];
          const masTexto =
            urgentesNuevas.length > 1
              ? ` (+${urgentesNuevas.length - 1} alerta${urgentesNuevas.length - 1 === 1 ? "" : "s"} más)`
              : "";

          await dispararNotificacionNativa({
            title: `📦 ${primera.titulo}${masTexto}`,
            body: primera.mensaje,
            url: primera.url,
            tag: `confeccion-urgente-${todayKey}`,
          });

          const nextPushed = Array.from(new Set([...pushedList, ...urgentesNuevas.map((u) => u.id)]));
          localStorage.setItem(pushedKey, JSON.stringify(nextPushed));
        }
      }
    } catch {
      // Silenciar error de red temporal
    }
  }, []);

  useEffect(() => {
    const todayKey = getTodayKey();
    const savedRead = localStorage.getItem(`confeccion_notifs_read_${todayKey}`);
    if (savedRead) {
      try {
        setReadIds(JSON.parse(savedRead));
      } catch {
        setReadIds([]);
      }
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setPushSupported(true);
      setPushPermission(Notification.permission);
      setPushEnabled(
        Notification.permission === "granted" &&
          localStorage.getItem("confeccion_push_enabled") === "true"
      );
    }

    cargarNotificaciones();

    const onFocus = () => cargarNotificaciones();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [cargarNotificaciones]);

  const noLeidas = notificaciones.filter((n) => !readIds.includes(n.id));
  const totalNoLeidas = noLeidas.length;
  const hayUrgentes = notificaciones.some((n) => n.tipo === "VENCIDO" || n.tipo === "HOY");

  const marcarTodasLeidas = () => {
    const todayKey = getTodayKey();
    const allIds = notificaciones.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem(`confeccion_notifs_read_${todayKey}`, JSON.stringify(allIds));
    toast.success("Notificaciones marcadas como revisadas por hoy.");
  };

  const activarPush = async () => {
    if (!pushSupported) {
      toast.error("Tu navegador no soporta notificaciones nativas.");
      return;
    }

    const perm = await Notification.requestPermission();
    setPushPermission(perm);

    if (perm === "granted") {
      localStorage.setItem("confeccion_push_enabled", "true");
      setPushEnabled(true);

      const urgente = notificaciones.find((n) => n.tipo === "HOY" || n.tipo === "VENCIDO") || notificaciones[0];
      await dispararNotificacionNativa({
        title: urgente ? `🔔 ${urgente.titulo}` : "🔔 Notificaciones Push Activadas",
        body: urgente
          ? urgente.mensaje
          : "Recibirás alertas cuando un taller deba entregar un lote hoy o esté atrasado.",
        url: urgente ? urgente.url : "/",
        tag: "confeccion-push-welcome",
      });
      toast.success("Notificaciones Push activadas en este dispositivo.");
    } else {
      toast.error("Debes permitir las notificaciones en tu navegador para recibir alertas Push.");
    }
  };

  const desactivarPush = () => {
    localStorage.setItem("confeccion_push_enabled", "false");
    setPushEnabled(false);
    toast.info("Notificaciones Push pausadas en este dispositivo.");
  };

  const probarPush = async () => {
    const urgente = notificaciones.find((n) => n.tipo === "HOY" || n.tipo === "VENCIDO") || notificaciones[0];
    const ok = await dispararNotificacionNativa({
      title: urgente ? `📦 ${urgente.titulo}` : "📦 Prueba de Alerta — Confección",
      body: urgente
        ? urgente.mensaje
        : "Ejemplo: La referencia 5370-1 el taller Confecciones Y debe entregar HOY (100 uds).",
      url: urgente ? urgente.url : "/",
      tag: `confeccion-test-${Date.now()}`,
    });
    if (ok) {
      toast.success("Notificación Push enviada a tu dispositivo.");
    } else {
      toast.error("No se pudo mostrar la notificación. Verifica los permisos del navegador.");
    }
  };

  const getBadgeStyle = (tipo: NotificacionItem["tipo"]) => {
    switch (tipo) {
      case "VENCIDO":
        return {
          bg: "bg-rose-50/70 border-rose-200",
          iconBg: "bg-rose-100 text-rose-600",
          pill: "bg-rose-100 text-rose-700",
          label: "Vencido",
          Icon: AlertTriangle,
        };
      case "HOY":
        return {
          bg: "bg-amber-50/80 border-amber-200",
          iconBg: "bg-amber-100 text-amber-700",
          pill: "bg-amber-100 text-amber-800",
          label: "Entrega HOY",
          Icon: CalendarClock,
        };
      case "MANANA":
        return {
          bg: "bg-blue-50/60 border-blue-200/80",
          iconBg: "bg-blue-100 text-blue-600",
          pill: "bg-blue-100 text-blue-700",
          label: "Mañana",
          Icon: Clock,
        };
      case "CORTE_PENDIENTE":
        return {
          bg: "bg-orange-50/60 border-orange-200/80",
          iconBg: "bg-orange-100 text-orange-600",
          pill: "bg-orange-100 text-orange-700",
          label: "En Corte",
          Icon: Scissors,
        };
    }
  };

  return (
    <>
      {variant === "mobile-header" ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            cargarNotificaciones();
          }}
          aria-label="Notificaciones"
          title="Ver notificaciones y entregas pendientes"
          className="relative p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          {hayUrgentes && totalNoLeidas > 0 ? (
            <BellRing className="w-5 h-5 text-amber-600 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {totalNoLeidas > 0 && (
            <span
              className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-xs ${
                hayUrgentes ? "bg-rose-600" : "bg-blue-600"
              }`}
            >
              {totalNoLeidas > 9 ? "9+" : totalNoLeidas}
            </span>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            cargarNotificaciones();
          }}
          title={collapsed ? `Notificaciones (${totalNoLeidas})` : undefined}
          className={`relative w-full flex items-center ${
            collapsed ? "justify-center p-3 rounded-xl" : "justify-between px-4 py-2.5 rounded-2xl"
          } transition-all duration-200 cursor-pointer ${
            totalNoLeidas > 0
              ? "bg-amber-50/90 hover:bg-amber-100/80 text-amber-900 font-semibold border border-amber-200/80"
              : "bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {hayUrgentes && totalNoLeidas > 0 ? (
              <BellRing className="w-5 h-5 shrink-0 text-amber-600" />
            ) : (
              <Bell className="w-5 h-5 shrink-0 text-slate-400" />
            )}
            {!collapsed && <span className="truncate text-sm">Notificaciones</span>}
          </div>
          {totalNoLeidas > 0 && (
            <span
              className={`${
                collapsed ? "absolute top-1.5 right-1.5 min-w-[16px] h-4 text-[9px]" : "min-w-[22px] h-5 text-xs"
              } px-1.5 rounded-full font-black text-white flex items-center justify-center ${
                hayUrgentes ? "bg-rose-600" : "bg-blue-600"
              }`}
            >
              {totalNoLeidas}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CABECERA */}
              <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 truncate">
                      Centro de Notificaciones
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {notificaciones.length === 0
                        ? "Todo al día con los talleres"
                        : `${notificaciones.length} alerta${notificaciones.length === 1 ? "" : "s"} activa${notificaciones.length === 1 ? "" : "s"} de producción`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {totalNoLeidas > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodasLeidas}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Marcar todas como vistas hoy"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Leídas hoy</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* BARRA DE NOTIFICACIONES PUSH */}
              {pushSupported && (
                <div className="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className={`w-4 h-4 shrink-0 ${pushEnabled ? "text-emerald-600" : "text-blue-600"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">
                        {pushEnabled
                          ? "Notificaciones Push activas en este dispositivo"
                          : "Recibe alertas Push en tu celular o computador"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {pushPermission === "denied"
                          ? "Permiso bloqueado en el navegador (habilítalo en el candado de la URL)"
                          : pushEnabled
                          ? "Te avisaremos cuando un taller deba entregar hoy o esté vencido"
                          : "Actívalas para recibir avisos nativos de entregas del día"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {pushEnabled ? (
                      <>
                        <button
                          type="button"
                          onClick={probarPush}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                        >
                          Probar Push
                        </button>
                        <button
                          type="button"
                          onClick={desactivarPush}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        >
                          Pausar
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={activarPush}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                      >
                        Activar Push
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* LISTA DE NOTIFICACIONES */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
                {notificaciones.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">¡No hay alertas pendientes!</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Ningún taller tiene lotes vencidos ni entregas programadas para hoy o mañana.
                    </p>
                  </div>
                ) : (
                  notificaciones.map((notif) => {
                    const style = getBadgeStyle(notif.tipo);
                    const Icon = style.Icon;
                    const contacto = getContactoLinks(notif.tallerTelefono);
                    const isRead = readIds.includes(notif.id);
                    const waText = encodeURIComponent(
                      `Hola ${notif.tallerNombre}, te escribimos para consultar por la entrega del lote de la Ref. ${notif.ordenNombre} (${notif.cantidad} uds).`
                    );

                    return (
                      <div
                        key={notif.id}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${style.bg} ${
                          isRead ? "opacity-75" : "shadow-xs"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${style.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${style.pill}`}>
                                {style.label}
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {notif.cantidad} uds
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {notif.mensaje}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Cliente: <strong className="text-slate-700">{notif.clienteNombre}</strong>
                            </p>

                            <div className="flex flex-wrap items-center justify-end gap-2 mt-3 pt-2.5 border-t border-slate-200/60">
                              {contacto && (
                                <a
                                  href={`${contacto.whatsappHref}?text=${waText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp al taller
                                </a>
                              )}
                              <Link
                                href={notif.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
                              >
                                Ver orden <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
