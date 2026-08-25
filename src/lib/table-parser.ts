/**
 * Utilitários para detecção e análise de tabelas em texto formatado / Markdown
 */

export interface ParsedTableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
}

export interface ParsedTextBlock {
  type: 'text';
  content: string;
}

export type ParsedContentBlock = ParsedTableBlock | ParsedTextBlock;

/**
 * Converte um texto contendo tabelas no padrão Markdown (| Coluna 1 | Coluna 2 |) em blocos estruturados
 */
export function parseContentWithTables(text: string): ParsedContentBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedContentBlock[] = [];
  let currentTextLines: string[] = [];
  let currentTableLines: string[] = [];

  const flushText = () => {
    if (currentTextLines.length > 0) {
      blocks.push({
        type: 'text',
        content: currentTextLines.join('\n').trim(),
      });
      currentTextLines = [];
    }
  };

  const flushTable = () => {
    if (currentTableLines.length >= 2) {
      const rawRows = currentTableLines.map(line => 
        line.split('|').map(cell => cell.trim()).filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      // Linha 0 = Cabeçalhos, Linha 1 = Separador (---), Linha 2+ = Dados
      if (rawRows.length >= 2) {
        const headers = rawRows[0];
        const dataRows = rawRows.slice(2).filter(row => row.length > 0);
        blocks.push({
          type: 'table',
          headers,
          rows: dataRows,
        });
      }
    }
    currentTableLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushText();
      currentTableLines.push(trimmed);
    } else {
      if (currentTableLines.length > 0) {
        flushTable();
      }
      currentTextLines.push(line);
    }
  }

  if (currentTableLines.length > 0) {
    flushTable();
  }
  flushText();

  return blocks;
}
