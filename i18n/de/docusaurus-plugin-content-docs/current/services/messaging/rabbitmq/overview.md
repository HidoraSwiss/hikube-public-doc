---
sidebar_position: 1
title: Übersicht
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# RabbitMQ auf Hikube

Die **RabbitMQ-Cluster** von Hikube bieten eine **verwaltete und zuverlässige Messaging-Infrastruktur**, die für die **asynchrone Kommunikation zwischen Diensten und Anwendungen** konzipiert ist.
Auf Basis des Protokolls **AMQP (Advanced Message Queuing Protocol)** gewährleistet RabbitMQ eine **sichere und geordnete Zustellung von Nachrichten** und eignet sich sowohl für **Microservice**-Architekturen als auch für komplexe Systeme der Geschäftsintegration.

Sie erstellen und verwalten Ihre Cluster im Self-Service in der [Hikube-Konsole](https://console.hikube.cloud), im Menü **DB & Messaging** → **RabbitMQ** Ihres Projekts.

---

## Was Sie in der Konsole tun können

- **Einen Cluster erstellen** (**Create a cluster**) mit einem geführten Assistenten: RabbitMQ-Version, Ressourcen-Preset, Disk-Größe, Anzahl der Replicas und externer Zugriff;
- **Virtual Hosts (VHosts)** und **Benutzer** bereits bei der Erstellung festlegen und anschließend auf der Seite des Clusters verwalten;
- jedem Benutzer **Rechte pro VHost** zuweisen (**Administrator** oder **Read-only**);
- **ein neues Passwort** für einen Benutzer **generieren**;
- Version, Disk-Größe und externen Zugriff eines bestehenden Clusters **ändern** (**Edit**);
- einen Cluster, einen VHost oder einen Benutzer **löschen** (**Delete**).

---

## Architektur und Funktionsweise

Eine RabbitMQ-Bereitstellung beruht auf einigen grundlegenden Konzepten:

* **Producers**: senden Nachrichten über **Exchanges** an RabbitMQ; diese bestimmen, wie die Nachrichten an die **Queues** weitergeleitet werden.
* **Exchanges**: wenden eine Routing-Logik an (direct, fanout, topic oder headers), um die Nachrichten anhand von Routing-Schlüsseln zu verteilen.
* **Queues**: speichern die Nachrichten, bis sie von den **Consumern** konsumiert werden.
* **Consumers**: rufen die Nachrichten ab und verarbeiten sie und gewährleisten so einen **asynchronen, zuverlässigen und entkoppelten** Arbeitsablauf.

Ein Cluster kann im **Standalone-Modus** (1 Replica) oder im **Cluster-Modus** (3 oder 5 Replicas) betrieben werden. Im Cluster-Modus replizieren **Quorum Queues** (auf Basis des Raft-Protokolls) die Nachrichten zwischen den Knoten, um die Kontinuität des Dienstes bei einem Ausfall sicherzustellen. Die Details finden Sie in den [Konzepten](./concepts.md).

---

## Typische Anwendungsfälle

### Kommunikation zwischen Diensten

RabbitMQ wird häufig als **interner Message-Bus** zwischen Anwendungen oder Microservices eingesetzt.
Damit lassen sich **Verarbeitungen entkoppeln**, die wahrgenommene Latenz verringern und die **Gesamtresilienz** verbessern.

**Beispiele:**

* Warteschlange für lang laufende Aufgaben (E-Mails, Berichte, Benachrichtigungen)
* System für Geschäftsereignisse (Bestellungen, Zahlungen, Lagerbestände)
* Zuverlässige Kommunikation zwischen verteilten Microservices

---

### Verwaltung asynchroner Abläufe

RabbitMQ vereinfacht die Umsetzung **asynchroner Workflows**, in denen jede Komponente unabhängig von den anderen arbeitet.

**Beispiele:**

* Orchestrierung von Hintergrundjobs
* Parallele Verarbeitung von Datenstapeln
* Koordination von CI/CD-Pipelines oder internen Automatisierungen

---

### Anwendungsintegration und Systemvernetzung

RabbitMQ fungiert als **Kommunikationsbrücke** zwischen heterogenen Anwendungen, Sprachen oder Umgebungen.

**Beispiele:**

* Integration zwischen Legacy-Anwendungen und modernen Microservices
* Verbindung zwischen internen Systemen und externen Plattformen über AMQP
* Zentralisierung der Nachrichten von Geschäftsereignissen in einem gemeinsamen Bus

---

### Zuverlässigkeit und Persistenz

RabbitMQ gewährleistet die **Dauerhaftigkeit von Nachrichten** durch Persistenz auf Disk und die Verwaltung von **Acknowledgements** (ACK/NACK).
In Kombination mit Quorum Queues auf einem Cluster mit 3 oder mehr Replicas verhindern diese Mechanismen den Verlust von Nachrichten beim Ausfall eines Knotens.

**Beispiele:**

* Transaktionale Warteschlange für kritische Verarbeitungen
* Garantierte Verarbeitung von Finanz- oder Logistiknachrichten
* Datenübertragung zwischen Diensten mit automatischer Wiederaufnahme nach Fehlern

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
