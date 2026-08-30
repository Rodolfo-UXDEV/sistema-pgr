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

