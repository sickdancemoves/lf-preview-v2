// Per-page metadata. Edit titles/descriptions here — build.js stitches them
// into each page's <head>. PT is the source language (Brazilian product).
//
// Canonical defaults to https://la-finteca.com; override with the BASE_URL
// env var when building for staging (e.g. BASE_URL=https://preview.la-finteca.com node build.js).

const BASE_URL = (process.env.BASE_URL || 'https://la-finteca.com').replace(/\/$/, '');

module.exports = {
  baseUrl: BASE_URL,
  defaultLang: 'pt',
  pages: [
    {
      name: 'home',
      route: '/',
      title: 'LaFinteca · Conta PJ para empresas no Brasil',
      description: 'Conta PJ regulada pelo Banco Central. TED, agendamentos e extratos auditáveis. Sem mensalidade, R$5 por TED.',
    },
    {
      name: 'contapj',
      route: '/contapj/',
      title: 'Conta PJ · LaFinteca',
      description: 'Conta PJ digital regulada pelo Banco Central. TED, agendamentos e extratos auditáveis. Sem mensalidade, R$5 por TED.',
    },
    {
      name: 'abrir-conta',
      route: '/abrir-conta/',
      title: 'Abrir Conta PJ · LaFinteca',
      description: 'Abra sua Conta PJ digital na LaFinteca. Preencha o cadastro e envie seus documentos para análise da nossa equipe.',
    },
    {
      name: 'about',
      route: '/about/',
      title: 'Sobre nós · LaFinteca',
      description: 'LaFinteca: instituição de pagamento autorizada pelo Banco Central do Brasil. TED, agendamentos e extratos auditáveis para empresas no Brasil.',
    },
    {
      name: 'faqs',
      route: '/faqs/',
      title: 'Perguntas frequentes · LaFinteca',
      description: 'Respostas sobre Conta PJ, tarifas, segurança e operações da LaFinteca.',
    },
    {
      name: 'contact',
      route: '/contact/',
      title: 'Contato · LaFinteca',
      description: 'Fale com a equipe da LaFinteca. Atendimento humano para empresas no Brasil.',
    },
    {
      name: 'politicas',
      route: '/politicas/',
      title: 'Centro de Políticas · LaFinteca',
      description: 'Documentos de governança, segurança e conformidade da LaFinteca, instituição de pagamento autorizada pelo Banco Central.',
    },
    {
      name: 'politicas/codigo-de-conduta',
      route: '/politicas/codigo-de-conduta/',
      title: 'Código de Conduta · LaFinteca',
      description: 'Princípios éticos e padrões de comportamento para todos os colaboradores da LaFinteca.',
    },
    {
      name: 'politicas/compliance',
      route: '/politicas/compliance/',
      title: 'Política de Compliance · LaFinteca',
      description: 'Diretrizes para garantir a conformidade da LaFinteca com as obrigações legais e regulatórias.',
    },
    {
      name: 'politicas/prevencao-fraude-corrupcao',
      route: '/politicas/prevencao-fraude-corrupcao/',
      title: 'Política de Prevenção à Fraude e à Corrupção · LaFinteca',
      description: 'Medidas para prevenir, detectar e combater atos de fraude e corrupção na LaFinteca.',
    },
    {
      name: 'politicas/privacidade-de-dados',
      route: '/politicas/privacidade-de-dados/',
      title: 'Política de Privacidade de Dados · LaFinteca',
      description: 'Como a LaFinteca coleta, utiliza e protege os dados pessoais dos seus usuários.',
    },
    {
      name: 'politicas/seguranca-da-informacao',
      route: '/politicas/seguranca-da-informacao/',
      title: 'Política de Segurança da Informação · LaFinteca',
      description: 'Diretrizes de proteção dos sistemas, redes e informações corporativas da LaFinteca.',
    },
    {
      name: 'politicas/ciberseguranca',
      route: '/politicas/ciberseguranca/',
      title: 'Política de Cibersegurança · LaFinteca',
      description: 'Diretrizes de cibersegurança da LaFinteca: controle contra malware, monitoramento, registro de eventos e gestão de riscos cibernéticos.',
    },
    {
      name: 'politicas/gestao-de-riscos',
      route: '/politicas/gestao-de-riscos/',
      title: 'Política de Gestão de Riscos · LaFinteca',
      description: 'Estrutura da LaFinteca para identificação, avaliação e mitigação dos riscos institucionais.',
    },
    {
      name: 'politicas/riscos-de-terceiros',
      route: '/politicas/riscos-de-terceiros/',
      title: 'Política de Gestão de Riscos de Terceiros · LaFinteca',
      description: 'Controles para avaliação e monitoramento de riscos associados a fornecedores e parceiros.',
    },
    {
      name: 'politicas/pld-cft',
      route: '/politicas/pld-cft/',
      title: 'Manual Operacional de PLD/CFT · LaFinteca',
      description: 'Procedimentos de prevenção à lavagem de dinheiro e ao financiamento do terrorismo na LaFinteca.',
    },
    {
      name: 'politicas/tabela-de-tarifas',
      route: '/politicas/tabela-de-tarifas/',
      title: 'Tabela Geral de Tarifas · LaFinteca',
      description: 'Tabela geral de tarifas dos serviços da LaFinteca: Conta PJ gratuita, TED e demais operações, conforme a Resolução 3.919 do Banco Central.',
    },
  ],
};
