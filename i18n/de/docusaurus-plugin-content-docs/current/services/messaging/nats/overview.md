---
sidebar_position: 1
title: Übersicht
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# NATS auf Hikube

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Die **NATS-Cluster** von Hikube bieten eine **moderne, ultraleichte und leistungsstarke Messaging-Plattform**, die für die **Echtzeitkommunikation** zwischen Diensten, Anwendungen und vernetzten Geräten konzipiert ist.  
NATS wurde für **Cloud-native- und Microservice-Architekturen** entwickelt und vereint **Einfachheit, Geschwindigkeit und Resilienz** in einem einzigen, leicht zu betreibenden System.

---

## Architektur und Funktionsweise

NATS verwendet eine **Pub/Sub**-Architektur (Publish–Subscribe) ohne komplexen Broker: Jede Nachricht wird an ein **Subject** (`subject`) gesendet, das andere Anwendungen **abonnieren** können.

* **Publishers** → veröffentlichen Nachrichten zu einem Subject (`orders.created`, `user.login` usw.)  
* **Subscribers** → abonnieren diese Subjects, um die entsprechenden Nachrichten zu empfangen  
* **Subjects** → definieren die logischen Kommunikationskanäle, hierarchisch und dynamisch  
* **JetStream** → ergänzt **Persistenz**, **Wiedergabe (Replay)** und **Zustellgarantien**

---

## Leichtgewichtigkeit und Leistung

NATS ist bekannt für seine **außergewöhnliche Geschwindigkeit** und seinen **minimalen Ressourcenbedarf** und eignet sich daher ideal als Komponente verteilter Architekturen.

**Hauptmerkmale:**

* Startzeit unter einer Sekunde  
* Weniger als **10 MB Arbeitsspeicher** pro Instanz  
* Verarbeitung von **Millionen Nachrichten pro Sekunde**  
* Direkte Kommunikation zwischen Diensten, ohne schwergewichtigen Vermittler  
* **Zustandslose** (stateless) Architektur, einfach **horizontal skalierbar**

> NATS bietet einen hohen Durchsatz bei einer durchschnittlichen Latenz im Bereich von **Mikrosekunden**, selbst unter hoher Last.

---

## Für Microservice-Architekturen konzipiert

Jeder Dienst kann Ereignisse veröffentlichen oder konsumieren, ohne vom Rest des Systems abhängig zu sein. Das fördert eine **starke Entkopplung** und eine **höhere Resilienz**.

**Anwendungsbeispiele:**

* Verteilung von Anwendungsereignissen in Echtzeit  
* Kommunikation zwischen verteilten Microservices  
* Leichtgewichtige Anfragen zwischen Diensten (Muster **Request/Reply**)  
* Verarbeitung von Geschäftsereignissen (Bestellanlage, Benachrichtigung, Profilaktualisierung)

---

## Unterstützte Protokolle

NATS ist ein **optimiertes Binärprotokoll**, bleibt aber mit zahlreichen Umgebungen und Standards kompatibel:

* **NATS Core** → leichtgewichtiges Messaging (Pub/Sub, Request/Reply)  
* **NATS JetStream** → Persistenz, Replay und Flusskontrolle  
* **NATS WebSocket** → direkte Integration in Webanwendungen  
* **NATS MQTT** → Unterstützung vernetzter Geräte (IoT)  
* **NATS gRPC** → Interoperabilität mit modernen APIs  
* **Clients** in mehr als **40 Sprachen** verfügbar: Go, Python, Node.js, Java, Rust, C# usw.

---

## Typische Anwendungsfälle

### Echtzeitkommunikation

NATS glänzt bei der **sofortigen Übertragung von Ereignissen** zwischen verteilten Anwendungen.

**Beispiele:**

* Live-Benachrichtigungen und Statusaktualisierungen  
* Anwendungsmonitoring und Erfassung von Metriken  
* Datensynchronisation zwischen Microservices

---

### Event-Streaming und Persistenz

Mit **JetStream** wird NATS zu einem **dauerhaften Streaming-System**:

* Temporäre oder persistente Speicherung von Nachrichten  
* Wiedergabe von Ereignissen für Audits oder die Wiederherstellung nach einem Vorfall  
* Flusskontrolle, damit Consumer nie überlastet werden

---

### Sicherheit und Zuverlässigkeit

Die NATS-Cluster von Hikube verfügen über fortschrittliche Sicherheitsmechanismen:

* **TLS/mTLS-Verschlüsselung**  
* **Authentifizierung über NKeys und JWT**  
* **Zugriffskontrolle pro Subject (subject-level ACL)**  

Dies gewährleistet eine **zuverlässige, sichere und isolierte Kommunikation** zwischen Diensten, auch in gemeinsam genutzten Umgebungen.

---

### Einfache Administration

Dank seines **minimalistischen Designs** und seiner **integrierten Werkzeuge (CLI, Dashboards, Prometheus-Metriken)** lässt sich NATS auch in großem Maßstab einfach betreiben und überwachen.

**Beispiele:**

* Interne Event-Busse für verteilte Plattformen  
* Orchestrierung interner Automatisierungen  
* Zentrales, leichtgewichtiges Messaging-System für Kubernetes

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Alle Messaging-Dienste", href: "../../"},
  ]}
/>
