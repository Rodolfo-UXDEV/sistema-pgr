import React from 'react';
import { parseContentWithTables } from '@/lib/table-parser';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';

/**
 * Renderiza texto com suporte a negrito (**texto**) e itálico (*texto*)
 */
export function renderMarkdownInline(text: string): React.ReactNode {
  if (!text) return '';

  // Separa por tags de negrito (**...**) e itálico (*...*)
  const tokens = text.split(/(\*\*[\s\S]*?\*\*|\*[^\*\n]+?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={i} className="italic text-foreground">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

/**
 * Renderiza blocos de conteúdo textual formatando parágrafos, listas e markdown inline
 */
export function renderFormattedBlockContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-foreground leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-sm font-bold text-foreground mt-3 mb-1">
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-2">
              <span className="text-emerald-600 font-bold">•</span>
              <span className="flex-1">{renderMarkdownInline(trimmed.replace(/^[•\-\*]\s*/, ''))}</span>
            </div>
          );
        }
        return (
          <p key={lineIdx} className="leading-relaxed">
            {renderMarkdownInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Componente universal que renderiza qualquer texto contendo tabelas markdown e formatações inline
 */
export const MarkdownSectionRenderer: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  const blocks = parseContentWithTables(content);

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          return (
            <div key={idx} className="border border-border rounded-lg overflow-hidden shadow-xs my-3 bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 text-xs">
                    {block.headers.map((h, hIdx) => (
                      <TableHead key={hIdx} className="font-bold text-foreground py-2 px-3">
                        {renderMarkdownInline(h)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.rows.map((row, rIdx) => (
                    <TableRow key={rIdx} className="text-xs hover:bg-muted/30">
                      {row.map((cell, cIdx) => (
                        <TableCell key={cIdx} className="py-2 px-3 text-foreground">
                          {renderMarkdownInline(cell)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          );
        }

        return (
          <div key={idx}>
            {renderFormattedBlockContent(block.content)}
          </div>
        );
      })}
    </div>
  );
};
