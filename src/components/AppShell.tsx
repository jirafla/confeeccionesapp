"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Factory, Users, Shirt, PackageSearch, FileSpreadsheet, Settings } from "lucide-react";
import { logout } from "@/app/login/actions";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clientes", label: "Clientes", icon: Users },
    { href: "/referencias", label: "Catálogo", icon: Shirt },
    { href: "/talleres", label: "Talleres", icon: Factory },
    { href: "/ordenes", label: "Órdenes", icon: PackageSearch },
    { href: "/reportes", label: "Reportes", icon: FileSpreadsheet },
    { href: "/configuracion", label: "Configuración", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 bg-white border-r border-slate-100 flex-shrink-0 z-10">
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
          <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
              C
            </div>
            Confección
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-semibold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-50">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors mb-4">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </form>
          <div className="bg-slate-50 p-4 rounded-2xl">
             <p className="text-xs text-slate-500 font-medium">Gestión de Producción</p>
             <p className="text-[10px] text-slate-400 mt-1">v2.0.0 (SaaS)</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="sm:hidden bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center px-6 flex-shrink-0 sticky top-0 z-20">
           <Link href="/" className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-2">
             <div className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md text-sm">
               C
             </div>
             Confección
           </Link>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-24 sm:pb-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 pb-2">
        <div className="flex justify-around items-center h-16 px-2">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-50" : ""}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                </div>
                <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
