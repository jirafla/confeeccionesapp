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

async function cargarImagenBase64(url: string): Promise<{ dataUrl: string; format: "JPEG" | "PNG" } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const objectUrl = URL.createObjectURL(blob);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const maxDim = 600;
          let w = img.width || 400;
          let h = img.height || 400;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            URL.revokeObjectURL(objectUrl);
            resolve(null);
            return;
          }
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          URL.revokeObjectURL(objectUrl);
          resolve({ dataUrl, format: "JPEG" });
        } catch {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
      img.src = objectUrl;
    });
  } catch {
    return null;
  }
}

export default function DescargarOrdenPdfButton({
  nombreOrden,
  empresaNombre,
  clienteNombre,
  referenciaCodigo,
  referenciaNombre,
  disenoArchivoUrl,
  estadoLabel,
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
      const margin = 14;
      const contentW = pageW - margin * 2; // 182
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageH - 18) {
          doc.addPage();
          y = margin;
        }
      };

      // ================= ENCABEZADO (ESTRUCTURA PREFERIDA EN BLANCO Y NEGRO) =================
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(margin, y, contentW, 22, "D");

      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text((empresaNombre || "TALLER DE CONFECCIÓN").toUpperCase(), margin + 5, y + 6.5);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13.5);
      doc.text("ORDEN DE PRODUCCIÓN — FICHA DE CORTE", margin + 5, y + 13.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(`Fecha: ${fechaCreacion}   |   Estado: ${estadoLabel.toUpperCase()}`, margin + 5, y + 19);

      const ordenBadgeText = `ORDEN #${nombreOrden}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const badgeW = Math.max(doc.getTextWidth(ordenBadgeText) + 10, 40);
      doc.setLineWidth(0.6);
      doc.rect(pageW - margin - badgeW - 4, y + 4, badgeW, 14, "D");
      doc.setTextColor(0, 0, 0);
      doc.text(ordenBadgeText, pageW - margin - 4 - badgeW / 2, y + 12.8, { align: "center" });
      doc.setLineWidth(0.25);

      y += 26;

      // ================= DATOS GENERALES + IMAGEN DE REFERENCIA =================
      const imgData = disenoArchivoUrl ? await cargarImagenBase64(disenoArchivoUrl) : null;
      const boxH = imgData ? 36 : 24;

      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, boxH, "D");

      const infoW = imgData ? contentW - 40 : contentW;
      const col1X = margin + 5;
      const col2X = margin + infoW * 0.52;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text("REFERENCIA / PRENDA:", col1X, y + 6.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(0, 0, 0);
      const refTexto = referenciaNombre
        ? `${referenciaCodigo} — ${referenciaNombre}`
        : referenciaCodigo;
      const refLines = doc.splitTextToSize(refTexto, infoW * 0.48 - 4);
      doc.text(refLines.slice(0, 2), col1X, y + 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text("CLIENTE:", col2X, y + 6.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const cliLines = doc.splitTextToSize(clienteNombre, infoW * 0.45 - 6);
      doc.text(cliLines.slice(0, 2), col2X, y + 12);

      const row2Y = imgData ? y + 23 : y + 16.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text("TOTAL A CORTAR:", col1X, row2Y + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`${cantidadTotal} PRENDAS`, col1X + 29, row2Y + 4.2);

      if (imgData) {
        try {
          const imgX = pageW - margin - 35;
          const imgY = y + 2.5;
          doc.setDrawColor(120, 120, 120);
          doc.rect(imgX - 0.5, imgY - 0.5, 32, 32, "D");
          doc.addImage(imgData.dataUrl, imgData.format, imgX, imgY, 31, 31, undefined, "FAST");
        } catch {
          // Continuar si la imagen falla
        }
      }

      y += boxH + 7;

      // ================= 1. PROMEDIOS Y CONSUMO ESTIMADO DE TELA =================
      checkPageBreak(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("1. PROMEDIOS Y CONSUMO ESTIMADO DE TELA", margin, y);
      y += 2.5;

      doc.setFillColor(235, 235, 235);
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, 8, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("TELA", margin + 4, y + 5.3);
      doc.text("TIPO / ESPECIFICACIÓN", margin + 44, y + 5.3);
      doc.text("PROMEDIO POR PRENDA", margin + 104, y + 5.3);
      doc.text("TOTAL ESTIMADO ORDEN", margin + 144, y + 5.3);
      y += 8;

      if (telas.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.rect(margin, y, contentW, 8, "D");
        doc.text("Sin promedios de tela registrados en la referencia", margin + 4, y + 5.3);
        y += 8;
      } else {
        telas.forEach((t) => {
          checkPageBreak(9);
          doc.setDrawColor(0, 0, 0);
          doc.rect(margin, y, contentW, 8, "D");

          const totalTela = Number((t.promedio * cantidadTotal).toFixed(2));

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(doc.splitTextToSize(t.nombre, 38)[0], margin + 4, y + 5.4);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(20, 20, 20);
          doc.text(doc.splitTextToSize(t.tipo || "—", 56)[0], margin + 44, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.text(`${t.promedio} m / prenda`, margin + 106, y + 5.4);

          doc.text(`${totalTela} m`, margin + 148, y + 5.4);

          y += 8;
        });
      }

      y += 7;

      // ================= 2. TABLA DE CORTE (CON TELA REQUERIDA SEGÚN PROMEDIO + CAPAS REQ / EXT) =================
      checkPageBreak(35);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("2. DESGLOSE DE TELAS, PRENDAS Y CAPAS PARA CORTE POR COLOR", margin, y);
      y += 2.5;

      const numTelasCols = Math.max(1, Math.min(3, telas.length));
      // Distribución exacta para sumar contentW (182 mm):
      const colorW = numTelasCols === 1 ? 34 : numTelasCols === 2 ? 28 : 24;
      const prendasW = numTelasCols === 3 ? 14 : 16;
      const cortadasW = numTelasCols === 3 ? 17 : 18;
      const capaColW = numTelasCols === 1 ? 19 : numTelasCols === 2 ? 15.5 : 13.5;
      const totalCapasW = capaColW * (numTelasCols * 2);
      const telaReqW = contentW - (colorW + prendasW + totalCapasW + cortadasW);

      const colWidths = [
        colorW,
        prendasW,
        telaReqW,
        ...Array(numTelasCols).fill(capaColW),
        ...Array(numTelasCols).fill(capaColW),
        cortadasW,
      ];

      const colX: number[] = [];
      let accX = margin;
      for (const w of colWidths) {
        colX.push(accX);
        accX += w;
      }

      const headerH = 11.5;
      doc.setFillColor(235, 235, 235);
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, headerH, "FD");

      for (let c = 0; c < colWidths.length; c++) {
        doc.rect(colX[c], y, colWidths[c], headerH, "D");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.setTextColor(0, 0, 0);
      doc.text("COLOR / VARIANTE", colX[0] + 2, y + 6.8);

      doc.setFontSize(6.5);
      doc.text("PRENDAS", colX[1] + colWidths[1] / 2, y + 6.8, { align: "center" });

      doc.setFontSize(6.8);
      doc.text("TELA REQUERIDA SEGÚN PROMEDIO", colX[2] + 2.5, y + 6.8);

      for (let t = 0; t < numTelasCols; t++) {
        const reqIdx = 3 + t;
        const cxReq = colX[reqIdx] + colWidths[reqIdx] / 2;
        doc.setFontSize(6.2);
        doc.text("CAPAS", cxReq, y + 3.6, { align: "center" });
        doc.text("REQ TELA", cxReq, y + 6.8, { align: "center" });
        doc.text(String(t + 1), cxReq, y + 10, { align: "center" });

        const extIdx = 3 + numTelasCols + t;
        const cxExt = colX[extIdx] + colWidths[extIdx] / 2;
        doc.text("CAPAS", cxExt, y + 3.6, { align: "center" });
        doc.text("EXT TELA", cxExt, y + 6.8, { align: "center" });
        doc.text(String(t + 1), cxExt, y + 10, { align: "center" });
      }

      const cortIdx = colWidths.length - 1;
      const cxCort = colX[cortIdx] + colWidths[cortIdx] / 2;
      doc.setFontSize(6.5);
      doc.text("UNDS", cxCort, y + 4.8, { align: "center" });
      doc.text("CORTADAS", cxCort, y + 8.6, { align: "center" });

      y += headerH;

      // Renderizar únicamente las filas exactas de colores/tallas que trae la orden (sin filas vacías extra)
      if (variantes.length === 0) {
        doc.rect(margin, y, contentW, 8, "D");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.text("Sin desglose de colores/variantes", margin + 4, y + 5.3);
        y += 8;
      } else {
        variantes.forEach((v) => {
          const cantPrendas = v.cantidad ?? 0;
          const textoMetrosPorTela =
            telas.length > 0 && cantPrendas > 0
              ? telas
                  .map((t) => {
                    const metros = Number((t.promedio * cantPrendas).toFixed(2));
                    const etiquetaTela = t.tipo ? `${t.nombre} (${t.tipo})` : t.nombre;
                    return `${etiquetaTela}: ${metros} m`;
                  })
                  .join("  |  ")
              : "—";

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          const wrappedTela = doc.splitTextToSize(textoMetrosPorTela, telaReqW - 4);
          const filaH = Math.max(8.5, wrappedTela.length * 4.2 + 3.5);

          checkPageBreak(filaH + 12);

          for (let c = 0; c < colWidths.length; c++) {
            doc.rect(colX[c], y, colWidths[c], filaH, "D");
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.8);
          doc.setTextColor(0, 0, 0);
          doc.text(doc.splitTextToSize(v.detalle || "—", colorW - 4)[0] || "", colX[0] + 2, y + 5.4);

          if (v.cantidad !== null) {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.8);
            doc.text(`${v.cantidad} uds`, colX[1] + colWidths[1] / 2, y + 5.4, { align: "center" });
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(20, 20, 20);
          doc.text(wrappedTela, colX[2] + 2, y + 5.2);

          y += filaH;
        });
      }

      // Fila final TOTAL de la tabla de corte
      const totalGeneralTelas =
        telas.length > 0
          ? telas
              .map((t) => `${t.nombre}: ${Number((t.promedio * cantidadTotal).toFixed(2))} m`)
              .join(" | ")
          : "";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      const wrappedTotalTelas = totalGeneralTelas
        ? doc.splitTextToSize(totalGeneralTelas, telaReqW - 4)
        : [];
      const totalRowH = Math.max(8.5, wrappedTotalTelas.length * 4.2 + 3.5);

      checkPageBreak(totalRowH + 4);
      doc.setFillColor(242, 242, 242);
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, totalRowH, "FD");

      for (let c = 0; c < colWidths.length; c++) {
        doc.rect(colX[c], y, colWidths[c], totalRowH, "D");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text("TOTAL A CORTAR", colX[0] + 2, y + 5.5);
      doc.text(`${cantidadTotal} uds`, colX[1] + colWidths[1] / 2, y + 5.5, { align: "center" });

      if (wrappedTotalTelas.length > 0) {
        doc.setFontSize(7.8);
        doc.text(wrappedTotalTelas, colX[2] + 2, y + 5.3);
      }

      y += totalRowH + 7;

      // ================= 3. INSUMOS A ALISTAR POR COLOR =================
      checkPageBreak(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("3. INSUMOS A ALISTAR POR COLOR", margin, y);
      y += 2.5;

      doc.setFillColor(235, 235, 235);
      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, 8, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text("INSUMO", margin + 4, y + 5.3);
      doc.text("MEDIDA / PDA", margin + 52, y + 5.3);
      doc.text("TOTAL ORDEN", margin + 82, y + 5.3);
      doc.text("PARAMETRIZACIÓN POR COLOR (ALISTAR)", margin + 112, y + 5.3);
      y += 8;

      if (desgloseInsumos.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        doc.rect(margin, y, contentW, 8, "D");
        doc.text("Sin insumos registrados para esta referencia", margin + 4, y + 5.3);
        y += 8;
      } else {
        desgloseInsumos.forEach((ins) => {
          const desgloseTexto =
            ins.agrupadoPorColor.length > 0
              ? ins.agrupadoPorColor
                  .map((ag) => `${ag.cantidad} ${ins.unidadLabel} ${ag.color}`)
                  .join("  •  ")
              : `${ins.totalCantidad} ${ins.unidadLabel}`;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          const wrappedDesglose = doc.splitTextToSize(desgloseTexto, contentW - 115);
          const rowH = Math.max(8, wrappedDesglose.length * 4.5 + 3.5);

          checkPageBreak(rowH + 2);
          doc.setDrawColor(0, 0, 0);
          doc.rect(margin, y, contentW, rowH, "D");

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(doc.splitTextToSize(ins.nombre, 45)[0], margin + 4, y + 5.4);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 30, 30);
          doc.text(`${ins.consumoUnitario} ${ins.unidadLabel}`, margin + 52, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(`${ins.totalCantidad} ${ins.unidadLabel}`, margin + 82, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(0, 0, 0);
          doc.text(wrappedDesglose, margin + 112, y + 5.4);

          y += rowH;
        });
      }

      y += 7;

      // ================= OBSERVACIONES Y FIRMAS DE CONTROL =================
      checkPageBreak(42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text("OBSERVACIONES Y CONTROL EN MESA DE CORTE", margin, y);
      y += 2.5;

      doc.setDrawColor(0, 0, 0);
      doc.rect(margin, y, contentW, 20, "D");

      if (observacionesCorte && observacionesCorte.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(0, 0, 0);
        const obsLines = doc.splitTextToSize(observacionesCorte.trim(), contentW - 8);
        doc.text(obsLines.slice(0, 4), margin + 4, y + 5.5);
      } else {
        doc.setDrawColor(180, 180, 180);
        doc.line(margin + 4, y + 7, pageW - margin - 4, y + 7);
        doc.line(margin + 4, y + 13, pageW - margin - 4, y + 13);
        doc.line(margin + 4, y + 18, pageW - margin - 4, y + 18);
      }

      y += 31;

      checkPageBreak(16);
      const sigW = (contentW - 16) / 3;
      doc.setDrawColor(0, 0, 0);

      doc.line(margin, y, margin + sigW, y);
      doc.line(margin + sigW + 8, y, margin + sigW * 2 + 8, y);
      doc.line(margin + sigW * 2 + 16, y, pageW - margin, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(0, 0, 0);
      doc.text("RESPONSABLE DE CORTE (FIRMA)", margin + sigW / 2, y + 4.5, { align: "center" });
      doc.text("FECHA REAL DE CORTE", margin + sigW + 8 + sigW / 2, y + 4.5, { align: "center" });
      doc.text("TOTAL PRENDAS CORTADAS", margin + sigW * 2 + 16 + sigW / 2, y + 4.5, { align: "center" });

      const safeFilename = nombreOrden.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`Ficha_Corte_${safeFilename}.pdf`);
      toast.success(`Ficha de corte ${nombreOrden} descargada`);
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
        title="Descargar Ficha de Corte (PDF)"
        aria-label="Descargar Ficha de Corte (PDF)"
        className="inline-flex items-center justify-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs disabled:opacity-50"
      >
        {generando ? <Loader2 className="w-4 h-4 animate-spin text-slate-900" /> : <FileDown className="w-4 h-4 text-slate-900" />}
        <span className="hidden sm:inline">{generando ? "Generando PDF..." : "Descargar Ficha PDF"}</span>
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
      <span>{generando ? "Generando PDF..." : "Descargar Ficha de Corte (PDF)"}</span>
    </button>
  );
}
