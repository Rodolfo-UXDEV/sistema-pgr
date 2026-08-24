import React, { useState } from 'react';
import { usePgr } from '@/context/PgrContext';
import { HazardItem, HazardCategory } from '@/types/pgr';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { HAZARD_CATEGORY_CONFIG } from '@/lib/risk-matrix';
import { AlertTriangle, Plus, Search, ShieldCheck } from 'lucide-react';

export const HazardCatalogPage: React.FC = () => {
  const { hazards, addHazard } = usePgr();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<HazardCategory>('FISICO');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [possibleDamages, setPossibleDamages] = useState('');
  const [suggestedEpc, setSuggestedEpc] = useState('');
  const [suggestedEpi, setSuggestedEpi] = useState('');
  const [suggestedAdminMeasures, setSuggestedAdminMeasures] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredHazards = hazards.filter((h) => {
    if (selectedCategory !== 'ALL' && h.category !== selectedCategory) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      return (
        h.name.toLowerCase().includes(term) ||
        h.code.toLowerCase().includes(term) ||
        h.description.toLowerCase().includes(term) ||
        h.possibleDamages.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !possibleDamages.trim()) {
      alert('Nome e danos à saúde são obrigatórios.');
      return;
    }

    setIsSaving(true);
    try {
      await addHazard({
        category,
        code: code.trim() || '09.99.999',
        name: name.trim(),
        description: description.trim() || 'Perigo cadastrado pelo usuário',
        possibleDamages: possibleDamages.trim(),
        suggestedEpc: suggestedEpc.trim() || undefined,
        suggestedEpi: suggestedEpi.trim() || undefined,
        suggestedAdminMeasures: suggestedAdminMeasures.trim() || undefined,
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar no catálogo de perigos.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Catálogo Mestre de Perigos (eSocial / NR-01)
            </h1>
            <Badge variant="outline" className="text-xs">
              {hazards.length} Perigos Pré-Cadastrados
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Biblioteca referencial de agentes físicos, químicos, biológicos, ergonômicos e acidentais com medidas de controle sugeridas.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setName('');
            setCode('09.01.001');
            setDescription('');
            setPossibleDamages('');
            setSuggestedEpc('');
            setSuggestedEpi('');
            setSuggestedAdminMeasures('');
            setIsModalOpen(true);
          }}
          className="h-9 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Perigo Personalizado</span>
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código eSocial, nome do agente ou lesão..."
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="FISICO">Agentes Físicos</option>
            <option value="QUIMICO">Agentes Químicos</option>
            <option value="BIOLOGICO">Agentes Biológicos</option>
            <option value="ERGONOMICO">Fatores Ergonômicos</option>
            <option value="ACIDENTE">Riscos de Acidentes / Mecânicos</option>
          </select>
        </div>
      </div>

      {/* Tabela do Catálogo */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código eSocial</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Perigo / Fator de Risco</TableHead>
              <TableHead>Possíveis Lesões / Danos</TableHead>
              <TableHead>Medidas Sugeridas (EPC / EPI)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHazards.map((hazard) => {
              const catConfig = HAZARD_CATEGORY_CONFIG[hazard.category];

              return (
                <TableRow key={hazard.id}>
                  <TableCell className="font-mono text-xs font-bold text-foreground">
                    {hazard.code}
                  </TableCell>

                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] font-semibold"
                      style={{ color: catConfig.color }}
                    >
                      {catConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex flex-col">
                      <span>{hazard.name}</span>
                      <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">{hazard.description}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground max-w-[280px]">
                    {hazard.possibleDamages}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground max-w-[280px] space-y-0.5">
                    {hazard.suggestedEpc && (
                      <div><strong className="text-foreground">EPC:</strong> {hazard.suggestedEpc}</div>
                    )}
                    {hazard.suggestedEpi && (
                      <div><strong className="text-foreground">EPI:</strong> {hazard.suggestedEpi}</div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Adicionar Perigo ao Catálogo</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Cadastre um perigo personalizado para reutilização em qualquer inventário de riscos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Grupo de Risco Ocupacional</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as HazardCategory)}
                    className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-ring font-medium"
                  >
                    <option value="FISICO">Físico</option>
                    <option value="QUIMICO">Químico</option>
                    <option value="BIOLOGICO">Biológico</option>
                    <option value="ERGONOMICO">Ergonômico</option>
                    <option value="ACIDENTE">Acidente / Mecânico</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Código eSocial (Tabela 24)</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Ex: 01.01.001"
                    className="h-9 mt-1 text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Nome do Perigo / Fator de Risco *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Prensagem em prensa excêntrica"
                    required
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Descrição Técnica do Perigo</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhes operacionais e circunstâncias..."
                    className="mt-1 text-xs min-h-[50px]"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-xs">Possíveis Danos e Lesões à Saúde *</Label>
                  <Textarea
                    value={possibleDamages}
                    onChange={(e) => setPossibleDamages(e.target.value)}
                    placeholder="Ex: Amputação traumática de membros, fraturas..."
                    required
                    className="mt-1 text-xs min-h-[50px]"
                  />
                </div>

                <div>
                  <Label className="text-xs">EPC Sugerido</Label>
                  <Input
                    value={suggestedEpc}
                    onChange={(e) => setSuggestedEpc(e.target.value)}
                    placeholder="Ex: Cortina de luz de segurança"
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">EPI Sugerido</Label>
                  <Input
                    value={suggestedEpi}
                    onChange={(e) => setSuggestedEpi(e.target.value)}
                    placeholder="Ex: Óculos de proteção ampla visão"
                    className="h-9 mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving} className="font-semibold shadow-sm">
                  {isSaving ? 'Salvando...' : 'Adicionar ao Catálogo'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
