import React from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function ServiceCard({title, description, icon, href, tags}) {
  return (
    <Link to={href} className={styles.serviceCard}>
      <div className="card shadow--sm">
        <div className="card__body">
          <div className={styles.cardHeader}>
            {icon && <img src={icon} alt="" className={styles.icon} />}
            <h3 className={styles.title}>{title}</h3>
          </div>
          <p className={styles.description}>{description}</p>
          {tags && tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <span key={tag} className="badge badge--secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
