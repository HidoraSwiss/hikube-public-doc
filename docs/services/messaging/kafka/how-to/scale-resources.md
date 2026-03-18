---
title: "Comment scaler le cluster"
---

# Comment scaler le cluster Kafka

Ce guide explique comment ajuster les ressources d'un cluster Kafka sur Hikube : nombre de brokers, ressources CPU/mémoire, stockage, ainsi que la configuration ZooKeeper associée.

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Un cluster **Kafka** déployé sur Hikube

## Presets disponibles

Hikube propose des presets de ressources prédéfinis, applicables aux brokers Kafka et aux nœuds ZooKeeper :

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
Si le champ `resources` (CPU/mémoire explicites) est défini, la valeur de `resourcesPreset` est **entièrement ignorée**. Assurez-vous de vider le champ `resources` si vous souhaitez utiliser un preset.
:::

## Étapes

### 1. Vérifier les ressources actuelles

Consultez la configuration actuelle du cluster :

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

**Exemple de résultat :**

```console
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

### 2. Scaler les brokers Kafka

Vous pouvez ajuster le nombre de brokers, les ressources et le stockage indépendamment.

**Option A : changer le preset des brokers**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    resources: {}
'
```

**Option B : définir des ressources explicites**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
'
```

Vous pouvez aussi modifier le manifeste complet :

```yaml title="kafka-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 50Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics: []
```

```bash
kubectl apply -f kafka-scaled.yaml
```

:::warning
Réduire le nombre de brokers sur un cluster existant peut entraîner une perte de données si des partitions ne sont pas redistribuées au préalable. Augmentez toujours le nombre de brokers plutôt que de le réduire.
:::

### 3. Scaler ZooKeeper

ZooKeeper utilise un mécanisme de quorum : le nombre de réplicas doit être **impair** (1, 3, 5) pour garantir l'élection d'un leader.

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  zookeeper:
    replicas: 3
    resourcesPreset: medium
    resources: {}
'
```

Ou avec des ressources explicites :

```yaml title="kafka-zookeeper-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    size: 50Gi
  zookeeper:
    replicas: 3
    resources:
      cpu: 1000m
      memory: 1Gi
    size: 10Gi
  topics: []
```

```bash
kubectl apply -f kafka-zookeeper-scaled.yaml
```

:::tip
En production, 3 réplicas ZooKeeper suffisent dans la majorité des cas. 5 réplicas sont recommandés uniquement pour les clusters très larges (10+ brokers).
:::

### 4. Augmenter le stockage si nécessaire

Si les brokers manquent d'espace disque, augmentez la taille du volume persistant :

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    size: 100Gi
'
```

:::warning
Le nombre de réplicas d'un topic ne peut pas dépasser le nombre de brokers. Après un scale-up des brokers, vous pouvez augmenter le facteur de réplication de vos topics existants.
:::

### 5. Appliquer et vérifier

Si vous n'avez pas encore appliqué les changements :

```bash
kubectl apply -f kafka-scaled.yaml
```

Surveillez le rolling update des pods :

```bash
kubectl get po -w | grep my-kafka
```

**Résultat attendu (pendant le rolling update) :**

```console
my-kafka-kafka-0       1/1     Running       0   45m
my-kafka-kafka-1       1/1     Running       0   44m
my-kafka-kafka-2       1/1     Terminating   0   43m
my-kafka-kafka-2       0/1     Pending       0   0s
my-kafka-kafka-2       1/1     Running       0   30s
```

Attendez que tous les pods soient en état `Running` :

```bash
kubectl get po | grep my-kafka
```

```console
my-kafka-kafka-0       1/1     Running   0   10m
my-kafka-kafka-1       1/1     Running   0   8m
my-kafka-kafka-2       1/1     Running   0   6m
my-kafka-kafka-3       1/1     Running   0   4m
my-kafka-kafka-4       1/1     Running   0   2m
my-kafka-zookeeper-0   1/1     Running   0   10m
my-kafka-zookeeper-1   1/1     Running   0   8m
my-kafka-zookeeper-2   1/1     Running   0   6m
```

## Vérification

Confirmez que les nouvelles ressources sont appliquées :

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

Vérifiez que le cluster est fonctionnel en listant les topics :

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

## Pour aller plus loin

- **[Référence API Kafka](../api-reference.md)** : documentation complète des paramètres `kafka`, `zookeeper` et du tableau des presets
- **[Comment créer et gérer les topics](./manage-topics.md)** : configurer les topics après le scaling
