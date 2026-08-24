# HISTÓRICO DE DESENVOLVIMENTO - SISTEMA PGR

Este arquivo registra cronologicamente todas as etapas, decisões, funcionalidades implementadas e marcos do projeto do **Sistema PGR** (Programa de Gerenciamento de Riscos - NR-01).

---

## 📌 Linha do Tempo

### [2026-08-24] - Inicialização do Projeto & Definição de Diretrizes
- **Definição de Stack:** React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Lucide React, Supabase (PostgreSQL, RLS).
- **Criação de Documentos Base:**
  - `REGRAS.md`: Regras de negócio da NR-01 (Inventário de Riscos, Plano de Ação, Matriz 5x5, Hierarquia Organizacional) e diretrizes técnicas.
  - `HISTORICO.md`: Registro de histórico de evolução do projeto.
- **Estruturação do Plano de Implementação:** Planejamento da arquitetura de dados (PostgreSQL/Supabase) e scaffolding do Frontend com shadcn/ui.

### [2026-08-24] - Implementação Completa do Sistema PGR (NR-01)
- **1. Arquitetura & Scaffolding:**
  - Configuração do Vite + TypeScript + Tailwind CSS com suporte a aliases (`@/*`).
  - Instalação e customização da suite de componentes **shadcn/ui** (Button, Card, Table, Input, Label, Textarea, Dialog, Select, Badge, Switch, Tabs, Progress, Separator, Avatar, Alert, DropdownMenu).
  - Configuração do cliente Supabase (`src/lib/supabase.ts`) com suporte híbrido (Online via Supabase API / Offline LocalStorage).

- **2. Modelagem do Banco de Dados (PostgreSQL / Supabase):**
  - Criação do script `supabase/schema.sql` com 11 tabelas estruturadas e integridade referencial:
    - `companies`, `establishments`, `sectors`, `positions`, `ghes`, `professionals`, `hazards_catalog`, `pgr_documents`, `risk_inventory`, `action_plans`, `environmental_measurements`.
  - Habilitação de **Row Level Security (RLS)** em 100% das tabelas.

- **3. Módulo 1: Visão Geral (Dashboard Executivo):**
  - KPIs em tempo real (Trabalhadores Protegidos, Perigos Mapeados, Riscos Críticos, Ações 5W2H, Taxa de Conclusão e Investimento Total).
  - Mapa de Calor interativo da Matriz de Risco 5x5.
  - Gráfico de barras com distribuição pelos 5 grupos ocupacionais (Físicos, Químicos, Biológicos, Ergonômicos, Acidentes).
  - Resumo de tarefas e prazos do Plano de Ação com alertas visuais de atraso.

- **4. Módulo 2: Estrutura Organizacional & Cadastros:**
  - Cadastro de Empresas com CNAE, enquadramento de Grau de Risco (NR-04) e representante legal.
  - Cadastro de Estabelecimentos, Unidades, Filiais e Canteiros de Obras.
  - Cadastro de Setores e Ambientes com caracterização física (Piso, Parede, Teto, Ventilação e Iluminação).
  - Cadastro de Cargos com CBO e discriminação de atividades rotineiras e não rotineiras.
  - Cadastro de Grupos Homogêneos de Exposição (GHE).
  - Cadastro de Profissionais Técnicos (Engenheiro de Segurança, Médico do Trabalho, Técnico de Segurança) com conselho de classe e ART/RRT.

- **5. Módulo 3: Inventário de Riscos Ocupacionais (NR-01.5.7):**
  - Catálogo pré-carregado com perigos de acordo com as NRs brasileiras e eSocial Tabela 24.
  - Seletor e calculador interativo da **Matriz de Risco 5x5** (Probabilidade x Severidade = 1 a 25) com gradação automática (Trivial, Tolerável, Moderado, Substancial, Intolerável) e prazos normativos.
  - Gestão de EPCs, Medidas Administrativas e EPIs com CA e validade.
  - Registro de avaliações quantitativas ambientais (NHO / Fundacentro).

- **6. Módulo 4: Plano de Ação & Cronograma (NR-01.5.5 - 5W2H):**
  - Visualização em **Tabela 5W2H** (O que, Por que, Onde, Quem, Quando, Como, Custo).
  - Visualização em **Quadro Kanban Ágil** (Não Iniciadas, Em Andamento, Concluídas).
  - Módulo de acompanhamento do ciclo PDCA e verificação técnica de eficácia.

- **7. Módulo 5: Emissão e Exportação do Documento PGR em PDF:**
  - Gerador oficial em PDF (`src/lib/pdf-generator.ts`) com capa institucional, dados cadastrais da empresa e unidade, metodologia da NR-01, inventário estruturado, cronograma de ações e termos de responsabilidade com assinaturas.
  - Visualizador interativo na tela (`/documentos-pgr/:id`) com impressão direta.

- **8. Validação & Build:**
  - TypeScript compilado com 0 erros (`tsc -b`).
  - Build de produção do Vite gerado com sucesso.

### [2026-08-24] - Provisionamento do NOVO Projeto Dedicado no Supabase (`sistema-pgr`)
- Liberação do slot e criação do **novo projeto exclusivo no Supabase**:
  - **Nome:** `sistema-pgr`
  - **Project ID:** `sdtprjzrzcyjzvwkxqzz`
  - **URL da API:** `https://sdtprjzrzcyjzvwkxqzz.supabase.co`
  - **Região:** `sa-east-1` (São Paulo, Brasil)
- Aplicação das migrações com as 11 tabelas com Row Level Security (RLS).
- Atualização do `.env` e reinicialização do servidor de desenvolvimento.

### [2026-08-24] - Publicação do Repositório no GitHub
- Criação e envio de todo o código fonte para o repositório público:
  - **Repositório:** [https://github.com/Rodolfo-UXDEV/sistema-pgr](https://github.com/Rodolfo-UXDEV/sistema-pgr)
  - **Branch Principal:** `main`
  - **Documentação:** `README.md`, `REGRAS.md`, `HISTORICO.md` e `PLANO_DE_TESTES.md`.
