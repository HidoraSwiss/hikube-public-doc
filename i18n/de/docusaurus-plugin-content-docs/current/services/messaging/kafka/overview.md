---
sidebar_position: 1
title: Übersicht
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Kafka auf Hikube

:::info Verfügbarkeit
Kafka ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Die **Kafka-Cluster** von Hikube bieten eine **verteilte, skalierbare und hochverfügbare Daten-Streaming-Plattform**, die für das **Erfassen, Verarbeiten und Verteilen von Ereignissen in Echtzeit** konzipiert ist.
Dank der nativen Integration mit **ZooKeeper** profitiert jeder Kafka-Cluster auf Hikube von einer **koordinierten und resilienten Verwaltung der Broker**, die die **Stabilität und Konsistenz** der Cluster-Metadaten sicherstellt.

---

## Architektur und Funktionsweise

Eine Kafka-Bereitstellung auf Hikube beruht auf zwei zentralen Komponenten:

* **Kafka** → übernimmt die **Veröffentlichung, Speicherung und Verteilung** der Nachrichten über ein *Publish/Subscribe*-Modell.
  Die Nachrichten sind in **Topics** organisiert, die in **Partitionen** unterteilt und auf mehrere **Broker** verteilt sind.
  So werden ein **hoher Durchsatz**, eine **geringe Latenz** und eine **horizontale Skalierbarkeit** erreicht.

* **ZooKeeper** → fungiert als **zentrales Koordinationsregister**.
  Es verwaltet die **Konfiguration der Broker**, die **Nachverfolgung der Partitionen und Leader** sowie die **Synchronisation zwischen den Knoten**.
  Fällt ein Broker aus, wählt ZooKeeper automatisch einen neuen Leader, um die Kontinuität des Dienstes zu gewährleisten.

---

## Typische Anwendungsfälle

### Integration und Synchronisation von Systemen

Kafka übernimmt die Rolle eines **zentralen Event-Bus** zwischen den verschiedenen Anwendungen einer Organisation.
**Beispiele:**

* Daten zwischen Microservices oder entfernten Systemen synchronisieren
* Datenbanken und Analysewerkzeuge über **Kafka Connect** verbinden
* Den Austausch zwischen Anwendungen entkoppeln, für eine robustere Architektur

---

### Echtzeitverarbeitung und Analytics

Kafka ermöglicht es, Daten **in dem Moment zu analysieren und zu transformieren, in dem sie entstehen**.
**Beispiele:**

* Betrugserkennung in Echtzeit
* Berechnung von Metriken oder Erzeugung sofortiger Alarme
* Kontinuierliche Versorgung von Analyse-Dashboards (ClickHouse, Elasticsearch, Grafana usw.)

---

### Erfassung von IoT-Daten und Logs

Kafka vereinfacht die **massenhafte Erfassung heterogener Daten** aus Sensoren, Anwendungen oder Servern.
**Beispiele:**

* Zentralisierung der IoT-Telemetrie für Tausende von Geräten
* Aggregation von Anwendungslogs in einer Monitoring-Pipeline
* Übertragung von Datenströmen an mehrere Ziele gleichzeitig

---

### Kommunikation zwischen Diensten

Kafka ermöglicht eine **asynchrone Kommunikation** zwischen Microservices, verbessert die Resilienz und verringert die Abhängigkeit zwischen Komponenten.
**Beispiele:**

* Verarbeitung von Geschäftsereignissen (Bestellungen, Zahlungen, Benachrichtigungen)
* Verteilte Warteschlange für komplexe Aufgaben oder Workflows
* Integration mit spezialisierten Workern oder Consumern

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
