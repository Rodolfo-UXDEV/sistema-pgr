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
    <div className="space-y-1 text-foreground leading-relaxed text-justify">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-2" />;
        }
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="text-sm font-bold text-foreground mt-3 mb-1 text-left">
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-1.5 pl-2 text-justify">
              <span className="text-emerald-600 font-bold">•</span>
              <span className="flex-1">{renderMarkdownInline(trimmed.replace(/^[•\-\*]\s*/, ''))}</span>
            </div>
          );
        }
        return (
          <p key={lineIdx} className="leading-relaxed text-justify">
            {renderMarkdownInline(line)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Renderiza células de tabelas tratando chips/cores da Matriz de Risco 5x5 e prioridades
 */
export function renderTableCellContent(cell: string): React.ReactNode {
  const trimmed = cell.trim();
  
  // 1. Padrão Código da Matriz: "15 (INT)" ou "5 (MOD)"
  const matrixMatch = trimmed.match(/^(\d+)\s*\((TRI|TOL|MOD|SUB|INT)\)$/i);
  if (matrixMatch) {
    const score = matrixMatch[1];
    const code = matrixMatch[2].toUpperCase();

    let bgClass = 'bg-slate-500 text-white';
    if (code === 'TRI') bgClass = 'bg-emerald-600 text-white';
    else if (code === 'TOL') bgClass = 'bg-lime-600 text-white';
    else if (code === 'MOD') bgClass = 'bg-amber-500 text-white';
    else if (code === 'SUB') bgClass = 'bg-orange-500 text-white';
    else if (code === 'INT') bgClass = 'bg-rose-600 text-white';

    return (
      <div className="flex items-center justify-center">
        <div className={`flex flex-col items-center justify-center w-12 py-0.5 rounded font-bold shadow-xs ${bgClass}`}>
          <span className="text-xs leading-none">{score}</span>
          <span className="text-[8px] uppercase tracking-tighter opacity-90">{code}</span>
        </div>
      </div>
    );
  }

  // 2. Pontuações puras da Matriz 5x5 (ex: "5", "10", "15", "20", "25", "1", "2", "3", "4", etc. em células numéricas)
  const isSingleNumber = /^([1-9]|1[0-9]|2[0-5])$/.test(trimmed);
  if (isSingleNumber) {
    const num = parseInt(trimmed, 10);
    let bgClass = 'bg-emerald-600 text-white';
    if (num >= 16) bgClass = 'bg-rose-600 text-white';
    else if (num >= 10) bgClass = 'bg-orange-500 text-white';
    else if (num >= 5) bgClass = 'bg-amber-500 text-white';

    return (
      <div className="flex items-center justify-center">
        <span className={`inline-flex items-center justify-center w-7 h-6 rounded text-xs font-bold shadow-xs ${bgClass}`}>
          {num}
        </span>
      </div>
    );
  }

  // 3. Faixas coloridas de Prioridade (Tabela 6)
  if (trimmed.startsWith('🟥') || trimmed.startsWith('🟧') || trimmed.startsWith('🟨') || trimmed.startsWith('🟩')) {
    let badgeColor = 'bg-muted text-foreground border-border';
    if (trimmed.startsWith('🟥')) badgeColor = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    else if (trimmed.startsWith('🟧')) badgeColor = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800';
    else if (trimmed.startsWith('🟨')) badgeColor = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
    else if (trimmed.startsWith('🟩')) badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border ${badgeColor}`}>
        {renderMarkdownInline(trimmed)}
      </span>
    );
  }

  // 4. Badges para Níveis de Risco, Classificações e Faixas de Pontuação
  if (['Intolerável', 'Extremo', 'Urgente', 'Intolerável / Crítico', 'Intolerável/Crítico', '15 a 25', '16 a 25'].includes(trimmed)) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-300 rounded whitespace-nowrap">
        {trimmed}
      </span>
    );
  }
  if (['Substancial', 'Alto', 'Alta', 'Substancial / Alto', 'Substancial/Alto', '10 a 16', '10 a 15'].includes(trimmed)) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 border border-orange-300 rounded whitespace-nowrap">
        {trimmed}
      </span>
    );
  }
  if (['Moderado', 'Médio', 'Média', 'Moderado / Médio', 'Moderado/Médio', '5 a 9'].includes(trimmed)) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300 rounded whitespace-nowrap">
        {trimmed}
      </span>
    );
  }
  if (['Tolerável', 'Baixo', 'Baixa', 'Tolerável / Baixo', 'Tolerável/Baixo', '3 a 4', '1 a 4'].includes(trimmed)) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-lime-100 text-lime-800 dark:bg-lime-900/50 dark:text-lime-200 border border-lime-300 rounded whitespace-nowrap">
        {trimmed}
      </span>
    );
  }
  if (['Trivial', 'Muito Baixo', 'Trivial / Muito Baixo', 'Trivial/Muito Baixo', '1 a 2'].includes(trimmed)) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300 rounded whitespace-nowrap">
        {trimmed}
      </span>
    );
  }
  // 5. Badges das Categorias de Risco Ocupacional (Item 10.2 do PGR)
  if (trimmed === 'Agentes Físicos' || trimmed === 'Físico') {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white rounded shadow-xs">
        {trimmed}
      </span>
    );
  }
  if (trimmed === 'Agentes Químicos' || trimmed === 'Químico') {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-red-600 text-white rounded shadow-xs">
        {trimmed}
      </span>
    );
  }
  if (trimmed === 'Agentes Biológicos' || trimmed === 'Biológico') {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-[#78350f] text-white rounded shadow-xs">
        {trimmed}
      </span>
    );
  }
  if (trimmed === 'Riscos Ergonômicos' || trimmed === 'Ergonômico') {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-amber-400 text-slate-900 rounded shadow-xs">
        {trimmed}
      </span>
    );
  }
  if (trimmed === 'Riscos Psicossociais Relacionados ao Trabalho' || trimmed === 'Psicossocial' || trimmed.includes('Psicossociais')) {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-amber-400 text-slate-900 rounded shadow-xs">
        {trimmed}
      </span>
    );
  }
  if (trimmed === 'Riscos de Acidentes' || trimmed === 'Acidente' || trimmed === 'Acidentes') {
    return (
      <span className="inline-block px-2.5 py-1 text-xs font-bold bg-blue-600 text-white rounded shadow-xs">
        {trimmed}
      </span>
    );
  }

  return renderMarkdownInline(cell);
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
                    {block.headers.map((h, hIdx) => {
                      const isFirstCol = hIdx === 0;
                      return (
                        <TableHead key={hIdx} className={`font-bold text-foreground py-2.5 px-3 ${isFirstCol ? 'text-left' : 'text-center'}`}>
                          {renderMarkdownInline(h)}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {block.rows.map((row, rIdx) => (
                    <TableRow key={rIdx} className="text-xs hover:bg-muted/30">
                      {row.map((cell, cIdx) => {
                        const trimmed = cell.trim();
                        const isMatrixRowHeader = cIdx === 0 && /^(\*\*)?S[1-5]/i.test(trimmed);
                        const isLongText = trimmed.length > 25;
                        const isCenter = !isMatrixRowHeader && !isLongText;
                        return (
                          <TableCell key={cIdx} className={`py-2 px-3 text-foreground ${isCenter ? 'text-center' : 'text-left'}`}>
                            {renderTableCellContent(cell)}
                          </TableCell>
                        );
                      })}
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
