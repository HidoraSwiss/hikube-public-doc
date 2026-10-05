---
sidebar_position: 6
title: FAQ
---

# FAQ — Kafka

:::info Disponibilité
Kafka n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

### Comment obtenir un cluster Kafka ?

Adressez votre demande au [support](mailto:support@hidora.io) avec les paramètres de l'instance (nombre de brokers, presets, stockage, topics, accès externe). Le [démarrage rapide](./quick-start.md) liste les informations à préparer.

### Quelle est la différence entre les partitions et le facteur de réplication ?

Ces deux paramètres servent des objectifs distincts :

- **Partitions** : déterminent le **parallélisme et le débit** d'un topic. Plus il y a de partitions, plus le nombre de consumers pouvant lire en parallèle est élevé. Chaque partition est une séquence ordonnée de messages.
- **Réplicas** (facteur de réplication) : déterminent le nombre de **copies** de chaque partition réparties sur différents brokers, garantissant la **haute disponibilité**. Si un broker tombe, un réplica prend le relais.

:::warning
Le nombre de réplicas d'un topic **ne peut pas dépasser** le nombre de brokers disponibles. Par exemple, avec 3 brokers, un topic peut avoir au maximum 3 réplicas.
:::

### Pourquoi Kafka utilise-t-il ZooKeeper ?

ZooKeeper assure la **coordination du cluster Kafka** :

- **Élection du contrôleur** : désigne le broker leader responsable de la gestion des partitions
- **Métadonnées des topics** : stocke la liste des topics, partitions et leur assignation aux brokers
- **Détection des pannes** : surveille l'état des brokers et déclenche la réassignation en cas de défaillance

:::tip
ZooKeeper nécessite un **nombre impair d'instances** (3, 5, 7…) pour maintenir le quorum. En production, prévoyez au minimum 3 instances.
:::

### À quoi sert `cleanup.policy` sur un topic ?

La politique de nettoyage définit comment Kafka gère les anciens messages :

- **`delete`** (par défaut) : supprime les segments de log qui dépassent la durée de rétention définie par `retention.ms`. Adapté aux flux d'événements.
- **`compact`** : conserve uniquement la **dernière valeur pour chaque clé**. Adapté aux tables de référence ou aux états (changelog).

La politique de chaque topic fait partie de la configuration de l'instance. Cette option n'est pas proposée dans la console ; contactez le support.

### Comment fonctionnent les consumer groups ?

Un **consumer group** est un ensemble de consumers qui se répartissent la lecture des partitions d'un topic :

- Chaque partition est lue par **un seul consumer** du groupe à un instant donné
- Si un consumer tombe, ses partitions sont redistribuées aux autres membres du groupe (**rebalancing**)
- Plusieurs consumer groups peuvent lire le même topic indépendamment (chacun maintient son propre offset)

Cela permet une **consommation parallèle** tout en garantissant l'ordre des messages au sein de chaque partition.

### Quels presets de ressources sont disponibles ?

Les presets s'appliquent séparément aux brokers et à ZooKeeper :

| **Preset** | **CPU** | **Mémoire** |
| ---------- | ------- | ----------- |
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Des valeurs CPU/mémoire explicites peuvent aussi être demandées ; elles remplacent alors le preset. Cette option n'est pas proposée dans la console ; contactez le support.

### Comment exposer Kafka à l'extérieur de la plateforme ?

L'accès externe est une option de l'instance : lorsqu'elle est activée, les brokers deviennent joignables depuis l'extérieur de la plateforme. Cette option n'est pas proposée dans la console ; contactez le support.

:::warning
L'exposition externe rend vos brokers accessibles sur Internet, sur le port `9094`. Ce listener est chiffré en TLS par défaut, mais aucune authentification des clients n'est configurée : toute personne qui connaît l'adresse peut produire et consommer des messages. Voyez avec le support la mise en place d'une authentification (SCRAM ou mTLS) avant d'activer cette option.
:::

### Comment configurer `min.insync.replicas` ?

Le paramètre `min.insync.replicas` garantit qu'un nombre minimum de réplicas confirme chaque écriture avant qu'elle ne soit considérée comme réussie. C'est une configuration au niveau du **topic**, définie dans la configuration de l'instance.

:::tip
Pour un topic de production avec 3 réplicas, `min.insync.replicas: 2` tolère la perte d'un broker tout en garantissant la durabilité des données. Côté producteur, combinez-le avec `acks=all`.
:::
