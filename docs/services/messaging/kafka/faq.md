---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

### Quelle est la différence entre `partitions` et `replicationFactor` ?

Ces deux paramètres servent des objectifs distincts :

- **`partitions`** : détermine le **parallélisme et le débit** d'un topic. Plus il y a de partitions, plus le nombre de consumers pouvant lire en parallèle est élevé. Chaque partition est une séquence ordonnée de messages.
- **`replicas`** (facteur de réplication) : détermine le nombre de **copies** de chaque partition réparties sur différents brokers, garantissant la **haute disponibilité**. Si un broker tombe, une réplique prend le relais.

:::warning
Le nombre de réplicas d'un topic **ne peut pas dépasser** le nombre de brokers disponibles. Par exemple, avec 3 brokers (`kafka.replicas: 3`), vous pouvez configurer au maximum `replicas: 3` sur un topic.
:::

### Pourquoi Kafka utilise-t-il ZooKeeper ?

ZooKeeper assure la **coordination du cluster Kafka** :

- **Élection du contrôleur** : désigne le broker leader responsable de la gestion des partitions
- **Métadonnées des topics** : stocke la liste des topics, partitions et leur assignation aux brokers
- **Détection des pannes** : surveille l'état des brokers et déclenche la réassignation en cas de défaillance

:::tip
ZooKeeper nécessite un **nombre impair de réplicas** (3, 5, 7...) pour maintenir le quorum. En production, utilisez au minimum `zookeeper.replicas: 3`.
:::

### À quoi sert `cleanup.policy` sur un topic ?

La politique de nettoyage définit comment Kafka gère les anciens messages :

- **`delete`** (par défaut) : supprime les segments de log qui dépassent la durée de rétention définie par `retention.ms`. Adapté aux flux d'événements.
- **`compact`** : conserve uniquement la **dernière valeur pour chaque clé**. Adapté aux tables de référence ou aux états (changelog).

Exemple de configuration :

```yaml title="kafka.yaml"
topics:
  - name: user-profiles
    partitions: 3
    replicas: 3
    config:
      cleanup.policy: compact
```

### Comment fonctionnent les consumer groups ?

Un **consumer group** est un ensemble de consumers qui se répartissent la lecture des partitions d'un topic :

- Chaque partition est lue par **un seul consumer** du groupe à un instant donné
- Si un consumer tombe, ses partitions sont redistribuées aux autres membres du groupe (**rebalancing**)
- Plusieurs consumer groups peuvent lire le même topic indépendamment (chacun maintient son propre offset)

Cela permet une **consommation parallèle** tout en garantissant l'ordre des messages au sein de chaque partition.

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` applique une configuration CPU/mémoire prédéfinie, tandis que `resources` permet de spécifier des valeurs explicites. Si `resources` est défini, `resourcesPreset` est **ignoré**.

| **Preset** | **CPU** | **Mémoire** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Exemple avec des ressources explicites :

```yaml title="kafka.yaml"
kafka:
  replicas: 3
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 50Gi
```

### Comment exposer Kafka à l'extérieur du cluster ?

Activez le paramètre `external: true` dans votre manifeste :

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: kafka
spec:
  external: true
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

Cela crée un service de type **LoadBalancer** pour chaque broker, permettant l'accès depuis l'extérieur du cluster Kubernetes.

:::warning
L'exposition externe rend vos brokers accessibles sur Internet. Assurez-vous que l'authentification et le chiffrement sont correctement configurés avant d'activer cette option.
:::

### Comment configurer `min.insync.replicas` ?

Le paramètre `min.insync.replicas` garantit qu'un nombre minimum de réplicas confirme chaque écriture avant qu'elle ne soit considérée comme réussie. C'est une configuration au niveau du **topic** :

```yaml title="kafka.yaml"
topics:
  - name: orders
    partitions: 6
    replicas: 3
    config:
      min.insync.replicas: "2"
```

:::tip
Pour un cluster de production avec 3 réplicas, configurez `min.insync.replicas: 2`. Cela tolère la perte d'un broker tout en garantissant la durabilité des données.
:::
