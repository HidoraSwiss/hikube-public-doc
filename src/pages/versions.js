import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import versions from '../../versions.json';

function VersionsPage() {
  const { siteConfig } = useDocusaurusContext();
  
  return (
    <Layout
      title="Versions"
      description="Liste de toutes les versions de la documentation Hikube"
    >
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <h1>Versions de la Documentation</h1>
            <p>
              Cette page présente toutes les versions disponibles de la documentation Hikube.
            </p>
            
            <h2>Versions Disponibles</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Documentation</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version}>
                    <td>
                      <strong>{version}</strong>
                      {version === '1.0' && (
                        <span className="badge badge--primary margin-left--sm">
                          Actuelle
                        </span>
                      )}
                      {version === '2.0' && (
                        <span className="badge badge--warning margin-left--sm">
                          Future
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={version === '1.0' ? '/' : `/${version}/get-started`}>
                        Documentation
                      </Link>
                    </td>
                    <td>
                      {version === '1.0' 
                        ? 'Version stable actuelle (par défaut)' 
                        : version === '2.0' 
                        ? 'Version future avec nouvelles fonctionnalités'
                        : `Version ${version}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="alert alert--info">
              <strong>Note :</strong> La version 1.0 est la version stable actuelle recommandée 
              pour la production. La version 2.0 contient les fonctionnalités futures et peut 
              être instable.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VersionsPage; 