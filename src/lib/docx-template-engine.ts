import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';
import { PgrDocumentContext } from '@/lib/pgr-official-template';
import { formatCNPJ, formatDate } from '@/lib/utils';

export async function generatePgrFromMasterTemplate(ctx: PgrDocumentContext): Promise<void> {
  const { company, establishment, professionals, pgr } = ctx;

  const techResp = professionals.find(p => p.id === pgr.technicalResponsibleId) || professionals[0];

  // Carrega o template Word original
  const response = await fetch('/templates/pgr_template_master.docx');
  if (!response.ok) {
    throw new Error(`Não foi possível carregar o template Word (/templates/pgr_template_master.docx). Status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = new PizZip(arrayBuffer);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{', end: '}' },
  });

  const fullAddress = `${company.address.street}, ${company.address.number} ${company.address.complement || ''} - ${company.address.neighborhood}, ${company.address.city}/${company.address.state} - CEP: ${company.address.zipCode}`;
  const estAddress = establishment 
    ? `${establishment.address.street}, ${establishment.address.number} - ${establishment.address.city}/${establishment.address.state}`
    : fullAddress;

  const data = {
    RAZAO_SOCIAL: company.name,
    NOME_FANTASIA: company.tradeName || company.name,
    CNPJ: formatCNPJ(company.cnpj),
    ENDERECO_MATRIZ: fullAddress,
    TELEFONE: company.phone || '-',
    ESTABELECIMENTO_NOME: establishment ? `${establishment.name} (${establishment.code})` : 'Unidade Matriz',
    ESTABELECIMENTO_ENDERECO: estAddress,
    RAMO_ATIVIDADE: company.cnaeDescription || 'Atividades industriais e comerciais',
    CNAE: company.cnae,
    CNAE_DESCRICAO: company.cnaeDescription,
    GRAU_RISCO: String(company.riskGrade),
    REPRESENTANTE_LEGAL: `${company.legalRepresentative} (${company.representativeRole})`,
    CARGO_REPRESENTANTE: company.representativeRole,
    TOTAL_TRABALHADORES: `${company.employeeCount} colaboradores`,
    RESPONSAVEL_TECNICO: techResp ? techResp.name : 'Engenheiro de Segurança do Trabalho',
    NUMERO_CONSELHO_RT: techResp ? `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState}` : 'CREA',
    REGISTRO_CONSELHO_RT: techResp ? `${techResp.registrationCouncil}: ${techResp.registrationNumber}/${techResp.registrationState} (ART: ${techResp.artRrt || 'Emitida'})` : 'CREA Habilitado',
    CPF_RT: techResp?.email || techResp?.phone || '-',
    ART_RT: techResp?.artRrt || 'ART Emitida',
    CODIGO_PGR: pgr.code,
    VERSAO_PGR: pgr.version,
    DATA_ELABORACAO: formatDate(pgr.elaborationDate),
    ANO_VIGENCIA: String(pgr.year),
    VIGENCIA_INICIO: formatDate(pgr.validityStart),
    VIGENCIA_FIM: formatDate(pgr.validityEnd),
  };

  doc.render(data);

  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  const cleanName = company.name.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `PGR_${cleanName}_${pgr.year}_OFICIAL.docx`;
  saveAs(out, filename);
}
