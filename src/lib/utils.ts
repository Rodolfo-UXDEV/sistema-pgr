import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

export function maskCNPJ(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return digits.replace(/^(\d{2})(\d+)/, "$1.$2");
  if (digits.length <= 8) return digits.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  if (digits.length <= 12) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)/, "$1.$2.$3/$4");
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, "$1.$2.$3/$4-$5");
}

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return cep;
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return "-";
  if (typeof dateString === "string") {
    const lower = dateString.toLowerCase().trim();
    if (lower === "continuo" || lower === "contínuo" || lower.includes("continuo") || lower.includes("contínuo")) {
      return "Contínuo";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [y, m, d] = dateString.split("-");
      return `${d}/${m}/${y}`;
    }
  }
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return typeof dateString === "string" ? dateString : "-";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function generateId(): string {
  return "id-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now().toString(36);
}

export function formatExposureRegime(expPart: string, obs?: string): string {
  if (!obs || !obs.trim()) return expPart;
  const trimmed = obs.trim();
  const lowerObs = trimmed.toLowerCase();
  const lowerExp = expPart.toLowerCase();

  // Se a observação já começar com o regime (ex: "Intermitente - 2 vezes ao mês" ou "Intermitente: 2x ao mês")
  if (lowerObs.startsWith(lowerExp)) {
    return trimmed;
  }

  // Se começar com traço ou hífen (ex: "- 2 vezes ao mês")
  if (trimmed.startsWith('-') || trimmed.startsWith('–') || trimmed.startsWith('—')) {
    return `${expPart} ${trimmed}`;
  }

  // Se expPart for 'NAP', retorna a própria observação
  if (expPart === 'NAP') {
    return trimmed;
  }

  // Padrão: "Intermitente - 2 vezes ao mês"
  return `${expPart} - ${trimmed}`;
}

export function getExposureParts(exposureType: string, exposureObservation?: string): { expPart1: string; expPart2: string } {
  let expPart1 = 'Habitual';
  let expPart2 = 'Permanente';

  if (exposureType === 'HABITUAL_INTERMITENTE') {
    expPart1 = 'Habitual';
    expPart2 = 'Intermitente';
  } else if (exposureType === 'EVENTUAL_INTERMITENTE') {
    expPart1 = 'Eventual';
    expPart2 = 'Intermitente';
  } else if (exposureType === 'EVENTUAL') {
    expPart1 = 'Eventual';
    expPart2 = 'NAP';
  } else if (exposureType === 'HABITUAL') {
    expPart1 = 'Habitual';
    expPart2 = 'NAP';
  } else if (exposureType === 'PERMANENTE') {
    expPart1 = 'NAP';
    expPart2 = 'Permanente';
  } else if (exposureType === 'INTERMITENTE') {
    expPart1 = 'NAP';
    expPart2 = 'Intermitente';
  }

  if (exposureObservation && exposureObservation.trim()) {
    // Se expPart2 for diferente de NAP, o detalhamento/frequência se aplica preferencialmente a expPart2 (ex: "Intermitente - 2 vezes ao mês")
    if (expPart2 !== 'NAP') {
      expPart2 = formatExposureRegime(expPart2, exposureObservation);
    } else {
      // Se expPart2 for NAP, aplica a expPart1 (ex: "Eventual - 2 vezes ao mês")
      expPart1 = formatExposureRegime(expPart1, exposureObservation);
    }
  }

  return { expPart1, expPart2 };
}

