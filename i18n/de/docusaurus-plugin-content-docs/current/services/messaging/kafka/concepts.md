---
sidebar_position: 2
title: Konzepte
---

# Concepts — Kafka

## Architecture

Kafka auf Hikube est un service managé de streaming distribué. Chaque instance déployée via la ressource `Kafka` crée un cluster de **brokers** coordonnés par **ZooKeeper**, capable de gérer des millions de messages par seconde avec une persistance garantie.

```mermaid
graph TB
    subgraph "Hikube Platform"
        subgraph "Tenant namespace"
            CR[Kafka CRD]
            SEC[Secret credentials]
        end

        subgraph "Cluster Kafka"
            B1[Broker 1]
            B2[Broker 2]
            B3[Broker 3]
        end

        subgraph "ZooKeeper"
            Z1[ZK 1]
            Z2[ZK 2]
            Z3[ZK 3]
        end

        subgraph "Topics"
            T1["Topic A (3 partitions)"]
            T2["Topic B (2 partitions)"]
        end

        subgraph "Stockage"
            PV1[PV Broker 1]
            PV2[PV Broker 2]
            PV3[PV Broker 3]
        end
    end

    CR --> B1
    CR --> B2
    CR --> B3
    B1 --> PV1
    B2 --> PV2
    B3 --> PV3
    Z1 <--> Z2
    Z2 <--> Z3
    B1 -.-> Z1
    B2 -.-> Z1
    B3 -.-> Z1
    T1 --> B1
    T1 --> B2
    T1 --> B3
    T2 --> B1
    T2 --> B2
```

---

## Terminologie

| Terme | Beschreibung |
|-------|-------------|
| **Kafka** | Ressource Kubernetes (`apps.cozystack.io/v1alpha1`) représentant un cluster Kafka managé. |
| **Broker** | Instance Kafka qui stocke les messages et sert les producteurs/consommateurs. |
| **ZooKeeper** | Service de coordination distribué qui gère les métadonnées du cluster, l'élection du leader et la configuration des topics. |
| **Topic** | Canal de messages nommé. Les producteurs écrivent dans un topic, les consommateurs lisent depuis un topic. |
| **Partition** | Subdivision d'un topic. Chaque partition est un log ordonné de messages, distribué sur un broker. |
| **Replication Factor** | Nombre de copies de chaque partition sur différents brokers. |
| **Consumer Group** | Groupe de consommateurs qui se répartissent les partitions d'un topic pour le traitement parallèle. |
| **Retention** | Durée ou taille maximale de conservation des messages dans un topic. |
| **resourcesPreset** | Profil de ressources prédéfini (nano à 2xlarge). |

---

## Topics et partitions

### Fonctionnement

Un **topic** est divisé en **partitions**, chacune distribuée sur un broker différent :

```mermaid
graph LR
    subgraph "Topic: orders"
        P0[Partition 0<br/>Broker 1]
        P1[Partition 1<br/>Broker 2]
        P2[Partition 2<br/>Broker 3]
    end

    Prod[Producteur] --> P0
    Prod --> P1
    Prod --> P2

    P0 --> C1[Consumer 1]
    P1 --> C2[Consumer 2]
    P2 --> C3[Consumer 3]
```

- Plus de partitions = plus de parallélisme
- Chaque partition a un **leader** (un broker) et des **followers** (réplicas)
- Le `replicationFactor` détermine le nombre de copies de chaque partition

### Konfiguration des topics

Les topics sont déclarés directement dans le manifeste Kafka :

| Paramètre | Beschreibung |
|-----------|-------------|
| `topics[name].partitions` | Nombre de partitions du topic |
| `topics[name].config.replicationFactor` | Nombre de réplicas par partition |
| `topics[name].config.retentionMs` | Durée de rétention en ms (ex: `604800000` = 7 jours) |
| `topics[name].config.cleanupPolicy` | `delete` (suppression par TTL) ou `compact` (conservation du dernier message par clé) |

---

## ZooKeeper

ZooKeeper assure la coordination du cluster Kafka :

- **Élection du leader** pour chaque partition
- **Stockage des métadonnées** (topics, partitions, offsets)
- **Détection des pannes** des brokers

:::tip
Configurez toujours un nombre impair d'instances ZooKeeper (`zookeeper.replicas: 3`) pour garantir le quorum.
:::

Les ressources ZooKeeper sont configurées indépendamment des brokers via `zookeeper.resources` ou `zookeeper.resourcesPreset`.

---

## Presets de ressources

Les presets s'appliquent séparément aux **brokers Kafka** et au **ZooKeeper** :

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

---

## Limites et quotas

| Paramètre | Wert |
|-----------|--------|
| Brokers Kafka max | Selon quota tenant |
| Instances ZooKeeper | 3 recommandé (impair) |
| Topics par cluster | Illimité (selon ressources) |
| Partitions par topic | Configurable |
| Taille stockage | Variable (`kafka.size`, `zookeeper.size`) |

---

## Weiterführende Informationen

- [Overview](./overview.md) : présentation du service
- [API-Referenz](./api-reference.md) : tous les paramètres de la ressource Kafka
