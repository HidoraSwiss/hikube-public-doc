
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const versionData = [
  {
    version: '3.0.0-alpha',
    label: 'Diátaxis',
    badge: 'En développement',
    badgeClass: 'badge--secondary',
    path: '/next/',
    description: 'Prochaine version majeure — structure Diátaxis (concepts, how-to, FAQ, troubleshooting)',
  },
  {
    version: '2.0',
    label: '2.0.2',
    badge: 'Actuelle',
    badgeClass: 'badge--primary',
    path: '/',
    description: 'Version stable actuelle recommandée pour la production',
  },
  {
    version: '1.0',
    label: '1.0.0',
    badge: 'Ancienne',
    badgeClass: 'badge--warning',
    path: '/1.0/',
    description: 'Ancienne version simpliste — non maintenue',
  },
];

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
                {versionData.map(({ version, label, badge, badgeClass, path, description }) => (
                  <tr key={version}>
                    <td>
                      <strong>{label}</strong>
                      <span className={`badge ${badgeClass} margin-left--sm`}>
                        {badge}
                      </span>
                    </td>
                    <td>
                      <Link to={path}>Documentation</Link>
                    </td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="alert alert--info">
              <strong>Note :</strong> La version 2.0 est la version stable actuelle recommandée
              pour la production. La version 3.0 (Diátaxis) est en cours de développement.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default VersionsPage;
