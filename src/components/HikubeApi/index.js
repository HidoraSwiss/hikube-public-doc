import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {translate} from '@docusaurus/Translate';
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
    <CodeBlock
      language="bash"
      title={translate({
        id: 'hikube.apiEnv.title',
        message: 'Variables utilisées par les exemples',
        description: 'Title of the code block that sets the variables used by the API examples',
      })}>
      {[
        `export HIKUBE_API="${url}"`,
        `# ${translate({
          id: 'hikube.apiEnv.keyComment',
          message: 'Lisez la clé depuis votre gestionnaire de secrets ; ne la versionnez jamais.',
          description: 'Shell comment above the API key variable in the API examples',
        })}`,
        'export HIKUBE_API_KEY="sk_hk_<keyId>_<secret>"',
        'export PROJECT_ID="<project_id>"',
      ].join('\n')}
    </CodeBlock>
  );
}

export default HikubeApiUrl;
