import { DEFAULT_PGR_SECTIONS } from '@/lib/pgr-default-sections';
import { PgrCustomSectionData } from '@/types/pgr-builder';

export const GLOBAL_TEMPLATE_STORAGE_KEY = 'pgr_global_master_template_v1';
export const getPgrDocumentStorageKey = (pgrId: string) => `pgr_custom_sections_v2_${pgrId}`;

export interface ResolvedSection {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  content: string;
  isSystemData: boolean;
  isLocallyModified: boolean;
  isGloballyModified: boolean;
}

/**
 * Carrega e resolve a hierarquia completa de seções:
 * 1º Nível: Ajuste específico deste PGR (se houver)
 * 2º Nível: Modelo Base Global de Apoio & Configurações (se houver)
 * 3º Nível: Padrão Oficial de Fábrica (ES Engenharia / EMEPE)
 */
export function getResolvedPgrSections(pgrId?: string): ResolvedSection[] {
  let globalCustom: Record<string, PgrCustomSectionData> = {};
  let docCustom: Record<string, PgrCustomSectionData> = {};

  if (typeof window !== 'undefined' && window.localStorage) {
    // 1. Carrega Global
    try {
      const gRaw = localStorage.getItem(GLOBAL_TEMPLATE_STORAGE_KEY);
      if (gRaw) globalCustom = JSON.parse(gRaw);
    } catch (e) {
      console.error('Erro ao ler global template:', e);
    }

    // 2. Carrega Específico do PGR
    if (pgrId) {
      try {
        const dRaw = localStorage.getItem(getPgrDocumentStorageKey(pgrId));
        if (dRaw) docCustom = JSON.parse(dRaw);
      } catch (e) {
        console.error('Erro ao ler custom template do documento:', e);
      }
    }
  }

  return DEFAULT_PGR_SECTIONS.map((sec) => {
    const g = globalCustom[sec.id];
    const d = docCustom[sec.id];

    const isGloballyModified = !!g?.isModified;
    const isLocallyModified = !!d?.isModified;

    // Resolução do Título
    let title = d?.title !== undefined 
      ? d.title! 
      : (g?.title !== undefined ? g.title! : sec.title);

    // Resolução do Subtítulo
    let subtitle = d?.subtitle !== undefined 
      ? d.subtitle! 
      : (g?.subtitle !== undefined ? g.subtitle! : (sec.subtitle || ''));

    // Resolução do Conteúdo
    let content = d?.content !== undefined 
      ? d.content 
      : (g?.content !== undefined ? g.content : sec.defaultContent);

    // Auto-migração geral de títulos e conteúdos legados da versão anterior
    if (sec.id === 'sec-1' && (title.includes('REVISÕES') || !content.includes('SEQUÊNCIA'))) {
      title = sec.title;
      subtitle = sec.subtitle || '';
      content = sec.defaultContent;
    }
    if (sec.id === 'sec-2' && title.includes('CADASTRAIS')) {
      title = sec.title;
      subtitle = sec.subtitle || '';
      content = sec.defaultContent;
    }
    if (sec.id === 'sec-3' && title.includes('RESPONSÁVEL')) {
      title = sec.title;
      subtitle = sec.subtitle || '';
      content = sec.defaultContent;
    }
    if (sec.id === 'sec-4' && title.includes('INTRODUÇÃO')) {
      title = sec.title;
      subtitle = sec.subtitle || '';
      content = sec.defaultContent;
    }
    if (sec.id === 'sec-10') {
      if (!content.includes('Riscos Psicossociais') || !content.includes('Tabela 6') || !content.includes('Tabela 1 – Critérios de avaliação')) {
        content = sec.defaultContent;
      }
    }

    return {
      id: sec.id,
      number: sec.number,
      title,
      subtitle,
      content,
      isSystemData: sec.isSystemData,
      isLocallyModified,
      isGloballyModified,
    };
  });
}
