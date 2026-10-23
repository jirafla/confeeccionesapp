"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DesgloseInsumoOrden, TelaItem } from "@/lib/ordenes";

type VarianteItem = {
  cantidad: number | null;
  detalle: string;
};

type Props = {
  nombreOrden: string;
  empresaNombre: string;
  clienteNombre: string;
  referenciaCodigo: string;
  referenciaNombre?: string | null;
  disenoArchivoUrl?: string | null;
  estadoLabel: string;
  fechaCreacion: string;
  cantidadTotal: number;
  variantes: VarianteItem[];
  telas: TelaItem[];
  desgloseInsumos: DesgloseInsumoOrden[];
  observacionesCorte?: string | null;
  variant?: "primary" | "outline";
};

export default function DescargarOrdenPdfButton({
  nombreOrden,
  clienteNombre,
  referenciaCodigo,
  referenciaNombre,
  fechaCreacion,
  cantidadTotal,
  variantes,
  telas,
  desgloseInsumos,
  observacionesCorte,
  variant = "primary",
}: Props) {
  const [generando, setGenerando] = useState(false);

  const handleDescargarPdf = async () => {
    try {
      setGenerando(true);
      const { jsPDF } = await import("jspdf");

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageW = doc.internal.pageSize.getWidth(); // 210
      const pageH = doc.internal.pageSize.getHeight(); // 297
      const margin = 12;
      const contentW = pageW - margin * 2; // 186
      let y = 12;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageH - 14) {
          doc.addPage();
          y = 12;
        }
      };

      doc.setDrawColor(0, 0, 0);
      doc.setTextColor(0, 0, 0);
      doc.setLineWidth(0.3);

      // ================= 1. BARRA TÍTULO: ORDEN DE CORTE =================
      doc.rect(margin, y, contentW, 7.5, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("ORDEN DE CORTE", pageW / 2, y + 5.2, { align: "center" });
      doc.setFontSize(8.5);
      doc.text(`#${nombreOrden}`, pageW - margin - 3, y + 5.1, { align: "right" });
      y += 10.5;

      // ================= 2. FECHA ORDEN / FECHA CORTE / REF / CORTADOR =================
      const halfW = contentW / 2;
      const rowHHeader = 7;

      // Fila 1: FECHA ORDEN | FECHA CORTE
      doc.rect(margin, y, halfW, rowHHeader, "D");
      doc.rect(margin + halfW, y, halfW, rowHHeader, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("FECHA ORDEN:", margin + 2.5, y + 4.8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(fechaCreacion, margin + 28, y + 4.8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("FECHA CORTE:", margin + halfW + 2.5, y + 4.8);
      y += rowHHeader;

      // Fila 2: REF + CLIENTE | CORTADOR
      const refW = halfW * 0.55;
      const cliW = halfW - refW;
      doc.rect(margin, y, refW, rowHHeader, "D");
      doc.rect(margin + refW, y, cliW, rowHHeader, "D");
      doc.rect(margin + halfW, y, halfW, rowHHeader, "D");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("REF:", margin + 2.5, y + 4.8);
      doc.setFontSize(10);
      doc.text(referenciaCodigo, margin + 12, y + 4.8);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("CLIENTE:", margin + refW + 2, y + 4.7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(doc.splitTextToSize(clienteNombre, cliW - 18)[0] || "", margin + refW + 16, y + 4.7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("CORTADOR:", margin + halfW + 2.5, y + 4.8);
      y += rowHHeader + 3.5;

      // ================= 3. DESCRIPCIÓN Y BLOQUES DE TELAS (PROMEDIOS) =================
      const telaBoxW = contentW * 0.84; // Igual a la planilla física donde los bloques de tela son ligeramente más angostos o alineados
      const anchoColW = telaBoxW * 0.36;
      const telaColW = telaBoxW - anchoColW;

      // Barra DESCRIPCIÓN
      doc.rect(margin, y, telaBoxW, 7, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("DESCRIPCION:", margin + 2.5, y + 4.8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(
        doc.splitTextToSize(referenciaNombre || referenciaCodigo, telaBoxW - 30)[0] || "",
        margin + 27,
        y + 4.8
      );
      y += 7;

      // Mostrar mínimo 3 bloques de tela (TELA 1, TELA 2, TELA 3) como en la planilla física, o más si la referencia tiene más
      const numBloquesTela = Math.max(3, telas.length);
      for (let i = 0; i < numBloquesTela; i++) {
        const tela = telas[i];
        // Fila superior del bloque de tela: TELA X | ANCHO
        doc.rect(margin, y, telaColW, 6.8, "D");
        doc.rect(margin + telaColW, y, anchoColW, 6.8, "D");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text(`TELA ${i + 1}:`, margin + 2.5, y + 4.7);
        if (tela) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          const nombreTela = tela.tipo ? tela.tipo : tela.nombre;
          doc.text(doc.splitTextToSize(nombreTela, telaColW - 18)[0] || "", margin + 17, y + 4.7);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("ANCHO:", margin + telaColW + 2.5, y + 4.7);
        y += 6.8;

        // Fila inferior del bloque de tela: LARGO y PROM
        doc.rect(margin, y, telaBoxW, 6.8, "D");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("LARGO:", margin + 2.5, y + 4.7);

        if (tela && tela.promedio > 0) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          const totalMetros = Number((tela.promedio * cantidadTotal).toFixed(2));
          doc.text(
            `PROM: ${tela.promedio} m   (Total est: ${totalMetros} m)`,
            margin + telaColW - 22,
            y + 4.7
          );
        }
        y += 6.8 + 2.8;
      }

      y += 1;

      // ================= 4. SECCIÓN PEDIDO (TABLA DE CORTE Y CAPAS) =================
      doc.rect(margin, y, telaBoxW, 7, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("PEDIDO", margin + telaBoxW / 2, y + 4.9, { align: "center" });
      y += 9.5;

      // Definición de columnas idéntica a la planilla física:
      // COLORES | UNIDADES DE PEDIDO | CAPAS REQ TELA 1 | CAPAS REQ TELA 2 | CAPAS REQ TELA 3 | CAPAS EXT TELA 1 | CAPAS EXT TELA 2 | CAPAS EXT TELA 3 | (Columna extra)
      const colWidths = [42, 22, 18, 18, 18, 18, 18, 18, 14]; // Suma = 186 = contentW
      const colX: number[] = [];
      let accX = margin;
      for (const w of colWidths) {
        colX.push(accX);
        accX += w;
      }

      const headerH = 12;
      for (let c = 0; c < colWidths.length; c++) {
        doc.rect(colX[c], y, colWidths[c], headerH, "D");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.text("COLORES", colX[0] + 2, y + 9.8);

      doc.setFontSize(6.5);
      doc.text("UNIDADES", colX[1] + colWidths[1] / 2, y + 5.2, { align: "center" });
      doc.text("DE PEDIDO", colX[1] + colWidths[1] / 2, y + 9.2, { align: "center" });

      // CAPAS REQ TELA 1, 2, 3
      for (let t = 0; t < 3; t++) {
        const cx = colX[2 + t] + colWidths[2 + t] / 2;
        doc.text("CAPAS", cx, y + 3.8, { align: "center" });
        doc.text("REQ TELA", cx, y + 7.2, { align: "center" });
        doc.text(String(t + 1), cx, y + 10.5, { align: "center" });
      }

      // CAPAS EXT TELA 1, 2, 3
      for (let t = 0; t < 3; t++) {
        const cx = colX[5 + t] + colWidths[5 + t] / 2;
        doc.text("CAPAS", cx, y + 3.8, { align: "center" });
        doc.text("EXT TELA", cx, y + 7.2, { align: "center" });
        doc.text(String(t + 1), cx, y + 10.5, { align: "center" });
      }

      y += headerH;

      // Filas de colores (mínimo 10 filas para dejar renglones vacíos como en la hoja física)
      const totalFilas = Math.max(10, variantes.length + 2);
      const filaH = 6.8;

      for (let r = 0; r < totalFilas; r++) {
        checkPageBreak(filaH + 15);
        const v = variantes[r];
        for (let c = 0; c < colWidths.length; c++) {
          doc.rect(colX[c], y, colWidths[c], filaH, "D");
        }

        if (v) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          const colorTexto = (v.detalle || "").toUpperCase();
          doc.text(doc.splitTextToSize(colorTexto, colWidths[0] - 4)[0] || "", colX[0] + 2.5, y + 4.8);

          if (v.cantidad !== null) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9.5);
            doc.text(String(v.cantidad), colX[1] + colWidths[1] / 2, y + 4.8, { align: "center" });
          }
        }
        y += filaH;
      }

      // Fila inferior: TOTAL | <cantidadTotal> | espacio | TOTAL UNDS CORTADAS | [ recuadro ]
      const totalRowH = 7.5;
      doc.setLineWidth(0.4);
      // Celda TOTAL
      doc.rect(colX[0], y, colWidths[0], totalRowH, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TOTAL", colX[0] + 2.5, y + 5.2);

      // Celda suma unidades de pedido
      doc.rect(colX[1], y, colWidths[1], totalRowH, "D");
      doc.setFontSize(10.5);
      doc.text(String(cantidadTotal), colX[1] + colWidths[1] / 2, y + 5.3, { align: "center" });

      // Recuadro TOTAL UNDS CORTADAS (desde col 4 hasta el final)
      const startTotalCortadasX = colX[4];
      const totalCortadasW = margin + contentW - startTotalCortadasX;
      doc.rect(startTotalCortadasX, y, totalCortadasW, totalRowH, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("TOTAL UNDS CORTADAS:", startTotalCortadasX + 3, y + 5.2);

      doc.setLineWidth(0.3);
      y += totalRowH + 5;

      // ================= 5. INSUMOS A ALISTAR POR COLOR (SI TIENE INSUMOS) =================
      if (desgloseInsumos.length > 0) {
        checkPageBreak(22);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("INSUMOS A ALISTAR POR COLOR:", margin, y + 3.5);
        y += 5;

        desgloseInsumos.forEach((ins) => {
          const detalleColores =
            ins.agrupadoPorColor.length > 0
              ? ins.agrupadoPorColor.map((ag) => `${ag.cantidad} ${ins.unidadLabel} ${ag.color}`).join("  |  ")
              : `${ins.totalCantidad} ${ins.unidadLabel}`;

          const textoLinea = `${ins.nombre} (${ins.consumoUnitario} ${ins.unidadLabel}/pda — Total: ${ins.totalCantidad} ${ins.unidadLabel}):  ${detalleColores}`;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          const lines = doc.splitTextToSize(textoLinea, contentW - 5);
          const hIns = Math.max(6, lines.length * 4 + 2);

          checkPageBreak(hIns + 4);
          doc.rect(margin, y, contentW, hIns, "D");
          doc.text(lines, margin + 2.5, y + 4.2);
          y += hIns;
        });

        y += 4;
      }

      // ================= 6. OBSERVACIONES =================
      const obsRestante = pageH - y - 22;
      const obsBoxH = Math.max(20, Math.min(32, obsRestante));
      checkPageBreak(obsBoxH + 18);

      // Pestaña OBSERVACIONES arriba a la izquierda (igual al formato físico)
      const tabW = 38;
      doc.rect(margin, y, tabW, 6.5, "D");
      doc.rect(margin + tabW, y, contentW - tabW, 6.5, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("OBSERVACIONES", margin + 2.5, y + 4.6);
      y += 6.5;

      doc.rect(margin, y, contentW, obsBoxH, "D");
      if (observacionesCorte && observacionesCorte.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const obsLines = doc.splitTextToSize(observacionesCorte.trim(), contentW - 6);
        doc.text(obsLines.slice(0, 5), margin + 3, y + 5.5);
      }
      y += obsBoxH + 5;

      // ================= 7. PIE DE PÁGINA: MUESTRA FÍSICA Y TIQUETEADO =================
      checkPageBreak(10);
      const footH = 6.5;
      // MUESTRA FÍSICA | SI | NO
      doc.rect(margin, y, 36, footH, "D");
      doc.rect(margin + 36, y, 16, footH, "D");
      doc.rect(margin + 52, y, 16, footH, "D");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("MUESTRA FÍSICA", margin + 2.5, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.text("SI", margin + 38.5, y + 4.5);
      doc.text("NO", margin + 54.5, y + 4.5);

      // TIQUETEADO | SI | NO
      const tiqX = margin + 96;
      doc.rect(tiqX, y, 34, footH, "D");
      doc.rect(tiqX + 34, y, 16, footH, "D");
      doc.rect(tiqX + 50, y, 16, footH, "D");
      doc.setFont("helvetica", "bold");
      doc.text("TIQUETEADO", tiqX + 2.5, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.text("SI", tiqX + 36.5, y + 4.5);
      doc.text("NO", tiqX + 52.5, y + 4.5);

      const safeFilename = nombreOrden.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`Orden_Corte_${safeFilename}.pdf`);
      toast.success(`Orden de Corte ${nombreOrden} descargada en PDF`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      toast.error("No se pudo generar el PDF de la orden");
    } finally {
      setGenerando(false);
    }
  };

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={handleDescargarPdf}
        disabled={generando}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50"
      >
        {generando ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : <FileDown className="w-4 h-4 text-slate-900" />}
        <span>{generando ? "Generando PDF..." : "Descargar Orden de Corte"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDescargarPdf}
      disabled={generando}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 shrink-0"
    >
      {generando ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      <span>{generando ? "Generando PDF..." : "Descargar Orden de Corte (PDF)"}</span>
    </button>
  );
}
