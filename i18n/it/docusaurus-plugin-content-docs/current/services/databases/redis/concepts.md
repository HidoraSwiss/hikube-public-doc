---
sidebar_position: 2
title: Concetti
---

# Concepts — Redis

## Architettura

Redis sur Hikube est un service managé basé sur l'opérateur **Spotahome Redis Operator**. Chaque instance déployée via la ressource `Redis` crée un cluster master-réplica avec **Redis Sentinel** pour le failover automatique.

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

        subgraph "Stockage"
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
    M -->|réplication| R1
    M -->|réplication| R2
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

| Terme | Description |
|-------|-------------|
| **Redis** | Ressource Kubernetes (`apps.cozystack.io/v1alpha1`) représentant un cluster Redis managé. |
| **Master** | Instance principale qui accepte les lectures et écritures. |
| **Replica** | Instance en lecture seule, synchronisée depuis le master. |
| **Sentinel** | Processus de supervision qui détecte les pannes du master et orchestre le failover automatique. |
| **Spotahome Redis Operator** | Opérateur Kubernetes qui gère le déploiement et le cycle de vie des clusters Redis. |
| **authEnabled** | Active l'authentification par mot de passe (`requirepass`). |
| **resourcesPreset** | Profil de ressources prédéfini (nano à 2xlarge). |

---

## Haute disponibilité avec Sentinel

Redis Sentinel assure la haute disponibilité en :

1. **Surveillant** en permanence le master et les réplicas
2. **Détectant** la panne du master par consensus (quorum entre Sentinels)
3. **Promouvant** automatiquement un réplica en nouveau master
4. **Reconfigurant** les autres réplicas pour suivre le nouveau master

```mermaid
sequenceDiagram
    participant S1 as Sentinel 1
    participant S2 as Sentinel 2
    participant S3 as Sentinel 3
    participant M as Master
    participant R1 as Replica

    S1->>M: PING
    M--xS1: Timeout (panne)
    S1->>S2: Master down?
    S1->>S3: Master down?
    S2-->>S1: Oui
    S3-->>S1: Oui
    Note over S1,S3: Quorum atteint
    S1->>R1: SLAVEOF NO ONE
    Note over R1: Promu Master
    S1->>S2: Nouveau master: R1
    S1->>S3: Nouveau master: R1
```

:::tip
Configurez `replicas: 3` minimum pour garantir le quorum Sentinel et permettre le failover automatique.
:::

---

## Persistance

Redis sur Hikube supporte le stockage persistant :

| Paramètre | Description |
|-----------|-------------|
| `size` | Taille du volume persistant (ex: `10Gi`) |
| `storageClass` | `local` (performances) ou `replicated` (haute disponibilité) |

Les données Redis sont écrites sur disque via les mécanismes natifs Redis (RDB/AOF), garantissant la durabilité même en cas de redémarrage.

:::warning
Pour la production, utilisez toujours `storageClass: replicated` pour protéger les données contre une panne de nœud.
:::

---

## Authentification

Redis supporte l'authentification optionnelle :

- `authEnabled: true` — un mot de passe est généré et stocké dans le Secret `<instance>-credentials`
- `authEnabled: false` — accès sans mot de passe (à éviter en production)

---

## Presets de ressources

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Si le champ `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est ignoré.
:::

---

## Limites et quotas

| Paramètre | Valeur |
|-----------|--------|
| Réplicas max | Selon quota tenant |
| Taille stockage (`size`) | Variable (en Gi) |
| Bases Redis | Base unique (db 0 par défaut) |

---

## Per approfondire

- [Overview](./overview.md) : présentation du service
- [Référence API](./api-reference.md) : tous les paramètres de la ressource Redis
