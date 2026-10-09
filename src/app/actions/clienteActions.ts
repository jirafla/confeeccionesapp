"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createCliente(formData: FormData) {
  const { empresa } = await requireAuth();
  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;

  if (!nombre) return { error: "El nombre es requerido." };

  await prisma.cliente.create({
    data: { nombre, telefono, empresaId: empresa.id }
  });

  redirect("/clientes");
}

export async function updateCliente(id: string, formData: FormData) {
  const { empresa } = await requireAuth();
  const nombre = formData.get("nombre") as string;
  const telefono = formData.get("telefono") as string;

  if (!nombre) return { error: "El nombre es requerido." };

  await prisma.cliente.update({
    where: { id, empresaId: empresa.id },
    data: { nombre, telefono }
  });

  redirect("/clientes");
}

export async function deleteCliente(id: string) {
  const { empresa } = await requireAuth();

  const c = await prisma.cliente.findUnique({
    where: { id, empresaId: empresa.id },
    include: { _count: { select: { ordenes: true } } }
  });

  if (c && c._count.ordenes > 0) {
    return { error: "No se puede eliminar un cliente con órdenes asociadas." };
  }

  await prisma.cliente.delete({
    where: { id, empresaId: empresa.id }
  });

  redirect("/clientes");
}
