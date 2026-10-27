// Template oficial do checklist de eventos medicos EMS.
// Alterar aqui NAO altera eventos ja criados: cada evento recebe uma copia (snapshot) no momento da criacao.
// Para mudar a lista de eventos futuros, edite os itens e incremente TEMPLATE_VERSAO.

export const TEMPLATE_VERSAO = 1;

export type Fase = "pre" | "dia" | "pos";

export const FASES: { key: Fase; titulo: string; subtitulo: string }[] = [
  { key: "pre", titulo: "Pré-evento", subtitulo: "Planejamento, speaker, fornecedores e materiais" },
  { key: "dia", titulo: "Dia do evento", subtitulo: "Conferências, execução, documentação e pagamento" },
  { key: "pos", titulo: "Pós-evento", subtitulo: "Prestação de contas e continuidade comercial" },
];

export type ItemTemplate = {
  key: string;
  fase: Fase;
  grupo: string;
  titulo: string;
  critico?: boolean; // ponto de controle obrigatorio
};

export const ITENS: ItemTemplate[] = [
  // ---------- PRE-EVENTO ----------
  { key: "pre-01", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Definir e confirmar speaker" },
  { key: "pre-02", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Alinhar fee do palestrante" },
  { key: "pre-03", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Confirmar data e horário" },
  { key: "pre-04", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Enviar materiais científicos para preparação da aula médica" },
  { key: "pre-05", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Verificar se o speaker necessita de algum recurso ou suporte adicional" },
  { key: "pre-06", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Validar com o speaker o convite, a fotografia e o minicurrículo" },
  { key: "pre-07", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Verificar e alinhar meios de deslocamento do speaker" },
  { key: "pre-08", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Preparar contrato do speaker para assinatura", critico: true },
  { key: "pre-09", fase: "pre", grupo: "Speaker e conteúdo científico", titulo: "Solicitar ao speaker que leve seu carimbo no dia do evento" },

  { key: "pre-10", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Definir e reservar o local do evento" },
  { key: "pre-11", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Negociar e confirmar valor total acordado", critico: true },
  { key: "pre-12", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Validar emissão de NF descritiva, sem bebidas alcoólicas", critico: true },
  { key: "pre-13", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Confirmar possibilidade de NF separada para refeição e locação/audiovisual" },
  { key: "pre-14", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Verificar se o cardápio inclui vinho ou outras bebidas alcoólicas e observar as políticas vigentes", critico: true },
  { key: "pre-15", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Validar cardápio e serviço contratado" },
  { key: "pre-16", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Confirmar disponibilidade de TV, telão, caixa de som, microfone e passador de slides" },
  { key: "pre-17", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Confirmar pagamento por cartão de crédito com inserção física" },
  { key: "pre-18", fase: "pre", grupo: "Local, infraestrutura e financeiro", titulo: "Verificar limite disponível do cartão: total, diário e mensal", critico: true },

  { key: "pre-19", fase: "pre", grupo: "Convites e Sympla", titulo: "Criar link do evento no Sympla" },
  { key: "pre-20", fase: "pre", grupo: "Convites e Sympla", titulo: "Preparar convite oficial" },
  { key: "pre-21", fase: "pre", grupo: "Convites e Sympla", titulo: "Realizar e acompanhar cadastros no Sympla" },
  { key: "pre-22", fase: "pre", grupo: "Convites e Sympla", titulo: "Validar lista de convidados, médicos e staffs" },
  { key: "pre-23", fase: "pre", grupo: "Convites e Sympla", titulo: "Compartilhar convite e orientações com a equipe" },

  // ---------- DIA DO EVENTO ----------
  { key: "dia-01", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Confirmar com o local que toda a estrutura e serviços estão prontos" },
  { key: "dia-02", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Confirmar com o speaker que está tudo certo para a apresentação" },
  { key: "dia-03", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Conferir cadastro de todos os médicos e staffs no Sympla" },
  { key: "dia-04", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Verificar presença do cartão corporativo", critico: true },
  { key: "dia-05", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Levar notebook e tablet carregados" },
  { key: "dia-06", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Conferir materiais: enxoval de mesa, banners, materiais científicos e AGs" },
  { key: "dia-07", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Levar contrato impresso do speaker", critico: true },
  { key: "dia-08", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Confirmar carimbo do speaker" },
  { key: "dia-09", fase: "dia", grupo: "Antes da chegada dos convidados", titulo: "Testar audiovisual e vídeo institucional de abertura da EMS" },

  { key: "dia-10", fase: "dia", grupo: "Durante o evento", titulo: "Recepcionar os convidados e realizar check-in no Sympla" },
  { key: "dia-11", fase: "dia", grupo: "Durante o evento", titulo: "Reconciliar participantes presentes com a lista de convidados", critico: true },
  { key: "dia-12", fase: "dia", grupo: "Durante o evento", titulo: "Exibir vídeo institucional da EMS" },
  { key: "dia-13", fase: "dia", grupo: "Durante o evento", titulo: "Realizar speech de abertura" },
  { key: "dia-14", fase: "dia", grupo: "Durante o evento", titulo: "Acompanhar conforto dos convidados e qualidade do serviço" },
  { key: "dia-15", fase: "dia", grupo: "Durante o evento", titulo: "Registrar fotos com timestamp das pessoas, speaker, alimentos e materiais gráficos, respeitando autorizações aplicáveis" },

  { key: "dia-16", fase: "dia", grupo: "Fechamento financeiro e documental", titulo: "Conferir cartão e limite antes do pagamento", critico: true },
  { key: "dia-17", fase: "dia", grupo: "Fechamento financeiro e documental", titulo: "Conferir número de pessoas atendidas versus valor acordado", critico: true },
  { key: "dia-18", fase: "dia", grupo: "Fechamento financeiro e documental", titulo: "Conferir a nota fiscal de acordo com as regras vigentes", critico: true },
  { key: "dia-19", fase: "dia", grupo: "Fechamento financeiro e documental", titulo: "Verificar descrição dos serviços, valores e segregação das despesas quando aplicável" },
  { key: "dia-20", fase: "dia", grupo: "Fechamento financeiro e documental", titulo: "Finalizar documentos e comprovantes necessários", critico: true },

  // ---------- POS-EVENTO ----------
  { key: "pos-01", fase: "pos", grupo: "Encerramento e follow-up", titulo: "Enviar aos representantes a lista dos médicos presentes" },
  { key: "pos-02", fase: "pos", grupo: "Encerramento e follow-up", titulo: "Orientar o impacto em consultório para reforço científico da marca e do evento" },
  { key: "pos-03", fase: "pos", grupo: "Encerramento e follow-up", titulo: "Verificar recebimento da lista de presença para prestação de contas", critico: true },
  { key: "pos-04", fase: "pos", grupo: "Encerramento e follow-up", titulo: "Realizar e finalizar RDV", critico: true },
  { key: "pos-05", fase: "pos", grupo: "Encerramento e follow-up", titulo: "Conferir pendências documentais e financeiras" },
];

// Orientacoes aos staffs: texto de repasse, nao e checklist.
export const ORIENTACOES_STAFF: { titulo: string; itens: string[] }[] = [
  {
    titulo: "Apresentação e pontualidade",
    itens: [
      "Roupa social corporativa, preferencialmente camisa da EMS quando disponível.",
      "Chegar ao local pelo menos 30 minutos antes do início.",
      "Levar tablet e celular carregados.",
    ],
  },
  {
    titulo: "Recepção e experiência médica",
    itens: [
      "Você é o anfitrião: receba ativamente cada convidado.",
      "No check-in, pergunte o nome e quem realizou o convite, e agradeça a presença.",
      "Monitore alimentação, bebidas, temperatura do ar-condicionado e conforto geral. O conforto e a experiência do médico são responsabilidade nossa.",
      "Observe e sinalize imediatamente qualquer falha na experiência do médico.",
    ],
  },
  {
    titulo: "Participação científica e relacionamento",
    itens: [
      "Acompanhe a aula com atenção e registre os insights relevantes.",
      "Compartilhe posteriormente com os colegas um resumo dos aprendizados.",
      "Durante o jantar, interaja com os médicos convidados.",
      "Evite formar grupos fechados somente com outros staffs.",
    ],
  },
];

export const SCRIPT_RECEPCAO =
  "Boa noite, doutor(a)! Seja bem-vindo(a). Poderia me informar seu nome e quem realizou o convite? Vou confirmar sua presença. Agradecemos por estar conosco e desejamos um excelente evento.";

export function textoOrientacoesParaCopiar(nomeEvento: string, data: string, local: string): string {
  const linhas: string[] = [];
  linhas.push(`ORIENTAÇÕES AOS STAFFS | ${nomeEvento}`);
  linhas.push(`${data} | ${local}`);
  linhas.push("");
  for (const bloco of ORIENTACOES_STAFF) {
    linhas.push(bloco.titulo.toUpperCase());
    for (const i of bloco.itens) linhas.push(`- ${i}`);
    linhas.push("");
  }
  linhas.push("PADRÃO DE RECEPÇÃO");
  linhas.push(`"${SCRIPT_RECEPCAO}"`);
  return linhas.join("\n");
}
