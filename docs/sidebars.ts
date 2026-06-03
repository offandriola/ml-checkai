import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'guia-instalacao',
    {
      type: 'category',
      label: 'Arquitetura',
      items: [
        'arquitetura/visao-geral',
        'arquitetura/frontend',
        'arquitetura/backend',
        'arquitetura/banco-de-dados',
        'arquitetura/docker',
      ],
    },
    {
      type: 'category',
      label: 'Modelo de ML',
      items: [
        'modelo-ml/pipeline-dados',
        'modelo-ml/treinamento',
        'modelo-ml/nli',
        'modelo-ml/decisor-veredito',
      ],
    },
    {
      type: 'category',
      label: 'API',
      items: [
        'api/endpoints',
        'api/autenticacao',
        'api/fluxo-verificacao',
        'api/seguranca',
      ],
    },
    {
      type: 'category',
      label: 'Testes',
      items: [
        'testes/como-testar',
        'testes/testes-backend',
      ],
    },
    'contribuindo',
    'glossario',
  ],
};

export default sidebars;
