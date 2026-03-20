import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function NavigationFooter({nextSteps, seeAlso}) {
  return (
    <div className={styles.footer}>
      <div className={styles.columns}>
        {nextSteps && nextSteps.length > 0 && (
          <div className={styles.column}>
            <h4>Prochaines etapes</h4>
            <ul>
              {nextSteps.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {seeAlso && seeAlso.length > 0 && (
          <div className={styles.column}>
            <h4>Voir aussi</h4>
            <ul>
              {seeAlso.map((item) => (
                <li key={item.href}>
                  <Link to={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
