# REGRAS DO PROJETO - SISTEMA PGR (PROGRAMA DE GERENCIAMENTO DE RISCOS)

Este documento estabelece as diretrizes, padrões de desenvolvimento, arquitetura de software e regras de negócio para a construção do **Sistema PGR**, em conformidade com a Norma Regulamentadora nº 01 (**NR-01** - Disposições Gerais e Gerenciamento de Riscos Ocupacionais).

---

## 1. STACK TECNOLÓGICA E DIRETRIZES TÉCNICAS

### 1.1 Frontend
- **Framework / Bundler:** React (TypeScript) com Vite.
- **Estilização & Componentes:** Tailwind CSS com **shadcn/ui** (baseado em Radix UI).
- **Ícones:** Lucide React (`lucide-react`).
- **Gerenciamento de Estado & Requisições:** TanStack Query (`@tanstack/react-query`) para caching e sincronização de dados assíncronos.
- **Roteamento:** React Router DOM (`react-router-dom`).
- **Formulários & Validação:** React Hook Form (`react-hook-form`) integrado com Zod (`zod`) para schemas estritos de validação.
- **Exportação de Documentos:** Geração de relatórios em PDF com suporte a cabeçalho, rodapé, numeração de páginas e formatação técnica oficial.
- **Qualidade de Código:** TypeScript strict mode, ESLint e Prettier padronizados.

### 1.2 Backend & Banco de Dados (Google Firebase / Cloud Firestore)
- **Banco de Dados:** Google Cloud Firestore (SDK Modular v12).
- **Persistência em Tempo Real:** Sincronização automática para coleções estruturadas (`companies`, `establishments`, `sectors`, `positions`, `ghes`, `professionals`, `pgr_documents`, `risk_inventory`, `action_plans`, `pgr_templates`, `pgr_document_sections`).
- **Segurança & Higiene:** Sanitização via `cleanForFirestore` e exclusão em cascata real e imediata no Firestore para prevenir dados órfãos.
- **Modelagem & Integridade:** Manutenção de integridade entre entidades pais e filhas, isolamento estrito por empresa e estabelecimento ativo.

---

## 2. REGRAS DE NEGÓCIO DO SISTEMA PGR (NR-01)

### 2.1 Estrutura Organizacional
1. **Multi-empresa / Multi-estabelecimento:** O sistema deve suportar múltiplas empresas (Razão Social, CNPJ, CNAE, Grau de Risco, Endereço, Responsável Legal).
2. **Hierarquia Operacional:**
   $$\text{Empresa} \longrightarrow \text{Estabelecimento/Unidade} \longrightarrow \text{Setor/Ambiente} \longrightarrow \text{Cargo/Função} \longrightarrow \text{GES (Grupo de Exposição Similar)}$$
3. **Profissionais Responsáveis:** Cadastro dos responsáveis técnicos pela elaboração do PGR (Engenheiro de Segurança com CREA/ART, Técnico de Segurança com Registro MTE, Médico do Trabalho com CRM/RQE).

### 2.2 Inventário de Riscos Ocupacionais (NR-01.5.7)
1. **Categorização de Riscos:**
   - **Físicos** (Ruído, Calor, Vibração, Radiação, etc.)
   - **Químicos** (Poeiras, Fumos, Gases, Vapores, Névoas, etc.)
   - **Biológicos** (Vírus, Bactérias, Fungos, Parasitas, etc.)
   - **Ergonômicos** (Levantamento de peso, Postura inadequada, Trabalho repetitivo, etc.)
   - **Acidentes / Mecânicos** (Máquinas desprotegidas, Queda de nível, Eletricidade, etc.)
2. **Identificação do Perigo / Fator de Risco:**
   - Fonte geradora ou circunstância.
   - Trabalhadores expostos (quantidade, cargos, GES, EMR - Exposto de Maior Risco).
   - Possíveis lesões ou agravos à saúde.
   - Tipo de exposição (contínua, intermitente, eventual).
   - Prioridade de Ação (Baixa, Média, Alta).
3. **Avaliação e Gradação de Risco (Matriz de Risco):**
   - **Probabilidade (1 a 5):** Mede a chance de ocorrência considerando a eficácia das medidas de controle existentes.
   - **Severidade / Gravidade (1 a 5):** Mede a consequência potencial das lesões/danos.
   - **Nível de Risco:** $\text{Risco} = \text{Severidade} \times \text{Probabilidade}$ (ou Matriz 5x5 categorizada em: *Trivial, Tolerável, Moderado, Substancial, Crítico/Intolerável*).
4. **Medidas de Prevenção Existentes:**
   - Registro de proteções coletivas (EPC), medidas administrativas e proteções individuais (EPI com Certificado de Aprovação - CA e data de validade).

### 2.3 Plano de Ação (NR-01.5.5)
1. Para cada risco avaliado com necessidade de controle, deve ser gerado pelo menos um plano de ação (Metodologia 5W2H: O quê, Por que, Onde, Quem, Quando, Como, Quanto).
2. **Cronograma e Acompanhamento:** Status das ações (*Não Iniciada, Em Andamento, Concluída, Atrasada, Cancelada*), data limite, responsável e evidência de conclusão.
3. **Verificação de Eficácia:** Avaliação pós-implementação para verificar se o risco residual foi reduzido ao nível aceitável.

### 2.4 Ciclo de Vida e Versionamento do PGR
1. O PGR deve ter status de versão: *Rascunho (Draft), Em Revisão, Aprovado/Vigente, Histórico/Arquivado*.
2. Toda revisão deve registrar número de versão, data, responsável pela alteração e motivo da revisão (ex.: revisão periódica bianual, alteração de layout/processo, após acidente de trabalho grave, novas exigências legais).
3. O documento assinado/aprovado deve ficar congelado para garantir integridade jurídica.

---

## 3. PADRÕES DE DESENVOLVIMENTO & PROCESSO

### 3.1 Padrão de Commits e Histórico
- Todo marco de entrega deve ser documentado no arquivo `HISTORICO.md`.
- Commits atômicos e mensagens descritivas em português ou inglês convencional (`feat:`, `fix:`, `refactor:`, `docs:`).

### 3.2 UI/UX e Acessibilidade
- Design profissional, moderno, limpo e intuitivo (estilo SaaS B2B moderno).
- Suporte a modo claro / escuro se desejado, priorizando contraste e leitura de tabelas densas e matrizes de risco com cores padronizadas (Verde, Amarelo, Laranja, Vermelho).
- Responsividade com foco em Desktop e Tablets para inspeções de campo.

### 3.3 Execução de Testes (Regra Mandatória)
- **REGRA OBRIGATÓRIA:** SÓ execute testes (automatizados, scripts Puppeteer, testes de interface ou testes manuais) se o usuário SOLICITAR explicitamente. NÃO execute rotinas ou scripts de teste automaticamente sem pedido prévio do usuário.

### 3.4 Análise e Adequação do Banco de Dados
- **REGRA OBRIGATÓRIA:** Sempre que o usuário solicitar qualquer ajuste de telas, campos ou regras de negócio, analise proativamente se há necessidade de adequações no banco de dados / modelos de dados e realize as devidas alterações estruturais.

### 3.5 Registro Mandatório no HISTORICO.md
- **REGRA OBRIGATÓRIA:** Registre SEMPRE todo o avanço, histórico de alterações, decisões arquiteturais e melhorias implementadas no arquivo `HISTORICO.md` na raiz do projeto. Nenhuma entrega ou sessão de trabalho deve ser finalizada sem a atualização correspondente no `HISTORICO.md`.
