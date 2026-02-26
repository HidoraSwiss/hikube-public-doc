---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer Kafka en 5 minutes

Ce guide vous accompagne pas à pas dans le déploiement de votre premier **cluster Kafka** sur Hikube, du manifeste YAML jusqu'aux premiers tests de messagerie.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster Kafka** déployé et opérationnel sur Hikube
- **3 brokers Kafka** et **3 nœuds ZooKeeper** pour la haute disponibilité
- Un **topic** prêt à recevoir des messages
- Un **stockage persistant** pour vos données Kafka et ZooKeeper

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- **Droits administrateur** sur votre tenant
- Un **namespace** dédié pour héberger votre cluster Kafka
- **kafkacat** (ou `kcat`) installé sur votre poste (optionnel, pour les tests)

---

## Étape 1 : Créer le manifeste Kafka

Créez un fichier `kafka.yaml` avec la configuration suivante :

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: example
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
    storageClass: replicated
  topics:
    - name: my-topic
      partitions: 3
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
```

:::tip
Kafka ne dispose pas d'authentification par défaut sur Hikube. Pour un usage en production, il est recommandé de ne pas exposer le cluster à l'extérieur (`external: false`). Consultez la [Référence API](./api-reference.md) pour la configuration complète.
:::

---

## Étape 2 : Déployer le cluster Kafka

Appliquez le manifeste et vérifiez que le déploiement démarre :

```bash
# Appliquer le manifeste
kubectl apply -f kafka.yaml
```

Vérifiez le statut du cluster (peut prendre 2-3 minutes) :

```bash
kubectl get kafka
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.13.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que tous les pods sont en état `Running` :

```bash
kubectl get pods | grep kafka
```

**Résultat attendu :**

```console
kafka-example-kafka-0        1/1     Running   0   2m
kafka-example-kafka-1        1/1     Running   0   2m
kafka-example-kafka-2        1/1     Running   0   2m
kafka-example-zookeeper-0    1/1     Running   0   2m
kafka-example-zookeeper-1    1/1     Running   0   2m
kafka-example-zookeeper-2    1/1     Running   0   2m
```

Avec `kafka.replicas: 3` et `zookeeper.replicas: 3`, vous obtenez **6 pods** :

| Préfixe | Rôle | Nombre |
|---------|------|--------|
| `kafka-example-kafka-*` | **Brokers Kafka** (réception, stockage et distribution des messages) | 3 |
| `kafka-example-zookeeper-*` | **ZooKeeper** (coordination du cluster et élection du leader) | 3 |

---

## Étape 4 : Récupérer les identifiants

Kafka sur Hikube ne dispose pas d'authentification par défaut. Les connexions se font directement via le service bootstrap :

```bash
kubectl get svc | grep kafka
```

**Résultat attendu :**

```console
kafka-example-kafka-bootstrap    ClusterIP      10.96.xx.xx    <none>        9092/TCP    2m
kafka-example-kafka-brokers      ClusterIP      None           <none>        9092/TCP    2m
kafka-example-zookeeper-client   ClusterIP      10.96.xx.xx    <none>        2181/TCP    2m
```

:::note
Le service `kafka-example-kafka-bootstrap` est le point d'entrée principal pour les clients Kafka.
:::

---

## Étape 5 : Connexion et tests

### Port-forward du service Kafka

```bash
kubectl port-forward svc/kafka-example-kafka-bootstrap 9092:9092 &
```

### Publier et consommer un message

```bash
# Envoyer un message sur le topic
echo "Hello Hikube!" | kafkacat -b localhost:9092 -t my-topic -P

# Consommer le message
kafkacat -b localhost:9092 -t my-topic -C -o beginning -e
```

**Résultat attendu :**

```console
Hello Hikube!
```

:::note
Si vous n'avez pas `kafkacat`, vous pouvez l'installer avec `apt install kafkacat` (Debian/Ubuntu) ou `brew install kcat` (macOS).
:::

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du broker en erreur
kubectl logs kafka-example-kafka-0

# Vérifier les events du pod
kubectl describe pod kafka-example-kafka-0
```

**Causes fréquentes :** mémoire insuffisante (`kafka.resources.memory` trop faible), volume de stockage plein.

### Kafka non accessible

```bash
# Vérifier que les services existent
kubectl get svc | grep kafka

# Vérifier le service bootstrap
kubectl describe svc kafka-example-kafka-bootstrap
```

**Causes fréquentes :** port-forward non actif, mauvais port dans la chaîne de connexion, service non prêt.

### ZooKeeper en erreur

```bash
# Vérifier les logs ZooKeeper
kubectl logs kafka-example-zookeeper-0

# Vérifier l'état des pods ZooKeeper
kubectl get pods | grep zookeeper
```

**Causes fréquentes :** le quorum ZooKeeper nécessite un nombre impair de réplicas (3 minimum recommandé), espace disque insuffisant.

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster Kafka
kubectl describe kafka example
```

---

## Étape 7 : Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f kafka.yaml
```

:::warning
Cette action supprime le cluster Kafka et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Résumé

Vous avez déployé :

- Un cluster Kafka avec **3 brokers** répartis sur des nœuds différents
- **3 nœuds ZooKeeper** pour la coordination du cluster
- Un **topic** configuré avec 3 partitions et 3 réplicas
- Un stockage persistant pour la durabilité des données

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options Kafka
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage Kafka sur Hikube
