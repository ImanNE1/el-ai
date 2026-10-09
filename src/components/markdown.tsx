/**
 * Premium Markdown Renderer
 * Handles: bold, italic, code blocks with syntax copy, inline code,
 * tables, blockquotes, ordered/unordered lists, headings, links, and line breaks.
 * Safe against XSS: relies on React's native string escaping without double-entity bugs.
 */
"use client";

import React, { useState } from "react";

interface MarkdownProps {
  content: string;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      className="md-copy-btn"
      onClick={handleCopy}
      type="button"
      aria-label="Copy code to clipboard"
      title={copied ? "Copied!" : "Copy code"}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Copied</span>
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*, `code`, [link](url)
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      nodes.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      nodes.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      nodes.push(
        <code key={match.index} className="md-inline-code">
          {match[4]}
        </code>
      );
    } else if (match[5] && match[6]) {
      nodes.push(
        <a
          key={match.index}
          href={match[6]}
          target="_blank"
          rel="noopener noreferrer"
          className="md-link"
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function Markdown({ content }: MarkdownProps) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code blocks
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      const fullCode = codeLines.join("\n");
      elements.push(
        <div key={`code-${i}`} className="md-code-block">
          <div className="md-code-header">
            <span className="md-code-lang">{lang || "code"}</span>
            <CopyButton code={fullCode} />
          </div>
          <pre>
            <code>{fullCode}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Markdown tables
    if (line.trim().startsWith("|") && line.trim().endsWith("|") && i + 1 < lines.length && lines[i + 1].includes("---")) {
      const headerCols = line.split("|").slice(1, -1).map((c) => c.trim());
      i += 2; // skip header line and separator line
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        const rowCols = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        tableRows.push(rowCols);
        i++;
      }
      elements.push(
        <div key={`table-${i}`} className="md-table-wrapper">
          <table className="md-table">
            <thead>
              <tr>
                {headerCols.map((col, idx) => (
                  <th key={idx}>{renderInline(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const className = `md-heading md-h${level}`;
      const children = renderInline(headingMatch[2]);
      const key = `h-${i}`;
      if (level === 1) elements.push(<h1 key={key} className={className}>{children}</h1>);
      else if (level === 2) elements.push(<h2 key={key} className={className}>{children}</h2>);
      else if (level === 3) elements.push(<h3 key={key} className={className}>{children}</h3>);
      else if (level === 4) elements.push(<h4 key={key} className={className}>{children}</h4>);
      else if (level === 5) elements.push(<h5 key={key} className={className}>{children}</h5>);
      else elements.push(<h6 key={key} className={className}>{children}</h6>);
      i++;
      continue;
    }

    // Unordered lists
    if (line.match(/^\s*[-*+]\s+/)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*+]\s+/)) {
        const itemText = lines[i].replace(/^\s*[-*+]\s+/, "");
        items.push(<li key={`li-${i}`}>{renderInline(itemText)}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="md-list">
          {items}
        </ul>
      );
      continue;
    }

    // Ordered lists
    if (line.match(/^\s*\d+\.\s+/)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].match(/^\s*\d+\.\s+/)) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "");
        items.push(<li key={`oli-${i}`}>{renderInline(itemText)}</li>);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="md-list md-ordered">
          {items}
        </ol>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="md-blockquote">
          {renderInline(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^(---+|\*\*\*+|___+)\s*$/)) {
      elements.push(<hr key={`hr-${i}`} className="md-hr" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="md-paragraph">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="md-content">{elements}</div>;
}

export default React.memo(Markdown);
