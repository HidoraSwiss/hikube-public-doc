import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Sécurité Maximale',
    Svg: require('@site/static/img/logo_whitemode.svg').default,
    description: (
      <>
        Infrastructure 100% privée avec chiffrement bout en bout.
        Isolation complète entre environnements et conformité RGPD native
        pour protéger vos données les plus sensibles.
      </>
    ),
  },
  {
    title: 'Haute Disponibilité',
    Svg: require('@site/static/img/logo_whitemode.svg').default,
    description: (
      <>
        Redondance intégrée sur tous les composants critiques.
        SLA garantie avec basculement automatique et sauvegarde continue
        pour une continuité de service maximale.
      </>
    ),
  },
  {
    title: 'Simplicité & Performance',
    Svg: require('@site/static/img/logo_whitemode.svg').default,
    description: (
      <>
        Déployez Kubernetes et VMs en quelques clics.
        Interface intuitive, API complète et scaling automatique
        pour une expérience cloud moderne et efficace.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
