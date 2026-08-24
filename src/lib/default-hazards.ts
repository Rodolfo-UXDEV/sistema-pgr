import { HazardItem } from '@/types/pgr';

export const DEFAULT_HAZARDS: HazardItem[] = [
  // FÍSICOS
  {
    id: 'haz-fis-01',
    category: 'FISICO',
    code: '01.01.001',
    name: 'Ruído Contínuo ou Intermitente',
    description: 'Exposição a níveis de pressão sonora elevados decorrentes de máquinas, motores, ferramentas e processos operacionais.',
    possibleDamages: 'Perda Auditiva Induzida por Ruído (PAIR), estresse, cefaleia, fadiga, hipertensão e perda de concentração.',
    suggestedEpc: 'Enclausuramento acústico de máquinas, barreiras acústicas, manutenção preventiva e substituição de equipamentos ruidosos.',
    suggestedEpi: 'Protetor auditivo tipo concha ou inserção (plug) com atenuação NRRsf compatível.',
    suggestedAdminMeasures: 'Pausa programada, revezamento de postos de trabalho, exames audiométricos periódicos (PCA).'
  },
  {
    id: 'haz-fis-02',
    category: 'FISICO',
    code: '01.01.018',
    name: 'Calor / Sobrecarga Térmica',
    description: 'Exposição a ambientes quentes decorrentes de fornos, caldeiras ou exposição direta a radiação solar em atividades a céu aberto.',
    possibleDamages: 'Desidratação, fadiga térmica, cãibras, choque térmico (insolação/intermação) e síncope por calor.',
    suggestedEpc: 'Ventilação forçada, exaustão localizada, isolamento térmico de fontes quentes e áreas de sombra.',
    suggestedEpi: 'Vestimentas térmicas reflexivas, óculos com proteção UV, chapéu legionário/árabe.',
    suggestedAdminMeasures: 'Disponibilização irrestrita de água fresca/isotônicos, regime de pausas térmicas conforme NR-09/NR-15.'
  },
  {
    id: 'haz-fis-03',
    category: 'FISICO',
    code: '01.01.021',
    name: 'Vibração de Corpo Inteiro (VCI)',
    description: 'Vibrações mecânicas transmitidas ao corpo através do assento ou piso em operação de tratores, caminhões pesados e empilhadeiras.',
    possibleDamages: 'Lombalgias, degeneração da coluna vertebral, distúrbios osteoarticulares e circulatórios.',
    suggestedEpc: 'Assentos pneumáticos amortecidos, manutenção de suspensão e nivelamento de pistas de tráfego.',
    suggestedEpi: 'Calçados com solado absorvedor de impacto.',
    suggestedAdminMeasures: 'Revezamento de operadores, limitação de jornada contínua em máquinas pesadas.'
  },
  {
    id: 'haz-fis-04',
    category: 'FISICO',
    code: '01.01.022',
    name: 'Vibração de Mãos e Braços (VMB)',
    description: 'Vibrações transmitidas às mãos através de marteletes, motosserras, lixadeiras e britadeiras.',
    possibleDamages: 'Síndrome de Raynaud (dedo branco), distúrbios neuromusculares e osteoartrite das mãos e punhos.',
    suggestedEpc: 'Ferramentas antivibratórias, balanceamento de discos e manutenção periódica.',
    suggestedEpi: 'Luvas antivibratórias certificadas com CA.',
    suggestedAdminMeasures: 'Pausas frequentes, aquecimento das mãos, redução do tempo de pega contínua.'
  },
  {
    id: 'haz-fis-05',
    category: 'FISICO',
    code: '01.01.025',
    name: 'Radiação Não Ionizante (UV / Solda / Solar)',
    description: 'Emissão de radiação ultravioleta em processos de solda elétrica ou trabalho externo sob luz solar direta.',
    possibleDamages: 'Queimaduras de pele, queratoconjuntivite actínica, envelhecimento precoce e câncer de pele.',
    suggestedEpc: 'Biombos e cortinas de proteção contra radiação de soldagem.',
    suggestedEpi: 'Máscara de solda com lente adequada, óculos de segurança com filtro UV, protetor solar FPS 50+, mangotes de raspa.',
    suggestedAdminMeasures: 'Evitar pico de insolação solar (10h às 15h), sinalização de áreas de solda.'
  },

  // QUÍMICOS
  {
    id: 'haz-qui-01',
    category: 'QUIMICO',
    code: '02.01.001',
    name: 'Poeiras Minerais (Sílica Livre Cristalizada)',
    description: 'Inalação de particulado gerado em cortes de cerâmica, mármore, concreto, jateamento ou escavações.',
    possibleDamages: 'Silicose pulmonar, fibrose pulmonar irreversível, DPOC e câncer de pulmão.',
    suggestedEpc: 'Corte úmido de materiais, sistemas de exaustão localizada e confinamento de processos.',
    suggestedEpi: 'Respirador PFF2 / PFF3 ou peça semifacial com filtro classe P3.',
    suggestedAdminMeasures: 'Monitoramento quantitativo periódico, treinamento sobre higiene respiratória, proibição de varrição a seco.'
  },
  {
    id: 'haz-qui-02',
    category: 'QUIMICO',
    code: '02.01.010',
    name: 'Fumos Metálicos (Soldagem / Oxicorte)',
    description: 'Vapores condensados de óxidos metálicos (ferro, manganês, cromo, níquel) gerados em processos térmicos.',
    possibleDamages: 'Febre dos fumos metálicos, bronquite crônica, intoxicação por manganês (parkinsonismo) e irritação ocular.',
    suggestedEpc: 'Braços articulados de exaustão localizada na fonte de solda.',
    suggestedEpi: 'Respirador semifacial com filtro combinado para fumos metálicos (PFF2/P2) e vapores.',
    suggestedAdminMeasures: 'Exames periódicos específicos, higienização dos postos.'
  },
  {
    id: 'haz-qui-03',
    category: 'QUIMICO',
    code: '02.01.025',
    name: 'Vapores Orgânicos e Solventes (Tintas, Thinner, Tolueno)',
    description: 'Emissão de compostos orgânicos voláteis em pintura, desengraxe, colagem e limpeza de peças.',
    possibleDamages: 'Depressão do sistema nervoso central, tonturas, dermatites de contato, hepatotoxicidade e nefrotoxicidade.',
    suggestedEpc: 'Cabines de pintura com cortina d’água ou filtros secos e ventilação exaustora.',
    suggestedEpi: 'Respirador com cartucho químico para vapores orgânicos, luvas de borracha nitrílica ou neoprene, avental impermeável.',
    suggestedAdminMeasures: 'Controle de FISPQ (Ficha de Informações de Segurança de Produtos Químicos), treinamento de manuseio seguro.'
  },

  // BIOLÓGICOS
  {
    id: 'haz-bio-01',
    category: 'BIOLOGICO',
    code: '03.01.001',
    name: 'Micro-organismos Patogênicos (Bactérias, Vírus e Fungos)',
    description: 'Contato com fluidos biológicos, sangue, secreções ou resíduos de saúde em serviços de atendimento e limpeza hospitalar.',
    possibleDamages: 'Hepatites B e C, HIV, infecções respiratórias, tuberculose e infecções bacterianas graves.',
    suggestedEpc: 'Caixas de descarte de perfurocortantes (Descarpack), autoclaves e cabines de fluxo laminar.',
    suggestedEpi: 'Luvas de procedimento cirúrgico/nitrílicas, avental impermeável, máscara N95/PFF2 e óculos ampla visão.',
    suggestedAdminMeasures: 'Programa de imunização ocupacional (Hepatite B, Tétano, etc.), protocolo pós-exposição a material biológico.'
  },
  {
    id: 'haz-bio-02',
    category: 'BIOLOGICO',
    code: '03.01.005',
    name: 'Esgoto, Resíduos Urbanos e Vetores',
    description: 'Manuseio e coleta de lixo urbano, manutenção de redes de esgoto e limpeza de sanitários públicos.',
    possibleDamages: 'Leptospirose, tétano, gastroenterites, parasitoses e micoses cutâneas.',
    suggestedEpc: 'Uso de ferramentas adequadas de coleta mecanizada e contentores lacrados.',
    suggestedEpi: 'Luvas de PVC/borracha cano longo, botas impermeáveis com biqueira, uniforme de alta visibilidade impermeável.',
    suggestedAdminMeasures: 'Vacinação em dia, locais adequados para higienização e banho ao final do turno.'
  },

  // ERGONÔMICOS
  {
    id: 'haz-erg-01',
    category: 'ERGONOMICO',
    code: '04.01.001',
    name: 'Levantamento e Transporte Manual de Cargas',
    description: 'Içamento, transporte e descarga manual de sacarias, caixas pesadas e materiais sem auxílio mecânico.',
    possibleDamages: 'Lombalgias agudas e crônicas, hérnias de disco, distensões musculares e sobrecarga articular.',
    suggestedEpc: 'Talhas, pontes rolantes, carrinhos hidráulicos, mesas pantográficas e esteiras transportadoras.',
    suggestedEpi: 'Cinto ergonômico lombar (quando prescrito) e luvas com aderência (pigmentadas).',
    suggestedAdminMeasures: 'Treinamento de postura para movimentação manual de cargas, limitação de peso máximo (conforme NR-17).'
  },
  {
    id: 'haz-erg-02',
    category: 'ERGONOMICO',
    code: '04.01.005',
    name: 'Movimentos Repetitivos dos Membros Superiores',
    description: 'Atividades com ciclo curto e alta repetição: digitação contínua, montagem em linha de produção, corte e empacotamento.',
    possibleDamages: 'LER/DORT, tendinites, tenossinovites, síndrome do túnel do carpo e epicondilite.',
    suggestedEpc: 'Postos de trabalho ergonômicos ajustáveis, ferramentas elétricas e automação de etapas repetitivas.',
    suggestedEpi: 'Apoios de punho e almofadas ergonômicas.',
    suggestedAdminMeasures: 'Pausas ergonômicas ativas regulares, ginástica laboral e rodízio de funções.'
  },
  {
    id: 'haz-erg-03',
    category: 'ERGONOMICO',
    code: '04.01.010',
    name: 'Postura Estática e Inadequada (Em pé ou Sentado prolongado)',
    description: 'Manutenção de postura ortostática ou sentada por longas horas consecutivas sem suporte postural adequado.',
    possibleDamages: 'Fadiga muscular, problemas circulatórios (varizes), dores na coluna cervical e lombar.',
    suggestedEpc: 'Cadeiras ergonômicas reguláveis (NR-17), bancadas com regulagem de altura e tapetes antifadiga.',
    suggestedEpi: 'Calçados ergonômicos confortáveis.',
    suggestedAdminMeasures: 'Alternância entre postura sentada e em pé, incentivo à movimentação.'
  },

  // ACIDENTES / MECÂNICOS
  {
    id: 'haz-aci-01',
    category: 'ACIDENTE',
    code: '05.01.001',
    name: 'Trabalho em Altura (Queda com Diferença de Nível)',
    description: 'Atividades executadas acima de 2,00m do piso, sobre andaimes, escadas, plataformas ou telhados (NR-35).',
    possibleDamages: 'Politraumatismos graves, fraturas, traumatismo cranioencefálico (TCE) e óbito.',
    suggestedEpc: 'Guarda-corpos rígidos, linhas de vida horizontais/verticais certificadas, redes de proteção.',
    suggestedEpi: 'Cinturão de segurança tipo paraquedista com talabarte duplo com absorvedor de energia e trava-quedas.',
    suggestedAdminMeasures: 'Emissão de Permissão de Trabalho (PT), Análise Preliminar de Risco (APR), treinamento NR-35 e ASO com aptidão.'
  },
  {
    id: 'haz-aci-02',
    category: 'ACIDENTE',
    code: '05.01.005',
    name: 'Partes Móveis de Máquinas e Equipamentos Desprotegidas (NR-12)',
    description: 'Acesso a engrenagens, polias, correias, eixos giratórios, prensas e serras sem proteção física de segurança.',
    possibleDamages: 'Amputações, esmagamentos de membros, lacerações e mortes por aprisionamento mecânico.',
    suggestedEpc: 'Proteções fixas e móveis intertravadas com sensores de segurança categoria 4, cortinas de luz e botões de emergência.',
    suggestedEpi: 'Óculos de proteção, calçado de segurança com bico de composite/aço, luvas específicas (evitar em eixos rotativos).',
    suggestedAdminMeasures: 'Procedimento LOTO (Bloqueio e Etiquetagem de Energia), capacitação e reciclagem periódica NR-12.'
  },
  {
    id: 'haz-aci-03',
    category: 'ACIDENTE',
    code: '05.01.010',
    name: 'Choque Elétrico e Arco Elétrico (NR-10)',
    description: 'Intervenções em quadros de distribuição, subestações, fiações expostas ou equipamentos energizados.',
    possibleDamages: 'Fibrilação ventricular, parada cardiorrespiratória, queimaduras severas de 3º grau e morte.',
    suggestedEpc: 'Painéis blindados IP adequados, sistemas de aterramento elétrico, dispositivos DR (Diferencial Residual) e barreiras isolantes.',
    suggestedEpi: 'Vestimenta antichama ATPV, luvas de borracha isolantes com sobreluva de couro, calçado eletricista sem partes metálicas.',
    suggestedAdminMeasures: 'Desenergização prévia (regra dos 5 passos), emissão de PT, treinamento NR-10 Básico e SEP.'
  },
  {
    id: 'haz-aci-04',
    category: 'ACIDENTE',
    code: '05.01.015',
    name: 'Queda de Mesmo Nível (Tropeços e Escorregões)',
    description: 'Pisos escorregadios, molhados, oleosos, com desníveis, degraus sem sinalização ou cabos soltos no chão.',
    possibleDamages: 'Entorses, contusões, fraturas nos membros e escoriações.',
    suggestedEpc: 'Pisos antiderrapantes, canaletas embutidas para cabos, fitas antiderrapantes em degraus e boa iluminação.',
    suggestedEpi: 'Calçado de segurança com solado bidensidade antiderrapante (SRC).',
    suggestedAdminMeasures: 'Programa 5S (Organização e Limpeza), sinalização imediata de piso molhado durante higienização.'
  }
];
