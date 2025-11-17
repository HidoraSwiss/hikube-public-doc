
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import versions from '../../versions.json';

function VersionsPage() {
  
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
                      {version === 'current' && (
                        <span className="badge badge--primary margin-left--sm">
                          Actuelle
                        </span>
                      )}
                      {version === '1.0' && (
                        <span className="badge badge--warning margin-left--sm">
                          Ancienne
                        </span>
                      )}
                    </td>
                    <td>
                      <Link to={version === 'current' ? '/' : `/${version}/`}>
                        Documentation
                      </Link>
                    </td>
                    <td>
                      {version === 'current' 
                        ? 'Version stable actuelle (par défaut)' 
                        : version === '1.0' 
                        ? 'Ancienne version plus simpliste'
                        : `Version ${version}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="alert alert--info">
              <strong>Note :</strong> La version 2.0 est la version stable actuelle recommandée 
              pour la production. La version 1.0 contient les fonctionnalités plus simplistes et n'est pas complète.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VersionsPage; 