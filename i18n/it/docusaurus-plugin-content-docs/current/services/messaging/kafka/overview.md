---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Kafka su Hikube

:::info Disponibilità
Kafka non è ancora disponibile in modalità self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

I **cluster Kafka** di Hikube offrono una piattaforma di **streaming di dati distribuita, scalabile e ad alta disponibilità**, progettata per la **raccolta, l'elaborazione e la distribuzione di eventi in tempo reale**.
Grazie all'integrazione nativa con **ZooKeeper**, ogni cluster Kafka su Hikube beneficia di una **gestione coordinata e resiliente dei broker**, che garantisce la **stabilità e la coerenza** dei metadati del cluster.

---

## Architettura e funzionamento

Un deployment Kafka su Hikube si basa su due componenti chiave:

* **Kafka** → garantisce la **pubblicazione, l'archiviazione e la diffusione** dei messaggi tramite un modello *publish / subscribe*.
  I messaggi sono organizzati in **topic**, suddivisi in **partizioni** ripartite tra più **broker**.
  Ciò consente di ottenere un **throughput elevato**, una **bassa latenza** e una **scalabilità orizzontale**.

* **ZooKeeper** → funge da **registro centrale di coordinamento**.
  Gestisce la **configurazione dei broker**, il **monitoraggio delle partizioni e dei leader** e la **sincronizzazione tra i nodi**.
  In caso di guasto di un broker, ZooKeeper elegge automaticamente un nuovo leader per mantenere la continuità del servizio.

---

## Casi d'uso tipici

### Integrazione e sincronizzazione di sistemi

Kafka svolge il ruolo di **bus di eventi centrale** tra le diverse applicazioni di un'organizzazione.
**Esempi:**

* Sincronizzare i dati tra microservizi o sistemi remoti
* Collegare database e strumenti analitici tramite **Kafka Connect**
* Disaccoppiare gli scambi tra applicazioni per un'architettura più robusta

---

### Elaborazione in tempo reale e analytics

Kafka permette di analizzare e trasformare i dati **nel momento in cui vengono prodotti**.
**Esempi:**

* Rilevamento delle frodi in tempo reale
* Calcolo di metriche o generazione di avvisi istantanei
* Alimentazione continua di dashboard analitiche (ClickHouse, Elasticsearch, Grafana, ecc.)

---

### Raccolta di dati IoT e log

Kafka semplifica la **raccolta massiva di dati eterogenei** provenienti da sensori, applicazioni o server.
**Esempi:**

* Centralizzazione della telemetria IoT per migliaia di dispositivi
* Aggregazione dei log applicativi in una pipeline di monitoraggio
* Trasmissione di flussi verso più destinazioni contemporaneamente

---

### Comunicazione tra servizi

Kafka consente una **comunicazione asincrona** tra microservizi, migliorando la resilienza e riducendo la dipendenza tra componenti.
**Esempi:**

* Gestione di eventi di business (ordini, pagamenti, notifiche)
* Coda distribuita per attività o workflow complessi
* Integrazione con worker o consumer specializzati

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
