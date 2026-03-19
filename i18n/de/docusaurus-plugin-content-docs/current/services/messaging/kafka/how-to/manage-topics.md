---
title: "Comment créer et gérer les topics"
---

# Comment créer et gérer les topics

Dieser Leitfaden erklärt comment créer, configurer et gérer les topics Kafka auf Hikube de manière déclarative via les manifestes Kubernetes. Vous apprendrez à définir les partitions, les réplicas et les politiques de rétention et de Bereinigung.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **Kafka** déployé sur Hikube (ou un manifeste prêt à déployer)

## Schritte

### 1. Ajouter un topic au manifeste

Les topics sont déclarés dans la section `topics` du manifeste Kafka. Chaque topic possède un nom, un nombre de partitions et un nombre de réplicas.

```yaml title="kafka-topics.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
    - name: orders
      partitions: 3
      replicas: 3
```

**Paramètres des topics :**

| Paramètre | Typ | Beschreibung |
|-----------|------|-------------|
| `topics[i].name` | `string` | Nom du topic |
| `topics[i].partitions` | `int` | Nombre de partitions (parallélisme de consommation) |
| `topics[i].replicas` | `int` | Nombre de réplicas (durabilité des données) |
| `topics[i].config` | `object` | Configuration avancée du topic |

:::warning
Le nombre de réplicas d'un topic ne peut pas dépasser le nombre de brokers disponibles. Par exemple, avec 3 brokers, le maximum est `replicas: 3`.
:::

### 2. Configurer la rétention et la politique de Bereinigung

Chaque topic peut être personnalisé via le champ `config`. Les deux principales politiques de Bereinigung sont :

- **`delete`** : les messages sont supprimés après expiration du délai de rétention (`retention.ms`)
- **`compact`** : seule la dernière valeur de chaque clé est conservée (idéal pour les tables de référence, les états)

```yaml title="kafka-topics-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 20Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics:
    - name: events
      partitions: 6
      replicas: 3
      config:
        cleanup.policy: "delete"
        retention.ms: "604800000"
        min.insync.replicas: "2"
    - name: orders
      partitions: 3
      replicas: 3
      config:
        cleanup.policy: "compact"
        segment.ms: "3600000"
        max.compaction.lag.ms: "5400000"
        min.insync.replicas: "2"
```

**Options de configuration courantes :**

| Paramètre | Beschreibung | Exemple |
|-----------|-------------|---------|
| `cleanup.policy` | Politique de Bereinigung : `delete` ou `compact` | `"delete"` |
| `retention.ms` | Durée de rétention des messages en millisecondes | `"604800000"` (7 jours) |
| `min.insync.replicas` | Nombre minimum de réplicas synchronisés pour confirmer une écriture | `"2"` |
| `segment.ms` | Durée avant rotation d'un segment de log (en ms) | `"3600000"` (1 heure) |
| `max.compaction.lag.ms` | Délai maximal avant compaction d'un message (en ms) | `"5400000"` (1h30) |

:::tip
Pour les topics de production, configurez toujours `min.insync.replicas: "2"` avec 3 réplicas. Cela garantit qu'au moins 2 brokers confirment chaque écriture, protégeant contre la perte de données en cas de panne d'un broker.
:::

### 3. Appliquer les changements

```bash
kubectl apply -f kafka-topics-config.yaml
```

L'opérateur Kafka crée ou met à jour automatiquement les topics déclarés dans le manifeste.

### 4. Vérifier les topics

Überprüfen Sie, ob la ressource Kafka a bien été Aktualisierung :

```bash
kubectl get kafka my-kafka -o yaml | grep -A 10 "topics:"
```

Pour une Überprüfung plus poussée, vous pouvez lancer un pod de debug avec le CLI Kafka :

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

**Erwartetes Ergebnis :**

```console
events
orders
```

Pour voir le détail d'un topic :

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --describe --topic events
```

**Erwartetes Ergebnis :**

```console
Topic: events   TopicId: AbC123...   PartitionCount: 6   ReplicationFactor: 3
  Topic: events   Partition: 0   Leader: 1   Replicas: 1,2,0   Isr: 1,2,0
  Topic: events   Partition: 1   Leader: 2   Replicas: 2,0,1   Isr: 2,0,1
  ...
```

## Überprüfung

La configuration est réussie si :

- Les topics apparaissent dans la liste (`--list`)
- Le nombre de partitions et le facteur de réplication correspondent au manifeste
- Les ISR (In-Sync Replicas) contiennent bien le nombre attendu de brokers

## Weiterführende Informationen

- **[API-Referenz Kafka](../api-reference.md)** : documentation complète des paramètres `topics` et de la configuration avancée
- **[Skalierung von le cluster Kafka](./scale-resources.md)** : ajuster les ressources des brokers et de ZooKeeper
