---
sidebar_position: 1
title: Übersicht
---


# RabbitMQ auf Hikube

Die **RabbitMQ-Cluster** von Hikube bieten eine **zuverlässige, verteilte und hochverfügbare Messaging-Infrastruktur**, die für die **asynchrone Kommunikation zwischen Diensten und Anwendungen** konzipiert ist.
Basierend auf dem Protokoll **AMQP (Advanced Message Queuing Protocol)** gewährleistet RabbitMQ eine **sichere und geordnete Nachrichtenzustellung**, die sowohl für **Microservice-Architekturen** als auch für komplexe Geschäftsintegrationssysteme geeignet ist.

---

## 🏗️ Architektur und Funktionsweise

Ein RabbitMQ-Deployment auf Hikube basiert auf mehreren grundlegenden Konzepten:

* **Producers** → senden Nachrichten an RabbitMQ über **Exchanges**, die bestimmen, wie Nachrichten an die **Queues** weitergeleitet werden.
* **Exchanges** → wenden eine Routing-Logik an (direct, fanout, topic oder headers), um Nachrichten nach Routing-Keys zu verteilen.
* **Queues** → speichern Nachrichten, bis sie von den **Consumern** verarbeitet werden.
* **Consumer** → empfangen und verarbeiten Nachrichten und gewährleisten einen **asynchronen, zuverlässigen und entkoppelten** Arbeitsfluss.

Die RabbitMQ-Cluster auf Hikube sind im **Hochverfügbarkeitsmodus (HA)** konfiguriert, mit einer **Replikation der Nachrichtenwarteschlangen** über mehrere Knoten, um die Dienstkontinuität bei Ausfällen zu gewährleisten.

> ⚙️ Die Hikube-Cluster verwenden die **Quorum-Queues-Funktionalität**, um ein Verhalten ähnlich dem verteilter Konsensverfahren (basierend auf Raft) zu bieten, das **Integrität und Fehlertoleranz** gewährleistet.

---

## 🚀 Typische Anwendungsfälle

### 💬 Inter-Service-Kommunikation

RabbitMQ wird häufig als **interner Nachrichtenbus** zwischen Anwendungen oder Microservices verwendet.
Es ermöglicht die **Entkopplung der Verarbeitungen**, reduziert die wahrgenommene Latenz und verbessert die **Gesamtresilienz**.

**Beispiele:**

* Warteschlange für lang laufende Aufgaben (E-Mails, Berichte, Benachrichtigungen)
* Geschäftsereignissystem (Bestellungen, Zahlungen, Inventar)
* Zuverlässige Kommunikation zwischen verteilten Microservices

---

### ⚙️ Verwaltung asynchroner Abläufe

RabbitMQ vereinfacht die Implementierung **asynchroner Workflows**, bei denen jede Komponente unabhängig von den anderen arbeitet.

**Beispiele:**

* Orchestrierung von Hintergrundjobs
* Parallele Verarbeitung von Datenstapeln
* Koordination von CI/CD-Pipelines oder internen Automatisierungen

---

### 📡 Anwendungsintegration und Systemvernetzung

RabbitMQ fungiert als **universelle Kommunikationsbrücke** zwischen Anwendungen, Sprachen oder heterogenen Umgebungen.

**Beispiele:**

* Integration zwischen Legacy-Anwendungen und modernen Microservices
* Verbindung zwischen internen Systemen und externen Plattformen über AMQP oder MQTT
* Zentralisierung von Geschäftsereignisnachrichten in einem gemeinsamen Bus

---

### 🔒 Zuverlässigkeit und Persistenz

RabbitMQ gewährleistet die **Nachrichtenhaltbarkeit** durch Festplattenpersistenz und die Verwaltung von **Acknowledgements** (ACK/NACK).
Dies stellt sicher, dass keine Nachricht verloren geht, selbst bei vorübergehendem Ausfall eines Knotens oder Netzwerks.

**Beispiele:**

* Transaktionale Warteschlange für kritische Verarbeitungen
* Garantierte Verarbeitung von Finanz- oder Logistiknachrichten
* Datentransfer zwischen Diensten mit automatischer Wiederaufnahme nach Fehlern
