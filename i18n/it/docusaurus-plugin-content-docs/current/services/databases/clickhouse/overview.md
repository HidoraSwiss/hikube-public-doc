---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# ClickHouse su Hikube

:::info Disponibilità
ClickHouse non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

I **database ClickHouse** di Hikube offrono un sistema di gestione SQL open source, ad alte prestazioni e orientato alle colonne, progettato per l'elaborazione analitica online (OLAP). Garantiscono l'ingestione rapida di dati massivi, l'esecuzione di query complesse quasi in tempo reale e l'affidabilità necessaria alle applicazioni analitiche critiche delle aziende.

---

## Architettura e funzionamento

L'architettura di ClickHouse si basa su due parametri essenziali che permettono di adattare il deployment alle esigenze reali:

- **Shard** → permettono di **suddividere i dati in più parti** su nodi diversi. Più shard ci sono, più il carico è distribuito, il che migliora la velocità di esecuzione delle query su volumi molto grandi.
- **Repliche** → creano **copie ridondanti** degli shard. Ciò aumenta la resilienza e la tolleranza ai guasti, consentendo al contempo di ripartire il carico di lettura tra più nodi.

### Esempio illustrativo

Immaginiamo un database di **1 miliardo di record di clienti**:

- **1 shard – 1 replica**
  Tutti i dati sono archiviati in un unico spazio.
  **Casi d'uso:**
  - Progetti pilota (POC)
  - Ambienti di sviluppo
  - Carichi analitici occasionali

- **2 shard – 1 replica**
  I dati sono divisi in due parti (ad es. clienti A–M e N–Z). Le query vengono eseguite in parallelo, il che accelera notevolmente l'analisi.
  **Casi d'uso:**
  - Analisi su grandi volumi di dati
  - Applicazioni che richiedono prestazioni migliori
  - Report regolari su ampie basi di clienti o transazioni

- **2 shard – 2 repliche**
  Ogni shard è duplicato su un altro nodo. Si beneficia sia della rapidità (dati distribuiti) sia della sicurezza (tolleranza ai guasti).
  **Casi d'uso:**
  - Applicazioni analitiche critiche in produzione
  - Esigenze di alta disponibilità
  - Piattaforme multiutente con forte concorrenza di query
  - Piani di disaster recovery (DRP)

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Tutti i database", href: "../../"},
  ]}
/>
