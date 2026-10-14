/**
 * Markdown Table to Excel (.xlsx) Converter Utility
 * Extracts tables, CSV, or structured data from Markdown and exports to Microsoft Excel (.xlsx).
 * Supports:
 * - Markdown table detection & multi-table sheets
 * - Auto-sized column widths
 * - Clean data cell formatting
 * - Direct browser file download
 */

import * as XLSX from "xlsx";
import { extractDocumentTitle } from "./docx-generator";

/**
 * Clean markdown symbols for table cell contents
 */
function cleanTableCell(cell: string): string {
  return cell
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

/**
 * Check if the Markdown response contains tabular data suitable for Excel export.
 */
export function hasTabularData(markdown: string): boolean {
  if (!markdown) return false;
  // Match standard markdown table syntax: | col | col | with |---|---|
  return /\|.+---\|/m.test(markdown) || /\|.+\|.+\|/m.test(markdown);
}

/**
 * Generate and download an Excel spreadsheet (.xlsx) from Markdown tables.
 */
export async function downloadExcel(markdown: string, customFilename?: string): Promise<void> {
  const lines = markdown.split("\n");
  const tables: string[][][] = [];
  let currentTable: string[][] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Check if it's a separator line like |---|---|
      if (trimmed.replace(/[\s|:-]/g, "").length === 0) {
        continue;
      }

      const cells = trimmed
        .split("|")
        .map((c) => cleanTableCell(c))
        .slice(1, -1);

      if (cells.length > 0) {
        currentTable.push(cells);
        inTable = true;
      }
    } else {
      if (inTable && currentTable.length > 0) {
        tables.push(currentTable);
        currentTable = [];
        inTable = false;
      }
    }
  }

  if (inTable && currentTable.length > 0) {
    tables.push(currentTable);
  }

  const wb = XLSX.utils.book_new();

  if (tables.length > 0) {
    tables.forEach((tableRows, idx) => {
      const ws = XLSX.utils.aoa_to_sheet(tableRows);

      // Auto-calculate column widths
      const colWidths: number[] = [];
      tableRows.forEach((r) => {
        r.forEach((cell, i) => {
          const len = String(cell).length;
          colWidths[i] = Math.max(colWidths[i] || 10, len + 3);
        });
      });
      ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w, 50) }));

      const sheetName = tables.length === 1 ? "Data" : `Tabel_${idx + 1}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
  } else {
    // If no explicit markdown table was found, export lines as a single column list
    const nonBlankLines = lines
      .map((l) => [cleanTableCell(l)])
      .filter(([l]) => l.length > 0);

    const ws = XLSX.utils.aoa_to_sheet(
      nonBlankLines.length > 0 ? nonBlankLines : [["Konten Dokumen"]]
    );
    ws["!cols"] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws, "Catatan");
  }

  const rawTitle = customFilename || `${extractDocumentTitle(markdown)}.xlsx`;
  const cleanTitle = rawTitle.endsWith(".xlsx") ? rawTitle : `${rawTitle}.xlsx`;
  const safeFilename = cleanTitle.replace(/[\\/:*?"<>|]/g, "_");

  XLSX.writeFile(wb, safeFilename);
}
