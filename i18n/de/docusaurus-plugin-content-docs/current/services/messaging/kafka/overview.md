---
sidebar_position: 1
title: Übersicht
---

# Kafka auf Hikube

Die **Kafka-Cluster** von Hikube bieten eine **verteilte, skalierbare und hochverfügbare Daten-Streaming-Plattform**, die für die **Erfassung, Verarbeitung und Verteilung von Ereignissen in Echtzeit** konzipiert ist.
Dank der nativen Integration mit **ZooKeeper** profitiert jeder Kafka-Cluster auf Hikube von einer **koordinierten und resilienten Verwaltung der Broker**, die **Stabilität und Konsistenz** der Cluster-Metadaten gewährleistet.

---

## 🏗️ Architektur und Funktionsweise

Ein Kafka-Deployment auf Hikube basiert auf zwei Schlüsselkomponenten:

* **Kafka** → sorgt für die **Veröffentlichung, Speicherung und Verteilung** von Nachrichten über ein *Publish / Subscribe*-Modell.
  Die Nachrichten sind in **Topics** organisiert, die in **Partitionen** aufgeteilt und auf mehrere **Broker** verteilt werden.
  Dies ermöglicht einen **hohen Durchsatz**, eine **geringe Latenz** und eine **horizontale Skalierbarkeit**.

* **ZooKeeper** → fungiert als **zentrales Koordinierungsregister**.
  Es verwaltet die **Broker-Konfiguration**, die **Überwachung von Partitionen und Leadern** sowie die **Synchronisation zwischen den Knoten**.
  Bei Ausfall eines Brokers wählt ZooKeeper automatisch einen neuen Leader, um die Dienstkontinuität aufrechtzuerhalten.

---

## 🚀 Typische Anwendungsfälle

### 📡 Integration und Synchronisation von Systemen

Kafka fungiert als **zentraler Event-Bus** zwischen den verschiedenen Anwendungen einer Organisation.
**Beispiele:**

* Daten zwischen Microservices oder entfernten Systemen synchronisieren
* Datenbanken und Analysetools über **Kafka Connect** verbinden
* Austausch zwischen Anwendungen für eine robustere Architektur entkoppeln

---

### ⚙️ Echtzeit-Verarbeitung und Analytics

Kafka ermöglicht die Analyse und Transformation von Daten **zum Zeitpunkt ihrer Erzeugung**.
**Beispiele:**

* Betrugserkennung in Echtzeit
* Berechnung von Metriken oder Generierung sofortiger Alarme
* Kontinuierliche Speisung analytischer Dashboards (ClickHouse, Elasticsearch, Grafana usw.)

---

### 🛰️ IoT- und Log-Datenerfassung

Kafka vereinfacht die **massive Erfassung heterogener Daten** von Sensoren, Anwendungen oder Servern.
**Beispiele:**

* Zentralisierung von IoT-Telemetrie für Tausende von Geräten
* Aggregation von Anwendungslogs in einer Monitoring-Pipeline
* Übertragung von Streams an mehrere Ziele gleichzeitig

---

### 💬 Inter-Service-Kommunikation

Kafka ermöglicht eine **asynchrone Kommunikation** zwischen Microservices, verbessert die Resilienz und reduziert die Abhängigkeit zwischen Komponenten.
**Beispiele:**

* Verwaltung von Geschäftsereignissen (Bestellungen, Zahlungen, Benachrichtigungen)
* Verteilte Warteschlange für komplexe Aufgaben oder Workflows
* Integration mit spezialisierten Workern oder Consumern
