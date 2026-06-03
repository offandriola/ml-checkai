import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'CheckAI',
  tagline: 'Plataforma de verificação de fake news com Machine Learning',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://offandriola.github.io',
  baseUrl: '/ml-checkai/',

  organizationName: 'offandriola',
  projectName: 'ml-checkai',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/offandriola/ml-checkai/tree/main/docs/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/checkai-social-card.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CheckAI',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentação',
        },
        {
          href: 'https://github.com/offandriola/ml-checkai',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentação',
          items: [
            {label: 'Introdução', to: '/docs/intro'},
            {label: 'Arquitetura', to: '/docs/arquitetura/visao-geral'},
            {label: 'Guia de Instalação', to: '/docs/guia-instalacao'},
          ],
        },
        {
          title: 'Projeto',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/offandriola/ml-checkai',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CheckAI — Projeto de TCC (UNICID). Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'yaml', 'docker'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
