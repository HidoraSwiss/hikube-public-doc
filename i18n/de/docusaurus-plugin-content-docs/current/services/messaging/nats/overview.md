---
sidebar_position: 1
title: Übersicht
---

# NATS auf Hikube

Die **NATS-Cluster** von Hikube bieten eine **moderne, ultraleichte und leistungsstarke Messaging-Plattform**, die für die **Echtzeit-Kommunikation** zwischen Diensten, Anwendungen und vernetzten Geräten konzipiert ist.
Entwickelt für **Cloud-native- und Microservice-Architekturen**, kombiniert NATS **Einfachheit, Geschwindigkeit und Resilienz** in einem einzigen, einfach zu betreibenden System.

---

## 🏗️ Architektur und Funktionsweise

NATS verwendet eine **Pub/Sub**-Architektur (Publish–Subscribe) ohne komplexen Broker: Jede Nachricht wird an ein **Subject** gesendet, das andere Anwendungen **abonnieren** können.

* **Publishers** → veröffentlichen Nachrichten zu einem Subject (`orders.created`, `user.login` usw.)
* **Subscribers** → abonnieren diese Subjects, um die entsprechenden Nachrichten zu empfangen
* **Subjects** → definieren die logischen Kommunikationskanäle, hierarchisch und dynamisch
* **JetStream** → fügt **Persistenz**, **Replay** und **Zustellgarantien** hinzu

---

## 🌿 Leichtgewichtigkeit und Performance

NATS ist bekannt für seine **außergewöhnliche Geschwindigkeit** und seinen **minimalen Ressourcenverbrauch**, was es zu einer idealen Komponente für verteilte Architekturen macht.

**Hauptmerkmale:**

* Startzeit unter einer Sekunde
* Weniger als **10 MB Arbeitsspeicher** pro Instanz
* Verarbeitung von **Millionen von Nachrichten pro Sekunde**
* Direkte Kommunikation zwischen Diensten ohne schwere Zwischenschicht
* **Stateless**-Architektur und einfach **horizontal skalierbar**

> NATS bietet hohen Durchsatz mit einer durchschnittlichen Latenz im **Mikrosekundenbereich**, selbst unter hoher Last.

---

## 🧩 Für Microservice-Architekturen konzipiert

Jeder Dienst kann Ereignisse veröffentlichen oder konsumieren, ohne vom Rest des Systems abhängig zu sein, was eine **starke Entkopplung** und **bessere Resilienz** fördert.

**Anwendungsbeispiele:**

* Echtzeit-Verbreitung von Anwendungsereignissen
* Kommunikation zwischen verteilten Microservices
* Leichtgewichtige Anfragen zwischen Diensten (Pattern **Request/Reply**)
* Verwaltung von Geschäftsereignissen (Bestellerstellung, Benachrichtigung, Profilaktualisierung)

---

## 🔗 Unterstützte Protokolle

NATS ist ein **optimiertes Binärprotokoll**, aber kompatibel mit vielen Umgebungen und Standards:

* **NATS Core** → leichtgewichtiges Messaging (Pub/Sub, Request/Reply)
* **NATS JetStream** → Persistenz, Replay und Flusskontrolle
* **NATS WebSocket** → direkte Integration mit Webanwendungen
* **NATS MQTT** → Unterstützung für vernetzte Objekte (IoT)
* **NATS gRPC** → Interoperabilität mit modernen APIs
* **Clients** verfügbar in mehr als **40 Sprachen**: Go, Python, Node.js, Java, Rust, C# usw.

---

## 🚀 Typische Anwendungsfälle

### ⚡ Echtzeit-Kommunikation

NATS zeichnet sich durch die **sofortige Übertragung von Ereignissen** zwischen verteilten Anwendungen aus.

**Beispiele:**

* Echtzeit-Benachrichtigungen und Statusaktualisierungen
* Anwendungsmonitoring und Metrikerfassung
* Datensynchronisation zwischen Microservices

---

### 📦 Event-Streaming und Persistenz

Mit **JetStream** wird NATS zu einem **dauerhaften Streaming-System**:

* Temporäre oder persistente Nachrichtenspeicherung
* Replay von Ereignissen für Audit oder Wiederherstellung nach Vorfall
* Flusskontrolle, um Konsumenten nie zu überlasten

---

### 🔒 Sicherheit und Zuverlässigkeit

Die NATS-Cluster von Hikube integrieren fortschrittliche Sicherheitsmechanismen:

* **TLS/mTLS-Verschlüsselung**
* **Authentifizierung über NKeys und JWT**
* **Subject-basierte Zugriffskontrolle (Subject-Level ACL)**

Dies gewährleistet eine **zuverlässige, sichere und isolierte Kommunikation** zwischen Diensten, auch in Multi-Tenant-Umgebungen.

---

### 🧠 Einfache Administration

Dank seines **minimalistischen Designs** und seiner **integrierten Tools (CLI, Dashboards, Prometheus-Metriken)** ist NATS einfach zu betreiben und zu überwachen, auch in großem Maßstab.

**Beispiele:**

* Interner Event-Bus für verteilte Plattformen
* Orchestrierung interner Automatisierungen
* Zentralisiertes und leichtgewichtiges Messaging-System für Kubernetes
