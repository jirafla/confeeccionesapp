"use client";

import { useState, useEffect } from "react";
import { Smartphone, Download, Share, PlusSquare, MoreVertical, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallButton({
  variant = "mobile-header",
  collapsed = false,
}: {
  variant?: "mobile-header" | "sidebar" | "banner";
  collapsed?: boolean;
}) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  useEffect(() => {
    // Registrar Service Worker para habilitar instalación PWA en Android/Chrome
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Verificar si ya está corriendo instalada como app independiente
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detectar iOS (iPhone / iPad)
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    const dismissed = localStorage.getItem("pwa_banner_dismissed") === "true";
    setBannerDismissed(dismissed);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowModal(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    setShowModal(true);
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem("pwa_banner_dismissed", "true");
  };

  return (
    <>
      {variant === "mobile-header" && (
        <button
          type="button"
          onClick={handleInstallClick}
          aria-label="Agregar al inicio del teléfono"
          title="Instalar App en el teléfono"
          className="p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <Smartphone className="w-5 h-5" />
        </button>
      )}

      {variant === "sidebar" && (
        <button
          type="button"
          onClick={handleInstallClick}
          title={collapsed ? "Instalar aplicación" : undefined}
          className={`w-full flex items-center ${
            collapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
          } text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-colors cursor-pointer`}
        >
          <Download className="w-[18px] h-[18px] text-slate-400 shrink-0" />
          {!collapsed && <span className="truncate">Instalar aplicación</span>}
        </button>
      )}

      {variant === "banner" && !bannerDismissed && (
        <div className="sm:hidden mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0 font-black text-base">
              C
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">Instala Confección en tu teléfono</p>
              <p className="text-[11px] text-blue-100 truncate">Acceso rápido desde tu pantalla de inicio</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="bg-white text-blue-700 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs hover:bg-blue-50 transition-colors"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Cerrar aviso"
              className="p-1 text-blue-200 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-600/20 shrink-0">
                  C
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">Agregar a pantalla de inicio</h3>
                  <p className="text-xs text-slate-500">Instala Confección como aplicación en tu teléfono</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700">
                <p className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-600">
                  Pasos en iPhone / iPad (Safari):
                </p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Toca el botón <strong>Compartir</strong>{" "}
                    <Share className="w-4 h-4 inline text-blue-600 -mt-0.5" /> en la barra inferior de Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Desliza hacia abajo y selecciona{" "}
                    <strong>&quot;Agregar a pantalla de inicio&quot;</strong>{" "}
                    <PlusSquare className="w-4 h-4 inline text-slate-700 -mt-0.5" />.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Confirma tocando <strong>&quot;Agregar&quot;</strong> en la esquina superior derecha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700">
                <p className="font-bold text-xs uppercase tracking-wider text-blue-600">
                  Pasos en Android (Chrome) / Navegador:
                </p>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Toca el ícono de menú de <strong>tres puntos</strong>{" "}
                    <MoreVertical className="w-4 h-4 inline text-slate-700 -mt-0.5" /> en la esquina superior derecha del navegador.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o{" "}
                    <strong>&quot;Agregar a la pantalla principal&quot;</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    También en iPhone (Safari): toca <strong>Compartir</strong>{" "}
                    <Share className="w-3.5 h-3.5 inline text-blue-600" /> y luego{" "}
                    <strong>&quot;Agregar a pantalla de inicio&quot;</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
