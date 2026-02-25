---
sidebar_position: 3
title: Référence API
---

# Référence API Kafka

Cette référence détaille la configuration et le fonctionnement des **clusters Kafka** sur Hikube, incluant la gestion des **topics**, la configuration des **brokers Kafka**, et la coordination via **ZooKeeper**.

---

## Structure de Base

### **Ressource Kafka**

#### Exemple de configuration YAML

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  topics: []
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

---

## Paramètres

### **Paramètres Communs**

| **Paramètre** | **Type** | **Description**                                                                 | **Défaut** | **Requis** |
| ------------- | -------- | ------------------------------------------------------------------------------- | ---------- | ---------- |
| `external`    | `bool`   | Active l’accès externe au cluster Kafka (exposition hors du cluster Kubernetes) | `false`    | Non        |

#### Exemple YAML

```yaml title="kafka.yaml"
external: true
```

---

### **Paramètres Kafka**

| **Paramètre**            | **Type**   | **Description**                                                                                          | **Défaut** | **Requis** |
| ------------------------ | ---------- | -------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| `kafka`                  | `object`   | Configuration du cluster Kafka                                                                           | `{}`       | Oui        |
| `kafka.replicas`         | `int`      | Nombre de réplicas Kafka (brokers)                                                                       | `3`        | Oui        |
| `kafka.resources`        | `object`   | Configuration explicite CPU et mémoire pour chaque broker. Si vide, `kafka.resourcesPreset` est utilisé. | `{}`       | Non        |
| `kafka.resources.cpu`    | `quantity` | CPU disponible par broker                                                                                | `null`     | Non        |
| `kafka.resources.memory` | `quantity` | RAM disponible par broker                                                                                | `null`     | Non        |
| `kafka.resourcesPreset`  | `string`   | Preset de ressources par défaut (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)       | `"small"`  | Oui        |
| `kafka.size`             | `quantity` | Taille du volume persistant utilisé pour les données Kafka                                               | `10Gi`     | Oui        |
| `kafka.storageClass`     | `string`   | StorageClass utilisé pour stocker les données Kafka                                                      | `""`       | Non        |

#### Exemple YAML

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 2Gi
  resourcesPreset: medium
  size: 20Gi
  storageClass: replicated
```

---

### **Paramètres ZooKeeper**

| **Paramètre**                | **Type**   | **Description**                                                                                                | **Défaut** | **Requis** |
| ---------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ---------- |
| `zookeeper`                  | `object`   | Configuration du cluster ZooKeeper utilisé par Kafka                                                           | `{}`       | Oui        |
| `zookeeper.replicas`         | `int`      | Nombre de réplicas ZooKeeper                                                                                   | `3`        | Oui        |
| `zookeeper.resources`        | `object`   | Configuration explicite CPU et mémoire pour chaque réplique. Si vide, `zookeeper.resourcesPreset` est utilisé. | `{}`       | Non        |
| `zookeeper.resources.cpu`    | `quantity` | CPU disponible par réplique ZooKeeper                                                                          | `null`     | Non        |
| `zookeeper.resources.memory` | `quantity` | RAM disponible par réplique ZooKeeper                                                                          | `null`     | Non        |
| `zookeeper.resourcesPreset`  | `string`   | Preset de ressources par défaut (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`)             | `"small"`  | Oui        |
| `zookeeper.size`             | `quantity` | Taille du volume persistant pour ZooKeeper                                                                     | `5Gi`      | Oui        |
| `zookeeper.storageClass`     | `string`   | StorageClass utilisé pour stocker les données ZooKeeper                                                        | `""`       | Non        |

#### Exemple YAML

```yaml title="kafka.yaml"
zookeeper:
  replicas: 3
  resourcesPreset: small
  size: 5Gi
  storageClass: replicated
```

---

### **Paramètres Topics**

| **Paramètre**          | **Type**   | **Description**                                             | **Défaut** | **Requis** |
| ---------------------- | ---------- | ----------------------------------------------------------- | ---------- | ---------- |
| `topics`               | `[]object` | Liste des topics à créer automatiquement                    | `[]`       | Non        |
| `topics[i].name`       | `string`   | Nom du topic                                                | `""`       | Oui        |
| `topics[i].partitions` | `int`      | Nombre de partitions du topic                               | `0`        | Oui        |
| `topics[i].replicas`   | `int`      | Nombre de réplicas du topic                                 | `0`        | Oui        |
| `topics[i].config`     | `object`   | Configuration avancée du topic (nettoyage, rétention, etc.) | `{}`       | Non        |

#### Exemple YAML

```yaml title="kafka.yaml"
topics:
  - name: results
    partitions: 1
    replicas: 3
    config:
      min.insync.replicas: 2
  - name: orders
    partitions: 1
    replicas: 3
    config:
      cleanup.policy: compact
      segment.ms: 3600000
      max.compaction.lag.ms: 5400000
      min.insync.replicas: 2
```

---

### **resources et resourcesPreset**

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque broker ou nœud ZooKeeper.
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.

#### Exemple YAML

```yaml title="kafka.yaml"
resources:
  cpu: 4000m
  memory: 4Gi
```

⚠️ Attention : si `resources` est défini, la valeur de `resourcesPreset` est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
| --------------- | ------- | ----------- |
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

---

## Exemples Complets

### Cluster de Production

```yaml title="kafka-production.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: production
spec:
  external: false
  kafka:
    replicas: 3
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 100Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
        min.insync.replicas: "2"
    - name: commands
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        min.insync.replicas: "2"
```

### Cluster de Développement

```yaml title="kafka-development.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: development
spec:
  external: false
  kafka:
    replicas: 1
    resourcesPreset: nano
    size: 5Gi
  zookeeper:
    replicas: 1
    resourcesPreset: nano
    size: 2Gi
  topics:
    - name: test-topic
      partitions: 1
      replicas: 1
```

---

:::tip Bonnes Pratiques

- **`min.insync.replicas: 2`** : configurez ce paramètre sur vos topics de production pour garantir qu'au moins 2 réplicas confirment chaque écriture
- **Stockage répliqué** : utilisez `storageClass: replicated` pour protéger les données contre la perte d'un nœud physique
- **Dimensionnement du stockage** : prévoyez suffisamment d'espace disque pour la rétention des messages (`retention.ms`) et la compaction
- **ZooKeeper : 3 réplicas minimum** en production pour garantir le quorum et la tolérance aux pannes
:::

:::warning Attention

- **Les suppressions sont irréversibles** : la suppression d'une ressource Kafka entraîne la perte définitive de tous les messages et topics
- **Réplicas topic vs brokers** : le nombre de réplicas d'un topic ne peut pas dépasser le nombre de brokers disponibles
- **Réduction du nombre de brokers** : réduire le nombre de brokers sur un cluster existant peut entraîner une perte de données si des partitions ne sont pas redistribuées au préalable
:::
