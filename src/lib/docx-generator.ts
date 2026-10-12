/**
 * Markdown to DOCX Converter Utility
 * Generates beautifully formatted Microsoft Word (.docx) documents from Markdown.
 * Supports:
 * - Titles and Headings (H1 - H4)
 * - Rich typography (Bold, Italic, Bold-Italic, Inline Code)
 * - Bulleted and Numbered lists
 * - Markdown Tables with styled header rows and borders
 * - Blockquotes and callouts
 * - Code blocks
 * - Direct browser file download
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
} from "docx";

const TABLE_BORDER = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
const CELL_BORDERS = {
  top: TABLE_BORDER,
  bottom: TABLE_BORDER,
  left: TABLE_BORDER,
  right: TABLE_BORDER,
};

/**
 * Parse inline Markdown formatting (*italic*, **bold**, ***both***, `code`)
 * and return an array of docx TextRun instances.
 */
function parseInlineRuns(text: string, defaultOptions?: { italics?: boolean; bold?: boolean }): TextRun[] {
  if (!text) return [];

  // Regex to match ***bold italic***, **bold**, *italic*, `code`
  const regex = /(\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  const runs: TextRun[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          font: "Calibri",
          size: 22, // 11pt
          italics: defaultOptions?.italics,
          bold: defaultOptions?.bold,
        })
      );
    }

    if (match[2]) {
      // Bold + Italic
      runs.push(
        new TextRun({
          text: match[2],
          font: "Calibri",
          size: 22,
          bold: true,
          italics: true,
        })
      );
    } else if (match[3]) {
      // Bold
      runs.push(
        new TextRun({
          text: match[3],
          font: "Calibri",
          size: 22,
          bold: true,
          italics: defaultOptions?.italics,
        })
      );
    } else if (match[4]) {
      // Italic
      runs.push(
        new TextRun({
          text: match[4],
          font: "Calibri",
          size: 22,
          bold: defaultOptions?.bold,
          italics: true,
        })
      );
    } else if (match[5]) {
      // Code
      runs.push(
        new TextRun({
          text: match[5],
          font: "Consolas",
          size: 20,
          color: "0F172A",
        })
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.slice(lastIndex),
        font: "Calibri",
        size: 22,
        italics: defaultOptions?.italics,
        bold: defaultOptions?.bold,
      })
    );
  }

  return runs.length > 0 ? runs : [new TextRun({ text, font: "Calibri", size: 22 })];
}

/**
 * Parse a block of Markdown table lines into a docx Table instance.
 */
function parseMarkdownTable(tableLines: string[]): Table {
  const rows: TableRow[] = [];
  let isHeaderRow = true;

  for (const line of tableLines) {
    // Skip separator lines like |---|---|
    if (line.replace(/[\s|:-]/g, "").length === 0) {
      isHeaderRow = false;
      continue;
    }

    const rawCells = line.split("|").map((c) => c.trim());
    if (rawCells.length > 0 && rawCells[0] === "") rawCells.shift();
    if (rawCells.length > 0 && rawCells[rawCells.length - 1] === "") rawCells.pop();

    if (rawCells.length === 0) continue;

    const cells = rawCells.map((cellText) => {
      const runs = parseInlineRuns(cellText, { bold: isHeaderRow });
      return new TableCell({
        children: [
          new Paragraph({
            children: runs,
            spacing: { before: 80, after: 80 },
          }),
        ],
        shading: isHeaderRow ? { fill: "F1F5F9" } : undefined,
        borders: CELL_BORDERS,
      });
    });

    rows.push(
      new TableRow({
        children: cells,
        tableHeader: isHeaderRow,
      })
    );

    isHeaderRow = false;
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

/**
 * Extract clean document title from Markdown content.
 */
export function extractDocumentTitle(markdown: string): string {
  if (!markdown) return "Dokumen";

  const lines = markdown.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return trimmed.replace(/^#\s+/, "").replace(/[*_#`]/g, "").trim();
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      return trimmed.replace(/^##\s+/, "").replace(/[*_#`]/g, "").trim();
    }
  }

  // Fallback to first non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("```") && !trimmed.startsWith(">")) {
      const clean = trimmed.replace(/[*_#`]/g, "").slice(0, 50).trim();
      if (clean) return clean;
    }
  }

  return "Dokumen";
}

/**
 * Check if the Markdown response represents a document (letter, report, proposal, contract, etc.)
 */
export function isDocumentLike(markdown: string): boolean {
  if (!markdown || markdown.length < 120) return false;

  const lower = markdown.toLowerCase();
  const documentKeywords = [
    "dokumen",
    "surat",
    "laporan",
    "proposal",
    "perjanjian",
    "kontrak",
    "makalah",
    "sop",
    "notulen",
    "docx",
    "word",
    "draft",
    "memorandum",
    "lembar",
    "pasal",
    "bab 1",
    "bab i",
  ];

  const hasKeyword = documentKeywords.some((kw) => lower.includes(kw));
  const hasHeadings = /^#{1,3}\s+/m.test(markdown);
  const hasTable = /\|.+---\|/m.test(markdown);

  return (hasKeyword && hasHeadings) || (hasHeadings && hasTable) || (markdown.includes("# ") && markdown.includes("## "));
}

/**
 * Generate a docx Document from Markdown string.
 */
export async function generateDocxBlob(markdown: string, customTitle?: string): Promise<Blob> {
  const lines = markdown.split("\n");
  const children: (Paragraph | Table)[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = () => {
    if (tableLines.length > 0) {
      children.push(parseMarkdownTable(tableLines));
      children.push(new Paragraph({ text: "", spacing: { after: 120 } }));
      tableLines = [];
      inTable = false;
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockLines.length > 0) {
      const codeText = codeBlockLines.join("\n");
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeText,
              font: "Consolas",
              size: 19,
              color: "1E293B",
            }),
          ],
          shading: { fill: "F8FAFC" },
          spacing: { before: 120, after: 120 },
        })
      );
      codeBlockLines = [];
      inCodeBlock = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block detection
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

    // Markdown Table detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      inTable = true;
      tableLines.push(trimmed);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Empty line
    if (!trimmed) {
      children.push(new Paragraph({ text: "", spacing: { after: 100 } }));
      continue;
    }

    // Headings
    if (trimmed.startsWith("# ")) {
      const text = trimmed.slice(2).trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text,
              font: "Calibri",
              size: 32, // 16pt
              bold: true,
              color: "0F172A",
            }),
          ],
          spacing: { before: 280, after: 140 },
        })
      );
    } else if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text,
              font: "Calibri",
              size: 26, // 13pt
              bold: true,
              color: "1E293B",
            }),
          ],
          spacing: { before: 220, after: 100 },
        })
      );
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text,
              font: "Calibri",
              size: 24, // 12pt
              bold: true,
              color: "334155",
            }),
          ],
          spacing: { before: 180, after: 80 },
        })
      );
    } else if (trimmed.startsWith("#### ")) {
      const text = trimmed.slice(5).trim();
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_4,
          children: [
            new TextRun({
              text,
              font: "Calibri",
              size: 22,
              bold: true,
              color: "475569",
            }),
          ],
          spacing: { before: 140, after: 60 },
        })
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("+ ")) {
      // Bullet list item
      const itemText = trimmed.slice(2).trim();
      children.push(
        new Paragraph({
          children: parseInlineRuns(itemText),
          bullet: { level: 0 },
          spacing: { before: 40, after: 40 },
        })
      );
    } else if (/^\d+\.\s+/.test(trimmed)) {
      // Numbered list item
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        const [, num, itemText] = numMatch;
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${num}. `, bold: true, font: "Calibri", size: 22 }),
              ...parseInlineRuns(itemText),
            ],
            indent: { left: 360 },
            spacing: { before: 40, after: 40 },
          })
        );
      }
    } else if (trimmed.startsWith("> ")) {
      // Blockquote
      const quoteText = trimmed.slice(2).trim();
      children.push(
        new Paragraph({
          children: parseInlineRuns(quoteText, { italics: true }),
          indent: { left: 720 },
          spacing: { before: 100, after: 100 },
        })
      );
    } else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      // Divider / Horizontal Rule
      children.push(
        new Paragraph({
          text: "",
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" } },
          spacing: { before: 140, after: 140 },
        })
      );
    } else {
      // Regular paragraph
      children.push(
        new Paragraph({
          children: parseInlineRuns(trimmed),
          spacing: { before: 60, after: 60 },
        })
      );
    }
  }

  // Flush remaining table or code block
  flushTable();
  flushCodeBlock();

  const title = customTitle || extractDocumentTitle(markdown);

  const doc = new Document({
    title,
    description: "Dihasilkan secara otomatis oleh EL Assistant",
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers a browser download of the generated docx file.
 */
export async function downloadDocx(markdown: string, filename?: string): Promise<void> {
  const title = filename || `${extractDocumentTitle(markdown)}.docx`;
  const cleanFilename = title.endsWith(".docx") ? title : `${title}.docx`;
  // Sanitize filename for operating systems
  const safeFilename = cleanFilename.replace(/[\\/:*?"<>|]/g, "_");

  const blob = await generateDocxBlob(markdown, extractDocumentTitle(markdown));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
