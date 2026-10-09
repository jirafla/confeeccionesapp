import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NuevaOrdenForm from "./NuevaOrdenForm";

export default async function NuevaOrdenPage() {
  const { empresa } = await requireAuth();

  const clientesPromise = prisma.cliente.findMany({ where: { empresaId: empresa.id }, orderBy: { nombre: 'asc' } });
  const referenciasPromise = prisma.referencia.findMany({ where: { empresaId: empresa.id }, orderBy: { codigo: 'asc' } });

  return <NuevaOrdenForm clientesPromise={clientesPromise} referenciasPromise={referenciasPromise} />;
}
