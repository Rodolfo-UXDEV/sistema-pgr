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








