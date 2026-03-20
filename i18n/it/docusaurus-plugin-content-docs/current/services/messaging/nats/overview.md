---
sidebar_position: 1
title: Panoramica
---

# NATS su Hikube

I **cluster NATS** di Hikube offrono una **piattaforma di messaggistica moderna, ultra-leggera e performante**, progettata per la **comunicazione in tempo reale** tra servizi, applicazioni e dispositivi connessi.
Pensato per le **architetture cloud native e microservizi**, NATS combina **semplicità, velocità e resilienza** in un sistema unico e facile da gestire.

---

## 🏗️ Architettura e Funzionamento

NATS adotta un'architettura **pub/sub** (publish-subscribe) senza broker complesso: ogni messaggio viene inviato a un **subject** che altre applicazioni possono **ascoltare**.

* **Publisher** → pubblicano messaggi su un subject (`orders.created`, `user.login`, ecc.)
* **Subscriber** → si iscrivono a questi subject per ricevere i messaggi corrispondenti
* **Subject** → definiscono i canali logici di comunicazione, gerarchici e dinamici
* **JetStream** → aggiunge la **persistenza**, la **rilettura (replay)** e le **garanzie di consegna**

---

## 🌿 Leggerezza e prestazioni

NATS è riconosciuto per la sua **velocità eccezionale** e la sua **impronta minima**, il che lo rende un componente ideale per le architetture distribuite.

**Caratteristiche chiave:**

* Tempo di avvio inferiore al secondo
* Meno di **10 MB di memoria** consumati per istanza
* Gestione di **milioni di messaggi al secondo**
* Comunicazione diretta tra servizi, senza intermediari pesanti
* Architettura **stateless** e facilmente **scalabile orizzontalmente**

> NATS offre un throughput elevato con una latenza media misurata in **microsecondi**, anche sotto forte carico.

---

## 🧩 Progettato per le architetture microservizi

Ogni servizio può pubblicare o consumare eventi senza dipendere dal resto del sistema, favorendo un **forte disaccoppiamento** e una **migliore resilienza**.

**Esempi di utilizzo:**

* Diffusione di eventi applicativi in tempo reale
* Comunicazione tra microservizi distribuiti
* Richieste leggere tra servizi (pattern **request/reply**)
* Gestione di eventi di business (creazione ordini, notifiche, aggiornamento profili)

---

## 🔗 Protocolli supportati

NATS è un protocollo **binario ottimizzato** ma resta compatibile con numerosi ambienti e standard:

* **NATS Core** → messaggistica leggera (pub/sub, request/reply)
* **NATS JetStream** → persistenza, replay e controllo di flusso
* **NATS WebSocket** → integrazione diretta con applicazioni web
* **NATS MQTT** → supporto degli oggetti connessi (IoT)
* **NATS gRPC** → interoperabilità con API moderne
* **Client** disponibili in più di **40 linguaggi**: Go, Python, Node.js, Java, Rust, C#, ecc.

---

## 🚀 Casi d'uso tipici

### ⚡ Comunicazione in tempo reale

NATS eccelle nella **trasmissione istantanea di eventi** tra applicazioni distribuite.

**Esempi:**

* Notifiche in diretta e aggiornamenti di stato
* Monitoraggio applicativo e raccolta di metriche
* Sincronizzazione di dati tra microservizi

---

### 📦 Streaming di eventi e persistenza

Con **JetStream**, NATS diventa un **sistema di streaming durevole**:

* Archiviazione temporanea o persistente dei messaggi
* Rilettura degli eventi per audit o ripristino dopo un incidente
* Controllo di flusso per non sovraccaricare mai i consumatori

---

### 🔒 Sicurezza e affidabilità

I cluster NATS Hikube integrano meccanismi di sicurezza avanzati:

* **Crittografia TLS/mTLS**
* **Autenticazione tramite NKeys e JWT**
* **Controllo degli accessi per subject (subject-level ACL)**

Questo garantisce una **comunicazione affidabile, sicura e isolata** tra servizi, anche in ambienti multi-tenant.

---

### 🧠 Semplicità di amministrazione

Grazie al suo **design minimalista** e ai suoi **strumenti integrati (CLI, dashboard, metriche Prometheus)**, NATS è semplice da gestire e monitorare, anche su larga scala.

**Esempi:**

* Bus di eventi interni per piattaforme distribuite
* Orchestrazione di automazioni interne
* Sistema di messaggistica centralizzato e leggero per Kubernetes
