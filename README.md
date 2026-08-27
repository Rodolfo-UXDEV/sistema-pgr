# 🛡️ Sistema PGR - Programa de Gerenciamento de Riscos (NR-01)

Sistema web completo para elaboração, gestão, inventário de riscos com Matriz 5x5, plano de ação 5W2H e emissão de documentos formais do **Programa de Gerenciamento de Riscos (PGR)** em conformidade com a **Norma Regulamentadora nº 01 (NR-01)** do Ministério do Trabalho e Emprego.

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/)
- **Componentes & UI:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend & Banco de Dados:** [Google Firebase](https://firebase.google.com/) (Cloud Firestore em tempo real)
- **Geração de Documentos:** [jsPDF](https://github.com/parallax/jsPDF) + [docx](https://docx.js.org/)
- **Roteamento:** [React Router Dom v6](https://reactrouter.com/)

---

## ✨ Funcionalidades Principais

1. **Dashboard Executivo:**
   - KPIs de trabalhadores protegidos, riscos críticos e investimento em SST.
   - **Mapa de Calor da Matriz de Risco 5x5** interativo.
   - Gráfico de distribuição por grupos de risco (Físicos, Químicos, Biológicos, Ergonômicos e Acidentes).

2. **Inventário de Riscos Ocupacionais (NR-01.5.7):**
   - Catálogo pré-carregado com códigos da **Tabela 24 do eSocial**.
   - Seletor e cálculo dinâmico de **Probabilidade $\times$ Severidade (Score 1 a 25)**.
   - Gestão de **EPCs**, **Medidas Administrativas** e **EPIs com Certificado de Aprovação (CA)** e validade.
   - Registro de avaliações ambientais quantitativas (NHO / Fundacentro).

3. **Plano de Ação 5W2H & PDCA (NR-01.5.5):**
   - Visualização em **Tabela 5W2H** (O que, Por que, Onde, Quem, Quando, Como, Custo).
   - Visualização em **Quadro Kanban Ágil** (*Não Iniciadas, Em Andamento, Concluídas*).
   - Alertas visuais de prazos e módulo de **Verificação Técnica de Eficácia**.

4. **Emissão de Documentos & Exportação em Word e PDF:**
   - Visualizador formal do documento na tela.
   - Editor e montagem modular por seções com suporte a tabelas personalizadas.
   - Exportação em Word (.docx) e PDF diagramado de alta fidelidade com capa oficial, dados do empregador, metodologia, inventário consolidado e termos para assinaturas de ART/CREA/CRM.

5. **Estrutura Organizacional & Cadastros:**
   - Cadastro de Empresas (CNAE e Grau de Risco NR-04).
   - Unidades, Filiais e Canteiros de Obras.
   - Setores com características físicas (Piso, Paredes, Ventilação, Iluminação).
   - Cargos com CBO e discriminação de atividades rotineiras e não rotineiras.
   - Grupos Homogêneos de Exposição (GHE).
   - Profissionais Técnicos Habilitados (Engenheiro de Segurança, Médico do Trabalho, Técnico de Segurança).

---

## ⚡ Deploy na Vercel (1-Click Deploy)

O projeto já está configurado com `vercel.json` para suporte a rotas do React Router (SPA).

### Passo a passo para subir na Vercel:

1. Acesse o dashboard da **[Vercel](https://vercel.com/)** e clique em **"Add New... > Project"**.
2. Importe o repositório **`Rodolfo-UXDEV/sistema-pgr`**.
3. O build roda de forma automática com todas as credenciais do Firebase integradas.
4. Clique em **"Deploy"**.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- Node.js v18+ e npm

```bash
# Clone o repositório
git clone https://github.com/Rodolfo-UXDEV/sistema-pgr.git

# Acesse o diretório
cd sistema-pgr

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra seu navegador em: **`http://localhost:3000`**

---

## 🗄️ Estrutura do Banco de Dados (Cloud Firestore)

As 10 coleções do sistema (`companies`, `establishments`, `sectors`, `positions`, `ghes`, `professionals`, `hazards_catalog`, `pgr_documents`, `risk_inventory`, `action_plans`) contam com persistência nativa e sincronização em tempo real via Firebase Modular SDK.

---

## 📜 Licença

Distribuído sob a licença MIT.
