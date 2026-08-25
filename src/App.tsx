import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PgrProvider } from '@/context/PgrContext';
import { AppLayout } from '@/components/layout/AppLayout';

import { DashboardPage } from '@/pages/DashboardPage';
import { RiskInventoryPage } from '@/pages/RiskInventoryPage';
import { ActionPlansPage } from '@/pages/ActionPlansPage';
import { PgrDocumentsPage } from '@/pages/PgrDocumentsPage';
import { PgrViewerPage } from '@/pages/PgrViewerPage';
import { PgrBuilderPage } from '@/pages/PgrBuilderPage';
import { GlobalPgrTemplatePage } from '@/pages/GlobalPgrTemplatePage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { EstablishmentsPage } from '@/pages/EstablishmentsPage';
import { SectorsPage } from '@/pages/SectorsPage';
import { PositionsPage } from '@/pages/PositionsPage';
import { GhesPage } from '@/pages/GhesPage';
import { ProfessionalsPage } from '@/pages/ProfessionalsPage';
import { HazardCatalogPage } from '@/pages/HazardCatalogPage';
import { DatabaseSettingsPage } from '@/pages/DatabaseSettingsPage';

export function App() {
  return (
    <PgrProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventario" element={<RiskInventoryPage />} />
            <Route path="plano-de-acao" element={<ActionPlansPage />} />
            <Route path="documentos-pgr" element={<PgrDocumentsPage />} />
            <Route path="documentos-pgr/:id" element={<PgrViewerPage />} />
            <Route path="documentos-pgr/:id/montagem" element={<PgrBuilderPage />} />
            
            {/* Estrutura Organizacional */}
            <Route path="empresas" element={<CompaniesPage />} />
            <Route path="estabelecimentos" element={<EstablishmentsPage />} />
            <Route path="setores" element={<SectorsPage />} />
            <Route path="cargos" element={<PositionsPage />} />
            <Route path="ghes" element={<GhesPage />} />
            <Route path="profissionais" element={<ProfessionalsPage />} />
            
            {/* Apoio e Configurações */}
            <Route path="modelo-base-pgr" element={<GlobalPgrTemplatePage />} />
            <Route path="catalogo-perigos" element={<HazardCatalogPage />} />
            <Route path="config-banco" element={<DatabaseSettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PgrProvider>
  );
}

export default App;
