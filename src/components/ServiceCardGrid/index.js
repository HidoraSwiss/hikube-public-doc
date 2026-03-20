import React from 'react';
import ServiceCard from '@site/src/components/ServiceCard';
import styles from './styles.module.css';

export default function ServiceCardGrid({items}) {
  return (
    <div className={styles.cardGrid}>
      {items.map((item) => (
        <ServiceCard key={item.href} {...item} />
      ))}
    </div>
  );
}
