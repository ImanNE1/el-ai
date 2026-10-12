import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export const maxDuration = 60;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_EXTRACTED_CHARS = 150000; // ~35,000 words

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Ukuran file melebihi batas maksimum 25MB (${(file.size / 1024 / 1024).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    const filename = file.name || "document";
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    let pageCount: number | undefined;
    let sheetCount: number | undefined;
    let docType = "txt";

    if (extension === "pdf") {
      docType = "pdf";
      try {
        const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
        const textResult = await parser.getText();
        extractedText = textResult.text || "";
        pageCount = textResult.total;
        await parser.destroy();
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr);
        return NextResponse.json(
          { error: "Gagal membaca file PDF. Pastikan file tidak terkunci password atau rusak." },
          { status: 422 }
        );
      }
    } else if (extension === "docx") {
      docType = "docx";
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr) {
        console.error("DOCX parse error:", docxErr);
        return NextResponse.json(
          { error: "Gagal membaca file Word (.docx). Pastikan file tidak rusak." },
          { status: 422 }
        );
      }
    } else if (extension === "xlsx" || extension === "xls") {
      docType = "xlsx";
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        sheetCount = workbook.SheetNames.length;
        const sheetTexts: string[] = [];

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          if (csv && csv.trim()) {
            sheetTexts.push(`### Lembar: ${sheetName}\n\`\`\`csv\n${csv.trim()}\n\`\`\``);
          }
        }

        extractedText = sheetTexts.join("\n\n");
      } catch (xlsxErr) {
        console.error("XLSX parse error:", xlsxErr);
        return NextResponse.json(
          { error: "Gagal membaca file Excel. Pastikan file spreadsheet tidak rusak." },
          { status: 422 }
        );
      }
    } else if (
      ["csv", "txt", "md", "markdown", "json", "js", "ts", "jsx", "tsx", "py", "html", "css", "yaml", "yml", "sql"].includes(
        extension
      )
    ) {
      docType = extension === "csv" ? "csv" : "txt";
      extractedText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error: `Format .${extension} belum didukung. Format yang didukung: PDF (.pdf), Word (.docx), Excel (.xlsx, .xls), CSV (.csv), dan Teks (.txt, .md, .json).`,
        },
        { status: 400 }
      );
    }

    // Clean whitespace
    extractedText = extractedText.trim();

    if (!extractedText) {
      return NextResponse.json(
        {
          error: `Tidak ada teks yang dapat diekstrak dari ${filename}. Dokumen mungkin kosong atau berupa hasil scan gambar tanpa teks terbaca.`,
        },
        { status: 422 }
      );
    }

    // Cap text length if extremely long to protect context limits
    let isTruncated = false;
    if (extractedText.length > MAX_EXTRACTED_CHARS) {
      extractedText =
        extractedText.slice(0, MAX_EXTRACTED_CHARS) +
        `\n\n...[Catatan: Teks dokumen dipotong pada ${MAX_EXTRACTED_CHARS.toLocaleString()} karakter karena melebihi batas panjang maksimum]`;
      isTruncated = true;
    }

    return NextResponse.json({
      success: true,
      name: filename,
      size: file.size,
      type: docType,
      text: extractedText,
      pageCount,
      sheetCount,
      isTruncated,
    });
  } catch (err: unknown) {
    console.error("Extract document general error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan saat memproses dokumen." },
      { status: 500 }
    );
  }
}
