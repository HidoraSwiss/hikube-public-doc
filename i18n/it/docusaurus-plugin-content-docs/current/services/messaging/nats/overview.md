---
sidebar_position: 1
title: Panoramica
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# NATS su Hikube

:::info Disponibilità
NATS non è ancora disponibile in self-service nella [console Hikube](https://console.hikube.cloud).
Per effettuare il provisioning di un'istanza o modificarne la configurazione, [contatti il supporto](mailto:support@hidora.io).
:::

I **cluster NATS** di Hikube offrono una **piattaforma di messaggistica moderna, ultraleggera e performante**, progettata per la **comunicazione in tempo reale** tra servizi, applicazioni e dispositivi connessi.  
Pensato per le **architetture cloud native e a microservizi**, NATS unisce **semplicità, velocità e resilienza** in un unico sistema facile da gestire.

---

## Architettura e funzionamento

NATS adotta un'architettura **pub/sub** (publish–subscribe) senza broker complesso: ogni messaggio viene inviato a un **soggetto** (`subject`) che altre applicazioni possono **ascoltare**.

* **Publishers** → pubblicano messaggi su un soggetto (`orders.created`, `user.login`, ecc.)  
* **Subscribers** → si iscrivono a questi soggetti per ricevere i messaggi corrispondenti  
* **Subjects** → definiscono i canali logici di comunicazione, gerarchici e dinamici  
* **JetStream** → aggiunge la **persistenza**, la **rilettura (replay)** e le **garanzie di consegna**

---

## Leggerezza e prestazioni

NATS è noto per la sua **velocità eccezionale** e il suo **ingombro minimo**, che ne fanno un componente ideale per le architetture distribuite.

**Caratteristiche principali:**

* Tempo di avvio inferiore al secondo  
* Meno di **10 MB di memoria** consumati per istanza  
* Gestione di **milioni di messaggi al secondo**  
* Comunicazione diretta tra servizi, senza intermediari pesanti  
* Architettura **stateless** e facilmente **scalabile orizzontalmente**

> NATS offre un throughput elevato con una latenza media misurata in **microsecondi**, anche sotto carico elevato.

---

## Progettato per le architetture a microservizi

Ogni servizio può pubblicare o consumare eventi senza dipendere dal resto del sistema, favorendo un **forte disaccoppiamento** e una **migliore resilienza**.

**Esempi di utilizzo:**

* Diffusione di eventi applicativi in tempo reale  
* Comunicazione tra microservizi distribuiti  
* Richieste leggere tra servizi (pattern **request/reply**)  
* Gestione di eventi di business (creazione di un ordine, notifica, aggiornamento del profilo)

---

## Protocolli supportati

NATS è un protocollo **binario ottimizzato**, ma resta compatibile con numerosi ambienti e standard:

* **NATS Core** → messaggistica leggera (pub/sub, request/reply)  
* **NATS JetStream** → persistenza, replay e controllo di flusso  
* **NATS WebSocket** → integrazione diretta con applicazioni web  
* **NATS MQTT** → supporto degli oggetti connessi (IoT)  
* **NATS gRPC** → interoperabilità con API moderne  
* **Client** disponibili in oltre **40 linguaggi**: Go, Python, Node.js, Java, Rust, C#, ecc.

---

## Casi d'uso tipici

### Comunicazione in tempo reale

NATS eccelle nella **trasmissione istantanea di eventi** tra applicazioni distribuite.

**Esempi:**

* Notifiche in diretta e aggiornamenti di stato  
* Monitoraggio applicativo e raccolta di metriche  
* Sincronizzazione dei dati tra microservizi

---

### Streaming di eventi e persistenza

Con **JetStream**, NATS diventa un **sistema di streaming durevole**:

* Archiviazione temporanea o persistente dei messaggi  
* Rilettura degli eventi per audit o ripresa dopo un incidente  
* Controllo di flusso per non sovraccaricare mai i consumer

---

### Sicurezza e affidabilità

I cluster NATS di Hikube integrano meccanismi di sicurezza avanzati:

* **Cifratura TLS/mTLS**  
* **Autenticazione tramite NKeys e JWT**  
* **Controllo degli accessi per soggetto (subject-level ACL)**  

Ciò garantisce una **comunicazione affidabile, sicura e isolata** tra i servizi, anche in ambienti condivisi.

---

### Semplicità di amministrazione

Grazie al suo **design minimalista** e ai suoi **strumenti integrati (CLI, dashboard, metriche Prometheus)**, NATS è semplice da gestire e da monitorare, anche su larga scala.

**Esempi:**

* Bus di eventi interno per piattaforme distribuite  
* Orchestrazione di automazioni interne  
* Sistema di messaggistica centralizzato e leggero per Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Tutti i servizi di messaggistica", href: "../../"},
  ]}
/>
