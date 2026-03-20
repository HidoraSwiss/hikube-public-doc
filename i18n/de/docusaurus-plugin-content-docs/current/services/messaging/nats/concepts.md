---
sidebar_position: 2
title: Konzepte
---

# Konzepte — NATS

## Architektur

NATS auf Hikube ist ein verwalteter Messaging-Dienst, ultraleicht und hochperformant. Jede über die Ressource `NATS` bereitgestellte Instanz erstellt einen Server-Cluster mit optionaler **JetStream**-Unterstützung für die Nachrichtenpersistenz.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[NATS CRD]
            SEC[Secret credentials]
        end

        subgraph "Cluster NATS"
            N1[NATS Server 1]
            N2[NATS Server 2]
            N3[NATS Server 3]
        end

        subgraph "JetStream"
            JS[Stream Storage]
            PV[Persistent Volume]
        end

        subgraph "Clients"
            PUB[Publisher]
            SUB[Subscriber]
            REQ[Request/Reply]
        end
    end

    CR --> N1
    CR --> N2
    CR --> N3
    N1 <-->|cluster routing| N2
    N2 <-->|cluster routing| N3
    N1 --> JS
    JS --> PV
    PUB --> N1
    N2 --> SUB
    REQ --> N3
    CR --> SEC
```

---

## Terminologie

| Begriff | Beschreibung |
|---------|--------------|
| **NATS** | Kubernetes-Ressource (`apps.cozystack.io/v1alpha1`), die einen verwalteten NATS-Cluster darstellt. |
| **Subject** | Routing-Adresse für Nachrichten (z.B. `orders.created`). Unterstützt Wildcards (`*`, `>`). |
| **Publish/Subscribe** | Kommunikationsmodell, bei dem Publisher Nachrichten an ein Subject senden und Subscriber sie empfangen. |
| **JetStream** | Persistenzerweiterung von NATS — dauerhafte Nachrichtenspeicherung mit Replay, Acknowledgment und Consumern. |
| **Stream** | Persistente Nachrichtensammlung in JetStream mit konfigurierbarer Aufbewahrungsrichtlinie. |
| **Consumer** | Dauerhaftes Abonnement in JetStream mit Positionsverfolgung (Offset) und Acknowledgment. |
| **Request/Reply** | Synchrones Kommunikationsmodell — ein Client sendet eine Anfrage und wartet auf eine Antwort. |
| **resourcesPreset** | Vordefiniertes Ressourcenprofil (nano bis 2xlarge). |

---

## Kommunikationsmodelle

NATS unterstützt drei Kommunikationsmodelle:

### Publish/Subscribe

Das einfachste Modell — ein Publisher sendet eine Nachricht, alle Subscriber erhalten eine Kopie:

```mermaid
graph LR
    PUB[Publisher] -->|"orders.created"| NATS[NATS Server]
    NATS --> SUB1[Subscriber 1]
    NATS --> SUB2[Subscriber 2]
    NATS --> SUB3[Subscriber 3]
```

### Queue Groups

Die Subscriber derselben Queue Group teilen sich die Nachrichten (Load Balancing):

```mermaid
graph LR
    PUB[Publisher] -->|"orders.created"| NATS[NATS Server]
    NATS -->|"message 1"| S1[Worker 1<br/>queue: processors]
    NATS -->|"message 2"| S2[Worker 2<br/>queue: processors]
    NATS -->|"message 3"| S3[Worker 3<br/>queue: processors]
```

### Request/Reply

Synchrone Kommunikation mit erwarteter Antwort:

```mermaid
sequenceDiagram
    participant Client
    participant NATS
    participant Service

    Client->>NATS: Request (orders.get)
    NATS->>Service: Forward request
    Service-->>NATS: Reply (order data)
    NATS-->>Client: Forward reply
```

---

## JetStream

JetStream fügt NATS **Persistenz** hinzu:

- Die Nachrichten werden auf der Festplatte in **Streams** gespeichert
- Die **Consumer** verfolgen ihre Position und können Nachrichten erneut lesen
- Unterstützung von **At-least-once**- und **Exactly-once**-Zustellung
- Konfigurierbare Aufbewahrung nach Dauer, Nachrichtenanzahl oder Größe

:::tip
Aktivieren Sie JetStream nur, wenn Sie Persistenz benötigen. Für ephemeres Pub/Sub ist das Basis-NATS leichtgewichtiger (< 10 MB RAM pro Instanz).
:::

---

## Benutzerverwaltung

Die NATS-Benutzer werden im Manifest mit einem Passwort deklariert. Die Zugangsdaten werden im Secret `<instance>-credentials` gespeichert.

---

## Ressourcen-Presets

| Preset | CPU | Speicher |
|--------|-----|----------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Grenzen und Kontingente

| Parameter | Wert |
|-----------|------|
| Max. Replikate | Je nach Tenant-Kontingent |
| Minimaler Speicherverbrauch | < 10 MB pro Instanz (ohne JetStream) |
| JetStream-Speichergröße | Variabel (in Gi) |
| Typische Latenz | < 1 ms (im selben Datacenter) |

---

## Weiterführende Informationen

- [Übersicht](./overview.md): Vorstellung des Dienstes
- [API-Referenz](./api-reference.md): Alle Parameter der NATS-Ressource
