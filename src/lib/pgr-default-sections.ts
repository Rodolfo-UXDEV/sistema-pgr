import { PgrSectionDefinition } from '@/types/pgr-builder';

/**
 * 17 Seções Oficiais Padronizadas do Modelo PGR (ES Engenharia / EMEPE)
 * Textos puros, normativos e metodológicos, sem dados de empresas específicas.
 */
export const DEFAULT_PGR_SECTIONS: PgrSectionDefinition[] = [
  {
    id: 'sec-0',
    number: '0',
    title: 'CAPA & IDENTIFICAÇÃO INSTITUCIONAL',
    subtitle: 'Título oficial e metadados do documento',
    category: 'pretextual',
    type: 'system_data',
    description: 'Capa oficial com dados da empresa, vigência, responsável técnico e consultoria.',
    defaultContent: `PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR)
GERENCIAMENTO DE RISCOS OCUPACIONAIS (GRO) - NR-01

Este documento estabelece as diretrizes e requisitos para o gerenciamento de riscos ocupacionais e as medidas de prevenção em Segurança e Saúde no Trabalho (SST) da organização.`,
    isSystemData: true,
    systemDataSummary: 'Gera a capa oficial com Razão Social, CNPJ, Vigência, Unidade e Responsável Técnico.'
  },
  {
    id: 'sec-1',
    number: '1',
    title: 'CONTROLE DE REVISÕES DO DOCUMENTO',
    subtitle: 'Histórico de versões e motivos de atualização',
    category: 'pretextual',
    type: 'hybrid',
    description: 'Registro cronológico de emissões e revisões conforme item 1.5.3 da NR-01.',
    defaultContent: `O Programa de Gerenciamento de Riscos (PGR) deve ser um processo contínuo a ser revisto a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos, postos de trabalho ou após a identificação de inadequações no controle de riscos.

As revisões e emissões históricas deste documento ficam registradas para controle da fiscalização e rastreabilidade técnica.`,
    isSystemData: false,
    systemDataSummary: 'Inclui a tabela de controle de versões cadastradas no sistema.'
  },
  {
    id: 'sec-2',
    number: '2',
    title: 'INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO',
    subtitle: 'Identificação da matriz, filiais, CNAE e grau de risco',
    category: 'pretextual',
    type: 'system_data',
    description: 'Dados cadastrais oficiais da organização (Razão Social, CNPJ, CNAE, Grau de Risco e Endereço).',
    defaultContent: `Caracterização cadastral e fiscal da organização perante os órgãos oficiais e o Ministério do Trabalho e Emprego, incluindo atividade econômica principal e enquadramento de Grau de Risco conforme o Quadro I da NR-04.`,
    isSystemData: true,
    systemDataSummary: 'Puxa automaticamente os dados da Empresa e da Unidade selecionada.'
  },
  {
    id: 'sec-3',
    number: '3',
    title: 'RESPONSABILIDADE TÉCNICA E LEGAL PELA ELABORAÇÃO',
    subtitle: 'Engenheiro de Segurança, CREA, ART e Médico Coordenador do PCMSO',
    category: 'pretextual',
    type: 'system_data',
    description: 'Qualificação técnica dos profissionais legalmente habilitados responsáveis pelo PGR e PCMSO.',
    defaultContent: `Identificação dos profissionais habilitados pelo Conselho Regional de Engenharia e Agronomia (CREA) e Conselho Regional de Medicina (CRM) responsáveis pela elaboração técnica do PGR, emissão de ART/RRT e coordenação do PCMSO.`,
    isSystemData: true,
    systemDataSummary: 'Puxa o Responsável Técnico selecionado (com ART) e Médico Coordenador.'
  },
  {
    id: 'sec-4',
    number: '4',
    title: 'INTRODUÇÃO E DIRETRIZES GERAIS',
    subtitle: 'Fundamentos do Gerenciamento de Riscos Ocupacionais (GRO)',
    category: 'normative',
    type: 'text',
    description: 'Texto introdutório sobre o propósito do PGR e a política de prevenção da empresa.',
    defaultContent: `O Programa de Gerenciamento de Riscos (PGR) é um conjunto de ações coordenadas de prevenção que têm por objetivo garantir locais de trabalho seguros e saudáveis. O PGR materializa o Gerenciamento de Riscos Ocupacionais (GRO) da organização, contemplando o Inventário de Riscos e o Plano de Ação, estruturados de acordo com as disposições estabelecidas na Norma Regulamentadora nº 01 (NR-01) aprovada pela Portaria SEPRT nº 6.730/2020 e suas atualizações.

A organização adota este documento como diretriz mestra para a antecipação, reconhecimento, avaliação e consequente controle dos riscos ocupacionais existentes ou que venham a existir no ambiente de trabalho, preservando a integridade física e a saúde dos seus trabalhadores, bem como a proteção do meio ambiente e dos recursos naturais.

O PGR deve estar integrado aos demais planos, programas e documentos previstos na legislação de segurança e saúde no trabalho, em especial com o Programa de Controle Médico de Saúde Ocupacional (PCMSO) regulamentado pela NR-07.`,
    isSystemData: false
  },
  {
    id: 'sec-5',
    number: '5',
    title: 'OBJETIVOS DO PROGRAMA',
    subtitle: 'Metas e diretrizes de Segurança e Saúde no Trabalho (SST)',
    category: 'normative',
    type: 'text',
    description: 'Objetivos e metas estabelecidos pela organização para a gestão de riscos.',
    defaultContent: `O objetivo primordial deste Programa de Gerenciamento de Riscos é estabelecer as diretrizes e requisitos para o gerenciamento de riscos ocupacionais e as medidas de prevenção em Segurança e Saúde no Trabalho (SST), visando:

a) Identificar os perigos e possíveis lesões ou agravos à saúde dos trabalhadores nos diversos processos produtivos;
b) Avaliar os riscos ocupacionais indicando o nível de risco e a necessidade de adoção de medidas de prevenção;
c) Classificar os riscos ocupacionais para determinar a necessidade e a prioridade de adoção de medidas preventivas;
d) Implementar medidas de prevenção, de acordo com a classificação de risco e na ordem de prioridade estabelecida na NR-01;
e) Acompanhar o controle dos riscos ocupacionais e avaliar a eficácia das medidas implementadas;
f) Manter registro da evolução das ações e subsidiar a elaboração e atualização do Programa de Controle Médico de Saúde Ocupacional (PCMSO) conforme a NR-07.`,
    isSystemData: false
  },
  {
    id: 'sec-6',
    number: '6',
    title: 'FUNDAMENTAÇÃO LEGAL E NORMAS REGULAMENTADORAS',
    subtitle: 'Base jurídica e técnica aplicável',
    category: 'normative',
    type: 'text',
    description: 'Relação das Normas Regulamentadoras da Portaria MTB 3.214/78 aplicáveis.',
    defaultContent: `Este documento está fundamentado na legislação vigente, em especial na Consolidação das Leis do Trabalho (CLT), Capítulo V do Título II, e nas Normas Regulamentadoras (NRs) aprovadas pela Portaria MTB nº 3.214/1978 e suas atualizações:

• NR-01: Disposições Gerais e Gerenciamento de Riscos Ocupacionais (Portaria SEPRT nº 6.730/2020);
• NR-05: Comissão Interna de Prevenção de Acidentes e Assédio (CIPA);
• NR-06: Equipamentos de Proteção Individual (EPI);
• NR-07: Programa de Controle Médico de Saúde Ocupacional (PCMSO);
• NR-09: Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos;
• NR-10: Segurança em Instalações e Serviços em Eletricidade;
• NR-12: Segurança no Trabalho em Máquinas e Equipamentos;
• NR-15: Atividades e Operações Insalubres e seus respectivos Anexos;
• NR-17: Ergonomia e Avaliação Ergonômica Preliminar (AEP);
• NR-23: Proteção Contra Incêndios;
• Normas de Higiene Ocupacional (NHO) da FUNDACENTRO;
• Convenções e Recomendações da Organização Internacional do Trabalho (OIT) ratificadas pelo Brasil.`,
    isSystemData: false
  },
  {
    id: 'sec-7',
    number: '7',
    title: 'RESPONSABILIDADES E ATRIBUIÇÕES LEGAIS',
    subtitle: 'Deveres do Empregador, dos Trabalhadores e do SESMT',
    category: 'normative',
    type: 'text',
    description: 'Matriz de responsabilidades dos diferentes atores da empresa.',
    defaultContent: `7.1 Cabe ao Empregador:
a) Implementar o PGR e garantir os recursos necessários para o cumprimento integral do Plano de Ação;
b) Cumprir e fazer cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho;
c) Informar aos trabalhadores os riscos ocupacionais existentes nos locais de trabalho, as medidas de prevenção e os resultados dos exames médicos e avaliações ambientais;
d) Adotar medidas para determinar que, em caso de risco grave e iminente, os trabalhadores possam interromper de imediato suas atividades.

7.2 Cabe aos Trabalhadores:
a) Cumprir as disposições legais e regulamentares sobre segurança e saúde no trabalho, inclusive as ordens de serviço expedidas pelo empregador;
b) Submeter-se aos exames médicos previstos no PCMSO (NR-07);
c) Utilizar corretamente os Equipamentos de Proteção Individual (EPI) fornecidos pelo empregador;
d) Colaborar com a organização na aplicação das Normas Regulamentadoras e comunicar imediatamente ao superior hierárquico quaisquer situações de risco.

7.3 Cabe aos Responsáveis Técnicos e ao SESMT:
a) Coordenar tecnicamente a identificação de perigos e a avaliação de riscos ocupacionais;
b) Propor medidas de engenharia, proteção coletiva (EPC), administrativas e individuais (EPI);
c) Acompanhar o cronograma de implementação do Plano de Ação e realizar a verificação de eficácia;
d) Subsidiar tecnicamente o médico coordenador na elaboração do PCMSO.`,
    isSystemData: false
  },
  {
    id: 'sec-8',
    number: '8',
    title: 'ESTRUTURA DO GRO E METODOLOGIA DE AÇÃO (CICLO PDCA)',
    subtitle: 'Estratégia de levantamento preliminar, reconhecimento, avaliação e controle',
    category: 'methodology',
    type: 'text',
    description: 'Detalhamento do ciclo contínuo PDCA e etapas do gerenciamento de riscos.',
    defaultContent: `O processo de Gerenciamento de Riscos Ocupacionais (GRO) da organização segue a sistemática contínua do ciclo PDCA (Plan-Do-Check-Act):

1. Levantamento Preliminar de Perigos e Reconhecimento: Realizado antes do início do funcionamento do estabelecimento, para as mudanças e introdução de novos processos ou máquinas.
2. Identificação de Perigos: Caracterização dos processos e ambientes, descrição das atividades rotineiras e não rotineiras, identificação das fontes geradoras, dos trabalhadores expostos e das possíveis lesões ou agravos à saúde.
3. Avaliação de Riscos: Gradação da severidade das possíveis lesões ou agravos à saúde e da probabilidade ou chance de sua ocorrência, combinadas na Matriz Bidimensional de Risco 5x5.
4. Controle de Riscos: Adoção prioritária de medidas de eliminação, substituição, controle de engenharia (EPC), medidas administrativas e, por fim, equipamentos de proteção individual (EPI).
5. Acompanhamento e Revisão: O PGR deve ser revisado a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos ou quando identificadas inadequações no controle.`,
    isSystemData: false
  },
  {
    id: 'sec-9',
    number: '9',
    title: 'METODOLOGIA DA MATRIZ DE RISCO 5X5 (SEVERIDADE X PROBABILIDADE)',
    subtitle: 'Critérios para gradação da severidade, probabilidade e níveis de risco',
    category: 'methodology',
    type: 'text',
    description: 'Definição dos critérios de pontuação da Matriz de Risco 5x5 adotada.',
    defaultContent: `A organização adota a Matriz Bidimensional de Risco 5x5 em estrita consonância com os preceitos da NR-01. O nível de risco ocupacional é obtido pelo produto da Severidade da possível lesão pela Probabilidade de sua ocorrência (Risco = Severidade × Probabilidade):

• Escala de Severidade (1 a 5):
  1 - Insignificante: Sem lesão ou desconforto passageiro.
  2 - Leve: Lesões leves que não exigem afastamento (primeiros socorros).
  3 - Moderada: Lesões com afastamento temporário reversível.
  4 - Grave: Lesões graves com incapacidade permanente parcial.
  5 - Catastrófica: Óbito ou incapacidade total permanente.

• Escala de Probabilidade (1 a 5):
  1 - Rara: Evento altamente improvável nas condições operacionais.
  2 - Improvável: Evento não esperado, mas teoricamente possível.
  3 - Possível: Evento que pode ocorrer esporadicamente.
  4 - Provável: Evento esperado que ocorra com frequência moderada.
  5 - Frequente: Evento quase certo ou contínuo.

• Classificação e Priorização dos Níveis de Risco:
  - TRIVIAL (Score 1 a 2): Ação não necessária além de manter os controles existentes.
  - TOLERÁVEL (Score 3 a 4): Monitoramento periódico. Não exige ação corretiva imediata.
  - MODERADO (Score 5 a 9): Esforços necessários para redução. Prazo de adequação: 90 dias.
  - SUBSTANCIAL (Score 10 a 16): O trabalho não deve iniciar sem medidas mitigadoras. Prazo: 30 dias.
  - INTOLERÁVEL (Score 20 a 25): O trabalho deve ser suspenso de imediato até eliminação urgente do risco.`,
    isSystemData: false
  },
  {
    id: 'sec-10',
    number: '10',
    title: 'DIRETRIZES DE RECONHECIMENTO DOS AGENTES OCUPACIONAIS',
    subtitle: 'Critérios técnicos para agentes Físicos, Químicos, Biológicos, Ergonômicos e Acidentes',
    category: 'methodology',
    type: 'text',
    description: 'Diretrizes técnicas para avaliação de ruído, calor, vibrações, químicas e ergonomia.',
    defaultContent: `10.1 Agente Físico - Ruído Contínuo ou Intermitente (NR-15 Anexos 1 e 2 / NHO-01 Fundacentro):
A avaliação é efetuada através de dosimetria de ruído com medidor integrador de uso pessoal (audiodosímetro), operando no circuito de ponderação "A", resposta lenta (Slow), nível de critério de 85 dB(A) para 8 horas e taxa de duplicação de dose q=5 (NR-15) e q=3 (NHO-01). O nível de ação é estabelecido em 80 dB(A).

10.2 Agente Físico - Calor (NR-15 Anexo 3 / NHO-06):
A exposição ao calor é avaliada por meio do Índice de Bulbo Úmido Termômetro de Globo (IBUTG), considerando a taxa metabólica das atividades e o regime de trabalho-descanso.

10.3 Agente Físico - Vibrações Ocupacionais (NR-15 Anexo 8 / NHO-09 e NHO-10):
Avaliações de Vibração de Corpo Inteiro (VCI) e Vibração de Mãos e Braços (VMB) com acelerômetros triaxiais, comparados ao nível de ação e limite de exposição da NR-09.

10.4 Agentes Biológicos (NR-15 Anexo 14):
Avaliação qualitativa focada no contato potencial com microorganismos patogênicos, sangue, fluidos ou resíduos biológicos.

10.5 Fatores de Risco Ergonômicos e Psicossociais (NR-17):
Avaliação Ergonômica Preliminar (AEP) contemplando esforço físico, levantamento manual de cargas, repetitividade, posturas inadequadas, mobiliário, organização do trabalho e fatores psicossociais.

10.6 Riscos Elétricos e Máquinas (NR-10 e NR-12):
Inspeções de conformidade das instalações elétricas, aterramento, proteções fixas e móveis, e dispositivos de parada de emergência.

10.7 Proteção Contra Incêndio e Pânico (NR-23):
Dimensionamento de extintores, sinalização de emergência, rotas de fuga desobstruídas e treinamento de brigadistas.`,
    isSystemData: false
  },
  {
    id: 'sec-11',
    number: '11',
    title: 'CARACTERIZAÇÃO DOS SETORES E AMBIENTES FÍSICOS',
    subtitle: 'Descrição predial e condições físicas de trabalho',
    category: 'environments',
    type: 'system_data',
    description: 'Setores com tipos de piso, parede, cobertura, ventilação e iluminação.',
    defaultContent: `Caracterização das instalações físicas de cada setor da empresa, contemplando arranjo físico, condições de piso, cobertura, paredes, ventilação e iluminação.`,
    isSystemData: true,
    systemDataSummary: 'Lista todos os Setores e suas Características Físicas cadastradas.'
  },
  {
    id: 'sec-12',
    number: '12',
    title: 'FUNÇÕES, CBO E DESCRIÇÃO DAS ATIVIDADES OCUPACIONAIS',
    subtitle: 'Atividades rotineiras, não rotineiras e população exposta',
    category: 'environments',
    type: 'system_data',
    description: 'Cargos com CBO, efetivo exposto e descrição minuciosa das tarefas.',
    defaultContent: `Detalhamento de cada cargo e função da organização, indicando o Código Brasileiro de Ocupações (CBO), o número de trabalhadores expostos e a discriminação de atividades rotineiras e não rotineiras.`,
    isSystemData: true,
    systemDataSummary: 'Lista todos os Cargos, CBOs e Atividades cadastradas no sistema.'
  },
  {
    id: 'sec-13',
    number: '13',
    title: 'PREPARAÇÃO PARA EMERGÊNCIAS, TREINAMENTOS E SAÚDE OCUPACIONAL',
    subtitle: 'Procedimentos de emergência, plano de capacitação e integração com o PCMSO',
    category: 'posttextual',
    type: 'text',
    description: 'Diretrizes de resposta a emergências, treinamentos obrigatórios e integração com PCMSO.',
    defaultContent: `13.1 Plano de Preparação e Resposta a Emergências:
A organização mantém procedimentos estruturados para resposta rápida a cenários de emergência no estabelecimento:
a) Cenários de emergência prováveis (incêndios, vazamentos químicos, panes elétricas e acidentes com máquinas);
b) Medidas para evacuação rápida e segura de todos os ambientes de trabalho;
c) Dispositivos de alarme sonoro/visual e rotas de fuga sinalizadas e desobstruídas;
d) Equipe de brigada de emergência com treinamento prático periódico e simulações anuais.

13.2 Programa de Treinamentos e Capacitação em SST:
Todos os trabalhadores recebem treinamentos admissionais e periódicos sobre:
• Riscos ocupacionais específicos do seu posto de trabalho e medidas de controle;
• Uso correto, guarda, conservação e higienização dos EPIs;
• Procedimentos operacionais de segurança e noções de primeiros socorros e combate a princípio de incêndio.

13.3 Acompanhamento da Saúde Ocupacional (PCMSO - NR-07):
O PGR subsidia diretamente o Médico do Trabalho na definição dos exames clínicos e complementares admissionais, periódicos, de retorno ao trabalho, mudança de riscos ocupacionais e demissionais.`,
    isSystemData: false
  },
  {
    id: 'sec-14',
    number: '14',
    title: 'INVENTÁRIO CONSOLIDADO DE RISCOS OCUPACIONAIS (NR-01.5.7)',
    subtitle: 'Tabela oficial de identificação de perigos, matriz 5x5 e medidas de controle',
    category: 'risks',
    type: 'system_data',
    description: 'Inventário com todas as colunas obrigatórias da NR-01.',
    defaultContent: `O Inventário de Riscos Ocupacionais consolida a identificação dos perigos, fontes geradoras, população exposta, severidade, probabilidade, nível de risco e medidas de proteção coletiva (EPC) e individual (EPI).`,
    isSystemData: true,
    systemDataSummary: 'Exibe a tabela oficial com todos os riscos cadastrados na Matriz 5x5.'
  },
  {
    id: 'sec-15',
    number: '15',
    title: 'PLANO DE AÇÃO E CRONOGRAMA DE PREVENÇÃO (NR-01.5.5 - 5W2H)',
    subtitle: 'Medidas preventivas, responsáveis, prazos, custos e verificação de eficácia',
    category: 'actions',
    type: 'system_data',
    description: 'Plano de ação metodológico no formato 5W2H com metas e acompanhamento.',
    defaultContent: `O Plano de Ação estabelece as medidas de prevenção a serem introduzidas, aprimoradas ou mantidas, com cronograma de implementação, responsáveis, investimentos e verificação técnica de eficácia.`,
    isSystemData: true,
    systemDataSummary: 'Exibe a tabela 5W2H com todas as ações programadas no sistema.'
  },
  {
    id: 'sec-16',
    number: '16',
    title: 'TERMO DE ENCERRAMENTO E RESPONSABILIDADE TÉCNICA',
    subtitle: 'Declaração pericial e assinaturas do Responsável Técnico e Empregador',
    category: 'posttextual',
    type: 'text',
    description: 'Texto formal de encerramento, declaração de veracidade e blocos de assinatura com ART.',
    defaultContent: `O presente Programa de Gerenciamento de Riscos (PGR) foi elaborado com base nas inspeções técnicas periciais realizadas nos postos de trabalho do estabelecimento, nas informações prestadas pela direção da empresa e nas avaliações instrumentais efetuadas.

Declara-se que as informações aqui contidas expressam fielmente a realidade das condições ambientais e operacionais identificadas na data da avaliação, assumindo o Responsável Técnico e o Representante Legal da empresa as responsabilidades legais e normativas decorrentes.

O documento é emitido em conformidade com as diretrizes da Norma Regulamentadora nº 01 do Ministério do Trabalho e Emprego.`,
    isSystemData: false
  },
  {
    id: 'sec-17',
    number: '17',
    title: 'MODELO - RECIBO DE ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)',
    subtitle: 'Termo de responsabilidade e guarda de EPIs conforme NR-06',
    category: 'posttextual',
    type: 'text',
    description: 'Termo padrão de compromisso e responsabilidade de entrega de EPIs ao colaborador.',
    defaultContent: `TERMO DE RESPONSABILIDADE E RECIBO DE ENTREGA DE EPI (NR-06)

Declaro para os devidos fins que recebi da empresa, gratuitamente, os Equipamentos de Proteção Individual (EPI) descritos no inventário de riscos deste programa, em perfeito estado de conservação e funcionamento, com seus respectivos Certificados de Aprovação (CA) válidos emitidos pelo Ministério do Trabalho.

Comprometo-me a:
1. Usar o EPI apenas para a finalidade a que se destina durante toda a jornada de trabalho;
2. Responsabilizar-me pela guarda, higienização e conservação do equipamento recebido;
3. Comunicar imediatamente à chefia imediata ou ao SESMT qualquer alteração que torne o EPI impróprio para uso;
4. Devolver os EPIs antigos no momento de sua substituição por desgaste ou na rescisão contratual.

Estou ciente de que o não uso dos EPIs fornecidos constitui ato faltoso, sujeito às sanções disciplinares previstas no Artigo 158 da CLT e na NR-06.`,
    isSystemData: false
  }
];
