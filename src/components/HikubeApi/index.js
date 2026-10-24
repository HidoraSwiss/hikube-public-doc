import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import CodeBlock from '@theme/CodeBlock';

/**
 * URL de base de l'API publique Hikube, lue depuis
 * `customFields.hikubeApiUrl` (docusaurus.config.js) : c'est le seul endroit
 * où elle est définie. Les exemples `curl` utilisent `$HIKUBE_API`.
 */
export function useHikubeApiUrl() {
  const {siteConfig} = useDocusaurusContext();
  return siteConfig.customFields.hikubeApiUrl;
}

/** L'URL de base, en ligne : <HikubeApiUrl /> */
export function HikubeApiUrl() {
  return <code>{useHikubeApiUrl()}</code>;
}

/**
 * Bloc des variables d'environnement utilisées par tous les exemples `curl`
 * de la documentation : <ApiEnv />
 */
export function ApiEnv() {
  const url = useHikubeApiUrl();
  return (
    <CodeBlock language="bash" title="Variables utilisées par les exemples">
      {[
        `export HIKUBE_API="${url}"`,
        '# Lisez la clé depuis votre gestionnaire de secrets ; ne la versionnez jamais.',
        'export HIKUBE_API_KEY="sk_hk_<keyId>_<secret>"',
        'export PROJECT_ID="<project_id>"',
      ].join('\n')}
    </CodeBlock>
  );
}

export default HikubeApiUrl;
