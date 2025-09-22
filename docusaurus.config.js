// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Documentation | Hikube',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.hikube.cloud',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'HidoraSwiss', // Usually your GitHub org/user name.
  projectName: 'hikube-public-doc', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: true,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // Set this value to '/'.
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://gitlab.hidora/hikube/documentation-hikube/-/tree/main',
          // Configuration du versioning
          includeCurrentVersion: false,
          lastVersion: '1.0',
          versions: {
            '1.0': {
              label: '1.0.0 (Stable)',
              path: '/',
              banner: 'none',
            },
            '2.0': {
              label: '2.0.0 (Future)',
              path: '/2.0',
              banner: 'unreleased',
            },
          },
        },
        blog: false,
        
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/hikube-social-card.svg',
      navbar: {
        logo: {
          alt: 'Hikube Logo',
          src: 'img/logo_whitemode.svg',
          srcDark: 'img/logo_darkmode.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            type: 'docsVersionDropdown',
            position: 'left',
            dropdownActiveClassDisabled: true,
            dropdownItemsAfter: [
              {
                to: '/versions',
                label: 'Toutes les versions',
              },
            ],
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://hikube.cloud',
            label: 'Hikube',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'API',
                to: '/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Linkedin',
                href: 'https://www.linkedin.com/company/hidora',
              },
              {
                label: 'X',
                href: 'https://x.com/HidoraSwiss',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Hikube',
                href: 'https://hikube.cloud',
              },
              {
                label: 'Hidora',
                href: 'https://hidora.io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hidora`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'yaml', 'hcl', 'json'],
      },
    }),
};

export default config;