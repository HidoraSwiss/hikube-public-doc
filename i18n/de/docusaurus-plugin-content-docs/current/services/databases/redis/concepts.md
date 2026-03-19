---
sidebar_position: 2
title: Konzepte
---

# Konzepte — Redis

## Architektur

Redis auf Hikube ist ein verwalteter Dienst basierend auf dem Operator **Spotahome Redis Operator**. Jede über die Ressource `Redis` bereitgestellte Instanz erstellt einen Master-Replika-Cluster mit **Redis Sentinel** für automatisches Failover.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[Redis CRD]
            SEC[Secret credentials]
        end

        subgraph "Spotahome Operator"
            OP[Controller]
        end

        subgraph "Cluster Redis"
            M[Master - R/W]
            R1[Replica 1 - RO]
            R2[Replica 2 - RO]
        end

        subgraph "Redis Sentinel"
            S1[Sentinel 1]
            S2[Sentinel 2]
            S3[Sentinel 3]
        end

        subgraph "Speicher"
            PV1[PV Master]
            PV2[PV Replica 1]
            PV3[PV Replica 2]
        end
    end

    CR --> OP
    OP --> M
    OP --> R1
    OP --> R2
    OP --> S1
    OP --> S2
    OP --> S3
    M -->|Replikation| R1
    M -->|Replikation| R2
    S1 -.->|Monitoring| M
    S2 -.->|Monitoring| M
    S3 -.->|Monitoring| M
    M --> PV1
    R1 --> PV2
    R2 --> PV3
    OP --> SEC
```

---

## Terminologie

| Begriff | Beschreibung |
|---------|-------------|
| **Redis** | Kubernetes-Ressource (`apps.cozystack.io/v1alpha1`), die einen verwalteten Redis-Cluster darstellt. |
| **Master** | Hauptinstanz, die Lese- und Schreibvorgänge akzeptiert. |
| **Replica** | Schreibgeschützte Instanz, die vom Master synchronisiert wird. |
| **Sentinel** | Überwachungsprozess, der Ausfälle des Masters erkennt und das automatische Failover orchestriert. |
| **Spotahome Redis Operator** | Kubernetes-Operator, der die Bereitstellung und den Lebenszyklus von Redis-Clustern verwaltet. |
| **authEnabled** | Aktiviert die Passwort-Authentifizierung (`requirepass`). |
| **resourcesPreset** | Vordefiniertes Ressourcenprofil (nano bis 2xlarge). |

---

## Hochverfügbarkeit mit Sentinel

Redis Sentinel gewährleistet Hochverfügbarkeit durch:

1. **Permanente Überwachung** des Masters und der Replikas
2. **Erkennung** eines Master-Ausfalls durch Konsens (Quorum zwischen den Sentinels)
3. **Automatische Beförderung** eines Replikas zum neuen Master
4. **Rekonfiguration** der übrigen Replikas zur Replikation vom neuen Master

```mermaid
sequenceDiagram
    participant S1 as Sentinel 1
    participant S2 as Sentinel 2
    participant S3 as Sentinel 3
    participant M as Master
    participant R1 as Replica

    S1->>M: PING
    M--xS1: Timeout (Ausfall)
    S1->>S2: Master down?
    S1->>S3: Master down?
    S2-->>S1: Ja
    S3-->>S1: Ja
    Note over S1,S3: Quorum erreicht
    S1->>R1: SLAVEOF NO ONE
    Note over R1: Zum Master befördert
    S1->>S2: Neuer Master: R1
    S1->>S3: Neuer Master: R1
```

:::tip
Konfigurieren Sie mindestens `replicas: 3`, um das Sentinel-Quorum zu gewährleisten und automatisches Failover zu ermöglichen.
:::

---

## Persistenz

Redis auf Hikube unterstützt persistenten Speicher:

| Parameter | Beschreibung |
|-----------|-------------|
| `size` | Größe des persistenten Volumes (z.B.: `10Gi`) |
| `storageClass` | `local` (Leistung) oder `replicated` (Hochverfügbarkeit) |

Die Redis-Daten werden über die nativen Redis-Mechanismen (RDB/AOF) auf die Festplatte geschrieben und gewährleisten so die Haltbarkeit auch bei einem Neustart.

:::warning
Verwenden Sie in der Produktion immer `storageClass: replicated`, um Daten gegen einen Knotenausfall zu schützen.
:::

---

## Authentifizierung

Redis unterstützt optionale Authentifizierung:

- `authEnabled: true` — ein Passwort wird generiert und im Secret `<instance>-credentials` gespeichert
- `authEnabled: false` — Zugriff ohne Passwort (in der Produktion zu vermeiden)

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

:::warning
Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird `resourcesPreset` ignoriert.
:::

---

## Limits und Kontingente

| Parameter | Wert |
|-----------|------|
| Max. Replikas | Je nach Tenant-Kontingent |
| Speichergröße (`size`) | Variabel (in Gi) |
| Redis-Datenbanken | Einzelne Datenbank (db 0 standardmäßig) |

---

## Weiterführende Informationen

- [Übersicht](./overview.md): Vorstellung des Dienstes
- [API-Referenz](./api-reference.md): Alle Parameter der Redis-Ressource
