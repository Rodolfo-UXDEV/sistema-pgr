import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Upload, 
  Trash2, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Image as ImageIcon,
  ShieldCheck,
  Award,
  Globe,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye
} from 'lucide-react';
import { 
  getIssuerCompanyConfig, 
  saveIssuerCompanyConfig, 
  fetchIssuerCompanyFromFirestore, 
  DEFAULT_ISSUER_COMPANY 
} from '@/lib/issuer-company-service';
import { IssuerCompanyConfig } from '@/types/pgr';

export const IssuerCompanyPage: React.FC = () => {
  const [config, setConfig] = useState<IssuerCompanyConfig>(getIssuerCompanyConfig());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Sincroniza do Firestore se houver versão mais recente
    fetchIssuerCompanyFromFirestore().then((cloudData) => {
      if (cloudData) {
        setConfig(cloudData);
      }
    });
  }, []);

  const handleSave = async () => {
    await saveIssuerCompanyConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar os dados para o padrão original da ES Engenharia de Segurança?')) {
      setConfig(DEFAULT_ISSUER_COMPANY);
      saveIssuerCompanyConfig(DEFAULT_ISSUER_COMPANY);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('O tamanho da imagem não deve exceder 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setConfig(prev => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleLogoUpload(file);
  };

  const handleRemoveLogo = () => {
    setConfig(prev => ({ ...prev, logoUrl: '' }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* BARRA SUPERIOR DE AÇÕES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs sticky top-0 z-10 backdrop-blur-md bg-card/90">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Empresa Emissora do PGR & Logotipo
            </h1>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
              Consultoria SST / Elaboradora
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure os dados cadastrais, registro profissional e o logotipo da empresa que elabora e assina os documentos do PGR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-9"
            title="Restaurar padrão inicial da ES Engenharia"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restaurar Padrão</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white h-9 shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaved ? '✓ Configurações Salvas!' : 'Salvar Alterações'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUNA ESQUERDA: LOGOTIPO & PREVIEW DA CAPA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card de Upload do Logo */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Logotipo da Consultoria SST
              </CardTitle>
              <CardDescription className="text-xs">
                Este logo será exibido na capa oficial, cabeçalhos de PDF, Word e no visualizador do PGR.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.logoUrl ? (
                <div className="space-y-3">
                  <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-center min-h-[140px] relative group overflow-hidden">
                    <img 
                      src={config.logoUrl} 
                      alt="Logo da Consultoria Emissora" 
                      className="max-h-24 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 text-xs gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Trocar Logotipo
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRemoveLogo}
                      className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                      title="Remover Logotipo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                    isDragging 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20' 
                      : 'border-muted-foreground/30 hover:border-emerald-500/70 hover:bg-muted/40'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">
                      Clique ou arraste o logotipo aqui
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      PNG transparente, JPG ou SVG (Máx 5MB)
                    </span>
                  </div>
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/png,image/jpeg,image/svg+xml,image/webp" 
                className="hidden" 
              />
            </CardContent>
          </Card>

          {/* Card de Preview da Capa */}
          <Card className="border-border shadow-xs bg-muted/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Simulação da Capa Oficial do PGR
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="border border-border bg-card rounded-xl p-5 text-center space-y-4 shadow-2xs">
                {config.logoUrl ? (
                  <div className="flex justify-center">
                    <img src={config.logoUrl} alt="Logo" className="h-12 object-contain" />
                  </div>
                ) : (
                  <div className="h-10 border border-dashed border-border rounded-lg flex items-center justify-center text-[10px] text-muted-foreground uppercase font-mono">
                    Sem Logo Cadastrado
                  </div>
                )}

                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
                    {config.name || 'ES Engenharia de Segurança do Trabalho LTDA.'}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {config.registrationCouncil || 'CREA-SP: 01.194.103'}
                  </p>
                </div>

                <div className="border-t border-border pt-3 space-y-1">
                  <p className="text-xs font-extrabold text-foreground tracking-tight">
                    PROGRAMA DE GERENCIAMENTO DE RISCOS
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">
                    PGR / GRO — NR-01
                  </p>
                </div>

                <div className="border-t border-border/60 pt-2 text-[10px] text-muted-foreground flex justify-between">
                  <span>{config.address.city}/{config.address.state}</span>
                  <span>{config.phone || '(11) 4496-4320'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO DE DADOS DA EMPRESA EMISSORA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dados Jurídicos & Institucionais */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Dados Jurídicos da Empresa Emissora / Consultoria
              </CardTitle>
              <CardDescription className="text-xs">
                Informações da entidade ou consultoria de engenharia e medicina ocupacional responsável técnica.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="issuer-name" className="text-xs font-semibold">
                    Razão Social da Consultoria / Emissora *
                  </Label>
                  <Input
                    id="issuer-name"
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: ES Engenharia de Segurança do Trabalho LTDA."
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issuer-trade" className="text-xs font-semibold">
                    Nome Fantasia
                  </Label>
                  <Input
                    id="issuer-trade"
                    value={config.tradeName || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, tradeName: e.target.value }))}
                    placeholder="Ex: ES Engenharia & Consultoria SST"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="issuer-cnpj" className="text-xs font-semibold">
                    CNPJ da Empresa Emissora
                  </Label>
                  <Input
                    id="issuer-cnpj"
                    value={config.cnpj}
                    onChange={(e) => setConfig(prev => ({ ...prev, cnpj: e.target.value }))}
                    placeholder="00.000.000/0001-00"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="issuer-council" className="text-xs font-semibold">
                    Registro Profissional / CREA da Empresa Consultoria *
                  </Label>
                  <Input
                    id="issuer-council"
                    value={config.registrationCouncil}
                    onChange={(e) => setConfig(prev => ({ ...prev, registrationCouncil: e.target.value }))}
                    placeholder="Ex: CREA-SP: 01.194.103"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço & Contatos */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Endereço & Contatos Oficiais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Logradouro / Avenida / Rua</Label>
                  <Input
                    value={config.address.street}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, street: e.target.value } }))}
                    placeholder="Ex: Av. Paulista"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Número</Label>
                  <Input
                    value={config.address.number}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, number: e.target.value } }))}
                    placeholder="Ex: 1000"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Complemento / Sala</Label>
                  <Input
                    value={config.address.complement || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, complement: e.target.value } }))}
                    placeholder="Ex: Andar 10, Sala 102"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Bairro</Label>
                  <Input
                    value={config.address.neighborhood}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, neighborhood: e.target.value } }))}
                    placeholder="Ex: Bela Vista"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">CEP</Label>
                  <Input
                    value={config.address.zipCode}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, zipCode: e.target.value } }))}
                    placeholder="00000-000"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Cidade</Label>
                  <Input
                    value={config.address.city}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, city: e.target.value } }))}
                    placeholder="Ex: São Paulo"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">UF</Label>
                  <Input
                    value={config.address.state}
                    onChange={(e) => setConfig(prev => ({ ...prev, address: { ...prev.address, state: e.target.value } }))}
                    placeholder="SP"
                    maxLength={2}
                    className="text-xs uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Telefone Principal</Label>
                  <Input
                    value={config.phone || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 4496-4320"
                    className="text-xs"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">E-mail de Contato</Label>
                  <Input
                    value={config.email || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@esengenharia.com.br"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Website</Label>
                  <Input
                    value={config.website || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="www.esengenharia.com.br"
                    className="text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável Técnico Titular da Consultoria */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-600" />
                Responsável Técnico Titular da Emissora
              </CardTitle>
              <CardDescription className="text-xs">
                Profissional legalmente habilitado responsável pelas diretrizes técnicas da consultoria.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nome do Engenheiro / RT</Label>
                  <Input
                    value={config.technicalManager?.name || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      technicalManager: { ...prev.technicalManager!, name: e.target.value } 
                    }))}
                    placeholder="Ex: Fernando Guimarães Ferrari"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Habilitação Técnica / Cargo</Label>
                  <Input
                    value={config.technicalManager?.role || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      technicalManager: { ...prev.technicalManager!, role: e.target.value } 
                    }))}
                    placeholder="Ex: Engenheiro de Segurança do Trabalho"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Registro de Classe (CREA/CRM)</Label>
                  <Input
                    value={config.technicalManager?.council || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      technicalManager: { ...prev.technicalManager!, council: e.target.value } 
                    }))}
                    placeholder="Ex: CREA-SP: 5.060.011.940"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">CPF do Responsável Técnico</Label>
                  <Input
                    value={config.technicalManager?.cpf || ''}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      technicalManager: { ...prev.technicalManager!, cpf: e.target.value } 
                    }))}
                    placeholder="000.000.000-00"
                    className="text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
