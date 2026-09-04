# HISTÓRICO DE DESENVOLVIMENTO - SISTEMA PGR

Este arquivo registra cronologicamente todas as etapas, decisões, funcionalidades implementadas e marcos do projeto do **Sistema PGR** (Programa de Gerenciamento de Riscos - NR-01).

---

## 📌 Linha do Tempo

### [2026-08-24] - Inicialização do Projeto & Definição de Diretrizes
- **Definição de Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Lucide React.
- **Criação de Documentos Base:**
  - `REGRAS.md`: Regras de negócio da NR-01 (Inventário de Riscos, Plano de Ação, Matriz 5x5, Hierarquia Organizacional) e diretrizes técnicas.
  - `HISTORICO.md`: Registro de histórico de evolução do projeto.
- **Estruturação do Plano de Implementação:** Planejamento da arquitetura de dados e scaffolding do Frontend com shadcn/ui.

---

### [2026-08-24] - Implementação Completa dos Módulos Principais do Sistema PGR (NR-01)
- **1. Arquitetura & Scaffolding:**
  - Configuração do Vite + TypeScript + Tailwind CSS com suporte a aliases (`@/*`).
  - Instalação e customização da suite de componentes **shadcn/ui** (Button, Card, Table, Input, Label, Textarea, Dialog, Select, Badge, Switch, Tabs, Progress, Separator, Avatar, Alert, DropdownMenu).
- **2. Módulo 1: Visão Geral (Dashboard Executivo):**
  - KPIs em tempo real (Trabalhadores Protegidos, Perigos Mapeados, Riscos Críticos, Ações 5W2H, Taxa de Conclusão e Investimento Total).
  - Mapa de Calor interativo da Matriz de Risco 5x5.
  - Gráfico de barras com distribuição pelos 5 grupos ocupacionais (Físicos, Químicos, Biológicos, Ergonômicos, Acidentes).
  - Resumo de tarefas e prazos do Plano de Ação com alertas visuais de atraso.
- **3. Módulo 2: Estrutura Organizacional & Cadastros:**
  - Cadastro de Empresas com CNAE, enquadramento de Grau de Risco (NR-04) e representante legal.
  - Cadastro de Estabelecimentos, Unidades, Filiais e Canteiros de Obras.
  - Cadastro de Setores e Ambientes com caracterização física (Piso, Parede, Teto, Ventilação e Iluminação).
  - Cadastro de Cargos com CBO e discriminação de atividades rotineiras e não rotineiras.
  - Cadastro de Grupos Homogêneos de Exposição (GHE).
  - Cadastro de Profissionais Técnicos (Engenheiro de Segurança, Médico do Trabalho, Técnico de Segurança) com conselho de classe e ART/RRT.
- **4. Módulo 3: Inventário de Riscos Ocupacionais (NR-01.5.7):**
  - Catálogo pré-carregado com perigos de acordo com as NRs brasileiras e eSocial Tabela 24.
  - Seletor e calculador interativo da **Matriz de Risco 5x5** (Probabilidade x Severidade = 1 a 25) com gradação automática (Trivial, Tolerável, Moderado, Substancial, Intolerável) e prazos normativos.
  - Gestão de EPCs, Medidas Administrativas e EPIs com CA e validade.
  - Registro de avaliações quantitativas ambientais (NHO / Fundacentro).
- **5. Módulo 4: Plano de Ação & Cronograma (NR-01.5.5 - 5W2H):**
  - Visualização em **Tabela 5W2H** (O que, Por que, Onde, Quem, Quando, Como, Custo).
  - Visualização em **Quadro Kanban Ágil** (Não Iniciadas, Em Andamento, Concluídas).
  - Módulo de acompanhamento do ciclo PDCA e verificação técnica de eficácia.
- **6. Módulo 5: Emissão e Exportação do Documento PGR em PDF:**
  - Gerador oficial em PDF (`src/lib/pdf-generator.ts`) com capa institucional, dados cadastrais da empresa e unidade, metodologia da NR-01, inventário estruturado, cronograma de ações e termos de responsabilidade com assinaturas.

---

### [2026-08-25] - Customização do Modelo Base PGR & Exportação em Word (.docx)
- **1. Estruturação do Modelo Mestre (18 Capítulos):**
  - Integração do modelo institucional de referência (`FF PGR.MODELO EMEPEcopia.doc`): Capa, Dados Cadastrais, Histórico de Revisões, Introdução, Objetivo, Campo de Aplicação, Responsabilidades, Identificação de Perigos e Riscos, Metodologia de Avaliação 5x5, Inventário Consolidado, Plano de Ação 5W2H, Acompanhamento da Eficácia, Medidas de Emergência, Disposições Gerais, Validade, Assinaturas dos RTs, Termo de Encerramento e Recibo de EPIs.
- **2. Arquitetura Modular de Documentos (Global vs Específico):**
  - Criação da página **Modelo Base do PGR** (`/modelo-base-pgr`) em *Apoio & Configurações* para personalização do texto padrão de todos os PGRs emitidos.
  - Criação da página **Montagem e Customização do Documento** (`/documentos-pgr/:id/montagem`) para ajustes finos em um PGR específico sem afetar os demais.
- **3. Suporte a Tabelas Customizadas & Formatador:**
  - Desenvolvimento do `table-parser.ts` para renderizar tabelas markdown diretamente no visualizador web, PDF e Word.
  - Barra de ferramentas visual com inserção em 1 clique de tabelas de: *Controle de Revisões*, *Histórico de Alterações*, *Equipamentos e Máquinas*, *Medições Ambientais* e formatações ricas.
- **4. Gerador de Documentos Word (.docx):**
  - Implementação do `src/lib/docx-generator.ts` utilizando a biblioteca `docx` para exportar documentos formais totalmente editáveis com capas, tabelas estilizadas e quebras de página automáticas.
- **5. Sincronização Dinâmica:**
  - Correção de sincronização entre o editor de texto/tabelas e os visualizadores, garantindo renderização exata de múltiplas linhas de revisões.

---

### [2026-08-26] - Migração Completa para o Google Firebase (Cloud Firestore)
- **1. Transição de Banco de Dados:**
  - Desativação e remoção completa do Supabase (`@supabase/supabase-js`, `supabase.ts`, `supabase-service.ts`, `supabase/schema.sql`).
  - Instalação e integração do **SDK Oficial do Google Firebase (Modular v12)**.
- **2. Camada de Persistência em Nuvem (`src/lib/firebase-service.ts`):**
  - Implementação de persistência em tempo real para as 12 coleções do Cloud Firestore:
    - `companies` (Empresas e Clientes)
    - `establishments` (Unidades Fabris e Canteiros de Obras)
    - `sectors` (Setores e Ambientes de Trabalho)
    - `positions` (Cargos e Funções CBO)
    - `ghes` (Grupos Homogêneos de Exposição)
    - `professionals` (Profissionais Técnicos Habilitados e ART)
    - `hazards_catalog` (Catálogo de Riscos eSocial Tabela 24)
    - `pgr_documents` (Documentos do PGR)
    - `risk_inventory` (Inventário de Riscos Matriz 5x5)
    - `action_plans` (Planos de Ação 5W2H)
    - `pgr_templates` (Modelo Base Global do PGR com textos e tabelas dos 18 capítulos)
    - `pgr_document_sections` (Customizações de seções por documento)
- **3. Tratamento e Robustez:**
  - Criação do helper `cleanForFirestore` para sanitização recursiva de campos `undefined` em formulários, evitando erros de serialização do Firestore.
- **4. Painel de Controle (`/config-banco`):**
  - Monitoramento do status da conexão com Firestore (Online / Local).
  - Botão de **Carga Inicial ("Popular Base Firebase")** com 1 clique para injetar a base modelo (*Metalúrgica Brasil Sul Ltda*).
  - Botão de **Sincronização Forçada** e contadores de documentos por coleção em tempo real.

---

### [2026-08-26] - Segurança de Credenciais & Alertas do GitHub
- **1. Proteção de Chaves Sensíveis:**
  - Remoção de qualquer `apiKey` ou segredo hardcoded no repositório (`git grep AIzaSy` = 0 ocorrências).
  - Leitura segura via variáveis de ambiente (`import.meta.env.VITE_FIREBASE_API_KEY`).
  - Armazenamento local protegido via `.env.local` (ignorado pelo Git).
  - Sanitização do `.env.example` com placeholders neutros.
- **2. Ajuste na Vercel:**
  - Orientação sobre o uso de variáveis do tipo *Config* na Vercel para compatibilidade com o bundle do cliente Vite.

---

### [2026-08-26] - Homologação e Validação E2E no Ambiente de Produção da Vercel
- **1. Testes Automatizados em Produção (`https://sistema-pgr.vercel.app`):**
  - Execução de testes de navegação e preenchimento via Puppeteer direto na Vercel.
  - Cadastro de nova empresa (*SulMetal Estruturas Metálicas*) e novo setor (*Corte a Laser & Conformação*).
- **2. Validação no Banco de Dados em Nuvem:**
  - Comprovada a gravação em tempo real no Google Cloud Firestore com leitura das novas coleções via API.
- **3. Confirmação Final:**
  - 100% dos dados alterados na Vercel estão persistidos e sincronizados no Google Cloud Firestore.

---

### [2026-08-30] - Reordenação da Modal de Cadastro de Empresas & Mascaramento Dinâmico
- **1. Reordenação Estrita dos Campos:**
  - Reorganização do formulário modal de cadastro e edição de empresas para seguir rigorosamente o fluxo:
    1. `CNPJ` (com máscara de digitação `maskCNPJ`)
    2. `Razão Social`
    3. `Nome Fantasia`
    4. `Endereço Completo` (Logradouro, número, bairro, Cidade e UF)
    5. `Código CNAE Principal` & `Descrição da Atividade Econômica`
    6. `Grau de Risco (NR-04)`
    7. `Representante Legal`
    8. `Cargo do Representante`
    9. `Total de Empregados`
- **2. Validação & Banco de Dados:**
  - Compatibilidade garantida com a coleção `companies` do Firestore.
  - Build testado e publicado na Vercel.

---

### [2026-08-30] - Simplificação e Unificação dos Campos de Atividades em Cargos & Funções
- **1. Ajuste da Interface & Modal:**
  - Remoção dos campos: *Descrição Sucinta do Cargo*, *Atividades Rotineiras (Diárias)* e *Atividades Não Rotineiras / Eventuais*.
  - Inserção do campo unificado **"Descrição da Atividade"** (`activityDescription`) na modal de cadastro e edição de cargos.
  - Alinhamento e proporcionalidade visual do campo *Número de Trabalhadores* na coluna esquerda do grid da modal.
  - Atualização da tabela de visualização da listagem de cargos com a nova coluna *Descrição da Atividade*.
- **2. Adequação do Banco de Dados & Exportações:**
  - Atualização da interface `Position` em `src/types/pgr.ts` com o novo campo `activityDescription` e retrocompatibilidade para dados legados.
  - Atualização do gerador Word (.docx), visualizador de documentos PGR (`PgrViewerPage.tsx`) e do template oficial (`pgr-official-template.ts`).
  - Atualização do seed de dados no Google Cloud Firestore (`src/lib/firebase-service.ts`).
  - Build validado e publicado no GitHub / Vercel (Commits `e5af223`, `029abc3` e `366cbd3`).

---

### [2026-08-30] - Migração Terminológica Completa de GHE para GES (Grupo de Exposição Similar)
- **1. Atualização no Sistema e Menus:**
  - Substituição da nomenclatura e siglas de *GHE (Grupos Homogêneos de Exposição)* para **"Grupo de Exposição Similar (GES)"** em toda a aplicação.
  - Atualização do Menu Lateral (`Sidebar.tsx`), rotas (`/ges` e `/ghes`), cabeçalhos, formulários modais, botões e tabelas de dados.
  - Atualização do formulário e tabela do Inventário de Riscos (`RiskFormModal.tsx` e `RiskInventoryTable.tsx`).
  - Atualização do painel de monitoramento do banco de dados (`DatabaseSettingsPage.tsx`).
- **2. Adequação no Banco de Dados & Tipagem:**
  - Criação da interface oficial `GES` em `src/types/pgr.ts` mantendo alias de tipagem `type GHE = GES` para integridade.
  - Atualização dos prefixos de códigos padrão (`GES-01`, `GES-02`) no Firestore e seed de dados.
  - Execução de script de migração e rotina de sanitização automática de dados legados no Firestore, convertendo qualquer registro com `GHE-` para `GES-`.
  - Persistência e integridade das coleções existentes mantidas 100% ativas no Firestore.
---

### [2026-08-30] - Simplificação e Otimização da Modal de GES (Exclusão de Campos)
- **1. Ajuste da Interface & Modal:**
  - Remoção dos campos redundantes: *"Nome / Título do GES \*"* e *"Descrição do Perfil de Exposição Similar"*.
  - A modal de cadastro e edição de GES agora possui apenas os 4 campos essenciais e diretos: *Unidade / Estabelecimento \**, *Setor \**, *Código do GES \** e *Quantidade Total de Expostos*.
  - Ajuste de layout para posicionar **"Unidade / Estabelecimento \*"** e **"Setor \*"** empilhados verticalmente (um em cima do outro), seguidos da linha com *Código do GES* e *Quantidade Total de Expostos*.
  - Redimensionamento e centralização compacta da janela modal (`max-w-md`).
  - Atualização da tabela de listagem de GESs, exibindo de forma clara e limpa: *Código do GES*, *Setor / Lotação*, *Trabalhadores* e *Ações*.
- **2. Adequação no Banco de Dados & Tipagem:**
  - Atualização da interface `GES` em `src/types/pgr.ts` tornando os campos `name` e `description` opcionais para total retrocompatibilidade.
  - Ajuste na busca e nos seletores do inventário de riscos (`RiskInventoryTable.tsx` e `RiskFormModal.tsx`).
  - Build validado e publicado no GitHub / Vercel (Commits `fc56802`, `5672e97` e `8630d01`).

---

### [2026-08-30] - Reestruturação da Modal de Levantamento de Risco (NR-01.5.7) & Adequação do Banco de Dados
- **1. Sequência Padronizada dos Campos na Modal:**
  - **1. Lotação & Trabalhadores Expostos:** `SETOR / AMBIENTE *`, `CARGO / FUNÇÃO`, `GES (GRUPO DE EXPOSIÇÃO SIMILAR)` e `QUANTIDADE DE TRABALHADORES EXPOSTOS`.
  - **2. Identificação do Risco & Agente:**
    - `RISCO (CATEGORIA)`: Seletor com botões interativos das categorias oficiais (*Físico, Químico, Biológico, Ergonômico, Acidente / Mecânico*).
    - `AGENTE / PERIGO *` e `CÓDIGO ESOCIAL (TAB. 24)` com catálogo de sugestões rápidas.
    - `TIPO DE EXPOSIÇÃO *`: Lista suspensa com as opções oficiais: *Habitual e Permanente*, *Habitual e Intermitente*, *Eventual e Intermitente*, *Eventual*, *Permanente*, *Intermitente*, *Habitual*.
    - `VIA DE PENETRAÇÃO`: Campo com sugestões rápidas (*Respiratória*, *Cutânea / Dérmica*, *Auditiva*, *Ocular*, *Digestiva*, *Contato Físico / Mecânico*, *Postural / Biomecânica*, *Não Aplicável*).
    - `EFEITOS A SAÚDE (LESÕES OU AGRAVOS) *` e `FONTE GERADORA / CIRCUNSTÂNCIA`.
    - `EPC / EPI (NOME E C.A)`: Medidas Coletivas (EPC) e Equipamentos de Proteção Individual (EPI) com Nome e Certificado de Aprovação (C.A.).
  - **3. Medição Ambiental:**
    - Seção expansível com `CRITÉRIO`, `TÉCNICA UTILIZADA`, `DATA DA MEDIÇÃO`, `RESULTADO` e `LT (LIMITE DE TOLERÂNCIA)`.
  - **4. Categorização do Risco/Perigo: Matriz (NR-01):**
    - Matriz 5x5 interativa (*Probabilidade x Severidade = Nível de Risco e Diretriz de Controle*).
  - **5. Recomendações & Medidas Propostas:**
    - Campo de texto livre para recomendações técnicas e switch de integração automática com o **Plano de Ação (5W2H)**.
  - **6. Avaliações e Resultados (Gráficos e Planilhas):**
    - Componente de upload e anexação de imagens com conversão Base64 / URL, galeria de miniaturas, botão de exclusão e modal de visualização em tela cheia (lightbox).
- **2. Adequações no Banco de Dados (Firestore) & Tipagem:**
  - Atualização dos tipos `RiskInventoryItem`, `EnvironmentalMeasurement` e `ExposureType` em `src/types/pgr.ts`.
  - Atualização do renderizador de inventário na tabela (`RiskInventoryTable.tsx`), no visualizador oficial (`PgrViewerPage.tsx`) e nos geradores Word / PDF (`docx-generator.ts` e `pgr-official-template.ts`).
  - Validação de compilação sem erros (`tsc -b && vite build`) e testes visuais com Puppeteer.

---

### [2026-09-01] - Reestruturação Hierárquica do Capítulo 12 (APR-HO), Novos Campos EMR / Prioridade, Isolamento por Empresa, Ocultação de Exportações e Exclusão em Cascata no Firestore

- **1. Reestruturação Hierárquica do Capítulo 12 (Inventário de Riscos Ocupacionais - Modelo APR-HO):**
  - Reorganização estrutural para agrupar riscos por **GHE / Setor** através do helper unificado `groupInventoryByGhe` (`src/lib/pgr-groups.ts`).
  - Definição da nova ordem visual e normativa no visualizador (`PgrViewerPage.tsx`) e no gerador PDF (`pdf-generator.ts`):
    1. **Título do Bloco em Negrito:** `GES-01 | Setor: [Nome do Setor] | Efetivo Exposto: [X] trabalhador(es) | EMR: [Valor do EMR]`
    2. **Lista Completa dos Cargos / Funções com CBO e Descrição das Atividades:** Todos os cargos vinculados ao GHE/Setor são listados ordenadamente antes das tabelas de perigos:
       - `Cargo / Função: [Nome do Cargo] (CBO: [Código CBO])`
       - `Descrição da Atividade: [Texto descritivo das atividades]`
    3. **Tabelas APR-HO Consolidadas por Agente:** Tabela completa com identificação do agente/perigo colorida por categoria, fontes, trajetórias, vias de penetração, efeitos à saúde, EPC/EPI, medições ambientais quantitativas e a coluna **Prioridade de Ação** (`Baixa`, `Média`, `Alta`).
- **2. Novos Campos na Modal de Levantamento de Risco (NR-01.5.7) & Persistência:**
  - **Lotação & Trabalhadores Expostos:** Reorganização em grade de 2 linhas com 2 campos cada (Setor, Cargo, GHE e Nº de Expostos).
  - **Exposto de Maior Risco (EMR) (`highestRiskExposed`):** Inclusão de campo de digitação livre para indicar o trabalhador ou função de maior vulnerabilidade.
  - **Prioridade de Ação (`actionPriority`):** Inclusão de seletor com opções `Baixa`, `Média` e `Alta` alimentando diretamente as tabelas APR-HO.
  - Persistência e leitura 100% integradas na coleção `risk_inventory` do Google Cloud Firestore.
- **3. Isolamento Rigoroso de Dados por Empresa e Estabelecimento Ativo:**
  - Criação da função centralizadora `filterContextForCompany` em `src/lib/pgr-official-template.ts`.
  - Garantia de que a visualização na web e o download do PDF oficial utilizem única e exclusivamente os setores, cargos, GHEs, riscos e planos da empresa e estabelecimento ativos, eliminando qualquer risco de mistura com dados de testes ou outras empresas.
- **4. Ocultação Segura das Exportações Word (.docx) e Excel (.xlsx):**
  - Ocultação dos botões de exportação de Word e Excel na barra superior do visualizador (`PgrViewerPage.tsx`), no construtor (`PgrBuilderPage.tsx`), na listagem de documentos (`PgrDocumentsPage.tsx`) e na tela do inventário de riscos (`RiskInventoryPage.tsx`).
  - Preservação total do código-fonte dos geradores (`docx-generator.ts` e `excel-generator.ts`) para reativação futura.
- **5. Limpeza Profunda do Google Cloud Firestore:**
  - Remoção física definitiva de **56 registros obsoletos e de testes anteriores** no Firestore (empresas de teste, setores antigos como *"Corte a Laser"* e coleções temporárias).
  - O banco de dados agora contém 100% de integridade com apenas os registros reais e oficiais da empresa **Advanced Innergy Solutions do Brasil Ltda.**.
- **6. Implementação de Exclusão Real e em Cascata no Firestore (`PgrContext.tsx`):**
  - Atualização de todas as rotinas de exclusão (`deleteCompany`, `deleteEstablishment`, `deleteSector`, `deletePosition`, `deleteGhe`, `deletePgrDocument`, `deleteRiskItem`, `deleteActionPlan`) para executar deleção física no Firestore e exclusão em cascata de todas as entidades filhas/dependentes, prevenindo acúmulo de dados órfãos.
- **7. Implementação Completa das Tabelas Padronizadas do PGR (Arquivo TABELAS PGR.docx):**
  - **Categorias de Riscos (Item 9.2):** Inclusão formal da tabela com as 6 categorias (Agentes Físicos, Agentes Químicos, Agentes Biológicos, Riscos Ergonômicos, Riscos Psicossociais Relacionados ao Trabalho e Riscos de Acidentes).
  - **Tabelas 1 a 6 de Metodologia e Avaliação de Riscos (Item 9.3):**
    - **Tabela 1:** Critérios de Avaliação (Probabilidade, Severidade, Classificação).
    - **Tabela 2:** Critério de Probabilidade Quantitativo e Qualitativo (Índices 1 a 5 com faixas percentuais de LEO).
    - **Tabela 3:** Critérios para Classificação de Severidade (Crítica 5 a Insignificante 1).
    - **Tabela 4:** Matriz de Risco 5x5 com Pontuações (1 a 25) com estilização colorida automática por faixa.
    - **Tabela 5:** Critérios para Classificação do Nível de Risco (Extremo, Alto, Médio, Baixo com significados e diretrizes de tratamento).
    - **Tabela 6:** Critérios para Priorização das Ações (Intolerável/Urgente, Substancial/Alta, Moderado/Média, Tolerável/Baixa com badges coloridos).
  - **Renderização Unificada em Todas as Camadas:**
    - Atualização do modelo base global no Firestore (`pgr_templates/global_master`).
    - Visualizador em tela (`PgrViewerPage.tsx` e `markdown-renderer.tsx`) com chips coloridos de alta fidelidade visual.
    - Gerador de PDF Oficial (`pdf-generator.ts`) com coloração de células e cabeçalhos em `autoTable`.
    - Gerador de Word (`docx-generator.ts`) com tabelas nativas estilizadas.
- **8. Padronização Oficial da Sequência do PGR com Índice Estruturado (17 Capítulos):**
  - **Novo Capítulo 1 (1. INDICE):** Inclusão formal de sumário estruturado contendo a relação dos 17 capítulos e a listagem dinâmica dos Grupos de Exposição Similar (`GES 1.0 – SETOR ...`).
  - **Sequência Oficial NR-01 Homologada:**
    - `CAPA`
    - `1. INDICE`
    - `2. CONTROLE DE REVISÕES DO DOCUMENTO`
    - `3. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO`
    - `4. RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR`
    - `5. INTRODUÇÃO`
    - `6. OBJETIVO`
    - `7. FUNDAMENTAÇÃO LEGAL`
    - `8. RESPONSABILIDADE`
    - `9. ESTRUTURA DO PGR`
    - `10. DESENVOLVIMENTO DO PGR`
    - `11. METODOLOGIA DE ANÁLISE`
    - `12. INTRUMENTOS UTILIZADOS NAS AVALIAÇÕES`
    - `13. AVALIAÇÃO, RESULTADOS E INTERPRETAÇÃO`
    - `14. INVENTÁRIO DE RISCOS OCUPACIONAIS (MODELO APR-HO)`
    - `15. PLANO DE AÇÃO`
    - `16. ENCERRAMENTO`
    - `17. MODELO DE FICHA DE EPIS.`
  - **Sincronização Integral em Todas as Camadas:**
    - Modelo Base Global em *Apoio & Configurações* (`pgr_templates/global_master` no Cloud Firestore).
    - Visualizador em Tela (`PgrViewerPage.tsx`).
    - Gerador de PDF Oficial (`pdf-generator.ts`).
    - Gerador de Word / Excel (`docx-generator.ts` e `excel-generator.ts`).
- **9. Qualidade, Testes e Deploy:**
  - Build compilado com **0 erros** no TypeScript e Vite (`tsc -b && vite build`).
  - Commits sincronizados no repositório GitHub (`origin/main`): `9d407b7`, `8de01e3`, `7cbb0e9`, `1a4d2a6`, `895dd08`, `1b6167b`, `b430ea8`, `02cc4fe`, `6d10fb2`.

---

### [2026-09-02] - Adequações Normativas e Estruturais Solicitadas pela Cliente (Áudios)

- **1. Capa Oficial do PGR:**
  - **Logos Proporcionais:** Inclusão e renderização das logomarcas da ES Engenharia (topo) e da empresa cliente (centro) com preservação rigorosa do aspect ratio original via cálculo vetorial (`getImageProperties`), eliminando qualquer achatamento ou distorção.
  - **Quadro Técnico Simplificado:** Remoção definitiva dos campos de *Vigência* e *ART* da capa, mantendo Código/Revisão, Responsável Técnico, Registro CREA/CRM e Data de Elaboração.
- **2. Paginação Oficial e Quebras de Página Exatas no PDF:**
  - **Página 1:** Capa Oficial.
  - **Página 2:** `1. INDICE` (página exclusiva).
  - **Página 3:** `2. CONTROLE DE REVISÕES DO DOCUMENTO` (página exclusiva).
  - **Página 4:** `3. INFORMAÇÕES CADASTRAIS DO EMPREGADOR E ESTABELECIMENTO` (página exclusiva).
  - **Página 5:** `4. RESPONSÁVEL TÉCNICO PELA ELABORAÇÃO DO PGR` (página exclusiva).
  - **Página 6:** `5. INTRODUÇÃO` (página exclusiva).
  - **Páginas seguintes:** Capítulos 6 a 13 em fluxo contínuo/sequencial.
  - **Capítulo 14 (INVENTÁRIO DE RISCOS OCUPACIONAIS - MODELO APR-HO):**
    - Inicia obrigatoriamente em uma **nova página**.
    - Exibe cabeçalho do GHE/Setor e descrição das atividades dos cargos.
    - Imediatamente após a descrição dos cargos, a **APR-HO inicia em uma nova página dedicada**.
    - Cada novo GHE cadastrado também inicia em uma nova página.
  - **Capítulo 15 (PLANO DE AÇÃO):** Inicia em uma **nova página dedicada**.
  - **Capítulo 16 (ENCERRAMENTO E ASSINATURAS):** Inicia em uma **nova página dedicada**.
  - **Capítulo 17 (MODELO DE FICHA DE EPIS):** Inicia em uma **nova página dedicada**.
- **3. Cores Normativas na Tabela de Categorias de Risco (Item 10.2):**
  - Aplicação das cores de identificação nas categorias de risco:
    - 🟩 **Agentes Físicos:** Verde (`#16a34a` / `RGB(22, 163, 74)`)
    - 🟥 **Agentes Químicos:** Vermelho (`#dc2626` / `RGB(220, 38, 38)`)
    - 🟫 **Agentes Biológicos:** Marrom (`#78350f` / `RGB(120, 53, 15)`)
    - 🟨 **Riscos Ergonômicos:** Amarelo (`#eab308` / `RGB(234, 179, 8)`)
    - 🟨 **Riscos Psicossociais Relacionados ao Trabalho:** Amarelo (`#eab308` / `RGB(234, 179, 8)`)
    - 🟦 **Riscos de Acidentes:** Azul (`#2563eb` / `RGB(37, 99, 235)`)
  - Renderizado no PDF (`pdf-generator.ts`), no visualizador em tela (`markdown-renderer.tsx`) e no gerador DOCX (`docx-generator.ts`).
- **4. Motor de Renderização de Negrito no PDF:**
  - Implementação de analisador léxico de markdown (`parseMarkdownTokens` e `renderMarkdownParagraphToPdf`) no jsPDF.
  - Textos demarcados com `**negrito**` agora são desenhados de forma fidedigna com fonte em negrito real (`doc.setFont('helvetica', 'bold')`), com word-wrapping preciso e cálculo de largura proporcional.
- **5. Cabeçalho e Rodapé Padronizados com Dados da ES Engenharia:**
  - **Cabeçalho (páginas >= 2):** Logo da ES Engenharia em escala proporcional + título formal do documento (`PGR — Programa de Gerenciamento de Riscos (NR-01) | Empresa`) e linha separadora.
  - **Rodapé (páginas >= 2):** Razão Social, CNPJ e endereço oficial da ES Engenharia (`ES Engenharia de Segurança do Trabalho LTDA. | CNPJ: ... | Endereço ...`) e numeração de páginas (`Página X de Y`), sem menção a vigência.
- **6. Ajustes de Interface do Sistema:**
  - `PgrViewerPage.tsx`: Remoção de vigência do quadro superior e tratamento de ART condicional na Seção 4.
  - `PgrDocumentsPage.tsx`: Coluna da listagem de documentos alterada para *Data de Elaboração*, facilitando a conferência cronológica.

---

### [02/09/2026] Marco de Correção Estrutural: Eliminação Definitiva de Páginas em Branco no PDF

#### Diagnóstico Técnico das Causas Raiz:
1. **Dessincronização de Coordenada Y no Motor Markdown (`renderMarkdownParagraphToPdf`):**
   - O argumento `currentY` era passado por valor como número primitivo. Consequentemente, o callback `checkPageBreak` utilizava a variável do escopo superior enquanto as linhas do parágrafo incrementavam apenas a cópia local.
   - Quando um parágrafo ultrapassava a margem inferior (272 mm), a quebra de página não ocorria em tempo real durante a renderização das linhas, e o valor retornado (> 272) forçava o próximo parágrafo a disparar `doc.addPage()` imediatamente, porém desenhando no rodapé/fora da página e deixando a página anterior com espaço vazio residual, gerando um efeito dominó de páginas vazias consecutivas.
2. **Quebras Redundantes Acumuladas:**
   - Chamadas subsequentes de `addPage()` no início e no fim de blocos (como no Inventário, Plano de Ação e Encerramento) criavam páginas em branco quando `currentY` já havia sido reinicializado para `20`.
   - Quebra indevida no encerramento gerava uma página fantasma ao final do documento.
3. **Quebra Precoce de Tabelas APR-HO:**
   - A margem para os cartões de APR-HO (`checkPageBreak(50)`) era insuficiente para cards com altura real (~85-95 mm), causando divisões indesejadas e páginas mal distribuídas.

#### Soluções Implementadas (`src/lib/pdf-generator.ts`):
1. **Cursor Sincronizado por Referência (`cursor: { y: number }`):**
   - Todas as funções de renderização agora compartilham o mesmo objeto de estado `cursor = { y: 20 }`.
   - Cada linha desenhada verifica `checkPageBreak(lineHeight + 2)`, atualizando a coordenada em tempo real e desenhando imediatamente no topo (Y = 20) da nova página, sem perda de alinhamento ou vazamento de coordenadas.
2. **Função Idempotente `ensureNewPage()`:**
   - Implementada função protetora que só cria uma nova página caso haja conteúdo na página atual (`if (cursor.y > 20)`). Se o documento já estiver no topo de uma página limpa, a função não cria páginas redundantes.
3. **Remoção de Quebras de Fim de Bloco & Defesa Contra Páginas Finais Vazias:**
   - As seções não mais chamam `addPage()` ao término; cada seção apenas solicita nova página no seu início se necessário.
   - Adicionada verificação final `if (cursor.y === 20 && doc.getNumberOfPages() > 1) doc.deletePage(...)` para garantir que o PDF termine exatamente onde o conteúdo encerra.
4. **Altura Adequada para Cartões APR-HO:**
   - Ajustado `checkPageBreak(85)` antes de cada cartão da APR-HO, garantindo que nenhum cartão seja quebrado ao meio de forma desagradável.

---

### [02/09/2026] Marco: Ordem Normativa Fixa dos Riscos e Cartão Condensado de "Não Há Exposição" (Vídeo da Cliente)

Com base na solicitação e demonstração visual gravada pela cliente em vídeo (`WhatsApp Video 2026-09-02 at 14.40.41.mp4`), foram implementadas as seguintes melhorias:

1. **Ordem Fixa Normativa das Categorias de Risco no Inventário (APR-HO):**
   - Criação da hierarquia normativa padrão `HAZARD_CATEGORY_ORDER`:
     1º 🟩 **Físico** (`fisico`)
     2º 🟥 **Químico** (`quimico`)
     3º 🟫 **Biológico** (`biologico`)
     4º 🟨 **Ergonômico / Psicossocial** (`ergonomico`, `psicossocial`)
     5º 🟦 **Acidentes** (`acidente`)
   - A função `groupInventoryByGhe` em `src/lib/pgr-groups.ts` agora ordena todos os riscos automaticamente por essa sequência normativa, padronizando a exibição em **todas** as frentes:
     - Visualizador em tela (`PgrViewerPage.tsx`);
     - Geração de PDF Oficial jsPDF (`pdf-generator.ts`);
     - Geração de documento Word DOCX (`docx-generator.ts`).

2. **Formato Condensado de 1 Linha para "Não há exposição / Não se aplica":**
   - Criação da função utilitária `isNoExposureRisk(item)` para identificar avaliações com ausência de exposição ocupacional.
   - Quando um risco não possui exposição ativa (ex.: Químico ou Biológico em ambientes onde não se aplica):
     - Não desenha mais o cartão completo de 14 linhas cheio de "NAP".
     - Desenha uma **tabela compacta de linha única** (~8 mm de altura):
       - Coluna da esquerda: Tarja sólida com a cor normativa oficial e texto branco em negrito `Risco {Categoria}`;
       - Coluna da direita: Texto claro com `Agente: Não há exposição / Não se Aplica`.
     - Implementado com máxima fidelidade no **PDF oficial**, na tela do **PGR Viewer** e no arquivo **Word (DOCX)**.







---

### [03/09/2026] Marco: Múltiplas Qualificações Técnicas & Sincronização Completa do Plano de Ação (5W2H)

- **Múltiplas Qualificações Técnicas para Profissionais Habilitados:**
  - Atualização do cadastro de Responsáveis Técnicos (`ProfessionalsPage.tsx` e `pgr.ts`) com suporte a múltiplas qualificações/cargos (ex.: *Engenheiro de Seg. do Trabalho*, *Higienista Ocupacional*, *Perito Judicial*, etc.).
  - Tags de seleção rápida e campo para inclusão de qualificações personalizadas com badges visuais.
  - Sincronização no Modelo Oficial (`pgr-official-template.ts`) e Seção 4 do PGR (exibição de todas as qualificações do elaborador técnico).

- **Aprimoramentos Estruturais no Plano de Ação & Inventário de Riscos (NR-01.5.5):**
  - Inclusão e integração de novos campos no Inventário e Plano de Ação:
    - **Prazo Inicial** (`startDate` / `actionStartDate`);
    - **Prazo Final / Limite** (`whenDate` / `actionEndDate`);
    - **Grau de Prioridade Normativa** (`priority`: Baixa, Média, Alta, Urgente) calculado e sugerido automaticamente conforme o nível do risco (Intolerável -> Urgente, Substancial -> Alta, Moderado -> Média, etc.);
    - **Responsável pela Ação** (`actionResponsible` / `who`), com atalho para puxar o responsável da unidade.
  - Sincronização automática em tempo real entre o Inventário de Riscos e o Plano de Ação (5W2H) no Firestore.
  - Atualização das tabelas do Plano de Ação no **PDF Oficial** (`pdf-generator.ts`), no **Documento Word** (`docx-generator.ts`) e na **Tela de Visualização** (`PgrViewerPage.tsx` e `ActionPlanTable.tsx`), substituindo números estáticos pela prioridade textual e exibindo o intervalo de datas completo.

---

### [03/09/2026] Marco: Adequações Normativas da Especificação Técnica (CHK-01 a CHK-08) & Justificação Universal de Textos

Com base no documento formal de auditoria técnica (`especificacao_ajustes_pgr.pdf`), foram aplicados integralmente todos os requisitos técnicos normativos no Sistema PGR/GRO (NR-01) e nos exportadores oficiais:

1. **CHK-01: Padronização dos Títulos dos Cartões de Riscos para `RISCO [NOME]`:**
   - Alterados cabeçalhos e badges de grupos de riscos nos relatórios e visualizadores de `GRUPO [NOME]` ou `Risco [Nome]` para `RISCO FÍSICO`, `RISCO QUÍMICO`, `RISCO BIOLÓGICO`, `RISCO ERGONÔMICO`, `RISCO DE ACIDENTES`.
   - Implementado em: `src/lib/pdf-generator.ts`, `src/lib/docx-generator.ts` e `src/pages/PgrViewerPage.tsx`.

2. **CHK-02: Rótulo "Data da Avaliação" e Eliminação de Status Redundante:**
   - Atualizado o rótulo de data no Bloco 3 para `Data da Avaliação`.
   - Removido o campo duplicado `Status: Risco Muito Baixo` nos cartões APR-HO e unificada a identificação de nível de risco com a Matriz 5x5 do GRO.

3. **CHK-03: Exclusão de Enquadramento eSocial no Inventário do PGR:**
   - Assegurado que referências a enquadramento de eSocial fiquem reservadas estritamente ao LTCAT / Laudos Específicos, mantendo o PGR focado nos critérios da NR-01.

4. **CHK-04: Matriz 5x5 Normativa (Tabelas 5 e 7 do PGR):**
   - Criação da função `getNormativeRiskMatrix(score)` em `src/lib/risk-matrix.ts`:
     - **16 a 25:** Nível `Extremo` / Prioridade `Urgente`
     - **10 a 15:** Nível `Alto` / Prioridade `Alta`
     - **5 a 9:** Nível `Médio` / Prioridade `Média`
     - **1 a 4:** Nível `Baixo` / Prioridade `Baixa`
   - Vinculação automática no seletor interativo (`Matrix5x5Selector.tsx`), no formulário de riscos (`RiskFormModal.tsx`), no PDF (`pdf-generator.ts`), no Word (`docx-generator.ts`) e no visualizador web (`PgrViewerPage.tsx`).

5. **CHK-05: Cartão de "Não há exposição / Não se aplica (NAP)":**
   - Adequação da estrutura do cartão conforme item 3.1 da especificação técnica:
     - Preservada estritamente a barra superior de identificação do grupo (`RISCO BIOLÓGICO`, etc.) e o Bloco 1 (Identificação do Risco: Agente, Fontes = NAP, Trajetória = NAP, Danos = NAP, Medidas = NAP).
     - Omitidos integralmente os Blocos 2 (Medição/Avaliação), Bloco 3 (Classificação do Risco) and Bloco 4 (Recomendações/Ação).
   - Aplicado de forma idêntica no PDF jsPDF, no Word DOCX e na página do PGR Viewer.

6. **CHK-06: Sequência Fixa Normativa dos Grupos Ocupacionais:**
   - Ordenação estrita em todo o inventário e relatórios:
     1º Físico, 2º Químico, 3º Biológico, 4º Ergonômico/Psicossocial, 5º Acidentes.
   - Reforçado em `src/lib/pgr-groups.ts` com tolerância a maiúsculas/minúsculas e acentos.

7. **CHK-07: Plano de Ação (5W2H) Conforme NR-01:**
   - Preenchimento consistente dos campos:
     - **Prazo Inicial** e **Prazo Final** exibidos em todas as tabelas (PDF, DOCX e Web);
     - **Responsável pela Ação:** herança automática do representante legal da empresa ou gestor do estabelecimento (`establishment.managerName` / `company.legalRepresentative`);
     - **Grau de Prioridade:** sugerido automaticamente pela Matriz 5x5;
     - **Status da Ação:** padronizado por padrão como `NÃO INICIADA`, com badges e formatações visuais adequadas.

8. **CHK-08: Múltiplas Qualificações do Responsável Técnico & Dados Oficiais do Eng. Fernando Guimarães Ferrari:**
   - Adicionado suporte a múltiplas qualificações e seleção dinâmica (`ProfessionalsPage.tsx`).
   - Adicionado campo CPF com máscara de formatação (`000.000.000-00`) nos cadastros de profissionais técnicos e na Seção 4 do PGR.
   - Inserido botão de carga rápida de dados oficiais do Responsável Técnico:
     - **Nome:** Fernando Guimarães Ferrari
     - **Qualificações:** Engenheiro de Segurança do Trabalho, Engenheiro de Minas, Higienista Ocupacional, Perito Judicial e Assistente Técnico
     - **Registro Profissional:** CREA-SP: 5060011940 / Visto 5060011940SP
     - **CPF:** 132.188.318-81
   - Renderização completa de todas as qualificações e CPF na Seção 4 no PDF, Word e Visualizador Web.

9. **Justificação Universal de Textos Gerados:**
   - **PDF:** Algoritmo de justificativa customizado no jsPDF (`renderMarkdownParagraphToPdf`) com distribuição balanceada de folga proporcional entre os espaços (`diff / spacesCount`) mantendo a última linha à esquerda.
   - **Word DOCX:** Alinhamento `AlignmentType.JUSTIFIED` configurado em todos os parágrafos de texto corridos e descrições de atividades.
   - **Visualizador Web:** Classe CSS `text-justify` aplicada universalmente nos blocos e parágrafos do `MarkdownSectionRenderer` e descrições de cargos.

---

### [03/09/2026] Marco: Especificação Técnica Parte 2 (AJ-V2-01 a AJ-V2-04) & Justificação Nativa Total no PDF

Implementação detalhada com base no documento `especificacao_ajustes_pgr_parte2.pdf`:

1. **AJ-V2-01: Quebras de Página & Layout Limpo para Documentação Formal:**
   - O **Inventário de Riscos Ocupacionais (Seção 10)** passa a iniciar obrigatoriamente em uma nova página limpa no PDF (`pdf-generator.ts`) e no Word (`docx-generator.ts`).
   - O **Plano de Ação 5W2H (Seção 11)** também inicia obrigatoriamente em página separada, evitando que suas tabelas sejam misturadas com os cartões de riscos.
   - Cada Grupo de Exposição Similar (**GES**) agora realiza quebra de página controlada, preservando a identidade visual, o cabeçalho de lotação e os detalhes físicos do ambiente juntos.

2. **AJ-V2-02: Ordem Normativa Rígida dos 5 Grupos Ocupacionais:**
   - Garantida a sequência imutável de apresentação dos riscos em todo o sistema, tabelas e relatórios:
     - **1º Riscos Físicos** ➔ **2º Riscos Químicos** ➔ **3º Riscos Biológicos** ➔ **4º Riscos Ergonômicos** ➔ **5º Riscos de Acidentes**.
   - A função de agrupamento `groupInventoryByGhe` (`src/lib/pgr-groups.ts`) agora ordena deterministicamente todos os agentes por categoria e por nome.

3. **AJ-V2-03: Cartão Condensado de Linha Única para "Não há exposição / Não se Aplica (NAP)":**
   - Eliminação de cartões gigantes de 14 linhas preenchidos com "NAP" quando não há exposição no GES.
   - Implementação de faixa compacta de 1 linha (~8 mm de altura):
     - Lado esquerdo: Faixa sólida colorida com o nome normativo (`RISCO QUÍMICO`, `RISCO BIOLÓGICO`, etc.);
     - Lado direito: Declaração formal concisa `Agente: Não há exposição / Não se Aplica`.
   - Disponível com fidelidade visual no PDF oficial, no visualizador web e no documento Word (.docx).

4. **AJ-V2-04: Justificação Nativa e Precisa de Textos no jsPDF:**
   - Aprimoramento da engine de renderização em PDF (`pdf-generator.ts`) para utilizar nativamente a propriedade `{ align: 'justify', maxWidth: contentWidth }` da API do jsPDF.
   - Textos de introdução, objetivos, preâmbulos, histórico, disposições gerais e metodologia ficam 100% justificados com acabamento tipográfico profissional.

---

### [03/09/2026] Marco: Auditoria Completa de Persistência no Cloud Firestore & Deploy em Produção na Vercel

1. **Auditoria em Tempo Real no Banco de Dados (Cloud Firestore):**
   - Executada verificação direta via script automatizado contra o projeto Firebase `sistema-pgr`.
   - Confirmação de integridade total das 12 coleções e da coleção de configurações do sistema:
     - `companies` (Empresas)
     - `establishments` (Estabelecimentos / Unidades)
     - `sectors` (Setores e Ambientes Físicos)
     - `positions` (Cargos com `activityDescription`, `cbo`, `workerCount`, `routineActivities`)
     - `ghes` (Grupos de Exposição padronizados como `GES`, com cargos vinculados e contagem de expostos)
     - `professionals` (Responsáveis Técnicos com múltiplas qualificações e CPF)
     - `hazards_catalog` (Catálogo de Perigos eSocial Tabela 24)
     - `pgr_documents` (Documentos do PGR)
     - `risk_inventory` (Inventário de Riscos com todos os 31 campos mapeados, incluindo trajetória, via de penetração, matriz 5x5, medições ambientais e prazos 5W2H)
     - `action_plans` (Plano de Ação 5W2H com metas, prazos, prioridades e responsáveis sincronizados)
     - `pgr_templates` & `pgr_document_sections` (Modelos globais e textos customizados de seções)
     - `system_settings/issuer_company` (Dados cadastrais e responsabilidade técnica da empresa emissora)
   - Teste de leitura e escrita direta no Firestore executado com 100% de sucesso.

2. **Proteção Contra Perda de Dados (Dual Layer Persistence):**
   - Todas as operações utilizam atualização segura via `setDoc(..., { merge: true })` combinada com o sanitizador recursivo `cleanForFirestore`.
   - Camada de contingência offline permanente em LocalStorage (chaves `_v2`) para resiliência caso ocorram quedas de conexão do usuário.

3. **Sincronização em Background no Visualizador (`PgrViewerPage.tsx`):**
   - Implementado hook assíncrono que consulta o Firestore no momento da abertura do visualizador. Se houver edições de seções feitas em outro dispositivo ou aba, os dados são sincronizados instantaneamente no cache local e refletidos na tela e no PDF.

4. **Publicação Contínua em Produção (Vercel):**
   - Repositório GitHub atualizado na branch `main` (`Rodolfo-UXDEV/sistema-pgr`).
   - Deploy automático na Vercel finalizado com sucesso (`https://sistema-pgr.vercel.app`), com status HTTP 200 e bundle atualizado (`index-GbKHGnnc.js`).

---

### [04/09/2026] Refinamento da Matriz de Risco 5x5, Formulário de Riscos & Emissão de Laudos

1. **Reorganização Estrutural da Modal de Riscos (`RiskFormModal.tsx` & `Matrix5x5Selector.tsx`):**
   - Realocação dos campos *Prioridade de Ação* e *Diretriz de Controle (NR-01.5.5)* da base da Matriz 5x5 para a **Seção 5: Recomendações & Medidas Propostas**, agrupando todas as definições de plano de ação no mesmo local.
   - Estruturação dos campos do plano de ação em 2 linhas perfeitamente simétricas (50% de largura cada):
     - **Linha 1:** *Prioridade de Ação* (esquerda) | *Responsável pela Ação* (direita, integrado com o botão "Puxar Responsável");
     - **Linha 2:** *Prazo Inicial (Início)* (esquerda) | *Prazo Final (Término / Limite)* (direita).
   - Ajuste nos rótulos e espaçamentos evitando quebras inadequadas de texto.

2. **Padronização do Rótulo de Medidas Propostas nos Laudos:**
   - Atualização nos geradores oficial de PDF (`pdf-generator.ts`) e Word (`docx-generator.ts`):
     - Rótulo alterado de *"Medidas de Controle Propostas:"* para **"Recomendações:"** nos cartões de risco APR-HO.

3. **Alinhamento 100% Idêntico da Matriz 5x5 do Laudo com a Matriz do Sistema:**
   - **Capítulo 10 do PGR (`src/lib/pgr-default-sections.ts` - `sec-10`):**
     - **Tabela 2 (Probabilidade):** Ajustada para refletir exatamente os graus da escala do sistema (1 - Raríssima, 2 - Pouco Provável, 3 - Provável / Ocasional, 4 - Frequente, 5 - Muito Frequente / Certa).
     - **Tabela 3 (Severidade):** Alinhada às definições do sistema (5 - Catastrófica / Fatal, 4 - Crítica / Severa, 3 - Moderada / Grave, 2 - Menor / Moderada, 1 - Leve / Desprezível).
     - **Tabela 4 (Matriz de Risco 5x5):** Invertidos os eixos para ficarem idênticos ao seletor interativo:
       - **Colunas:** Probabilidade `P1` a `P5` (Raríssima até Muito Frequente / Certa);
       - **Linhas:** Severidade de cima para baixo `S5` a `S1` (Catastrófica até Leve / Desprezível);
       - **Células:** Pontuação com badge de classificação normativa idêntica ao sistema: `(TRI)`, `(TOL)`, `(MOD)`, `(SUB)` e `(INT)`.
     - **Tabela 5 e Tabela 6:** Diretrizes e prioridades alinhadas com as faixas normativas da NR-01.
   - **Motores de Renderização e Exportação (`pdf-generator.ts`, `docx-generator.ts` e `markdown-renderer.tsx`):**
     - Suporte nativo e cores oficiais para cada badge da matriz (`TRI` verde-esmeralda, `TOL` verde-limão, `MOD` âmbar, `SUB` laranja, `INT` vermelho-rose).
     - Alinhamento refinado com colunas da matriz perfeitamente dimensionadas.
   - **Mecanismo de Auto-Migração (`pgr-template-resolver.ts`):**
     - Adicionado gatilho de migração que atualiza automaticamente qualquer documento com modelo em cache para a nova matriz 5x5.

5. **Alinhamento das 5 Classificações Normativas na Tabela 5 do Laudo:**
   - **Cabeçalho:** Alterado de *"Nível de Risco"* para **"Classificação"**, espelhando o rótulo do sistema.
   - **Estruturação em 5 Resultados Oficiais da Matriz 5x5:**
     - `15 a 25`: **Intolerável / Crítico** (Risco crítico, interrupção imediata / emergencial);
     - `10 a 16`: **Substancial / Alto** (Risco significativo, ação prioritária e mitigação prévia);
     - `5 a 9`: **Moderado / Médio** (Risco moderado, plano de ação corretivo e melhoria contínua);
     - `3 a 4`: **Tolerável / Baixo** (Risco tolerável, monitoramento periódico da eficácia);
     - `1 a 2`: **Trivial / Muito Baixo** (Risco trivial, manutenção dos controles existentes sem ação adicional).
   - **Tabela 6 (Priorização das Ações):** Sincronizada com as 5 classificações e faixas de pontuação correspondentes.
   - **Renderização e Cores:**
     - Badges em destaque na web (`markdown-renderer.tsx`), no PDF oficial (`pdf-generator.ts`) e no Word (`docx-generator.ts`), mantendo os campos de texto explicativo (Significado e Diretriz) limpos e perfeitamente legíveis.
   - **Auto-migração:** Atualizado gatilho em `pgr-template-resolver.ts` para carregar a nova Tabela 5 automaticamente.

6. **Ajuste nas Assinaturas do Laudo (Termo de Encerramento - Cap. 16):**
   - **Elaborador:** Exibição clara e padronizada do CREA (`docData.header.techRespCouncil`) diretamente abaixo do nome do responsável técnico SST.
   - **Representante da Empresa:** Substituição do nome do responsável legal pela **Razão Social** da empresa (`company.name`) e inclusão do **CNPJ** formatado (`CNPJ: XX.XXX.XXX/XXXX-XX`).
   - Aplicado em todas as saídas: Visualizador Web (`PgrViewerPage.tsx`), Laudo PDF Oficial (`pdf-generator.ts`) e Documento Word (`docx-generator.ts`).

7. **Ajuste no Plano de Ação - Metas com Recomendações e Exclusão de "Não há exposição" (Cap. 15):**
   - **Coluna "Metas":** Passou a trazer fielmente as **Recomendações técnicas** / medidas de controle propostas cadastradas no risco (`recommendations`), ao invés de exibir prefixos genéricos com nomes de perigos/agentes (como `Mitigação de Agente: ...`).
   - **Exclusão de Registros Sem Exposição:** Removidas do plano de ação quaisquer tarefas associadas a "Não há exposição" ou "Não se Aplica", mantendo a tabela de metas estritamente focada nas ações que demandam intervenção.
   - **Criação Automática no Contexto (`PgrContext.tsx`):** Prevenção automática de criação de tarefas 5W2H para riscos sem exposição, e geração da meta com a recomendação técnica direta.
   - Aplicado de forma homogênea no template unificado (`pgr-official-template.ts`), no visualizador Web (`PgrViewerPage.tsx`), no gerador PDF (`pdf-generator.ts`) e no Word DOCX (`docx-generator.ts`).

8. **Padronização das Tabelas Sem Exposição / Não se Aplica (Inventário APR-HO):**
   - **Cabeçalho Unificado:** Quando um perigo/categoria for marcado como "Não há exposição / Não se Aplica", a tabela passa a manter o cabeçalho idêntico às demais tabelas normais de risco, com as 3 colunas padrão:
     - Coluna 1: Código do GHE e Data (`GES-01 APR-HO - DD/MM/AAAA`);
     - Coluna 2: `IDENTIFICAÇÃO DO PERIGO / FATOR DE RISCO`;
     - Coluna 3: `RISCO [CATEGORIA]` com o badge e a cor normativa oficial (Químico, Físico, Biológico, Ergonômico, Acidentes).
   - **Linha de Baixo com Informações de Não se Aplica:** As informações de ausência de exposição são renderizadas logo abaixo do cabeçalho de forma limpa e estruturada:
     - `Agente: Não há exposição / Não se Aplica   |   Condição: NAP (Processos operacionais do setor)`.
   - **Consistência Total:** Implementado de forma homogênea no Laudo PDF Oficial (`pdf-generator.ts`), no Documento Word (`docx-generator.ts`) e no Visualizador Web (`PgrViewerPage.tsx`).

9. **Padronização das Fontes e Textos da Geração de Documentos em Preto Sólido (100% Black):**
   - **Solicitação do Usuário:** *"ajuste todo o texto da geração do documento em preto"*.
   - **Gerador PDF Oficial (`src/lib/pdf-generator.ts`):**
     - Todas as chamadas `doc.setTextColor(...)` e definições de cor de texto das tabelas (`textColor: [r, g, b]`) que utilizavam tons de cinza/slate (`[15, 23, 42]`, `[30, 41, 59]`, `[51, 65, 85]`, `[71, 85, 105]`, `[100, 116, 139]`) foram atualizadas para preto sólido puro `[0, 0, 0]`.
     - Capa institucional, cabeçalhos de capítulos, índice analítico, dados cadastrais, informações dos responsáveis técnicos, textos de fundamentação técnica, inventário de riscos APR-HO, descrições de atividades, plano de ação e rodapés foram convertidos para preto 100%.
     - Cabeçalhos de tabelas passam a usar fundo cinza claro (`[226, 232, 240]`) com texto em preto sólido (`textColor: [0, 0, 0]`).
     - Badges de categorias com fundo escuro/colorido (ex: Vermelho, Verde, Azul, Amarelo) mantêm alto contraste e legibilidade.
   - **Gerador Word (.docx) Oficial (`src/lib/docx-generator.ts`):**
     - Estilo padrão do documento Word configurado com `run: { color: '000000' }`.
     - O utilitário de conversão de texto e markdown `parseTextToTextRuns` atualizado para emitir `color: '000000'`.
     - Todos os textos de seções, cabeçalhos, cargos, descrições de atividades, notas de inventário e plano de ação convertidos para `'000000'`.

10. **Ajuste de Espaçamento e Respiro no Topo da Capa Institucional:**
    - **Solicitação do Usuário:** *"na capa, de um respiro maior entre o logo da empresa e o topo da pagina, mantenha o conteudo da capa como está, apenas de um respiro maior"*.
    - **Gerador PDF Oficial (`src/lib/pdf-generator.ts`):**
      - Aumentado o recuo do logotipo do topo da capa de `y = 16mm` para `y = 28mm` (respiro de 16mm em relação à faixa superior e 28mm da borda física da página A4).
      - Rebalanceamento proporcional de todos os elementos subsequentes da capa (títulos, logo do cliente, dados cadastrais e caixa técnica), mantendo 100% do conteúdo original intacto com harmonia visual.
    - **Gerador Word (.docx) Oficial (`src/lib/docx-generator.ts`):**
      - Aumentado o espaçamento superior antes do logotipo na capa (`spacing: { before: 600 }`).
    - **Visualizador Web (`src/pages/PgrViewerPage.tsx`):**
      - Adicionado preenchimento superior (`pt-4 sm:pt-6`) na capa formal, conferindo maior respiro visual.

11. **Remoção da Linha "ART / RRT Vinculada" na Geração do Documento (Cap. 4):**
    - **Solicitação do Usuário:** *"retire a linha "ART / RRT Vinculada" da geração do documento"*.
    - **Gerador PDF Oficial (`src/lib/pdf-generator.ts`):**
      - Removida a linha `ART / RRT Vinculada` da tabela da Seção 4 (*Responsável Técnico pela Elaboração do PGR*).
    - **Gerador Word (.docx) Oficial (`src/lib/docx-generator.ts`):**
      - Removido o item `• Número da ART / RRT` e simplificado o cabeçalho para *Responsável Técnico pela Elaboração do PGR*.
    - **Visualizador Web (`src/pages/PgrViewerPage.tsx`):**
      - Removida a exibição de `• Número da ART / RRT` no card da Seção 4.

12. **Suporte Completo e Correção da Renderização de Negrito (**bold**) na Geração de Documentos (PDF, DOCX e Web):**
    - **Solicitação do Usuário:** *"por algum motivo os texto ainda não estão ficando em negrito na geração, preciso que ajuste isso"*.
    - **Causa Raiz Identificada:**
      - No gerador PDF (`pdf-generator.ts`), a função de renderização `renderMarkdownParagraphToPdf` tratava o texto como string única com `doc.setFont('helvetica', 'normal')`, sem suporte a palavras ou spans inline em negrito (`**texto**`).
      - Expressões regulares de detecção de títulos e subtítulos (`10.1. CONCEITOS GERAIS`, `CABE AO EMPREGADOR:`, `Tabela 1 – ...`, etc.) falhavam quando o usuário ou o template incluía asteriscos `**` no início/fim da linha.
      - Células de tabelas markdown com `**` tinham os asteriscos removidos sem aplicar `fontStyle = 'bold'` no motor do PDF (`jspdf-autotable`).
      - Na Seção 14 (APR-HO), a linha *"Descrição da Atividade:"* era renderizada em fonte normal e sem formatação inline.
    - **Solução Implementada no Gerador PDF Oficial (`src/lib/pdf-generator.ts`):**
      - Desenvolvimento de motor de quebra e medição tipográfica precisa (`parseParagraphToWords` e `PdfWord`): quebra o parágrafo em palavras preservando spans de negrito (`**`, `<b>`, `<strong>`), calcula as larguras exatas em milímetros para fontes normal e negrito no jsPDF e faz o alinhamento **JUSTIFICADO** nativo palavra a palavra com espaçamento harmônico e margem direita cravada em 196mm.
      - Detecção aprimorada de títulos, subtítulos e alíneas: suporte a numeração de seções (`(\d+\.)+`), cabeçalhos especiais (`CABE AO EMPREGADOR:`, `Tabela X`), títulos em maiúsculas e linhas destacadas em negrito (`**Título**`), renderizados em `helvetica bold` tamanho 8.5pt.
      - Suporte a negrito em células de tabelas markdown: verificação de `**` no conteúdo original da célula no hook `didParseCell` do `autoTable`, aplicando `fontStyle = 'bold'`.
      - Na Seção 14: aplicação de `**Descrição da Atividade:**` em negrito com suporte inline a termos destacados da descrição de funções.
    - **Solução Implementada no Gerador Word (.docx) Oficial (`src/lib/docx-generator.ts`):**
      - Normalização de tags HTML (`<b>`, `<strong>`) para markdown em `parseTextToTextRuns`.
      - Renderização estruturada de blocos de texto, identificando subtítulos, listas (`•`) e alíneas (`a)`, `b)`) com títulos em negrito tamanho 19pt.
      - Na Seção 14: definição explícita de `**Descrição da Atividade:**` em negrito.
    - **Solução no Visualizador Web (`src/lib/markdown-renderer.tsx`):**
      - Sincronização da detecção de subtítulos e alíneas para exibir títulos em negrito (`font-bold`) e suporte a tags `<b>` e `<strong>` inline.

13. **Build & Deploy:**
    - Verificação de tipos TypeScript e build de produção Vite concluídos com sucesso.
    - Sincronização e deploy contínuo enviados para a branch `main` do GitHub / Vercel.

14. **Suporte e Botão de Seleção para Prazo "Contínuo" no Inventário de Riscos e Plano de Ação (NR-01.5.5):**
    - **Solicitação do Usuário:** Inclusão de um botão seletor de prazo "Contínuo" no card de Prioridade, Prazos & Responsável do Plano de Ação, propagando a informação para todo o sistema e documentos gerados.
    - **Modal de Inventário de Riscos (`RiskFormModal.tsx`):**
      - Adicionado botão interativo com ícone de infinito (`InfinityIcon`) no cabeçalho do card: `Definir como Contínuo` / `✓ Prazo Contínuo`.
      - Alternância dinâmica: ao ativar, os inputs de tipo `date` são substituídos por campos informativos estilizados com o badge e valor `"Contínuo"` e atalho para retorno à data fixa.
      - Ao salvar o risco, a ação vinculada é salva com `startDate: 'Contínuo'` e `whenDate: 'Contínuo'` no Firestore e no estado local.
    - **Modal do Plano de Ação 5W2H (`ActionPlanModal.tsx`):**
      - Adicionado suporte idêntico com o botão `Definir como Contínuo` na modal direta do Plano de Ação.
      - Validação de formulário flexibilizada para aceitar `"Contínuo"` sem requerer formato ISO `YYYY-MM-DD`.
    - **Inteligência Anti-Atraso & Formatação (`PgrContext.tsx`, `ActionPlanTable.tsx`, `ActionPlanKanban.tsx`, `ActionPlanOverview.tsx`, `utils.ts`):**
      - Ações marcadas como contínuas não são contabilizadas como atrasadas (`delayedActions`).
      - A função `formatDate` trata variações (`continuo`, `contínuo`, `Contínuo`) retornando `"Contínuo"` padronizado.
      - Na tabela do Plano de Ação, o intervalo de datas é exibido de forma limpa como `"Contínuo"` (ao invés de duplicar `"Contínuo - Contínuo"`).
    - **Exportações e Visualizadores (PDF, DOCX, Excel e Web):**
      - No Laudo PDF Oficial (`pdf-generator.ts`): colunas de Prazo Inicial e Prazo Final renderizam `"Contínuo"`.
      - No Documento Word (`docx-generator.ts`): tabela do Plano de Ação 5W2H renderiza `"Contínuo"`.
      - Na Planilha Excel (`excel-generator.ts`): exportação padronizada via `formatDate`.
      - No Editor do PGR (`PgrBuilderPage.tsx`) e Visualizador (`PgrViewerPage.tsx`): renderização limpa do prazo contínuo.

