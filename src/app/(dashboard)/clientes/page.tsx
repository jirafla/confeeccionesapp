import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Users, Search, Phone, MessageCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { requireAuth } from "@/lib/auth";
import ClienteEditModal from "@/components/ClienteEditModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { canDelete } from "@/lib/permissions";
import { getContactoLinks } from "@/lib/talleres";

export default async function Clientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { user, empresa } = await requireAuth();
  const permiteEliminar = canDelete(user.rol);
  const query = await searchParams;
  const q = query.q || "";

  const clientes = await prisma.cliente.findMany({
    where: {
      empresaId: empresa.id,
      ...(q ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { telefono: { contains: q, mode: 'insensitive' } }
        ]
      } : {})
    },
    include: {
      _count: {
        select: { ordenes: true }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} {clientes.length === 1 ? "cliente registrado" : "clientes registrados"}</p>
        </div>
        <Link 
          href="/clientes/nuevo" 
          title="Registrar Cliente"
          aria-label="Registrar Cliente"
          className="bg-blue-600 text-white p-2.5 sm:px-5 sm:py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center shrink-0 gap-2"
        >
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Registrar Cliente</span>
        </Link>
      </div>

      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200/70 flex items-center gap-2 px-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <form className="flex-1" method="GET">
          <input 
            type="search" 
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre o teléfono..." 
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none py-1.5"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
        {clientes.map((cliente) => {
          const contacto = getContactoLinks(cliente.telefono);
          return (
          <div key={cliente.id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/70 hover:shadow-md hover:border-blue-200 transition-all flex flex-col h-full">
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate" title={cliente.nombre}>{cliente.nombre}</h2>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 whitespace-nowrap shrink-0">
                {cliente._count.ordenes} {cliente._count.ordenes === 1 ? 'orden' : 'órdenes'}
              </span>
            </div>
            
            <div className="flex-1 space-y-2 mt-auto text-sm text-slate-500 mb-3">
              <p className="flex items-center gap-2 truncate">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{cliente.telefono || "Sin teléfono"}</span>
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              {contacto ? (
                <div className="flex items-center gap-1.5">
                  <a
                    href={contacto.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Escribir por WhatsApp"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={contacto.telHref}
                    title="Llamar"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Llamar</span>
                  </a>
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-1">
                <ClienteEditModal cliente={cliente} />
                {permiteEliminar && cliente._count.ordenes === 0 && (
                  <DeleteConfirmModal 
                    action={async () => {
                      "use server";
                      const { deleteCliente } = await import("@/app/actions/clienteActions");
                      await deleteCliente(cliente.id);
                    }}
                    title="¿Eliminar cliente?"
                    description={`Estás a punto de eliminar a ${cliente.nombre}.`}
                    buttonText="Eliminar"
                    iconOnly={true}
                  />
                )}
              </div>
            </div>
          </div>
          );
        })}
        
        {clientes.length === 0 && (
          <div className="col-span-full">
            <EmptyState 
              title="No hay clientes"
              description={q ? "No encontramos clientes con esa búsqueda." : "Aún no tienes clientes registrados."}
              actionLabel="Registrar Cliente"
              actionHref="/clientes/nuevo"
            />
          </div>
        )}
      </div>
    </div>
  );
}
