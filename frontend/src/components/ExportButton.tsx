import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any) => string;
}

interface ExportButtonProps {
  data: Record<string, any>[];
  filename: string;
  columns: ExportColumn[];
  title?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ data, filename, columns, title }) => {
  const [open, setOpen] = useState(false);

  const getRows = () =>
    data.map((row) =>
      columns.map((col) => {
        const val = col.key.split('.').reduce((acc, k) => acc?.[k], row as any);
        return col.format ? col.format(val) : (val ?? '');
      })
    );

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape' });

    if (title) {
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(title, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}`, 14, 26);
    }

    autoTable(doc, {
      head: [columns.map((c) => c.header)],
      body: getRows(),
      startY: title ? 32 : 14,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`${filename}.pdf`);
    setOpen(false);
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const headers = columns.map((c) => c.header);
    const rows = getRows();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Set column widths
    ws['!cols'] = columns.map((c) => ({ wch: c.width || 18 }));

    // Style header row
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '3B82F6' } },
      alignment: { horizontal: 'center' },
    };
    headers.forEach((_, idx) => {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: idx });
      if (ws[cellAddr]) {
        ws[cellAddr].s = headerStyle;
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        title="Export data"
      >
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={exportPDF}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-200 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <FileText className="h-4 w-4 text-red-500" />
              Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-green-50 hover:text-green-600 dark:text-slate-200 dark:hover:bg-green-900/20 dark:hover:text-green-400"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-500" />
              Export Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
