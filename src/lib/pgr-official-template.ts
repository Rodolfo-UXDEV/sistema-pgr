import { 
  Company, 
  Establishment, 
  Sector, 
  Position, 
  GHE, 
  Professional, 
  PGRDocument, 
  RiskInventoryItem, 
  ActionPlanItem 
} from '@/types/pgr';
import { formatDate, formatCNPJ } from '@/lib/utils';
import { getResolvedPgrSections } from '@/lib/pgr-template-resolver';
import { DEFAULT_PGR_SECTIONS } from '@/lib/pgr-default-sections';
import { getIssuerCompanyConfig } from '@/lib/issuer-company-service';
import { DEFAULT_EMISSORA_LOGO, DEFAULT_CLIENTE_LOGO } from '@/lib/default-logos';

export interface PgrDocumentContext {
  company: Company;
  establishment?: Establishment | null;
  sectors: Sector[];
  positions: Position[];
  ghes: GHE[];
  professionals: Professional[];
  pgr: PGRDocument;
  riskInventory: RiskInventoryItem[];
  actionPlans: ActionPlanItem[];
}

/**
 * Filtra de maneira estrita todos os dados do contexto para pertencerem unicamente
 * à empresa e ao estabelecimento do documento PGR em questão.
 */
export function filterContextForCompany(rawCtx: PgrDocumentContext): PgrDocumentContext {
  const { company, establishment, pgr, sectors = [], positions = [], ghes = [], professionals = [], riskInventory = [], actionPlans = [] } = rawCtx;
  
  const compId = company?.id || pgr?.companyId;
  const estId = establishment?.id || pgr?.establishmentId;

  // Setores que pertencem ao estabelecimento
  const filteredSectors = sectors.filter(s => {
    if (estId && s.establishmentId) return s.establishmentId === estId;
    return !s.establishmentId;
  });
  const sectorIds = new Set(filteredSectors.map(s => s.id));

  // Cargos que pertencem ao estabelecimento ou a um dos setores da empresa
  const filteredPositions = positions.filter(p => {
    if (estId && p.establishmentId && p.establishmentId === estId) return true;
    if (p.sectorId && sectorIds.has(p.sectorId)) return true;
    if (!p.establishmentId && !p.sectorId) return true;
    return false;
  });
  const positionIds = new Set(filteredPositions.map(p => p.id));

  // GHEs que pertencem ao estabelecimento ou a um dos setores da empresa
  const filteredGhes = ghes.filter(g => {
    if (estId && g.establishmentId && g.establishmentId === estId) return true;
    if (g.sectorId && sectorIds.has(g.sectorId)) return true;
    if (g.positionIds && g.positionIds.some(id => positionIds.has(id))) return true;
    if (!g.establishmentId && !g.sectorId) return true;
    return false;
  });
  const gheIds = new Set(filteredGhes.map(g => g.id));

  // Riscos que pertencem ao PGR, empresa, setor ou GHE filtrados
  const filteredRisks = riskInventory.filter(r => {
    if (pgr?.id && r.pgrId && r.pgrId === pgr.id) return true;
    if (compId && r.companyId && r.companyId === compId) return true;
    if (r.sectorId && sectorIds.has(r.sectorId)) return true;
    if (r.gheId && gheIds.has(r.gheId)) return true;
    return false;
  });

  // Planos de ação vinculados
  const filteredActions = actionPlans.filter(a => {
    if (pgr?.id && a.pgrId && a.pgrId === pgr.id) return true;
    if (compId && a.companyId && a.companyId === compId) return true;
    if (estId && a.establishmentId && a.establishmentId === estId) return true;
    return false;
  });

  return {
    company,
    establishment,
    pgr,
    professionals,
    sectors: filteredSectors.length > 0 ? filteredSectors : sectors.filter(s => !s.establishmentId || s.establishmentId === estId),
    positions: filteredPositions.length > 0 ? filteredPositions : positions,
    ghes: filteredGhes.length > 0 ? filteredGhes : ghes,
    riskInventory: filteredRisks,
    actionPlans: filteredActions,
  };
}

/**
 * Textos Padrão e Normativos do Modelo Oficial EMEPE / ES Engenharia de Segurança
 */
export const OFFICIAL_PGR_TEXTS = {
  documentTitle: 'PROGRAMA DE GERENCIAMENTO DE RISCOS - PGR',
  subTitle: 'GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) - NR-01',
  consultingCompany: 'ES Engenharia de Segurança do Trabalho LTDA.',
  consultingCrea: 'CREA-SP: 01.194.103',

  // 4. INTRODUÇÃO
  introducao: `Este documento intitulado PGR – Programa de Gerenciamento de Riscos, integra o Gerenciamento de Riscos Ocupacionais GRO, visando apresentar a implantação de um programa de prioridades para a preservação da saúde e da integridade física dos trabalhadores, gerenciando os riscos ocupacionais através da antecipação, reconhecimento, avaliação e consequentemente controle das ocorrências existentes ou que venham a existir no ambiente de trabalho das dependências da empresa.`,

  // 5. OBJETIVO
  objetivo: `A intenção na elaboração deste trabalho é evitar que ocorram acidentes e adoecimentos ocupacionais, gerenciando os riscos e fornecendo aos trabalhadores, informações quanto aos riscos e perigos envolvidos em sua atividade laboral e a eficácia das medidas controle utilizadas ou a serem implantadas.

NR 01 - 1.1.1 - O objetivo desta Norma é estabelecer as disposições gerais, o campo de aplicação, os termos e as definições comuns às Normas Regulamentadoras - NR relativas a segurança e saúde no trabalho e as diretrizes e os requisitos para o gerenciamento de riscos ocupacionais e as medidas de prevenção em Segurança e Saúde no Trabalho - SST. (Redação dada pela Portaria SEPRT n.º 6.730, de 09/03/20)

As NR são de observância obrigatória pelas organizações e pelos órgãos públicos da administração direta e indireta, bem como pelos órgãos dos Poderes Legislativo, Judiciário e Ministério Público, que possuam empregados regidos pela Consolidação das Leis do Trabalho.`,

  // 6. FUNDAMENTAÇÃO LEGAL
  fundamentacaoLegal: `O presente Programa de Gerenciamento de Riscos – PGR foi elaborado em atendimento às disposições da Norma Regulamentadora nº 1 (NR-1) – Disposições Gerais e Gerenciamento de Riscos Ocupacionais, estabelecida pelo Ministério do Trabalho e Emprego, e demais dispositivos legais e normativos aplicáveis à Segurança e Saúde no Trabalho.

O PGR constitui a materialização do Gerenciamento de Riscos Ocupacionais – GRO, tendo como finalidade a identificação dos perigos, a avaliação dos riscos ocupacionais e o estabelecimento de medidas de prevenção e controle, visando à eliminação, redução ou controle dos riscos presentes nos ambientes e processos de trabalho. A NR-1 estabelece que o gerenciamento deve abranger os riscos decorrentes de agentes físicos, químicos e biológicos, acidentes e fatores ergonômicos, incluindo os fatores de risco psicossociais relacionados ao trabalho.

Principais referências normativas:
• NR-1: Disposições Gerais e Gerenciamento de Riscos Ocupacionais;
• NR-9: Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos;
• NR-15: Atividades e Operações Insalubres e seus respectivos Anexos;
• NR-16: Atividades e Operações Periculosas;
• NR-17: Ergonomia e Avaliação Ergonômica Preliminar (AEP);
• Demais NRs aplicáveis às atividades e aos riscos identificados;
• Normas de Higiene Ocupacional – NHO/Fundacentro, quando aplicáveis;
• Consolidação das Leis do Trabalho (CLT), Capítulo V do Título II.

O disposto nestes itens deve ser utilizado para fins de prevenção e gerenciamento dos riscos ocupacionais. Para fins de caracterização de atividades ou operações insalubres ou perigosas, devem ser aplicadas as disposições previstas na NR-15 – Atividades e operações insalubres e NR-16 – Atividades e operações perigosas.`,

  // 7. RESPONSABILIDADES
  responsabilidades: `CABE AO EMPREGADOR:
a) cumprir e fazer cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho;
b) informar aos trabalhadores:
   I. os riscos ocupacionais existentes nos locais de trabalho;
   II. as medidas de prevenção adotadas pela empresa para eliminar ou reduzir tais riscos;
   III. os resultados dos exames médicos e de exames complementares de diagnóstico aos quais os próprios trabalhadores forem submetidos; e
   IV. os resultados das avaliações ambientais realizadas nos locais de trabalho.
c) elaborar ordens de serviço sobre segurança e saúde no trabalho, dando ciência aos trabalhadores;
d) permitir que representantes dos trabalhadores acompanhem a fiscalização dos preceitos legais e regulamentares sobre segurança e saúde no trabalho;
e) determinar procedimentos que devem ser adotados em caso de acidente ou doença relacionada ao trabalho, incluindo a análise de suas causas;
f) disponibilizar à Inspeção do Trabalho todas as informações relativas à segurança e saúde no trabalho; e
g) implementar medidas de prevenção, ouvidos os trabalhadores, de acordo com a seguinte ordem de prioridade:
   I. eliminação dos fatores de risco;
   II. minimização e controle dos fatores de risco, com a adoção de medidas de proteção coletiva;
   III. minimização e controle dos fatores de risco, com a adoção de medidas administrativas ou de organização do trabalho; e
   IV. adoção de medidas de proteção individual.

CABE AO TRABALHADOR:
a) cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho, inclusive as ordens de serviço expedidas pelo empregador;
b) submeter-se aos exames médicos previstos nas NR;
c) colaborar com a organização na aplicação das NR; e
d) usar o equipamento de proteção individual fornecido pelo empregador.`,

  // 8. ESTRUTURA DO PGR
  estruturaPgr: DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-8')?.defaultContent || '',

  // 9. DESENVOLVIMENTO DO PGR E MATRIZ
  desenvolvimentoPgr: DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-9')?.defaultContent || '',

  // 10. METODOLOGIA DE ANÁLISE POR AGENTE
  metodologiaAgentes: DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-10')?.defaultContent || '',

  // 11. INSTRUMENTOS DE MEDIÇÃO
  instrumentosMedicao: DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-11')?.defaultContent || '',

  // 16. ENCERRAMENTO
  termoEncerramento: `Este trabalho atende às Portarias Mtb. 3214 de 08/06/78, 3111 de 29/11/89 e 29/12/1994.

O principal objetivo deste programa foi de elaborar o PGR oferecendo dados e medidas de controle sobre a exposição ocupacional a que estão sujeitos os trabalhadores, para que possam ser gerenciados.

Dentro da Segurança do Trabalho o ideal seria eliminarmos todos os riscos à saúde de nossos trabalhadores, evidentemente isto é impossível, pois grande parte dos riscos são inerentes a atividades. Daí nossa alternativa é controlarmos a exposição a estes riscos, a fim de que fiquem dentro de parâmetros seguros à saúde desses trabalhadores.`,

  // 15. MODELO DE RECIBO DE EPI
  reciboEpi: DEFAULT_PGR_SECTIONS.find(s => s.id === 'sec-15')?.defaultContent || ''
};

/**
 * Monta o documento PGR estruturado com todas as 17 seções completas
 */
export function buildPgrFullDocument(rawCtx: PgrDocumentContext) {
  const ctx = filterContextForCompany(rawCtx);
  const { company, establishment, sectors, positions, professionals, pgr, riskInventory, actionPlans } = ctx;
  const issuerConfig = getIssuerCompanyConfig();

  const techResp = professionals.find(p => p.id === pgr.technicalResponsibleId) || professionals[0];
  const medResp = professionals.find(p => p.id === pgr.medicalResponsibleId);
  const resolvedSections = getResolvedPgrSections(pgr.id);
  const getSec = (id: string) => resolvedSections.find(s => s.id === id);

  return {
    header: {
      companyName: company.name,
      tradeName: company.tradeName || company.name,
      establishmentName: establishment ? establishment.name : 'Unidade Matriz',
      cnpj: formatCNPJ(company.cnpj),
      cnae: `${company.cnae} - ${company.cnaeDescription}`,
      riskGrade: `Grau ${company.riskGrade}`,
      code: pgr.code,
      version: pgr.version,
      year: new Date(pgr.validityStart).getFullYear().toString(),
      validityPeriod: `${formatDate(pgr.validityStart)} a ${formatDate(pgr.validityEnd)}`,
      elaborationDate: formatDate(pgr.elaborationDate),
      techRespName: techResp ? techResp.name : (issuerConfig.technicalManager?.name || 'Engenheiro de Segurança do Trabalho'),
      techRespCouncil: techResp ? `${techResp.registrationCouncil} ${techResp.registrationNumber}/${techResp.registrationState}` : (issuerConfig.technicalManager?.council || 'CREA/CRM'),
      techRespArt: techResp ? (techResp.artRrt || 'ART Emitida') : 'ART Emitida',
      consultingCompany: issuerConfig.name || OFFICIAL_PGR_TEXTS.consultingCompany,
      consultingCrea: issuerConfig.registrationCouncil || OFFICIAL_PGR_TEXTS.consultingCrea,
      consultingLogo: issuerConfig.logoUrl || DEFAULT_EMISSORA_LOGO,
      companyLogo: company.logoUrl || DEFAULT_CLIENTE_LOGO
    },
    sections: [
      {
        id: 'sec-1',
        number: '1',
        title: getSec('sec-1')?.title || '1. CONTROLE DE REVISÕES DO DOCUMENTO',
        type: 'text' as const,
        content: getSec('sec-1')?.content || `O Programa de Gerenciamento de Riscos (PGR) deve ser um processo contínuo a ser revisto a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos, postos de trabalho ou após a identificação de inadequações no controle de riscos.\n\n| Revisão | Data | Descrição / Motivo da Revisão |\n| :--- | :--- | :--- |\n| ${pgr.version} | ${formatDate(pgr.elaborationDate)} | ${pgr.revisionReason || 'Emissão Inicial do Programa de Gerenciamento de Riscos (PGR)'} |`
      },
      {
        id: 'sec-2',
        number: '2',
        title: getSec('sec-2')?.title || '2. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO',
        type: 'company_info' as const,
        data: {
          razaoSocial: company.name,
          nomeFantasia: company.tradeName || company.name,
          cnpj: formatCNPJ(company.cnpj),
          cnae: `${company.cnae} - ${company.cnaeDescription}`,
          grauDeRisco: `Grau de Risco ${company.riskGrade} (Conforme Quadro I da NR-04)`,
          enderecoMatriz: `${company.address.street}, ${company.address.number} ${company.address.complement || ''} - ${company.address.neighborhood}, ${company.address.city}/${company.address.state} - CEP: ${company.address.zipCode}`,
          estabelecimento: establishment ? `${establishment.name} (${establishment.code}) - ${establishment.address.street}, ${establishment.address.number}, ${establishment.address.city}/${establishment.address.state}` : 'Unidade Matriz',
          representanteLegal: `${company.legalRepresentative} (${company.representativeRole})`,
          totalTrabalhadores: `${company.employeeCount} colaboradores`,
          contato: `${company.phone || '-'} | ${company.email || '-'}`
        }
      },
      {
        id: 'sec-3',
        number: '3',
        title: getSec('sec-3')?.title || '3. RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR',
        type: 'responsibles_info' as const,
        elaborador: techResp ? {
          nome: techResp.name,
          cargo: techResp.role.replace('_', ' '),
          conselho: `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState}`,
          art: techResp.artRrt || 'ART/RRT Emitida',
          email: techResp.email || '-',
          empresaConsultoria: `${issuerConfig.name} (${issuerConfig.registrationCouncil})`
        } : null,
        medicoPcmso: medResp ? {
          nome: medResp.name,
          cargo: 'Médico Coordenador do PCMSO',
          conselho: `${medResp.registrationCouncil}: ${medResp.registrationNumber}/${medResp.registrationState}`,
          email: medResp.email || '-'
        } : null
      },
      {
        id: 'sec-4',
        number: '4',
        title: getSec('sec-4')?.title || '4. INTRODUÇÃO',
        type: 'text' as const,
        content: getSec('sec-4')?.content || OFFICIAL_PGR_TEXTS.introducao
      },
      {
        id: 'sec-5',
        number: '5',
        title: getSec('sec-5')?.title || '5. OBJETIVO',
        type: 'text' as const,
        content: getSec('sec-5')?.content || OFFICIAL_PGR_TEXTS.objetivo
      },
      {
        id: 'sec-6',
        number: '6',
        title: getSec('sec-6')?.title || '6. FUNDAMENTAÇÃO LEGAL',
        type: 'text' as const,
        content: getSec('sec-6')?.content || OFFICIAL_PGR_TEXTS.fundamentacaoLegal
      },
      {
        id: 'sec-7',
        number: '7',
        title: getSec('sec-7')?.title || '7. RESPONSABILIDADES',
        type: 'text' as const,
        content: getSec('sec-7')?.content || OFFICIAL_PGR_TEXTS.responsabilidades
      },
      {
        id: 'sec-8',
        number: '8',
        title: getSec('sec-8')?.title || '8. ESTRUTURA DO PGR',
        type: 'text' as const,
        content: getSec('sec-8')?.content || OFFICIAL_PGR_TEXTS.estruturaPgr
      },
      {
        id: 'sec-9',
        number: '9',
        title: getSec('sec-9')?.title || '9. DESENVOLVIMENTO DO PGR E MATRIZ DE RISCO 5X5',
        type: 'text' as const,
        content: getSec('sec-9')?.content || OFFICIAL_PGR_TEXTS.desenvolvimentoPgr
      },
      {
        id: 'sec-10',
        number: '10',
        title: getSec('sec-10')?.title || '10. METODOLOGIA DE ANÁLISE POR AGENTE OCUPACIONAL',
        type: 'text' as const,
        content: getSec('sec-10')?.content || OFFICIAL_PGR_TEXTS.metodologiaAgentes
      },
      {
        id: 'sec-11',
        number: '11',
        title: getSec('sec-11')?.title || '11. INSTRUMENTOS UTILIZADOS NAS AVALIAÇÕES DOS RISCOS',
        type: 'text' as const,
        content: getSec('sec-11')?.content || OFFICIAL_PGR_TEXTS.instrumentosMedicao
      },
      {
        id: 'sec-12',
        number: '12',
        title: getSec('sec-12')?.title || '12. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)',
        type: 'risk_inventory_table' as const,
        items: riskInventory
      },
      {
        id: 'sec-13',
        number: '13',
        title: getSec('sec-13')?.title || '13. PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (5W2H)',
        type: 'action_plan_table' as const,
        items: actionPlans
      },
      {
        id: 'sec-14',
        number: '14',
        title: getSec('sec-14')?.title || '14. ENCERRAMENTO E TERMO DE RESPONSABILIDADE TÉCNICA',
        type: 'closing_signatures' as const,
        text: getSec('sec-14')?.content || OFFICIAL_PGR_TEXTS.termoEncerramento,
        date: formatDate(pgr.elaborationDate),
        city: company.address.city,
        state: company.address.state
      },
      {
        id: 'sec-15',
        number: '15',
        title: getSec('sec-15')?.title || '15. MODELO - RECIBO DE ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)',
        type: 'text' as const,
        content: getSec('sec-15')?.content || OFFICIAL_PGR_TEXTS.reciboEpi
      }
    ]
  };
}
