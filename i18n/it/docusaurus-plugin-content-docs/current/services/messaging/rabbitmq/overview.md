---
sidebar_position: 1
title: Panoramica
---


# RabbitMQ su Hikube

I **cluster RabbitMQ** di Hikube offrono un'**infrastruttura di messaggistica affidabile, distribuita e altamente disponibile**, progettata per la **comunicazione asincrona tra servizi e applicazioni**.
Basato sul protocollo **AMQP (Advanced Message Queuing Protocol)**, RabbitMQ garantisce un **instradamento sicuro e ordinato dei messaggi**, adatto sia alle architetture **microservizi** che ai sistemi di integrazione aziendale complessi.

---

## 🏗️ Architettura e Funzionamento

Un deployment RabbitMQ su Hikube si basa su diversi concetti fondamentali:

* **Producer** → inviano i messaggi a RabbitMQ tramite degli **exchange**, che determinano come i messaggi vengono instradati verso le **code**.
* **Exchange** → applicano una logica di routing (direct, fanout, topic o headers) per distribuire i messaggi secondo chiavi di routing.
* **Code** → archiviano i messaggi fino a quando non vengono consumati dai **consumer**.
* **Consumer** → recuperano ed elaborano i messaggi, garantendo un flusso di lavoro **asincrono, affidabile e disaccoppiato**.

I cluster RabbitMQ su Hikube sono configurati in **modalità alta disponibilità (HA)**, con una **replica delle code di messaggi** tra più nodi per garantire la continuità del servizio in caso di guasto.

> ⚙️ I cluster Hikube utilizzano la **funzionalità quorum queue** per offrire un comportamento simile a quello dei consensi distribuiti (basato su Raft), garantendo **integrità e tolleranza ai guasti**.

---

## 🚀 Casi d'uso tipici

### 💬 Comunicazione inter-servizi

RabbitMQ è spesso utilizzato come **bus di messaggi interno** tra applicazioni o microservizi.
Consente di **disaccoppiare le elaborazioni**, ridurre la latenza percepita e migliorare la **resilienza globale**.

**Esempi:**

* Coda di elaborazione per task lunghi (email, report, notifiche)
* Sistema di eventi di business (ordini, pagamenti, inventari)
* Comunicazione affidabile tra microservizi distribuiti

---

### ⚙️ Gestione di flussi asincroni

RabbitMQ semplifica l'implementazione di **workflow asincroni** in cui ogni componente lavora indipendentemente dagli altri.

**Esempi:**

* Orchestrazione di job in background
* Elaborazione parallela di lotti di dati
* Coordinamento di pipeline CI/CD o automazioni interne

---

### 📡 Integrazione di applicazioni e interconnessione di sistemi

RabbitMQ funge da **ponte di comunicazione universale** tra applicazioni, linguaggi o ambienti eterogenei.

**Esempi:**

* Integrazione tra applicazioni legacy e microservizi moderni
* Connessione tra sistemi interni e piattaforme esterne tramite AMQP o MQTT
* Centralizzazione dei messaggi di eventi di business in un unico bus

---

### 🔒 Affidabilità e persistenza

RabbitMQ garantisce la **durabilità dei messaggi** grazie alla persistenza su disco e alla gestione degli **acknowledgement** (ACK/NACK).
Questo garantisce che nessun messaggio venga perso, anche in caso di guasto temporaneo di un nodo o della rete.

**Esempi:**

* Coda transazionale per elaborazioni critiche
* Elaborazione garantita dei messaggi finanziari o logistici
* Trasferimento di dati tra servizi con ripresa automatica dopo un errore
