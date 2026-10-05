---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# RabbitMQ su Hikube

I **cluster RabbitMQ** di Hikube offrono un'**infrastruttura di messaggistica gestita e affidabile**, progettata per la **comunicazione asincrona tra servizi e applicazioni**.
Basato sul protocollo **AMQP (Advanced Message Queuing Protocol)**, RabbitMQ garantisce un **instradamento sicuro e ordinato dei messaggi**, adatto sia alle architetture a **microservizi** sia ai sistemi di integrazione aziendale complessi.

I cluster si creano e si gestiscono in self-service dalla [console Hikube](https://console.hikube.cloud), nel menu **DB & Messaging** → **RabbitMQ** del suo progetto.

---

## Cosa permette di fare la console

- **Creare un cluster** con una procedura guidata: versione di RabbitMQ, preset di risorse, dimensione del disco, numero di repliche e accesso esterno;
- **Definire i virtual host (vhost)** e gli **utenti** fin dalla creazione, per poi gestirli dalla pagina del cluster;
- **Assegnare diritti per vhost** a ciascun utente (**Administrator** o **Read-only**);
- **Generare una nuova password** per un utente;
- **Modificare** la versione, la dimensione del disco e l'accesso esterno di un cluster esistente;
- **Eliminare** un cluster, un vhost o un utente.

---

## Architettura e funzionamento

Un deployment RabbitMQ si basa su alcuni concetti fondamentali:

* **Producers**: inviano i messaggi a RabbitMQ tramite gli **exchanges**, che determinano come i messaggi vengono instradati verso le **queues**.
* **Exchanges**: applicano una logica di instradamento (direct, fanout, topic o headers) per distribuire i messaggi in base alle chiavi di routing.
* **Queues**: conservano i messaggi finché non vengono consumati dai **consumers**.
* **Consumers**: recuperano ed elaborano i messaggi, garantendo un flusso di lavoro **asincrono, affidabile e disaccoppiato**.

Un cluster può funzionare in **modalità standalone** (1 replica) o in **modalità cluster** (3 o 5 repliche). In modalità cluster, le **quorum queues** (basate sul protocollo Raft) replicano i messaggi tra i nodi per assicurare la continuità del servizio in caso di guasto. Il dettaglio è presentato nei [concetti](./concepts.md).

---

## Casi d'uso tipici

### Comunicazione tra servizi

RabbitMQ è spesso utilizzato come **bus di messaggi interno** tra applicazioni o microservizi.
Permette di **disaccoppiare le elaborazioni**, ridurre la latenza percepita e migliorare la **resilienza complessiva**.

**Esempi:**

* Coda di elaborazione per attività lunghe (e-mail, report, notifiche)
* Sistema di eventi di business (ordini, pagamenti, inventari)
* Comunicazione affidabile tra microservizi distribuiti

---

### Gestione di flussi asincroni

RabbitMQ semplifica la realizzazione di **workflow asincroni** in cui ogni componente lavora indipendentemente dagli altri.

**Esempi:**

* Orchestrazione di job in background
* Elaborazione parallela di lotti di dati
* Coordinamento di pipeline CI/CD o di automazioni interne

---

### Integrazione di applicazioni e interconnessione di sistemi

RabbitMQ funge da **ponte di comunicazione** tra applicazioni, linguaggi o ambienti eterogenei.

**Esempi:**

* Integrazione tra applicazioni legacy e microservizi moderni
* Connessione tra sistemi interni e piattaforme esterne tramite AMQP
* Centralizzazione dei messaggi di eventi di business in un unico bus

---

### Affidabilità e persistenza

RabbitMQ assicura la **durabilità dei messaggi** grazie alla persistenza su disco e alla gestione degli **acknowledgements** (ACK/NACK).
Combinati con le quorum queues su un cluster di 3 o più repliche, questi meccanismi evitano la perdita di messaggi in caso di guasto di un nodo.

**Esempi:**

* Coda transazionale per elaborazioni critiche
* Elaborazione garantita di messaggi finanziari o logistici
* Trasferimento di dati tra servizi con ripresa automatica dopo un errore

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
