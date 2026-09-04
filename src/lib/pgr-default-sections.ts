import { PgrSectionDefinition } from '@/types/pgr-builder';

/**
 * 17 Capítulos Oficiais Padronizados do Modelo PGR (Sequência Oficial NR-01)
 * Textos puros, normativos e metodológicos idênticos ao documento oficial institucional.
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
    title: '1. INDICE',
    subtitle: 'Sumário estruturado dos capítulos e grupos de exposição similar',
    category: 'pretextual',
    type: 'system_data',
    description: 'Sumário com a estrutura completa e relação de capítulos do documento.',
    defaultContent: `SEQUÊNCIA DO PGR

1. INDICE
2. CONTROLE DE REVISÕES DO DOCUMENTO
3. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO
4. RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR
5. INTRODUÇÃO
6. OBJETIVO
7. FUNDAMENTAÇÃO LEGAL
8. RESPONSABILIDADE
9. ESTRUTURA DO PGR
10. DESENVOLVIMENTO DO PGR
11. METODOLOGIA DE ANÁLISE
12. INTRUMENTOS UTILIZADOS NAS AVALIAÇÕES
13. AVALIAÇÃO, RESULTADOS E INTERPRETAÇÃO
14. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)
15. PLANO DE AÇÃO
16. ENCERRAMENTO
17. MODELO DE FICHA DE EPIS.`,
    isSystemData: true,
    systemDataSummary: 'Gera dinamicamente o sumário oficial com numeração e lista dos GESs avaliados.'
  },
  {
    id: 'sec-2',
    number: '2',
    title: '2. CONTROLE DE REVISÕES DO DOCUMENTO',
    subtitle: 'Histórico de versões e motivos de atualização',
    category: 'pretextual',
    type: 'text',
    description: 'Registro cronológico de emissões e revisões conforme item 1.5.3 da NR-01.',
    defaultContent: `O Programa de Gerenciamento de Riscos (PGR) deve ser um processo contínuo a ser revisto a cada 2 (dois) anos ou quando ocorrerem modificações nas tecnologias, processos, postos de trabalho ou após a identificação de inadequações no controle de riscos.

| Revisão | Data | Descrição / Motivo da Revisão |
| :--- | :--- | :--- |
| 00 | 01/04/2026 | Emissão Inicial do Programa de Gerenciamento de Riscos (PGR) |
| 01 | 29/04/2026 | Avaliações quantitativas de agentes químicos e ruído |`,
    isSystemData: false,
    systemDataSummary: 'Inclui o texto de diretrizes e a tabela de controle de revisões editável.'
  },
  {
    id: 'sec-3',
    number: '3',
    title: '3. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO',
    subtitle: 'Identificação da matriz, filiais, CNAE, grau de risco e representantes',
    category: 'pretextual',
    type: 'system_data',
    description: 'Dados cadastrais oficiais da organização (Razão Social, CNPJ, CNAE, Grau de Risco e Endereço).',
    defaultContent: `3.1. Razão Social: Razão social e CNPJ da empresa avaliada.
3.2. Endereço: Endereço completo da matriz e instalações fabris/administrativas.
3.2.1. Estabelecimento de Atividade: Unidade física onde as atividades laborais são executadas.
3.3. Ramo de Atividade: Descrição das operações e atividades industriais/comerciais.
3.4. Código da Atividade (CNAE): Classificação Nacional de Atividades Econômicas.
3.5. Grau de Risco: Classificação conforme o Quadro I da NR-04.
3.6. Responsável pelo PGR no Estabelecimento: Representante legal ou gestor indicado.
3.7. Acompanhante (Representante da Empresa): Acompanhante técnico das vistorias.`,
    isSystemData: true,
    systemDataSummary: 'Puxa automaticamente os dados da Empresa e da Unidade selecionada no sistema.'
  },
  {
    id: 'sec-4',
    number: '4',
    title: '4. RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR',
    subtitle: 'Engenheiro de Segurança do Trabalho, Habilitação Técnica, CREA e ART',
    category: 'pretextual',
    type: 'system_data',
    description: 'Qualificação técnica dos profissionais legalmente habilitados responsáveis pelo PGR e PCMSO.',
    defaultContent: `Identificação do Responsável Técnico legalmente habilitado pelo Conselho Regional de Engenharia e Agronomia (CREA) com respectiva emissão de ART/RRT e da Consultoria Especializada em Engenharia de Segurança do Trabalho.`,
    isSystemData: true,
    systemDataSummary: 'Puxa o Responsável Técnico selecionado (com ART/CREA) e Médico Coordenador.'
  },
  {
    id: 'sec-5',
    number: '5',
    title: '5. INTRODUÇÃO',
    subtitle: 'Diretrizes do Gerenciamento de Riscos Ocupacionais (GRO)',
    category: 'normative',
    type: 'text',
    description: 'Texto introdutório sobre o propósito do PGR e a política de prevenção da empresa.',
    defaultContent: `Este documento intitulado PGR – Programa de Gerenciamento de Riscos, integra o Gerenciamento de Riscos Ocupacionais GRO, visando apresentar a implantação de um programa de prioridades para a preservação da saúde e da integridade física dos trabalhadores, gerenciando os riscos ocupacionais através da antecipação, reconhecimento, avaliação e consequentemente controle das ocorrências existentes ou que venham a existir no ambiente de trabalho das dependências da empresa.`,
    isSystemData: false
  },
  {
    id: 'sec-6',
    number: '6',
    title: '6. OBJETIVO',
    subtitle: 'Prevenção de acidentes, adoecimentos e requisitos da NR-01',
    category: 'normative',
    type: 'text',
    description: 'Objetivos e metas estabelecidos pela organização para a gestão de riscos.',
    defaultContent: `A intenção na elaboração deste trabalho é evitar que ocorram acidentes e adoecimentos ocupacionais, gerenciando os riscos e fornecendo aos trabalhadores, informações quanto aos riscos e perigos envolvidos em sua atividade laboral e a eficácia das medidas controle utilizadas ou a serem implantadas.

NR 01 - 1.1.1 - O objetivo desta Norma é estabelecer as disposições gerais, o campo de aplicação, os termos e as definições comuns às Normas Regulamentadoras - NR relativas a segurança e saúde no trabalho e as diretrizes e os requisitos para o gerenciamento de riscos ocupacionais e as medidas de prevenção em Segurança e Saúde no Trabalho - SST. (Redação dada pela Portaria SEPRT n.º 6.730, de 09/03/20)

As NR são de observância obrigatória pelas organizações e pelos órgãos públicos da administração direta e indireta, bem como pelos órgãos dos Poderes Legislativo, Judiciário e Ministério Público, que possuam empregados regidos pela Consolidação das Leis do Trabalho.`,
    isSystemData: false
  },
  {
    id: 'sec-7',
    number: '7',
    title: '7. FUNDAMENTAÇÃO LEGAL',
    subtitle: 'Base jurídica e Normas Regulamentadoras aplicáveis',
    category: 'normative',
    type: 'text',
    description: 'Relação das Normas Regulamentadoras da Portaria MTB 3.214/78 aplicáveis.',
    defaultContent: `O presente Programa de Gerenciamento de Riscos – PGR foi elaborado em atendimento às disposições da Norma Regulamentadora nº 1 (NR-1) – Disposições Gerais e Gerenciamento de Riscos Ocupacionais, estabelecida pelo Ministério do Trabalho e Emprego, e demais dispositivos legais e normativos aplicáveis à Segurança e Saúde no Trabalho.

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
    isSystemData: false
  },
  {
    id: 'sec-8',
    number: '8',
    title: '8. RESPONSABILIDADE',
    subtitle: 'Deveres legais do Empregador e dos Trabalhadores',
    category: 'normative',
    type: 'text',
    description: 'Matriz de responsabilidades dos diferentes atores da empresa.',
    defaultContent: `CABE AO EMPREGADOR:
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
    isSystemData: false
  },
  {
    id: 'sec-9',
    number: '9',
    title: '9. ESTRUTURA DO PGR',
    subtitle: 'Estratégia, metodologia de ação, manutenção, treinamentos e emergências',
    category: 'methodology',
    type: 'text',
    description: 'Detalhamento da estrutura operacional e fluxo do PGR.',
    defaultContent: `9.1. ESTRATÉGIA E METODOLOGIA DE AÇÃO
O presente PGR foi elaborado com base no reconhecimento dos perigos e na avaliação dos riscos ocupacionais, com o objetivo de prevenir acidentes e agravos à saúde dos trabalhadores por meio da eliminação, redução ou controle dos riscos identificados.

9.1.2. Reconhecimento
O reconhecimento dos perigos foi realizado por meio de levantamento preliminar das atividades, processos, ambientes e postos de trabalho, com a participação de gestores e trabalhadores.
Foram identificadas as atividades rotineiras, não rotineiras e eventuais, bem como verificadas as medidas de prevenção existentes e sua efetividade.
Quando aplicável, a caracterização de atividades ou operações insalubres e perigosas observará os critérios estabelecidos nas NR-15 e NR-16.
Nos casos em que os riscos identificados não puderem ser eliminados na etapa preliminar, será realizada a identificação dos perigos e a avaliação dos riscos ocupacionais.

9.1.3. Avaliação
A avaliação dos riscos ocupacionais considera as informações levantadas junto aos trabalhadores, à CIPA, quando existente, e os resultados de avaliações qualitativas e quantitativas dos agentes ambientais, fatores ergonômicos e riscos de acidentes.
Para cada risco identificado será definido o nível de risco ocupacional, considerando a combinação entre a severidade das possíveis consequências e a probabilidade de ocorrência.
A avaliação da probabilidade considera:
a) os requisitos das Normas Regulamentadoras aplicáveis;
b) as medidas de prevenção implementadas;
c) as características das atividades desenvolvidas; e
d) os valores de referência e critérios técnicos aplicáveis.

9.1.4. Controle
As medidas de controle serão definidas com base nos riscos identificados e avaliados, visando sua eliminação ou redução a níveis aceitáveis.
Quando as medidas de proteção coletiva forem tecnicamente inviáveis, insuficientes ou estiverem em fase de implementação, serão adotadas, conforme a hierarquia de controle:
a) medidas administrativas ou de organização do trabalho;
b) equipamentos de proteção individual (EPI).
O acompanhamento e a reavaliação das medidas implantadas serão realizados periodicamente para verificar sua eficácia.

9.2. PLANO DE AÇÃO
Será elaborado plano de ação contendo as medidas de prevenção a serem implementadas, mantidas ou aprimoradas, os responsáveis, os prazos de execução e o acompanhamento dos resultados, em cronograma anual.

9.3. REGISTRO, MANUTENÇÃO E ATUALIZAÇÃO
O PGR é um processo contínuo e dinâmico, devendo ser revisado sempre que ocorrerem alterações nos processos, ambientes ou condições de trabalho e, no mínimo, uma vez a cada dois anos.
Os registros e documentos relacionados ao programa serão mantidos atualizados e incorporados ao seu histórico.
O histórico das atualizações deve ser mantido por um período mínimo de 20 (vinte) anos ou pelo período estabelecido em normatização específica, constituindo-se no banco de dados com o histórico administrativo e técnico do desenvolvimento deste documento.

9.4. DIVULGAÇÃO DAS INFORMAÇÕES
As informações contidas no Inventário de Riscos e no Plano de Ação serão comunicadas aos trabalhadores por meio de treinamentos, reuniões da CIPA, quando existente, ou outros meios formais adotados pela empresa.
Os documentos do PGR permanecerão disponíveis aos trabalhadores, seus representantes e à Inspeção do Trabalho.
Da Informação quando a Admissão e/ou Alteração de Risco: Todo trabalhador, ao ser admitido ou quando mudar de função que implique em alteração de risco deve receber informações sobre os riscos ocupacionais existentes, os meios para prevenir e controlar, as medidas adotadas pela organização e os procedimentos em situação de emergência.

9.5. ACOMPANHAMENTO DA SAÚDE OCUPACIONAL
As ações de saúde ocupacional serão desenvolvidas de forma integrada às medidas de prevenção em SST, observando os riscos ocupacionais identificados e as diretrizes estabelecidas no PCMSO (NR-07).

9.6. ANÁLISE DE ACIDENTES E DOENÇAS RELACIONADAS AO TRABALHO
Os acidentes e doenças relacionados ao trabalho serão analisados e documentados, considerando as atividades executadas, o ambiente de trabalho, os materiais utilizados e a organização do trabalho, visando identificar causas e subsidiar a revisão das medidas de prevenção.

9.7. PREPARAÇÃO PARA EMERGÊNCIAS
Serão estabelecidos e mantidos procedimentos de resposta a emergências compatíveis com os riscos e as características das atividades desenvolvidas (NR-23).

9.8. TREINAMENTOS
A empresa promoverá a capacitação e o treinamento dos trabalhadores conforme as exigências das Normas Regulamentadoras aplicáveis, com emissão de certificados oficiais.

9.9. DADOS INDICATIVOS
Os dados relacionados ao monitoramento da saúde dos trabalhadores permanecem sob responsabilidade técnica do médico responsável do PCMSO, conforme os requisitos legais aplicáveis.`,
    isSystemData: false
  },
  {
    id: 'sec-10',
    number: '10',
    title: '10. DESENVOLVIMENTO DO PGR',
    subtitle: 'Conceitos gerais, tabela de probabilidade, severidade, matriz 5x5 e priorização de ações',
    category: 'methodology',
    type: 'text',
    description: 'Metodologia de avaliação e matriz bidimensional 5x5 com tabelas completas.',
    defaultContent: `10.1. CONCEITOS GERAIS
O Gerenciamento de Riscos Ocupacionais (GRO) compreende a identificação de perigos, a avaliação de riscos e a adoção de medidas de controle nos processos e ambientes de trabalho.

10.1.1. GRO nas Relações de Prestação de Serviços a Terceiros
A organização contratante deve fornecer às empresas contratadas as informações sobre os riscos ocupacionais sob sua gestão e exigir o cumprimento das medidas de prevenção estabelecidas no PGR.

10.1.2. Inventário de Riscos Ocupacionais
O inventário de riscos contempla a caracterização dos processos e ambientes de trabalho, a descrição das atividades, a identificação dos perigos, os possíveis danos à saúde, a identificação dos grupos de trabalhadores expostos (GES), a gradação da probabilidade e da severidade, o nível de risco ocupacional e as medidas de controle existentes e propostas.

10.2. DOS RISCOS OCUPACIONAIS
Os riscos ocupacionais são classificados conforme sua natureza e potencial de causar lesões ou agravos à saúde dos trabalhadores sendo eles:

| Categoria | Definição | Exemplos |
| :--- | :--- | :--- |
| Agentes Físicos | Formas de energia capazes de causar lesões ou agravos à saúde em função da intensidade e do tempo de exposição. | Ruído, vibração, calor, frio, pressões anormais e radiações não ionizantes. |
| Agentes Químicos | Substâncias, misturas ou produtos que podem causar danos à saúde pela inalação, absorção ou ingestão. | Poeiras, fumos, névoas, gases, vapores e produtos químicos em geral. |
| Agentes Biológicos | Microrganismos, parasitas ou materiais biológicos com potencial de causar doenças ou agravos à saúde. | Bactérias, vírus, fungos, parasitas, sangue e outros materiais biológicos. |
| Riscos Ergonômicos | Fatores relacionados à organização do trabalho e às condições que possam gerar desconforto, fadiga ou adoecimento ocupacional. | Posturas inadequadas, movimentação manual de cargas, repetitividade, esforço físico e mobiliário inadequado. |
| Riscos Psicossociais Relacionados ao Trabalho | Fatores relacionados à organização, gestão e condições do trabalho que podem afetar o bem-estar, a saúde mental e o desempenho dos trabalhadores. | Pressão e sobrecarga de trabalho, cobrança excessiva, baixa autonomia, conflitos interpessoais, assédio moral ou sexual, falta de apoio, comunicação inadequada, jornadas extensas e desequilíbrio entre demandas e recursos. |
| Riscos de Acidentes | Condições ou situações com potencial de causar acidentes e comprometer a integridade física dos trabalhadores. | Quedas, choque elétrico, incêndio, explosão, cortes, aprisionamentos, atropelamentos e falhas de sinalização. |

10.3. DAS CATEGORIAS DE RISCO
10.3.1. Critérios para Priorização das Avaliações dos Riscos
A avaliação dos riscos tem como finalidade estabelecer prioridades para implementação das medidas de prevenção, considerando requisitos legais, aspectos técnicos, viabilidade de controle e potencial de dano.

Tabela 1 – Critérios de avaliação
| Critério de Avaliação | Descrição |
| :--- | :--- |
| Probabilidade | Possibilidade de ocorrência de lesão, doença ocupacional ou acidente. |
| Severidade | Magnitude das consequências decorrentes da materialização do risco. |
| Classificação do Risco | Resultado da combinação entre a probabilidade de ocorrência e a severidade das consequências. |

Tabela 2 – Critério de Probabilidade Quantitativo e Qualitativo
| Grau | Classificação | Perfil de Exposição Qualitativo / Descrição | Perfil de Exposição Quantitativo |
| :---: | :--- | :--- | :--- |
| 1 | Raríssima | Praticamente impossível de ocorrer; medidas de proteção altamente eficazes e redundantes. | Exposições < 10% do LEO (Limite de Exposição Ocupacional). |
| 2 | Pouco Provável | Rara ocorrência conhecida; medidas de controle existentes com boa eficácia. | Exposições > 10% e < 50% do LEO. |
| 3 | Provável / Ocasional | Pode ocorrer durante a vida útil da instalação; controles parciais ou falhas eventuais. | Exposições > 50% e < 100% do LEO. |
| 4 | Frequente | Ocorre com frequência no histórico de operações; medidas de controle deficientes. | Exposições > 100% e ≤ 500% do LEO. |
| 5 | Muito Frequente / Certa | Ocorrência sistemática ou contínua; ausência de medidas de controle aplicadas. | Exposições > 5 × LEO (superiores a 500% do LEO). |

Tabela 3 – Critérios para Classificação de Severidade
| Grau | Classificação | Definição / Consequência à Saúde e Integridade Física |
| :---: | :--- | :--- |
| 5 | Catastrófica / Fatal | Morte de um ou mais trabalhadores, desastre operacional ou colapso ambiental. |
| 4 | Crítica / Severa | Incapacidade permanente parcial ou total, amputações, perda auditiva severa. |
| 3 | Moderada / Grave | Lesão severa reversível, afastamento temporário significativo (> 15 dias). |
| 2 | Menor / Moderada | Lesão leve com atendimento médico e retorno rápido ao trabalho (< 3 dias). |
| 1 | Leve / Desprezível | Pequenos ferimentos sem necessidade de afastamento ou primeiros socorros simples. |

Tabela 4 – Matriz de Risco 5x5 (NR-01)
Na matriz de risco 5×5, cada célula representa a pontuação resultante da multiplicação entre a Severidade (linhas de 1 a 5) e a Probabilidade (colunas de 1 a 5), acompanhada da classificação do nível de risco: TRIVIAL (TRI), TOLERÁVEL (TOL), MODERADO (MOD), SUBSTANCIAL (SUB) e INTOLERÁVEL (INT).

| Severidade \ Probabilidade | P1 - Raríssima (1) | P2 - Pouco Provável (2) | P3 - Provável / Ocasional (3) | P4 - Frequente (4) | P5 - Muito Frequente / Certa (5) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **S5 - Catastrófica / Fatal (5)** | 5 (MOD) | 10 (SUB) | 15 (INT) | 20 (INT) | 25 (INT) |
| **S4 - Crítica / Severa (4)** | 4 (TOL) | 8 (MOD) | 12 (SUB) | 16 (INT) | 20 (INT) |
| **S3 - Moderada / Grave (3)** | 3 (TOL) | 6 (MOD) | 9 (MOD) | 12 (SUB) | 15 (INT) |
| **S2 - Menor / Moderada (2)** | 2 (TRI) | 4 (TOL) | 6 (MOD) | 8 (MOD) | 10 (SUB) |
| **S1 - Leve / Desprezível (1)** | 1 (TRI) | 2 (TRI) | 3 (TOL) | 4 (TOL) | 5 (MOD) |

Tabela 5 – Critérios para Classificação do Nível de Risco
| Pontuação | Classificação | Significado | Diretriz de Tratamento |
| :---: | :--- | :--- | :--- |
| 15 a 25 | Intolerável / Crítico | Risco crítico e intolerável com potencial de fatalidade ou consequências graves. Exige intervenção emergencial. | INTERRUPÇÃO IMEDIATA da atividade até implantação de medidas que reduzam o risco a níveis aceitáveis. |
| 10 a 16 | Substancial / Alto | Risco significativo com necessidade de medidas robustas e controle prioritário sistemático. | Ação prioritária e urgente. Não iniciar ou restringir atividade até a implantação de medidas de mitigação. |
| 5 a 9 | Moderado / Médio | Risco de magnitude moderada, controlável por meio de medidas preventivas mantidas e monitoradas. | Necessário estabelecer plano de ação corretivo e preventivo para redução contínua do risco. |
| 3 a 4 | Tolerável / Baixo | Risco tolerável e aceitável nas condições operacionais vigentes, mantidos os controles existentes. | Monitorar periodicamente para assegurar que as medidas de controle permaneçam eficazes. |
| 1 a 2 | Trivial / Muito Baixo | Risco trivial e muito baixo com consequências desprezíveis à segurança e integridade física. | Nenhuma ação adicional é necessária. Manter e acompanhar as medidas de controle existentes. |

Tabela 6 – Critérios para Priorização das Ações
A priorização das ações de controle será definida com base na classificação de risco obtida a partir do cruzamento entre a Probabilidade de Ocorrência e a Severidade das Consequências. Os riscos classificados como Intoleráveis e Substanciais terão prioridade na implementação das medidas de prevenção, observando-se a hierarquia de controles prevista na NR-01.

| Faixa de Pontuação | Classificação | Prioridade | Ação |
| :---: | :--- | :---: | :--- |
| 🟥 15 a 25 | Intolerável / Crítico | Urgente | Intervenção imediata / Medidas emergenciais. |
| 🟧 10 a 16 | Substancial / Alto | Alta | Controle prioritário e mitigação prévia. |
| 🟨 5 a 9 | Moderado / Médio | Média | Monitoramento e melhoria contínua. |
| 🟩 3 a 4 | Tolerável / Baixo | Baixa | Monitoramento periódico dos controles. |
| 🟩 1 a 2 | Trivial / Muito Baixo | Baixa | Manutenção dos controles existentes. |

10.4. CONCEITOS ADOTADOS E CRITÉRIOS CONSIDERADOS
• GES (Grupo de Exposição Similar): Grupo de trabalhadores que experimentam exposição semelhante a determinado agente ocupacional decorrente do mesmo ambiente e processo.
• EMR (Exposto de Maior Risco): Trabalhador com potencial de maior exposição dentro de um GES, utilizado para avaliações periciais mais conservadoras.
• NA (Nível de Ação): Valor a partir do qual devem ser iniciadas ações preventivas para minimizar a probabilidade de que as exposições ultrapassem os limites de tolerância (50% do LEO).`,
    isSystemData: false
  },
  {
    id: 'sec-11',
    number: '11',
    title: '11. METODOLOGIA DE ANÁLISE',
    subtitle: 'Critérios técnicos para Ruído, Calor, Vibração, Biológicos, Ergonomia, Elétrico e Incêndio',
    category: 'methodology',
    type: 'text',
    description: 'Normas e métodos específicos aplicados para cada agente ambiental.',
    defaultContent: `11.1. Agente Físico - Ruído (NR-15, Anexos 1 e 2 / NHO-01 Fundacentro)
As avaliações de ruído são realizadas por meio de dosímetros e medidores integradores devidamente calibrados. Considera-se o nível de critério de 85 dB(A) para jornada de 8 horas com fator de duplicação q=5 (NR-15) e q=3 (NHO-01). Quando utilizado protetor auditivo, a eficácia é verificada com base no NRRsf do Certificado de Aprovação (CA).

11.2. Agente Físico - Calor (NR-15, Anexo 3 / NHO-06)
A exposição ocupacional ao calor é avaliada por meio do Índice de Bulbo Úmido Termômetro de Globo (IBUTG), considerando a taxa metabólica das atividades e as condições térmicas reais nos postos mais representativos.

11.3. Agente Físico - Vibração (NR-15, Anexo 8 / NHO-09 e NHO-10)
A avaliação contempla a Vibração de Corpo Inteiro (VCI - parâmetros aren e VDVR) e a Vibração de Mãos e Braços (VMB - parâmetro aren) com acelerômetros triaxiais comparados aos níveis de ação e limites de tolerância.

11.4. Agentes Biológicos (NR-15, Anexo 14)
A avaliação considera as atividades desenvolvidas, ambientes de trabalho e o potencial de exposição a microrganismos e materiais biológicos patogênicos.

11.5. Fatores de Risco Ergonômicos e Psicossociais (NR-17 Ergonomia)
Identificação de condições de trabalho relacionadas à organização do trabalho, levantamento manual de cargas, repetitividade, posturas e fatores psicossociais, mediante Avaliação Ergonômica Preliminar (AEP) e Análise Ergonômica do Trabalho (AET) quando indicado.

11.6. Instalações Elétricas (NR-10)
Inspeção das instalações elétricas, circuitos, quadros de distribuição, aterramento e procedimentos de segurança para prevenção de choques, queimaduras e arcos elétricos.

11.7. Incêndio e Explosão (NR-23)
Medidas de prevenção relativas a sistemas de proteção, rotas de fuga, sinalização de emergência, extintores e treinamento de brigadistas.`,
    isSystemData: false
  },
  {
    id: 'sec-12',
    number: '12',
    title: '12. INTRUMENTOS UTILIZADOS NAS AVALIAÇÕES',
    subtitle: 'Relação de equipamentos de medição, números de série e certificados de calibração',
    category: 'methodology',
    type: 'text',
    description: 'Tabela de dosímetros, termômetros, vibrômetros e certificados de calibração.',
    defaultContent: `Os equipamentos utilizados nas avaliações possuem certificados de calibração válidos e rastreáveis pela RBC/Inmetro, mantidos em arquivo e disponíveis para consulta.

| Agente Avaliado | Equipamento / Instrumento | Modelo | Nº de Série | Certificado de Calibração | Data da Calibração |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Ruído | Dosímetro de Ruído Integrador | Quest NoisePro DL | NLN 050066 | 121.794 | Janeiro/2025 |
| Ruído | Dosímetro de Ruído Integrador | Quest NoisePro DL | NLE 100070 | 121.795 | Janeiro/2025 |
| Ruído | Dosímetro de Ruído Integrador | Quest NoisePro DL | NKL040004 | 121.796 | Janeiro/2025 |
| Ruído | Calibrador Acústico | Quest AC-300 | AC300002935 | 121.755 | Janeiro/2025 |
| Calor | Termômetro de Globo Digital | Quest Temp 32 | TPK 020002 | 121.781 | Janeiro/2025 |
| Calor | Termômetro de Globo Digital | In Lite ITEMP | 2024-ITEMP | 9700/24R | Dezembro/2024 |
| Vibração | Vibrômetro e Acelerômetro Triaxial | HAVPRO Monitor | 10057 | 150.052-A | Outubro/2025 |
| Vibração | Vibrômetro e Acelerômetro Triaxial | Axpró In Lite | 25030402207A | 12985-448 | Julho/2025 |`,
    isSystemData: false
  },
  {
    id: 'sec-13',
    number: '13',
    title: '13. AVALIAÇÃO, RESULTADOS E INTERPRETAÇÃO',
    subtitle: 'Critérios de interpretação técnica, Nível de Ação (NA) e Limites de Tolerância (LT)',
    category: 'methodology',
    type: 'text',
    description: 'Interpretação técnica dos resultados ambientais e análises periciais.',
    defaultContent: `13.1. CRITÉRIOS DE INTERPRETAÇÃO E JULGAMENTO TÉCNICO
A interpretação dos resultados das avaliações qualitativas e quantitativas baseia-se na comparação dos níveis de exposição apurados com os Limites de Tolerância (LT) estabelecidos na NR-15 e os Limites de Exposição Ocupacional (LEO) recomendados pelas Normas de Higiene Ocupacional (NHO) da Fundacentro e ACGIH.

13.2. AVALIAÇÃO DO NÍVEL DE AÇÃO (NA)
Considera-se Nível de Ação o valor a partir do qual devem ser iniciadas ações preventivas de forma a minimizar a probabilidade de que as exposições ultrapassem os limites de tolerância. Para agentes químicos e ruído, o nível de ação corresponde a 50% (cinquenta por cento) da dose ou do limite de exposição diária.

13.3. ANÁLISE CRÍTICA DAS MEDIDAS DE CONTROLE
Sempre que os resultados das avaliações indicarem exposição acima do Nível de Ação ou do Limite de Tolerância, ou quando a matriz de risco classificar a exposição como Substancial ou Intolerável, são propostas medidas prioritárias de engenharia, organização do trabalho e uso de EPIs adequados no Plano de Ação (Capítulo 15).`,
    isSystemData: false
  },
  {
    id: 'sec-14',
    number: '14',
    title: '14. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)',
    subtitle: 'Caracterização de cargos, funções, atividades e cartões estruturados APR-HO por perigo e GES',
    category: 'risks',
    type: 'system_data',
    description: 'Inventário consolidado com caracterização de cargos/funções e avaliações no modelo APR-HO.',
    defaultContent: `O Inventário de Riscos Ocupacionais consolida a caracterização minuciosa de cada cargo, função e atividades operacionais, juntamente com a identificação dos perigos, fontes geradoras, trajetórias, vias de penetração, população exposta, medições, severidade, probabilidade, nível de risco e medidas de prevenção (EPC e EPI com CA).`,
    isSystemData: true,
    systemDataSummary: 'Exibe a Caracterização do Cargo/Função acima de cada avaliação tabular no modelo APR-HO agrupada por GES/Setor.'
  },
  {
    id: 'sec-15',
    number: '15',
    title: '15. PLANO DE AÇÃO',
    subtitle: 'Metas por GES, medidas preventivas, responsáveis, prazos, custos e status',
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
    title: '16. ENCERRAMENTO',
    subtitle: 'Declaração pericial, citação das Portarias Mtb e assinaturas do RT e da Empresa',
    category: 'posttextual',
    type: 'text',
    description: 'Texto formal de encerramento, declaração de veracidade e blocos de assinatura com ART.',
    defaultContent: `Este trabalho atende às Portarias Mtb. 3214 de 08/06/78, 3111 de 29/11/89 e 29/12/1994.

O principal objetivo deste programa foi de elaborar o PGR oferecendo dados e medidas de controle sobre a exposição ocupacional a que estão sujeitos os trabalhadores, para que possam ser gerenciados.

Dentro da Segurança do Trabalho o ideal seria eliminarmos todos os riscos à saúde de nossos trabalhadores, evidentemente isto é impossível, pois grande parte dos riscos são inerentes a atividades. Daí nossa alternativa é controlarmos a exposição a estes riscos, a fim de que fiquem dentro de parâmetros seguros à saúde desses trabalhadores.`,
    isSystemData: false
  },
  {
    id: 'sec-17',
    number: '17',
    title: '17. MODELO DE FICHA DE EPIS.',
    subtitle: 'Termo de entrega, responsabilidade e guarda de EPI conforme NR-06',
    category: 'posttextual',
    type: 'text',
    description: 'Ficha individual de entrega e compromisso de uso e guarda de EPIs.',
    defaultContent: `MODELO - RECIBO DE ENTREGA DE EQUIPAMENTO DE PROTEÇÃO INDIVIDUAL (EPI)

Declaro ter recebido GRATUITAMENTE os EPI’s (Equipamentos de Proteção Individual) abaixo relacionados, bem como todo treinamento para o uso correto, manutenção, higienização e conservação dos mesmos, conforme determina a NR 6. Declaro ainda, estar ciente que:

1. É obrigatório o uso dos EPIs recebidos sempre que estiver executando atividades e/ou em local que seja necessário o uso destes, seguindo instruções por mim recebidas no treinamento e/ou avisos constantes nestes locais.
2. O não uso ocorrerá em punição prevista na legislação, desde advertência até dispensa por justa causa, conforme as Normas Regulamentadoras e regulamentos da empresa.
3. Responsabilizo-me pela guarda e conservação dos EPIs que me foram confiados.
4. Deverei comunicar imediatamente ao responsável qualquer alteração nos EPIs que os tornem parcialmente ou totalmente danificados.
5. Devolverei o(s) EPI(s) a empresa quando por esta solicitada, quando sem condições de uso ou por rescisão do contrato de trabalho, sob pena desconto no valor correspondente ao E.P.I.
6. É proibido o empréstimo ou doação de E.P.I., pois este é de uso pessoal.

| Quant. | Equipamento (EPI) | Nº do C.A. | Data de Recebimento | Visto do Empregado | Data de Devolução | Visto do Responsável |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 01 | Óculos de Segurança com Lente Incolor | 35.123 | ____/____/2026 | ________________ | ____/____/2026 | ________________ |
| 01 | Protetor Auditivo tipo Concha | 29.845 | ____/____/2026 | ________________ | ____/____/2026 | ________________ |
| 01 | Luvas de Proteção Mecânica / Química | 41.234 | ____/____/2026 | ________________ | ____/____/2026 | ________________ |
| 01 | Calçado de Segurança com Biqueira | 38.921 | ____/____/2026 | ________________ | ____/____/2026 | ________________ |
| 01 | Respirador Semifacial PFF2 / Filtros | 42.110 | ____/____/2026 | ________________ | ____/____/2026 | ________________ |`,
    isSystemData: false
  }
];
