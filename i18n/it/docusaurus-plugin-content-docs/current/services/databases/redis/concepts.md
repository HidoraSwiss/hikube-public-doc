---
sidebar_position: 2
title: Concetti
---

# Concetti — Redis

## Architettura

Redis su Hikube e un servizio gestito basato sull'operatore **Spotahome Redis Operator**. Ogni istanza distribuita tramite la risorsa `Redis` crea un cluster master-replica con **Redis Sentinel** per il failover automatico.

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

        subgraph "Archiviazione"
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
    M -->|replica| R1
    M -->|replica| R2
    S1 -.->|monitoring| M
    S2 -.->|monitoring| M
    S3 -.->|monitoring| M
    M --> PV1
    R1 --> PV2
    R2 --> PV3
    OP --> SEC
```

---

## Terminologia

| Termine | Descrizione |
|---------|-------------|
| **Redis** | Risorsa Kubernetes (`apps.cozystack.io/v1alpha1`) che rappresenta un cluster Redis gestito. |
| **Master** | Istanza principale che accetta letture e scritture. |
| **Replica** | Istanza in sola lettura, sincronizzata dal master. |
| **Sentinel** | Processo di supervisione che rileva i guasti del master e orchestra il failover automatico. |
| **Spotahome Redis Operator** | Operatore Kubernetes che gestisce il deployment e il ciclo di vita dei cluster Redis. |
| **authEnabled** | Attiva l'autenticazione tramite password (`requirepass`). |
| **resourcesPreset** | Profilo di risorse predefinito (da nano a 2xlarge). |

---

## Alta disponibilita con Sentinel

Redis Sentinel assicura l'alta disponibilita:

1. **Sorvegliando** permanentemente il master e le repliche
2. **Rilevando** il guasto del master tramite consenso (quorum tra Sentinel)
3. **Promuovendo** automaticamente una replica a nuovo master
4. **Riconfigurando** le altre repliche per seguire il nuovo master

```mermaid
sequenceDiagram
    participant S1 as Sentinel 1
    participant S2 as Sentinel 2
    participant S3 as Sentinel 3
    participant M as Master
    participant R1 as Replica

    S1->>M: PING
    M--xS1: Timeout (guasto)
    S1->>S2: Master down?
    S1->>S3: Master down?
    S2-->>S1: Si
    S3-->>S1: Si
    Note over S1,S3: Quorum raggiunto
    S1->>R1: SLAVEOF NO ONE
    Note over R1: Promosso Master
    S1->>S2: Nuovo master: R1
    S1->>S3: Nuovo master: R1
```

:::tip
Configurate `replicas: 3` come minimo per garantire il quorum Sentinel e permettere il failover automatico.
:::

---

## Persistenza

Redis su Hikube supporta lo storage persistente:

| Parametro | Descrizione |
|-----------|-------------|
| `size` | Dimensione del volume persistente (es: `10Gi`) |
| `storageClass` | `local` (prestazioni) o `replicated` (alta disponibilita) |

I dati Redis vengono scritti su disco tramite i meccanismi nativi Redis (RDB/AOF), garantendo la durabilita anche in caso di riavvio.

:::warning
Per la produzione, usate sempre `storageClass: replicated` per proteggere i dati contro un guasto del nodo.
:::

---

## Autenticazione

Redis supporta l'autenticazione opzionale:

- `authEnabled: true` — una password viene generata e memorizzata nel Secret `<instance>-credentials`
- `authEnabled: false` — accesso senza password (da evitare in produzione)

---

## Preset di risorse

| Preset | CPU | Memoria |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Se il campo `resources` (CPU/memoria espliciti) e definito, `resourcesPreset` viene ignorato.
:::

---

## Limiti e quote

| Parametro | Valore |
|-----------|--------|
| Repliche max | Secondo la quota del tenant |
| Dimensione archiviazione (`size`) | Variabile (in Gi) |
| Database Redis | Database unico (db 0 per impostazione predefinita) |

---

## Per approfondire

- [Panoramica](./overview.md): presentazione del servizio
- [Riferimento API](./api-reference.md): tutti i parametri della risorsa Redis
