// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import {createRequire} from 'node:module';
import {
  createApiPageMD,
  createInfoPageMD,
} from 'docusaurus-plugin-openapi-docs/lib/markdown/index.js';

const require = createRequire(import.meta.url);

// URL de base de l'API publique Hikube. C'est le SEUL endroit où elle est
// définie : les pages la lisent via `customFields.hikubeApiUrl` (composant
// <HikubeApiUrl /> et <ApiEnv />), et la référence générée l'utilise comme
// serveur à la place du `host` déclaré par la spécification OpenAPI.
// api.hikube.cloud depuis la migration qui a sorti l'API Kubernetes de la
// plateforme de ce nom (passée en accès VPN) ; api.demo.hikube.cloud reste
// servi le temps de la transition.
const HIKUBE_API_URL = 'https://api.hikube.cloud';

// La surface publique s'appelle avec une clé d'API. La spécification déclare
// aussi le schéma OAuth2 de la session console : on ne l'affiche pas.
const onlyApiKeyScheme = (schemes) =>
  schemes && schemes.ApiKey ? {ApiKey: schemes.ApiKey} : schemes;

// Certaines descriptions de la spécification renvoient aux fichiers de valeurs
// d'un dépôt interne de la plateforme : on retire ces renvois des pages.
const INTERNAL_REF = /\s*See https:\/\/raw\.githubusercontent\.com\/\S+/g;
const stripInternalRefs = (node) => {
  if (Array.isArray(node)) {
    node.forEach(stripInternalRefs);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'description' && typeof value === 'string') {
        node[key] = value.replace(INTERNAL_REF, '');
      } else {
        stripInternalRefs(value);
      }
    }
  }
  return node;
};

/**
 * Coloration syntaxique « graphite » : les blocs de code gardent le fond
 * #14110e de hikube.cloud dans les deux thèmes. Toutes les teintes tiennent
 * au moins 4,5:1 sur ce fond.
 */
const hikubePrismTheme = {
  plain: {color: '#ded8d1', backgroundColor: '#14110e'},
  styles: [
    {types: ['comment', 'prolog', 'doctype', 'cdata'], style: {color: '#8f847a', fontStyle: 'italic'}},
    {types: ['punctuation', 'operator'], style: {color: '#a99e95'}},
    {types: ['atrule', 'attr-name', 'property', 'key', 'selector'], style: {color: '#7fd3a0'}},
    {types: ['keyword', 'important', 'rule'], style: {color: '#38ba6a'}},
    {types: ['string', 'char', 'attr-value', 'inserted', 'url', 'regex'], style: {color: '#e8b872'}},
    {types: ['number', 'boolean', 'constant', 'symbol'], style: {color: '#f39a6b'}},
    {types: ['function', 'class-name', 'builtin'], style: {color: '#8fbdf9'}},
    {types: ['tag', 'namespace'], style: {color: '#5ccdef'}},
    {types: ['variable', 'parameter', 'interpolation'], style: {color: '#c99cfa'}},
    {types: ['deleted'], style: {color: '#f57a52'}},
    {types: ['entity'], style: {color: '#e0a24f', cursor: 'help'}},
    {types: ['bold'], style: {fontWeight: 'bold'}},
    {types: ['italic'], style: {fontStyle: 'italic'}},
  ],
};

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Documentation | Hikube',
  favicon: 'img/favicon.svg',

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

  customFields: {
    hikubeApiUrl: HIKUBE_API_URL,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'it', 'de'],
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
            'https://github.com/HidoraSwiss/hikube-public-doc/edit/main/',
          editLocalizedFiles: true,
          // Requis par docusaurus-theme-openapi-docs pour les pages de la
          // référence API ; les autres pages gardent le rendu standard.
          docItemComponent: '@theme/ApiItem',
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'Changelog',
          blogDescription: 'Nouveautés et mises à jour de la plateforme Hikube',
          blogSidebarTitle: 'Releases récentes',
          blogSidebarCount: 10,
          feedOptions: {
            type: 'all',
            title: 'Hikube Changelog',
            description: 'Suivez les mises à jour de la plateforme Hikube',
          },
        },
        
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    // Les générateurs d'exemples de code du thème OpenAPI importent le module
    // Node `path`, que webpack 5 ne fournit plus côté navigateur.
    () => ({
      name: 'webpack-path-fallback',
      configureWebpack: () => ({
        resolve: {fallback: {path: require.resolve('path-browserify')}},
      }),
    }),
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'openapi',
        docsPluginId: 'classic',
        config: {
          hikube: {
            // Surface publique uniquement (opérations appelables avec une clé
            // d'API). Ne jamais y mettre frontend.swagger.json.
            specPath: 'static/openapi/hikube-public.swagger.json',
            outputDir: 'docs/api/reference',
            downloadUrl: '/openapi/hikube-public.swagger.json',
            hideSendButton: true,
            showSchemas: false,
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
            markdownGenerators: {
              // Serveur = URL centralisée ; authentification = clé d'API.
              createApiPageMD: (item) => {
                item.api.servers = [{url: HIKUBE_API_URL}];
                item.api.security = [{ApiKey: []}];
                item.api.securitySchemes = onlyApiKeyScheme(
                  item.api.securitySchemes,
                );
                stripInternalRefs(item.api);
                return createApiPageMD(item);
              },
              createInfoPageMD: (item) =>
                createInfoPageMD({
                  ...item,
                  securitySchemes: onlyApiKeyScheme(item.securitySchemes),
                }),
            },
          },
        },
      },
    ],
  ],

  themes: [
    '@docusaurus/theme-mermaid',
    'docusaurus-theme-openapi-docs',
    [
      '@easyops-cn/docusaurus-search-local',
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ['fr', 'en', 'it', 'de'],
        docsRouteBasePath: '/',
        indexBlog: true,
        highlightSearchTermsOnTargetPage: true,
      }),
    ],
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    }
  },

  // Icônes et police principale, comme hikube.cloud.
  headTags: [
    {tagName: 'link', attributes: {rel: 'icon', href: '/img/favicon.ico', sizes: '32x32'}},
    {tagName: 'link', attributes: {rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png'}},
    {
      tagName: 'link',
      attributes: {
        rel: 'preload',
        href: '/fonts/archivo-variable-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossorigin: 'anonymous',
      },
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/hikube-social-card.png',
      metadata: [
        {name: 'theme-color', content: '#16120f'},
        {name: 'twitter:card', content: 'summary_large_image'},
      ],
      colorMode: {
        // hikube.cloud est graphite d'abord ; la préférence système l'emporte.
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      docs: {
        sidebar: {
          hideable: true,
        },
      },
      navbar: {
        logo: {
          alt: 'Hikube Logo',
          // La barre reste graphite dans les deux thèmes : logo clair partout.
          src: 'img/logo_darkmode.svg',
          srcDark: 'img/logo_darkmode.svg',
          width: 107,
          height: 28,
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docsSidebar',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/blog',
            label: 'Changelog',
            position: 'left',
          },
          {
            type: 'search',
            position: 'right',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://hikube.cloud',
            label: 'hikube.cloud',
            position: 'right',
          },
          {
            href: 'https://console.hikube.cloud',
            label: 'Console',
            position: 'right',
            className: 'navbar__cta',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'Hikube',
          src: 'img/logo_darkmode.svg',
          href: 'https://hikube.cloud',
          width: 107,
          height: 28,
        },
        links: [
          {
            title: 'Documentation',
            items: [
              {label: 'Accueil', to: '/'},
              {label: 'Kubernetes', to: '/services/kubernetes/overview'},
              {label: 'Machines virtuelles', to: '/services/compute/overview'},
              {label: 'Bases de données', to: '/services/databases/'},
              {label: 'Changelog', to: '/blog'},
            ],
          },
          {
            title: 'Plateforme',
            items: [
              {label: 'hikube.cloud', href: 'https://hikube.cloud'},
              {label: 'Console', href: 'https://console.hikube.cloud'},
              {label: 'Statut', href: 'https://status.hikube.cloud'},
              {label: 'Tarifs', href: 'https://hikube.cloud/pricing'},
            ],
          },
          {
            title: 'Hidora',
            items: [
              {label: 'Hidora', href: 'https://hidora.io'},
              {label: 'contact@hidora.io', href: 'mailto:contact@hidora.io'},
              {label: 'LinkedIn', href: 'https://www.linkedin.com/company/hidora'},
              {label: 'X', href: 'https://x.com/HidoraSwiss'},
            ],
          },
        ],
        copyright: `<a class="footer__status" href="https://status.hikube.cloud">status.hikube.cloud</a><span>© ${new Date().getFullYear()} Hidora SA</span>`,
      },
      prism: {
        theme: hikubePrismTheme,
        darkTheme: hikubePrismTheme,
        additionalLanguages: ['bash', 'yaml', 'hcl', 'json'],
      },
      // Exemples de code de la référence API : curl en premier (onglet par
      // défaut), comme dans le reste de la documentation.
      languageTabs: [
        {highlight: 'bash', language: 'curl', logoClass: 'curl'},
        {highlight: 'python', language: 'python', logoClass: 'python'},
        {highlight: 'javascript', language: 'nodejs', logoClass: 'nodejs'},
        {highlight: 'go', language: 'go', logoClass: 'go'},
      ],
      mermaid: {
        theme: {light: 'neutral', dark: 'dark'},
        options: {
          fontFamily: "Archivo, system-ui, -apple-system, 'Segoe UI', sans-serif",
        },
      },
    }),
};

export default config;