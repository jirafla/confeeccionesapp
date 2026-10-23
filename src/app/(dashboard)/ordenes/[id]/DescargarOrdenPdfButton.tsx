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
      const contentW = pageW - margin * 2;
      let y = margin;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageH - 18) {
          doc.addPage();
          y = margin;
        }
      };

      // ================= ENCABEZADO =================
      doc.setFillColor(15, 23, 42); // slate-900
      doc.roundedRect(margin, y, contentW, 24, 3, 3, "F");

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text((empresaNombre || " TALLER DE CONFECCIÓN").toUpperCase(), margin + 6, y + 7);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("ORDEN DE PRODUCCIÓN — FICHA DE CORTE", margin + 6, y + 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`Fecha de emisión: ${fechaCreacion}   |   Etapa: ${estadoLabel.toUpperCase()}`, margin + 6, y + 20.5);

      // Badge con número de orden a la derecha
      const ordenBadgeText = `ORDEN #${nombreOrden}`;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const badgeW = Math.max(doc.getTextWidth(ordenBadgeText) + 10, 38);
      doc.setFillColor(37, 99, 235); // blue-600
      doc.roundedRect(pageW - margin - badgeW - 5, y + 5, badgeW, 14, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.text(ordenBadgeText, pageW - margin - 5 - badgeW / 2, y + 13.8, { align: "center" });

      y += 29;

      // ================= FICHA GENERAL + IMAGEN =================
      const imgData = disenoArchivoUrl ? await cargarImagenBase64(disenoArchivoUrl) : null;
      const boxH = imgData ? 38 : 26;

      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(margin, y, contentW, boxH, 2.5, 2.5, "FD");

      const infoW = imgData ? contentW - 42 : contentW;
      const col1X = margin + 5;
      const col2X = margin + infoW * 0.52;

      // Referencia
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("REFERENCIA / PRENDA", col1X, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const refTexto = referenciaNombre
        ? `${referenciaCodigo} — ${referenciaNombre}`
        : referenciaCodigo;
      const refLines = doc.splitTextToSize(refTexto, infoW * 0.48 - 4);
      doc.text(refLines.slice(0, 2), col1X, y + 13);

      // Cliente
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("CLIENTE", col2X, y + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      const cliLines = doc.splitTextToSize(clienteNombre, infoW * 0.45 - 6);
      doc.text(cliLines.slice(0, 2), col2X, y + 13);

      // Total prendas a cortar
      const row2Y = imgData ? y + 24 : y + 18;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("TOTAL A CORTAR:", col1X, row2Y + 4);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text(`${cantidadTotal} PRENDAS`, col1X + 28, row2Y + 4.2);

      if (imgData) {
        try {
          const imgX = pageW - margin - 37;
          const imgY = y + 3;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(203, 213, 225);
          doc.roundedRect(imgX - 1, imgY - 1, 34, 34, 1.5, 1.5, "FD");
          doc.addImage(imgData.dataUrl, imgData.format, imgX, imgY, 32, 32, undefined, "FAST");
        } catch {
          // Si falla el renderizado de la imagen, continuamos sin bloquear el PDF
        }
      }

      y += boxH + 7;

      // ================= SECCIÓN 1: VARIANTES A CORTAR =================
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("1. DESGLOSE DE VARIANTES / COLORES A CORTAR", margin, y);
      y += 3;

      // Cabecera de tabla
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y, contentW, 8, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text("#", margin + 4, y + 5.3);
      doc.text("VARIANTE / COLOR / DETALLE", margin + 15, y + 5.3);
      doc.text("CANT. PROGRAMADA", margin + 118, y + 5.3);
      doc.text("CORTADO (VERIFICAR)", margin + 152, y + 5.3);
      y += 8;

      if (variantes.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.rect(margin, y, contentW, 8, "D");
        doc.text("Sin desglose de variantes especificado", margin + 6, y + 5.3);
        y += 8;
      } else {
        variantes.forEach((v, idx) => {
          checkPageBreak(9);
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentW, 8.5, "FD");
          } else {
            doc.rect(margin, y, contentW, 8.5, "D");
          }

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(71, 85, 105);
          doc.text(String(idx + 1), margin + 4, y + 5.7);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(15, 23, 42);
          const varTexto = doc.splitTextToSize(v.detalle || "—", 95)[0];
          doc.text(varTexto, margin + 15, y + 5.7);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
          doc.text(`${v.cantidad ?? "—"} uds`, margin + 123, y + 5.7);

          // Casilla de chequeo para mesa de corte
          doc.setDrawColor(148, 163, 184);
          doc.rect(margin + 155, y + 2, 4.5, 4.5, "D");
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text("______ uds", margin + 162, y + 5.7);

          doc.setDrawColor(203, 213, 225);
          y += 8.5;
        });
      }

      // Fila total
      checkPageBreak(10);
      doc.setFillColor(239, 246, 255); // blue-50
      doc.setDrawColor(191, 219, 254);
      doc.rect(margin, y, contentW, 8.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(30, 58, 138);
      doc.text("TOTAL PRENDAS DE LA ORDEN", margin + 15, y + 5.7);
      doc.text(`${cantidadTotal} uds`, margin + 123, y + 5.7);
      y += 14;

      // ================= SECCIÓN 2: TELAS Y CONSUMO =================
      if (telas.length > 0) {
        checkPageBreak(28);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("2. TELAS Y CONSUMO ESTIMADO", margin, y);
        y += 3;

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, 8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text("TELA", margin + 4, y + 5.3);
        doc.text("TIPO / REFERENCIA DE TELA", margin + 48, y + 5.3);
        doc.text("PROMEDIO / PRENDA", margin + 118, y + 5.3);
        doc.text("TOTAL ESTIMADO", margin + 154, y + 5.3);
        y += 8;

        telas.forEach((t, idx) => {
          checkPageBreak(9);
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentW, 8, "FD");
          } else {
            doc.rect(margin, y, contentW, 8, "D");
          }

          const totalTela = Number((t.promedio * cantidadTotal).toFixed(2));

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(t.nombre, 40)[0], margin + 4, y + 5.4);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(doc.splitTextToSize(t.tipo || "—", 65)[0], margin + 48, y + 5.4);

          doc.text(`${t.promedio} m`, margin + 123, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
          doc.text(`${totalTela} m`, margin + 156, y + 5.4);

          y += 8;
        });

        y += 6;
      }

      // ================= SECCIÓN 3: INSUMOS POR COLOR =================
      if (desgloseInsumos.length > 0) {
        checkPageBreak(28);
        const numSeccion = telas.length > 0 ? "3" : "2";
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(`${numSeccion}. INSUMOS A ALISTAR POR COLOR`, margin, y);
        y += 3;

        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, contentW, 8, "FD");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text("INSUMO", margin + 4, y + 5.3);
        doc.text("CONSUMO/PDA", margin + 52, y + 5.3);
        doc.text("TOTAL ORDEN", margin + 82, y + 5.3);
        doc.text("PARAMETRIZACIÓN POR COLOR (ALISTAR)", margin + 112, y + 5.3);
        y += 8;

        desgloseInsumos.forEach((ins, idx) => {
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
          if (idx % 2 === 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y, contentW, rowH, "FD");
          } else {
            doc.rect(margin, y, contentW, rowH, "D");
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          doc.text(doc.splitTextToSize(ins.nombre, 45)[0], margin + 4, y + 5.4);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`${ins.consumoUnitario} ${ins.unidadLabel}`, margin + 52, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.setTextColor(79, 70, 229); // indigo-600
          doc.text(`${ins.totalCantidad} ${ins.unidadLabel}`, margin + 82, y + 5.4);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(8.5);
          doc.setTextColor(30, 41, 59);
          doc.text(wrappedDesglose, margin + 112, y + 5.4);

          y += rowH;
        });

        y += 6;
      }

      // ================= SECCIÓN 4: OBSERVACIONES Y CONTROL DE CORTE =================
      checkPageBreak(48);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text("OBSERVACIONES Y CONTROL EN MESA DE CORTE", margin, y);
      y += 3;

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, y, contentW, 22, 2, 2, "FD");

      if (observacionesCorte && observacionesCorte.trim()) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const obsLines = doc.splitTextToSize(observacionesCorte.trim(), contentW - 8);
        doc.text(obsLines.slice(0, 4), margin + 4, y + 6);
      } else {
        doc.setDrawColor(226, 232, 240);
        doc.line(margin + 4, y + 8, pageW - margin - 4, y + 8);
        doc.line(margin + 4, y + 14, pageW - margin - 4, y + 14);
        doc.line(margin + 4, y + 20, pageW - margin - 4, y + 20);
      }

      y += 34;

      // Líneas de firma
      checkPageBreak(20);
      const sigW = (contentW - 16) / 3;
      doc.setDrawColor(148, 163, 184);

      doc.line(margin, y, margin + sigW, y);
      doc.line(margin + sigW + 8, y, margin + sigW * 2 + 8, y);
      doc.line(margin + sigW * 2 + 16, y, pageW - margin, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("RESPONSABLE DE CORTE (FIRMA)", margin + sigW / 2, y + 4.5, { align: "center" });
      doc.text("FECHA REAL DE CORTE", margin + sigW + 8 + sigW / 2, y + 4.5, { align: "center" });
      doc.text("TOTAL PRENDAS CORTADAS", margin + sigW * 2 + 16 + sigW / 2, y + 4.5, { align: "center" });

      const safeFilename = nombreOrden.replace(/[^a-zA-Z0-9_-]/g, "_");
      doc.save(`Orden_Corte_${safeFilename}.pdf`);
      toast.success(`PDF de la orden ${nombreOrden} descargado`);
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
        {generando ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <FileDown className="w-4 h-4 text-blue-600" />}
        <span>{generando ? "Generando PDF..." : "Descargar PDF"}</span>
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
      <span>{generando ? "Generando PDF..." : "Descargar Orden en PDF"}</span>
    </button>
  );
}
