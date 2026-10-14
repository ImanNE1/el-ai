/**
 * Markdown to PDF Converter Utility
 * Generates beautifully formatted PDF documents directly in the browser using jsPDF & jspdf-autotable.
 * Supports:
 * - Titles and Headings (H1 - H4)
 * - Paragraphs with text wrapping
 * - Bullet lists and numbered lists
 * - Markdown Tables with auto-sized columns and styled headers
 * - Code blocks and blockquotes
 * - Running headers and page numbers
 * - Direct browser file download
 */

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { extractDocumentTitle } from "./docx-generator";

/**
 * Clean markdown symbols for plain text rendering in PDF
 */
function cleanMarkdownText(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/**
 * Generate and download a PDF document from Markdown content.
 */
export async function downloadPdf(markdown: string, customFilename?: string): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 55;

  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let inTable = false;
  let tableLines: string[] = [];

  const checkPageOverflow = (requiredHeight: number) => {
    if (cursorY + requiredHeight > pageHeight - 50) {
      doc.addPage();
      cursorY = 55;
    }
  };

  const flushTable = () => {
    if (tableLines.length === 0) return;

    const rows: string[][] = [];
    let headers: string[] = [];
    let isHeader = true;

    for (const tLine of tableLines) {
      if (tLine.replace(/[\s|:-]/g, "").length === 0) {
        isHeader = false;
        continue;
      }
      const rawCells = tLine.split("|").map((c) => cleanMarkdownText(c.trim()));
      if (rawCells.length > 0 && rawCells[0] === "") rawCells.shift();
      if (rawCells.length > 0 && rawCells[rawCells.length - 1] === "") rawCells.pop();

      if (rawCells.length === 0) continue;

      if (isHeader) {
        headers = rawCells;
        isHeader = false;
      } else {
        rows.push(rawCells);
      }
    }

    if (headers.length > 0 || rows.length > 0) {
      checkPageOverflow(80);
      autoTable(doc, {
        startY: cursorY,
        head: headers.length > 0 ? [headers] : undefined,
        body: rows,
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235], // #2563eb
          textColor: 255,
          fontStyle: "bold",
          fontSize: 9.5,
        },
        styles: {
          fontSize: 9,
          cellPadding: 6,
          textColor: [30, 41, 59],
          overflow: "linebreak",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: margin, right: margin },
      });

      // @ts-expect-error jspdf-autotable adds lastAutoTable to jsPDF instance
      cursorY = (doc.lastAutoTable?.finalY || cursorY) + 16;
    }

    tableLines = [];
    inTable = false;
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length === 0) return;
    const codeText = codeBlockLines.join("\n");
    doc.setFont("courier", "normal");
    doc.setFontSize(8.5);
    const wrappedCode = doc.splitTextToSize(codeText, contentWidth - 20);
    const blockHeight = wrappedCode.length * 12 + 16;

    checkPageOverflow(blockHeight);

    // Gray background for code block
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, cursorY, contentWidth, blockHeight, 4, 4, "F");

    doc.setTextColor(30, 41, 59);
    doc.text(wrappedCode, margin + 10, cursorY + 14);

    cursorY += blockHeight + 14;
    codeBlockLines = [];
    inCodeBlock = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushTable();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Markdown Tables
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty lines
    if (!trimmed) {
      cursorY += 8;
      continue;
    }

    // H1 Heading (# Heading)
    if (trimmed.startsWith("# ")) {
      flushTable();
      const text = cleanMarkdownText(trimmed.replace(/^#\s+/, ""));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42); // #0f172a
      const wrapped = doc.splitTextToSize(text, contentWidth);
      const textHeight = wrapped.length * 22;
      checkPageOverflow(textHeight + 14);
      doc.text(wrapped, margin, cursorY);
      cursorY += textHeight + 12;
      continue;
    }

    // H2 Heading (## Heading)
    if (trimmed.startsWith("## ")) {
      flushTable();
      const text = cleanMarkdownText(trimmed.replace(/^##\s+/, ""));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13.5);
      doc.setTextColor(30, 41, 59); // #1e293b
      const wrapped = doc.splitTextToSize(text, contentWidth);
      const textHeight = wrapped.length * 18;
      checkPageOverflow(textHeight + 10);
      doc.text(wrapped, margin, cursorY);
      cursorY += textHeight + 8;
      continue;
    }

    // H3 Heading (### Heading)
    if (trimmed.startsWith("### ")) {
      flushTable();
      const text = cleanMarkdownText(trimmed.replace(/^###\s+/, ""));
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(51, 65, 85);
      const wrapped = doc.splitTextToSize(text, contentWidth);
      const textHeight = wrapped.length * 15;
      checkPageOverflow(textHeight + 8);
      doc.text(wrapped, margin, cursorY);
      cursorY += textHeight + 6;
      continue;
    }

    // Bullet Lists (- item, * item, • item)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      const text = cleanMarkdownText(trimmed.slice(2));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const wrapped = doc.splitTextToSize(text, contentWidth - 16);
      const textHeight = wrapped.length * 14;
      checkPageOverflow(textHeight + 4);

      // Bullet dot
      doc.text("•", margin + 4, cursorY);
      doc.text(wrapped, margin + 16, cursorY);
      cursorY += textHeight + 4;
      continue;
    }

    // Numbered Lists (1. item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const [, num, itemText] = numMatch;
      const text = cleanMarkdownText(itemText);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`${num}.`, margin + 2, cursorY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const wrapped = doc.splitTextToSize(text, contentWidth - 22);
      const textHeight = wrapped.length * 14;
      checkPageOverflow(textHeight + 4);
      doc.text(wrapped, margin + 20, cursorY);
      cursorY += textHeight + 4;
      continue;
    }

    // Blockquote (> text)
    if (trimmed.startsWith("> ")) {
      const text = cleanMarkdownText(trimmed.slice(2));
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      const wrapped = doc.splitTextToSize(text, contentWidth - 24);
      const textHeight = wrapped.length * 14;
      checkPageOverflow(textHeight + 8);

      // Left bar
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(2.5);
      doc.line(margin + 4, cursorY - 8, margin + 4, cursorY + textHeight - 4);

      doc.text(wrapped, margin + 16, cursorY);
      cursorY += textHeight + 8;
      continue;
    }

    // Horizontal Rule (---, ***)
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      checkPageOverflow(16);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(1);
      doc.line(margin, cursorY, margin + contentWidth, cursorY);
      cursorY += 16;
      continue;
    }

    // Regular Paragraph
    const cleanText = cleanMarkdownText(trimmed);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const wrapped = doc.splitTextToSize(cleanText, contentWidth);
    const textHeight = wrapped.length * 14.5;
    checkPageOverflow(textHeight + 6);
    doc.text(wrapped, margin, cursorY);
    cursorY += textHeight + 6;
  }

  // Flush remaining table or code block
  flushTable();
  flushCodeBlock();

  // Add Page Numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184); // #94a3b8

    // Footer text
    doc.text(`EL Assistant · Halaman ${p} dari ${totalPages}`, margin, pageHeight - 25);
  }

  const rawTitle = customFilename || `${extractDocumentTitle(markdown)}.pdf`;
  const cleanTitle = rawTitle.endsWith(".pdf") ? rawTitle : `${rawTitle}.pdf`;
  const safeFilename = cleanTitle.replace(/[\\/:*?"<>|]/g, "_");

  doc.save(safeFilename);
}
