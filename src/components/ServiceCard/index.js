import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {resolveAccent} from './accents';
import styles from './styles.module.css';

/**
 * Carte de service, dans l'esprit des cartes de hikube.cloud : filet en tête à
 * la couleur de la famille de produit, lavis très dilué, soulèvement d'un
 * cheveu au survol.
 *
 * Props : title, description, icon, href, tags, accent (optionnel : compute,
 * kubernetes, gpu, databases, messaging, storage, neutral ou une couleur hex ;
 * déduit du lien et de l'icône s'il est absent).
 */
export default function ServiceCard({title, description, icon, href, tags, accent}) {
  const iconUrl = useBaseUrl(icon || '');
  const {bright, deep} = resolveAccent({accent, href, icon});

  return (
    <Link
      to={href}
      className={styles.card}
      style={{'--svc': bright, '--svc-deep': deep}}>
      <div className={styles.header}>
        {icon && (
          <span className={styles.glyph} aria-hidden="true">
            <img src={iconUrl} alt="" className={styles.icon} loading="lazy" />
          </span>
        )}
        <h3 className={styles.title}>{title}</h3>
      </div>
      {description && <p className={styles.description}>{description}</p>}
      <div className={styles.footer}>
        {tags && tags.length > 0 ? (
          <ul className={styles.tags}>
            {tags.map((tag) => (
              <li key={tag} className={styles.tag}>
                {tag}
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </div>
    </Link>
  );
}
