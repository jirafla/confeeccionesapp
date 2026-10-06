"use client";

interface DownloadReportProps {
  data: {
    lote: string;
    prenda: string;
    taller: string;
    cantidad: number;
    estado: string;
    pago: string;
    precioUnitario: number;
    fechaPactada: string;
  }[];
}

export default function DownloadReport({ data }: DownloadReportProps) {
  const handleDownload = () => {
    if (data.length === 0) {
      alert("No hay datos para descargar");
      return;
    }

    // Prepare CSV content
    const headers = ["Lote", "Prenda", "Taller", "Cantidad", "Precio Unitario", "Estado", "Pago", "Fecha Pactada"];
    const csvRows = [headers.join(",")];

    for (const row of data) {
      const values = [
        row.lote,
        `"${row.prenda}"`,
        `"${row.taller}"`,
        row.cantidad.toString(),
        row.precioUnitario.toString(),
        row.estado,
        row.pago,
        row.fechaPactada,
      ];
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reporte_produccion_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownload}
      className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Descargar Excel / CSV
    </button>
  );
}
