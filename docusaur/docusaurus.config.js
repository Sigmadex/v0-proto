// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const math = require('remark-math');
const katex = require('rehype-katex');
const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Smart Contracts',
  tagline: 'documentation',
  url: 'https://your-docusaurus-test-site.com',
  trailingSlash: false,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Sigmadex', // Usually your GitHub org/user name.
  projectName: 'v0-proto', // Usually your repo name.,
  deploymentBranch: 'gh-pages',
  url: 'https://sigmadex.github.io',
  baseUrl: '/v0-proto/',


  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [math],
          rehypePlugins: [katex],
          // Please change this to your repo.
          //editUrl: 'https://github.com/Sigmadex/v0-proto',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },

      }),
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css',
      integrity:
        'sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc',
      crossorigin: 'anonymous',
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: '',
        logo: {
          alt: 'Sigmadex',
          src: '/img/sigmadex-logo.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'Introduction',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://github.com/Sigmadex/v0-proto',
            label: 'GitHub',
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
                label: 'Introduction',
                to: '/docs/Introduction',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Telegram',
                href: 'https://t.me/SigmadexEN',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/sigmadex',
              },
              {
                label: 'Github',
                href: 'https://github.com/Sigmadex',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: 'https://blog.sigmadex.org/',
              },
              {
                label: 'Sigmadex',
                to: 'https://sigmadex.org/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Sigmadex, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
