"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Factory, 
  Users, 
  Shirt, 
  PackageSearch, 
  Settings, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import { logout } from "@/app/login/actions";
import PwaInstallButton from "./PwaInstallButton";
import NotificationCenter from "./NotificationCenter";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const links = [
    { href: "/", label: "Panel", icon: LayoutDashboard },
    { href: "/ordenes", label: "Órdenes", icon: PackageSearch },
    { href: "/referencias", label: "Referencias", icon: Shirt },
    { href: "/talleres", label: "Talleres", icon: Factory },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden sm:flex flex-col ${
          isCollapsed ? "w-[72px]" : "w-60"
        } bg-white border-r border-slate-200/70 flex-shrink-0 transition-all duration-200 ease-in-out`}
      >
        <div 
          className={`h-16 flex items-center ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          } border-b border-slate-100`}
        >
          <Link 
            href="/" 
            className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2.5 min-w-0" 
            title="Confección"
          >
            <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 text-sm">
              C
            </div>
            {!isCollapsed && <span className="truncate">Confección</span>}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Contraer menú"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <div className="px-2 pt-3 flex justify-center">
            <button
              onClick={toggleCollapsed}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expandir menú"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <nav className={`flex-1 ${isCollapsed ? "px-2" : "px-3"} py-4 space-y-1 overflow-y-auto`}>
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center p-2.5 rounded-xl" : "gap-3 px-3.5 py-2.5 rounded-xl"
                } transition-all duration-150 ${
                  isActive 
                    ? "bg-blue-50/90 text-blue-600 font-semibold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {!isCollapsed && <span className="truncate text-sm">{link.label}</span>}
              </Link>
            );
          })}

          <NotificationCenter variant="nav-item" collapsed={isCollapsed} />
        </nav>
        
        <div className={`${isCollapsed ? "p-2" : "p-3"} border-t border-slate-100 space-y-1`}>
          <PwaInstallButton variant="sidebar" collapsed={isCollapsed} />
          <form action={logout}>
            <button 
              type="submit" 
              title={isCollapsed ? "Cerrar sesión" : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? "justify-center p-2.5" : "gap-3 px-3.5 py-2.5"
              } text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50/70 rounded-xl transition-colors cursor-pointer`}
            >
              <LogOut className="w-[18px] h-[18px] text-slate-400 group-hover:text-rose-600 shrink-0" />
              {!isCollapsed && <span className="truncate">Cerrar sesión</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="sm:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
           <Link href="/" className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
             <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md text-sm">
               C
             </div>
             Confección
           </Link>
           <div className="flex items-center gap-1.5">
             <NotificationCenter />
             <PwaInstallButton variant="mobile-header" />
             <Link
               href="/configuracion"
               aria-label="Configuración"
               className={`p-2 rounded-xl transition-colors ${
                 pathname.startsWith("/configuracion") ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
               }`}
             >
               <Settings className="w-5 h-5" />
             </Link>
             <form action={logout}>
               <button type="submit" aria-label="Cerrar sesión" className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                 <LogOut className="w-5 h-5" />
               </button>
             </form>
           </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-24 sm:pb-8">
          <div className="max-w-6xl mx-auto w-full">
            <PwaInstallButton variant="banner" />
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-4px_20px_-10px_rgba(15,23,42,0.08)] z-50 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center h-16 px-1.5">
          {links.filter(l => l.href !== "/configuracion").map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-all active:scale-95 ${
                  isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 rounded-full bg-blue-600" />
                )}
                <div className={`px-3 py-1 rounded-xl transition-all ${isActive ? "bg-blue-50/90" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                </div>
                <span className={`text-[10px] tracking-tight ${isActive ? "font-bold text-blue-600" : "font-medium"}`}>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
