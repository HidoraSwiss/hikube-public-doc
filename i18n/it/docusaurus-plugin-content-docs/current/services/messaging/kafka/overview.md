---
sidebar_position: 1
title: Panoramica
---

# Kafka su Hikube

I **cluster Kafka** di Hikube offrono una piattaforma di **streaming di dati distribuito, scalabile e altamente disponibile**, progettata per la **raccolta, l'elaborazione e la distribuzione di eventi in tempo reale**.
Grazie alla sua integrazione nativa con **ZooKeeper**, ogni cluster Kafka su Hikube beneficia di una **gestione coordinata e resiliente dei broker**, garantendo la **stabilità e la coerenza** dei metadati del cluster.

---

## 🏗️ Architettura e Funzionamento

Un deployment Kafka su Hikube si basa su due componenti chiave:

* **Kafka** → garantisce la **pubblicazione, l'archiviazione e la diffusione** dei messaggi tramite un modello *publish / subscribe*.
  I messaggi sono organizzati in **topic**, suddivisi in **partizioni** distribuite tra diversi **broker**.
  Questo consente di ottenere un **elevato throughput**, una **bassa latenza** e una **scalabilità orizzontale**.

* **ZooKeeper** → funge da **registro centrale di coordinamento**.
  Gestisce la **configurazione dei broker**, il **monitoraggio delle partizioni e dei leader**, nonché la **sincronizzazione tra i nodi**.
  In caso di guasto di un broker, ZooKeeper elegge automaticamente un nuovo leader per mantenere la continuità del servizio.

---

## 🚀 Casi d'uso tipici

### 📡 Integrazione e sincronizzazione di sistemi

Kafka svolge il ruolo di **bus di eventi centrale** tra le diverse applicazioni di un'organizzazione.
**Esempi:**

* Sincronizzare i dati tra microservizi o sistemi remoti
* Connettere database e strumenti analitici tramite **Kafka Connect**
* Disaccoppiare gli scambi tra applicazioni per un'architettura più robusta

---

### ⚙️ Elaborazione in tempo reale e analytics

Kafka permette di analizzare e trasformare i dati **nel momento in cui vengono prodotti**.
**Esempi:**

* Rilevamento di frodi in tempo reale
* Calcolo di metriche o generazione di alert istantanei
* Alimentazione continua di dashboard analitiche (ClickHouse, Elasticsearch, Grafana, ecc.)

---

### 🛰️ Raccolta dati IoT e log

Kafka semplifica la **raccolta massiva di dati eterogenei** provenienti da sensori, applicazioni o server.
**Esempi:**

* Centralizzazione della telemetria IoT per migliaia di dispositivi
* Aggregazione di log applicativi in una pipeline di monitoraggio
* Trasmissione di flussi verso più destinazioni contemporaneamente

---

### 💬 Comunicazione inter-servizi

Kafka consente una **comunicazione asincrona** tra microservizi, migliorando la resilienza e riducendo la dipendenza tra componenti.
**Esempi:**

* Gestione di eventi di business (ordini, pagamenti, notifiche)
* Coda distribuita per task o workflow complessi
* Integrazione con worker o consumer specializzati
