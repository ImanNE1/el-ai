/**
 * Client-Side & Resilient Document Text Extractor
 * Extracts text and metadata directly in the browser (or via server fallback),
 * avoiding Vercel 4.5MB serverless body limits and worker crashes.
 * Supports: PDF, DOCX, XLSX, XLS, CSV, TXT, JSON, MD
 */

import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import type { AttachedDoc } from "@/hooks/use-chat";

const MAX_CLIENT_EXTRACT_CHARS = 150000;

export interface ExtractedDocumentResult {
  success: boolean;
  name: string;
  size: number;
  type: string;
  text: string;
  pageCount?: number;
  sheetCount?: number;
  error?: string;
}

/**
 * Extract document content safely on client-side with full error handling.
 */
export async function extractDocumentFile(file: File): Promise<ExtractedDocumentResult> {
  const filename = file.name || "document";
  const extension = filename.split(".").pop()?.toLowerCase() || "";
  const size = file.size;

  try {
    // 1. Text & Code Files (Direct UTF-8 reading — 0ms, zero dependencies)
    if (["txt", "csv", "json", "md", "markdown", "js", "ts", "jsx", "tsx", "py", "html", "css", "yaml", "yml", "sql"].includes(extension)) {
      const rawText = await file.text();
      return {
        success: true,
        name: filename,
        size,
        type: extension === "csv" ? "csv" : "txt",
        text: rawText.slice(0, MAX_CLIENT_EXTRACT_CHARS).trim(),
      };
    }

    // 2. Excel Spreadsheets (.xlsx, .xls) — parsed via SheetJS in browser
    if (extension === "xlsx" || extension === "xls") {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetCount = workbook.SheetNames.length;
      const sheetTexts: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        if (csv && csv.trim()) {
          sheetTexts.push(`### Lembar: ${sheetName}\n\`\`\`csv\n${csv.trim()}\n\`\`\``);
        }
      }

      const fullText = sheetTexts.join("\n\n").trim();
      if (!fullText) {
        throw new Error(`File spreadsheet ${filename} kosong.`);
      }

      return {
        success: true,
        name: filename,
        size,
        type: "xlsx",
        text: fullText.slice(0, MAX_CLIENT_EXTRACT_CHARS),
        sheetCount,
      };
    }

    // 3. Microsoft Word (.docx) — parsed via Mammoth in browser
    if (extension === "docx") {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = (result.value || "").trim();

      if (!text) {
        throw new Error(`Tidak ada teks yang dapat dibaca dari file Word ${filename}.`);
      }

      return {
        success: true,
        name: filename,
        size,
        type: "docx",
        text: text.slice(0, MAX_CLIENT_EXTRACT_CHARS),
      };
    }

    // 4. PDF (.pdf) — parsed via unpdf
    if (extension === "pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
        const { text, totalPages } = await extractText(pdf, { mergePages: true });
        const cleanText = (text || "").trim();

        if (cleanText) {
          return {
            success: true,
            name: filename,
            size,
            type: "pdf",
            text: cleanText.slice(0, MAX_CLIENT_EXTRACT_CHARS),
            pageCount: totalPages,
          };
        }
      } catch (clientPdfErr) {
        console.warn("Client-side PDF extraction failed, falling back to server route:", clientPdfErr);
      }

      // Fallback to server route /api/extract-document
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-document", {
        method: "POST",
        body: formData,
      });

      const serverData = await res.json().catch(() => null);
      if (!res.ok || !serverData?.success) {
        throw new Error(serverData?.error || "Gagal membaca teks dari file PDF.");
      }

      return {
        success: true,
        name: serverData.name || filename,
        size: serverData.size || size,
        type: "pdf",
        text: serverData.text,
        pageCount: serverData.pageCount,
      };
    }

    throw new Error(`Format file .${extension} belum didukung.`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat membaca file.";
    return {
      success: false,
      name: filename,
      size,
      type: extension,
      text: "",
      error: errorMsg,
    };
  }
}
