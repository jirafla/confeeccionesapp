import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { nombreOrden } from "@/lib/ordenes";

export type NotificacionItem = {
  id: string;
  tipo: "VENCIDO" | "HOY" | "MANANA" | "CORTE_PENDIENTE";
  titulo: string;
  mensaje: string;
  url: string;
  fechaPactada: string;
  diasDiferencia: number;
  cantidad: number;
  tallerNombre: string;
  tallerTelefono: string | null;
  ordenNombre: string;
  prendaNombre: string | null;
  clienteNombre: string;
};

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ notificaciones: [] }, { status: 401 });
    }

    const dbUser = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: { empresaId: true },
    });

    if (!dbUser) {
      return NextResponse.json({ notificaciones: [] }, { status: 401 });
    }

    const asignaciones = await prisma.asignacion.findMany({
      where: {
        empresaId: dbUser.empresaId,
        estadoLote: "ASIGNADO",
        orden: {
          estado: { not: "ENTREGADO" },
        },
      },
      include: {
        taller: true,
        orden: {
          include: {
            referencia: true,
            cliente: true,
          },
        },
      },
      orderBy: {
        fechaEntregaEsperada: "asc",
      },
    });

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const notificaciones: NotificacionItem[] = [];

    for (const asig of asignaciones) {
      const meta = new Date(asig.fechaEntregaEsperada);
      meta.setHours(0, 0, 0, 0);

      const diffDays = Math.round((meta.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      const ordNombre = nombreOrden(asig.orden);
      const prenda = asig.orden.referencia.nombrePrenda;
      const refTexto = prenda ? `${ordNombre} (${prenda})` : ordNombre;

      if (diffDays < 0) {
        const diasAtraso = Math.abs(diffDays);
        notificaciones.push({
          id: `lote-vencido-${asig.id}`,
          tipo: "VENCIDO",
          titulo: `Entrega vencida (${diasAtraso === 1 ? "hace 1 día" : `hace ${diasAtraso} días`})`,
          mensaje: `La referencia ${refTexto} con el taller ${asig.taller.nombre} debía entregarse hace ${diasAtraso} ${diasAtraso === 1 ? "día" : "días"} (${asig.cantidadAsignada} uds).`,
          url: `/ordenes/${asig.ordenId}`,
          fechaPactada: asig.fechaEntregaEsperada.toISOString(),
          diasDiferencia: diffDays,
          cantidad: asig.cantidadAsignada,
          tallerNombre: asig.taller.nombre,
          tallerTelefono: asig.taller.telefono,
          ordenNombre: ordNombre,
          prendaNombre: prenda || null,
          clienteNombre: asig.orden.cliente.nombre,
        });
      } else if (diffDays === 0) {
        notificaciones.push({
          id: `lote-hoy-${asig.id}`,
          tipo: "HOY",
          titulo: "Entrega programada para HOY",
          mensaje: `La referencia ${refTexto}: el taller ${asig.taller.nombre} debe entregar HOY (${asig.cantidadAsignada} uds).`,
          url: `/ordenes/${asig.ordenId}`,
          fechaPactada: asig.fechaEntregaEsperada.toISOString(),
          diasDiferencia: 0,
          cantidad: asig.cantidadAsignada,
          tallerNombre: asig.taller.nombre,
          tallerTelefono: asig.taller.telefono,
          ordenNombre: ordNombre,
          prendaNombre: prenda || null,
          clienteNombre: asig.orden.cliente.nombre,
        });
      } else if (diffDays === 1) {
        notificaciones.push({
          id: `lote-manana-${asig.id}`,
          tipo: "MANANA",
          titulo: "Entrega programada para mañana",
          mensaje: `La referencia ${refTexto}: el taller ${asig.taller.nombre} debe entregar mañana (${asig.cantidadAsignada} uds).`,
          url: `/ordenes/${asig.ordenId}`,
          fechaPactada: asig.fechaEntregaEsperada.toISOString(),
          diasDiferencia: 1,
          cantidad: asig.cantidadAsignada,
          tallerNombre: asig.taller.nombre,
          tallerTelefono: asig.taller.telefono,
          ordenNombre: ordNombre,
          prendaNombre: prenda || null,
          clienteNombre: asig.orden.cliente.nombre,
        });
      }
    }

    // Órdenes en corte que llevan 3 o más días sin avanzar a confección
    const hace3Dias = new Date(hoy);
    hace3Dias.setDate(hace3Dias.getDate() - 3);

    const ordenesEnCorteAntiguas = await prisma.ordenProduccion.findMany({
      where: {
        empresaId: dbUser.empresaId,
        estado: "CORTE",
        createdAt: { lt: hace3Dias },
      },
      include: {
        referencia: true,
        cliente: true,
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    });

    for (const ord of ordenesEnCorteAntiguas) {
      const creado = new Date(ord.createdAt);
      creado.setHours(0, 0, 0, 0);
      const diasEnCorte = Math.round((hoy.getTime() - creado.getTime()) / (1000 * 60 * 60 * 24));
      const ordNombre = nombreOrden(ord);
      notificaciones.push({
        id: `corte-${ord.id}`,
        tipo: "CORTE_PENDIENTE",
        titulo: `Orden en corte hace ${diasEnCorte} días`,
        mensaje: `La orden ${ordNombre} (${ord.cliente.nombre}) lleva ${diasEnCorte} días en etapa de corte (${ord.cantidadTotal} uds).`,
        url: `/ordenes/${ord.id}`,
        fechaPactada: ord.createdAt.toISOString(),
        diasDiferencia: -diasEnCorte,
        cantidad: ord.cantidadTotal,
        tallerNombre: "Etapa de Corte",
        tallerTelefono: null,
        ordenNombre: ordNombre,
        prendaNombre: ord.referencia.nombrePrenda || null,
        clienteNombre: ord.cliente.nombre,
      });
    }

    return NextResponse.json({ notificaciones });
  } catch (err) {
    console.error("Error cargando notificaciones:", err);
    return NextResponse.json({ notificaciones: [] }, { status: 500 });
  }
}
