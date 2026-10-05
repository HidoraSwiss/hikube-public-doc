---
title: "Comment créer et gérer les topics"
---

# Comment créer et gérer les topics

:::info Disponibilité
Kafka n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide présente les paramètres d'un topic Kafka sur Hikube (partitions, réplicas, rétention, politique de nettoyage) et la manière de vérifier la configuration depuis un client Kafka.

Les topics gérés font partie de la configuration de l'instance : leur création et leur modification se demandent au support. Cette option n'est pas proposée dans la console ; contactez le support.

## Prérequis

- Un cluster **Kafka** provisionné sur Hikube et l'adresse de ses serveurs bootstrap (`<bootstrap-servers>`)
- Les scripts clients Kafka (`kafka-topics.sh`) installés sur votre poste

## Étapes

### 1. Définir les topics

Pour chaque topic, préparez :

| Paramètre | Description |
|-----------|-------------|
| Nom | Nom du topic |
| Partitions | Nombre de partitions (parallélisme de consommation) |
| Réplicas | Nombre de copies de chaque partition (durabilité des données) |
| Options | Configuration avancée du topic (voir ci-dessous) |

:::warning
Le nombre de réplicas d'un topic ne peut pas dépasser le nombre de brokers disponibles. Par exemple, avec 3 brokers, le maximum est de 3 réplicas.
:::

### 2. Choisir la rétention et la politique de nettoyage

Les deux principales politiques de nettoyage sont :

- **`delete`** : les messages sont supprimés après expiration du délai de rétention (`retention.ms`)
- **`compact`** : seule la dernière valeur de chaque clé est conservée (idéal pour les tables de référence, les états)

**Options de configuration courantes :**

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `cleanup.policy` | Politique de nettoyage : `delete` ou `compact` | `"delete"` |
| `retention.ms` | Durée de rétention des messages en millisecondes | `"604800000"` (7 jours) |
| `min.insync.replicas` | Nombre minimum de réplicas synchronisés pour confirmer une écriture | `"2"` |
| `segment.ms` | Durée avant rotation d'un segment de log (en ms) | `"3600000"` (1 heure) |
| `max.compaction.lag.ms` | Délai maximal avant compaction d'un message (en ms) | `"5400000"` (1h30) |

:::tip
Pour les topics de production, prévoyez `min.insync.replicas: "2"` avec 3 réplicas. Au moins 2 brokers confirment alors chaque écriture, ce qui protège contre la perte de données en cas de panne d'un broker.
:::

### 3. Transmettre la demande

Envoyez la liste des topics et de leurs options au [support](mailto:support@hidora.io), en précisant le projet et le nom de l'instance Kafka.

### 4. Vérifier les topics

Une fois la configuration appliquée, listez les topics depuis votre client :

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
```

**Résultat attendu :**

```console
events
orders
```

Pour voir le détail d'un topic :

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --topic events
```

**Résultat attendu :**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Vérification

La configuration est correcte si :

- Les topics apparaissent dans la liste (`--list`)
- Le nombre de partitions et le facteur de réplication correspondent à votre demande
- Les ISR (In-Sync Replicas) contiennent bien le nombre attendu de brokers

## Pour aller plus loin

- **[Concepts](../concepts.md)** : topics, partitions et réplication
- **[Comment scaler le cluster Kafka](./scale-resources.md)** : ajuster les ressources des brokers et de ZooKeeper
