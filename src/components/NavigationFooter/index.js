import React from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import styles from './styles.module.css';

function Column({heading, items}) {
  return (
    <div className={styles.column}>
      <p className={styles.heading}>{heading}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link to={item.href} className={styles.link}>
              <span>{item.label}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NavigationFooter({nextSteps, seeAlso}) {
  const hasNext = nextSteps && nextSteps.length > 0;
  const hasSeeAlso = seeAlso && seeAlso.length > 0;
  if (!hasNext && !hasSeeAlso) return null;

  return (
    <nav
      className={styles.footer}
      aria-label={translate({
        id: 'hikube.navigationFooter.ariaLabel',
        message: 'Pour aller plus loin',
        description: 'Accessible label of the navigation block at the bottom of a doc page',
      })}>
      <div className={styles.columns}>
        {hasNext && (
          <Column
            heading={
              <Translate
                id="hikube.navigationFooter.nextSteps"
                description="Heading of the 'next steps' column at the bottom of a doc page">
                Prochaines étapes
              </Translate>
            }
            items={nextSteps}
          />
        )}
        {hasSeeAlso && (
          <Column
            heading={
              <Translate
                id="hikube.navigationFooter.seeAlso"
                description="Heading of the 'see also' column at the bottom of a doc page">
                Voir aussi
              </Translate>
            }
            items={seeAlso}
          />
        )}
      </div>
    </nav>
  );
}
