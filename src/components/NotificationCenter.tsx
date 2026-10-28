"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, X, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import ModalPortal from "./ModalPortal";
import type { NotificacionItem } from "@/app/api/notificaciones/route";

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
  variant = "icon",
  collapsed = false,
}: {
  variant?: "icon" | "nav-item";
  collapsed?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notificaciones, setNotificaciones] = useState<NotificacionItem[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const cargarNotificaciones = useCallback(async () => {
    try {
      const res = await fetch("/api/notificaciones", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const items: NotificacionItem[] = data.notificaciones || [];
      setNotificaciones(items);

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
          await dispararNotificacionNativa({
            title: primera.titulo,
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
  };

  const togglePush = async () => {
    if (!pushSupported) {
      toast.error("Tu navegador no soporta notificaciones nativas.");
      return;
    }

    if (pushEnabled) {
      localStorage.setItem("confeccion_push_enabled", "false");
      setPushEnabled(false);
      toast.info("Alertas Push desactivadas.");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      localStorage.setItem("confeccion_push_enabled", "true");
      setPushEnabled(true);

      const urgente = notificaciones.find((n) => n.tipo === "HOY" || n.tipo === "VENCIDO") || notificaciones[0];
      await dispararNotificacionNativa({
        title: urgente ? urgente.titulo : "Alertas Push activadas",
        body: urgente
          ? urgente.mensaje
          : "Recibirás avisos cuando un taller deba entregar un lote hoy o esté atrasado.",
        url: urgente ? urgente.url : "/",
        tag: "confeccion-push-welcome",
      });
      toast.success("Alertas Push activadas.");
    } else {
      toast.error("Permite las notificaciones en el navegador para activarlas.");
    }
  };

  const getStatusMeta = (n: NotificacionItem) => {
    switch (n.tipo) {
      case "VENCIDO": {
        const d = Math.abs(n.diasDiferencia);
        return {
          dot: "bg-rose-500",
          tag: d === 1 ? "Vencido 1d" : `Vencido ${d}d`,
          tagCls: "text-rose-700 bg-rose-50",
          sub: `Debía entregar hace ${d} ${d === 1 ? "día" : "días"}`,
        };
      }
      case "HOY":
        return {
          dot: "bg-amber-500",
          tag: "Hoy",
          tagCls: "text-amber-700 bg-amber-50",
          sub: "Debe entregar hoy",
        };
      case "MANANA":
        return {
          dot: "bg-blue-500",
          tag: "Mañana",
          tagCls: "text-blue-700 bg-blue-50",
          sub: "Entrega programada mañana",
        };
      case "CORTE_PENDIENTE": {
        const d = Math.abs(n.diasDiferencia);
        return {
          dot: "bg-orange-400",
          tag: `Corte ${d}d`,
          tagCls: "text-orange-700 bg-orange-50",
          sub: `Lleva ${d} días en corte`,
        };
      }
    }
  };

  return (
    <>
      {variant === "nav-item" ? (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            cargarNotificaciones();
          }}
          title={collapsed ? "Notificaciones" : undefined}
          className={`relative w-full flex items-center ${
            collapsed ? "justify-center p-2.5 rounded-xl" : "justify-between px-3.5 py-2.5 rounded-xl"
          } transition-all duration-150 cursor-pointer ${
            isOpen
              ? "bg-blue-50 text-blue-600 font-semibold"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Bell className={`w-[18px] h-[18px] shrink-0 ${isOpen ? "text-blue-600" : "text-slate-400"}`} />
            {!collapsed && <span className="truncate text-sm">Notificaciones</span>}
          </div>
          {totalNoLeidas > 0 && (
            collapsed ? (
              <span
                className={`absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-white ${
                  hayUrgentes ? "bg-rose-500" : "bg-blue-600"
                }`}
              />
            ) : (
              <span
                className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full leading-none ${
                  hayUrgentes
                    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200/80"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {totalNoLeidas}
              </span>
            )
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            cargarNotificaciones();
          }}
          aria-label="Notificaciones"
          title="Notificaciones"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {totalNoLeidas > 0 && (
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                hayUrgentes ? "bg-rose-500" : "bg-blue-600"
              }`}
            />
          )}
        </button>
      )}

      {isOpen && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-[110] bg-slate-900/30 backdrop-blur-[2px] animate-in fade-in duration-200 flex justify-end"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white h-full w-full max-w-sm shadow-2xl border-l border-slate-100 flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header limpio */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Notificaciones</h3>
                  {totalNoLeidas > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700">
                      {totalNoLeidas}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {totalNoLeidas > 0 && (
                    <button
                      type="button"
                      onClick={marcarTodasLeidas}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Marcar leídas
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Switch discreto de Push */}
              {pushSupported && (
                <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">Alertas Push en este equipo</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Avisos de lotes que entregan hoy o vencidos
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={pushEnabled}
                    onClick={togglePush}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      pushEnabled ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        pushEnabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Lista minimalista */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {notificaciones.length === 0 ? (
                  <div className="py-16 px-6 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Todo al día</p>
                    <p className="text-xs text-slate-400 mt-1">
                      No hay entregas vencidas ni lotes pendientes para hoy o mañana.
                    </p>
                  </div>
                ) : (
                  notificaciones.map((notif) => {
                    const meta = getStatusMeta(notif);
                    const isRead = readIds.includes(notif.id);
                    return (
                      <Link
                        key={notif.id}
                        href={notif.url}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group ${
                          isRead ? "opacity-60" : ""
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${meta.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                              Ref. {notif.ordenNombre}
                              {notif.tipo !== "CORTE_PENDIENTE" && ` · ${notif.tallerNombre}`}
                            </p>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${meta.tagCls}`}>
                              {meta.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {meta.sub} · <span className="font-medium text-slate-700">{notif.cantidad} uds</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                            Cliente: {notif.clienteNombre}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 mt-1 shrink-0 transition-colors" />
                      </Link>
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
