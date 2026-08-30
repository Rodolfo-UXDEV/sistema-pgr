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
import { SEVERITY_SCALE, PROBABILITY_SCALE, RISK_LEVEL_CONFIG } from '@/lib/risk-matrix';

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
 * Textos Padrão e Normativos do Modelo Oficial EMEPE / ES Engenharia de Segurança
 */
export const OFFICIAL_PGR_TEXTS = {
  documentTitle: 'PROGRAMA DE GERENCIAMENTO DE RISCOS - PGR',
  subTitle: 'GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) - NR-01',
  consultingCompany: 'ES Engenharia de Segurança do Trabalho LTDA.',
  consultingCrea: 'CREA-SP: 01.194.103',

  // 5. INTRODUÇÃO
  introducao: `O Programa de Gerenciamento de Riscos (PGR) é um conjunto de ações coordenadas de prevenção que têm por objetivo garantir locais de trabalho seguros e saudáveis. O PGR materializa o Gerenciamento de Riscos Ocupacionais (GRO) da organização, contemplando o Inventário de Riscos e o Plano de Ação, estruturados de acordo com as disposições estabelecidas na Norma Regulamentadora nº 01 (NR-01) aprovada pela Portaria SEPRT nº 6.730/2020 e suas atualizações.

A organização adota este documento como diretriz mestra para a antecipação, reconhecimento, avaliação e consequente controle dos riscos ocupacionais existentes ou que venham a existir no ambiente de trabalho, preservando a integridade física e a saúde dos seus trabalhadores, bem como a proteção do meio ambiente e dos recursos naturais.`,

  // 6. OBJETIVO
  objetivo: `O objetivo primordial deste Programa de Gerenciamento de Riscos é estabelecer as diretrizes e requisitos para o gerenciamento de riscos ocupacionais e as medidas de prevenção em Segurança e Saúde no Trabalho (SST), visando:

a) Identificar os perigos e possíveis lesões ou agravos à saúde dos trabalhadores;
b) Avaliar os riscos ocupacionais indicando o nível de risco e a necessidade de adoção de medidas preventivas;
c) Classificar os riscos ocupacionais para determinar a necessidade e prioridade de adoção de medidas de prevenção;
d) Implementar medidas de prevenção, de acordo com a classificação de risco e na ordem de prioridade estabelecida na NR-01;
e) Acompanhar o controle dos riscos ocupacionais e avaliar a eficácia das medidas implementadas;
f) Manter registro da evolução das ações e subsidiar a elaboração e atualização do Programa de Controle Médico de Saúde Ocupacional (PCMSO) conforme a NR-07.`,

  // 7. FUNDAMENTAÇÃO LEGAL
  fundamentacaoLegal: `Este documento está fundamentado na legislação vigente e nas Normas Regulamentadoras da Portaria MTB nº 3.214/1978, em especial:

• NR-01: Disposições Gerais e Gerenciamento de Riscos Ocupacionais (Portaria SEPRT nº 6.730/2020);
• NR-05: Comissão Interna de Prevenção de Acidentes e Assédio (CIPA);
• NR-06: Equipamentos de Proteção Individual (EPI);
• NR-07: Programa de Controle Médico de Saúde Ocupacional (PCMSO);
• NR-09: Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos;
• NR-10: Segurança em Instalações e Serviços em Eletricidade;
• NR-12: Segurança no Trabalho em Máquinas e Equipamentos;
• NR-15: Atividades e Operações Insalubres e seus Anexos;
• NR-17: Ergonomia e Avaliação Ergonômica Preliminar (AEP);
• NR-23: Proteção Contra Incêndios;
• Normas de Higiene Ocupacional (NHO) da FUNDACENTRO;
• Consolidação das Leis do Trabalho (CLT), Capítulo V do Título II.`,

  // 8. RESPONSABILIDADES
  responsabilidades: {
    empregador: `Cabe ao empregador:
a) Implementar o PGR e garantir os recursos necessários para o cumprimento do Plano de Ação;
b) Cumprir e fazer cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho;
c) Informar aos trabalhadores os riscos ocupacionais existentes nos locais de trabalho, as medidas de prevenção e os resultados dos exames médicos e avaliações ambientais;
d) Adotar medidas para determinar que, em caso de risco grave e iminente, os trabalhadores possam interromper de imediato suas atividades.`,
    trabalhadores: `Cabe aos trabalhadores:
a) Cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho, inclusive as ordens de serviço expedidas pelo empregador;
b) Submeter-se aos exames médicos previstos no PCMSO (NR-07);
c) Utilizar corretamente os Equipamentos de Proteção Individual (EPI) fornecidos pelo empregador;
d) Colaborar com a organização na aplicação das Normas Regulamentadoras e comunicar imediatamente ao superior hierárquico situações de risco.`,
    sesmt: `Cabe aos Responsáveis Técnicos e ao SESMT:
a) Coordenar tecnicamente a identificação de perigos e a avaliação de riscos ocupacionais;
b) Propor medidas de engenharia, proteção coletiva (EPC), administrativas e individuais (EPI);
c) Acompanhar o cronograma de implementação do Plano de Ação e realizar a verificação de eficácia;
d) Subsidiar tecnicamente o médico coordenador na elaboração do PCMSO.`
  },

  // 9. METODOLOGIA DE AÇÃO & GRO
  metodologiaGro: `O processo de Gerenciamento de Riscos Ocupacionais (GRO) da organização segue a sistemática contínua do ciclo PDCA (Plan-Do-Check-Act):

1. Levantamento Preliminar de Perigos e Reconhecimento: Realizado antes do início do funcionamento do estabelecimento, para as mudanças e introdução de novos processos ou máquinas.
2. Identificação de Perigos: Caracterização dos processos e ambientes, descrição das atividades rotineiras e não rotineiras, identificação das fontes geradoras, dos trabalhadores expostos e das possíveis lesões ou agravos à saúde.
3. Avaliação de Riscos: Gradação da severidade das possíveis lesões ou agravos à saúde e da probabilidade ou chance de sua ocorrência, combinadas na Matriz Bidimensional de Risco 5x5.
4. Controle de Riscos: Adoção prioritária de medidas de eliminação, substituição, controle de engenharia (EPC), medidas administrativas e, por fim, equipamentos de proteção individual (EPI).
5. Acompanhamento e Revisão: O PGR deve ser revisado a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos ou quando identificadas inadequações no controle.`,

  // 10. PREPARAÇÃO PARA EMERGÊNCIAS
  preparacaoEmergencias: `A organização mantém procedimentos e instruções para resposta a cenários de emergência no estabelecimento, contemplando:
a) Identificação dos cenários de emergência prováveis (incêndios, vazamentos químicos, panes elétricas e acidentes graves);
b) Medidas para evacuação rápida e segura dos ambientes de trabalho;
c) Dispositivos de alarme, combate a princípio de incêndio (extintores, hidrantes) e rotas de fuga desobstruídas e sinalizadas;
d) Treinamento periódico dos membros da Brigada de Emergência e simulações práticas.`,

  // 11. ANÁLISE DE ACIDENTES E ACOMPANHAMENTO DA SAÚDE
  acompanhamentoSaude: `A organização assegura a integração total entre o PGR e o PCMSO (NR-07):
• Os dados quantitativos e qualitativos do Inventário de Riscos subsidiam diretamente o médico do trabalho na definição dos exames clínicos e complementares admissionais, periódicos, de retorno ao trabalho, mudança de riscos e demissionais.
• Todos os acidentes e incidentes de trabalho são investigados tecnicamente para identificação das causas raízes e revisão imediata do inventário de riscos e plano de ação.`,

  // 12. ENCERRAMENTO E ASSINATURAS
  termoEncerramento: `O presente Programa de Gerenciamento de Riscos (PGR) foi elaborado com base nas inspeções técnicas periciais realizadas nos postos de trabalho do estabelecimento, nas informações prestadas pela direção da empresa e nas medições instrumentais efetuadas.

Declara-se que as informações aqui contidas expressam fielmente a realidade das condições ambientais e operacionais identificadas na data da avaliação, assumindo o Responsável Técnico e o Representante Legal da empresa as responsabilidades legais e normativas decorrentes.`
};

/**
 * Monta o sumário estruturado e o conteúdo para exibição formal e exportação
 */
export function buildPgrFullDocument(ctx: PgrDocumentContext) {
  const { company, establishment, sectors, positions, professionals, pgr, riskInventory, actionPlans } = ctx;

  const techResp = professionals.find(p => p.id === pgr.technicalResponsibleId) || professionals[0];
  const medResp = professionals.find(p => p.id === pgr.medicalResponsibleId);
  const resolvedSections = getResolvedPgrSections(pgr.id);
  const getSec = (id: string) => resolvedSections.find(s => s.id === id);

  return {
    header: {
      companyName: company.name,
      establishmentName: establishment ? establishment.name : 'Unidade Matriz',
      cnpj: formatCNPJ(company.cnpj),
      cnae: `${company.cnae} - ${company.cnaeDescription}`,
      riskGrade: `Grau ${company.riskGrade}`,
      code: pgr.code,
      version: pgr.version,
      year: new Date(pgr.validityStart).getFullYear().toString(),
      validityPeriod: `${formatDate(pgr.validityStart)} a ${formatDate(pgr.validityEnd)}`,
      elaborationDate: formatDate(pgr.elaborationDate),
      techRespName: techResp ? techResp.name : 'Engenheiro de Segurança do Trabalho',
      techRespCouncil: techResp ? `${techResp.registrationCouncil} ${techResp.registrationNumber}/${techResp.registrationState}` : 'CREA/CRM',
      techRespArt: techResp ? (techResp.artRrt || 'ART Emitida') : 'ART Emitida'
    },
    sections: [
      {
        id: 'sec-1',
        number: '1',
        title: getSec('sec-1')?.title || 'CONTROLE DE REVISÕES DO DOCUMENTO',
        type: 'text' as const,
        content: getSec('sec-1')?.content || `O Programa de Gerenciamento de Riscos (PGR) deve ser um processo contínuo a ser revisto a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos, postos de trabalho ou após a identificação de inadequações no controle de riscos.\n\n| Revisão | Data | Descrição / Motivo da Revisão |\n| :--- | :--- | :--- |\n| ${pgr.version} | ${formatDate(pgr.elaborationDate)} | ${pgr.revisionReason || 'Emissão Oficial do PGR e Inventário de Riscos Ocupacionais'} |`
      },
      {
        id: 'sec-2',
        number: '2',
        title: getSec('sec-2')?.title || 'INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO',
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
        title: getSec('sec-3')?.title || 'RESPONSABILIDADE TÉCNICA PELA ELABORAÇÃO',
        type: 'responsibles_info' as const,
        elaborador: techResp ? {
          nome: techResp.name,
          cargo: techResp.role.replace('_', ' '),
          conselho: `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState}`,
          art: techResp.artRrt || 'ART/RRT Emitida',
          email: techResp.email || '-',
          empresaConsultoria: OFFICIAL_PGR_TEXTS.consultingCompany
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
        title: getSec('sec-4')?.title || 'INTRODUÇÃO E DIRETRIZES GERAIS',
        type: 'text' as const,
        content: getSec('sec-4')?.content || OFFICIAL_PGR_TEXTS.introducao
      },
      {
        id: 'sec-5',
        number: '5',
        title: getSec('sec-5')?.title || 'OBJETIVOS DO PROGRAMA',
        type: 'text' as const,
        content: getSec('sec-5')?.content || OFFICIAL_PGR_TEXTS.objetivo
      },
      {
        id: 'sec-6',
        number: '6',
        title: getSec('sec-6')?.title || 'FUNDAMENTAÇÃO LEGAL E NORMAS APLICÁVEIS',
        type: 'text' as const,
        content: getSec('sec-6')?.content || OFFICIAL_PGR_TEXTS.fundamentacaoLegal
      },
      {
        id: 'sec-7',
        number: '7',
        title: getSec('sec-7')?.title || 'RESPONSABILIDADES E ATRIBUIÇÕES',
        type: 'text' as const,
        content: getSec('sec-7')?.content || `${OFFICIAL_PGR_TEXTS.responsabilidades.empregador}\n\n${OFFICIAL_PGR_TEXTS.responsabilidades.trabalhadores}\n\n${OFFICIAL_PGR_TEXTS.responsabilidades.sesmt}`
      },
      {
        id: 'sec-8',
        number: '8',
        title: getSec('sec-8')?.title || 'ESTRUTURA DO GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO)',
        type: 'text' as const,
        content: getSec('sec-8')?.content || OFFICIAL_PGR_TEXTS.metodologiaGro
      },
      {
        id: 'sec-9',
        number: '9',
        title: getSec('sec-9')?.title || 'METODOLOGIA DA MATRIZ DE RISCO 5X5 (SEVERIDADE X PROBABILIDADE)',
        type: 'text' as const,
        content: getSec('sec-9')?.content || 'A organização adota a Matriz Bidimensional de Risco 5x5 em consonância com os preceitos da NR-01.'
      },
      {
        id: 'sec-10',
        number: '10',
        title: getSec('sec-10')?.title || 'DIRETRIZES DE RECONHECIMENTO DOS AGENTES OCUPACIONAIS',
        type: 'text' as const,
        content: getSec('sec-10')?.content || ''
      },
      {
        id: 'sec-11',
        number: '11',
        title: getSec('sec-11')?.title || 'CARACTERIZAÇÃO DOS SETORES E AMBIENTES DE TRABALHO',
        type: 'sectors_list' as const,
        sectors: sectors.map(s => ({
          name: s.name,
          description: s.description || 'Ambiente fabril / operacional',
          characteristics: s.physicalCharacteristics
        }))
      },
      {
        id: 'sec-12',
        number: '12',
        title: getSec('sec-12')?.title || 'FUNÇÕES, CBO E DESCRIÇÃO DAS ATIVIDADES OCUPACIONAIS',
        type: 'positions_list' as const,
        positions: positions.map(p => ({
          title: p.title,
          cbo: p.cbo,
          sectorName: sectors.find(s => s.id === p.sectorId)?.name || '-',
          workers: p.workerCount,
          activityDescription: p.activityDescription || p.routineActivities || p.description || 'Não identificada',
          routine: p.activityDescription || p.routineActivities || p.description || 'Não identificada',
          nonRoutine: p.nonRoutineActivities || '-'
        }))
      },
      {
        id: 'sec-13',
        number: '13',
        title: getSec('sec-13')?.title || 'PREPARAÇÃO PARA EMERGÊNCIAS, TREINAMENTOS E SAÚDE OCUPACIONAL',
        type: 'text' as const,
        content: getSec('sec-13')?.content || `${OFFICIAL_PGR_TEXTS.preparacaoEmergencias}\n\n${OFFICIAL_PGR_TEXTS.acompanhamentoSaude}`
      },
      {
        id: 'sec-14',
        number: '14',
        title: getSec('sec-14')?.title || 'INVENTÁRIO CONSOLIDADO DE RISCOS OCUPACIONAIS (NR-01.5.7)',
        type: 'risk_inventory_table' as const,
        items: riskInventory
      },
      {
        id: 'sec-15',
        number: '15',
        title: getSec('sec-15')?.title || 'PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (NR-01.5.5 - 5W2H)',
        type: 'action_plan_table' as const,
        items: actionPlans
      },
      {
        id: 'sec-16',
        number: '16',
        title: getSec('sec-16')?.title || 'TERMO DE ENCERRAMENTO E RESPONSABILIDADE TÉCNICA',
        type: 'closing_signatures' as const,
        text: getSec('sec-16')?.content || OFFICIAL_PGR_TEXTS.termoEncerramento,
        date: formatDate(pgr.elaborationDate),
        city: company.address.city,
        state: company.address.state
      }
    ]
  };
}
