---
title: "Comment configurer le sharding ClickHouse"
---

# Comment configurer le sharding ClickHouse

Ce guide explique comment configurer le sharding (partitionnement horizontal) sur ClickHouse pour distribuer les donnees sur plusieurs shards et garantir la haute disponibilite avec des replicas. La coordination du cluster est assuree par **ClickHouse Keeper**.

## Prerequis

- Une instance ClickHouse deployee sur Hikube (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Connaissance des concepts de sharding et replication (voir les [concepts](../concepts.md) si disponible)

## Etapes

### 1. Comprendre shards vs replicas

Avant de configurer le sharding, il est important de distinguer ces deux concepts :

- **Shards** : distribuent les donnees horizontalement. Chaque shard contient une partie des donnees. Plus de shards = plus de capacite de stockage et de traitement en parallele.
- **Replicas** : dupliquent les donnees au sein de chaque shard pour la redondance. Plus de replicas = plus de disponibilite en cas de panne.

Par exemple, avec `shards: 2` et `replicas: 2`, vous obtenez 4 pods ClickHouse au total (2 shards x 2 replicas par shard).

:::note
Le sharding est utile lorsque le volume de donnees depasse la capacite d'un seul noeud, ou lorsque vous souhaitez paralleliser les requetes sur plusieurs serveurs.
:::

### 2. Configurer le sharding

Creez un manifeste avec plusieurs shards et replicas :

```yaml title="clickhouse-sharded.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 2Gi
```

Cette configuration cree :
- **2 shards** pour distribuer les donnees
- **2 replicas par shard** pour la redondance (4 pods ClickHouse au total)
- **3 replicas Keeper** pour la coordination du cluster

### 3. Configurer le ClickHouse Keeper

ClickHouse Keeper assure la coordination du cluster : election du leader, replication des donnees et suivi de l'etat des shards. Il doit imperativement etre active pour les configurations shardees.

```yaml title="clickhouse-keeper-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

:::tip
Deployez toujours le Keeper en nombre impair (3 ou 5 replicas) pour garantir le quorum. Avec 3 replicas, le cluster tolere la perte d'un noeud Keeper. Avec 5, il en tolere deux.
:::

:::warning
Modifier le nombre de shards sur un cluster existant peut entrainer une redistribution complexe des donnees. Planifiez le nombre de shards des le deploiement initial autant que possible.
:::

### 4. Appliquer et verifier

Appliquez la configuration :

```bash
kubectl apply -f clickhouse-sharded.yaml
```

Attendez que tous les pods soient prets :

```bash
# Observer le deploiement en temps reel
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded -w
```

**Resultat attendu :**

```console
NAME                          READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-0-0     1/1     Running   0          4m
my-clickhouse-sharded-0-1     1/1     Running   0          4m
my-clickhouse-sharded-1-0     1/1     Running   0          3m
my-clickhouse-sharded-1-1     1/1     Running   0          3m
```

Verifiez egalement les pods Keeper :

```bash
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded,app.kubernetes.io/component=keeper
```

**Resultat attendu :**

```console
NAME                                  READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-keeper-0        1/1     Running   0          4m
my-clickhouse-sharded-keeper-1        1/1     Running   0          4m
my-clickhouse-sharded-keeper-2        1/1     Running   0          4m
```

## Verification

Connectez-vous a ClickHouse et verifiez la topologie du cluster :

```bash
# Se connecter au premier pod ClickHouse
kubectl exec -it my-clickhouse-sharded-0-0 -- clickhouse-client
```

Puis executez la requete suivante pour lister les shards et replicas :

```sql
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters
WHERE cluster = 'default'
ORDER BY shard_num, replica_num;
```

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Parametres `shards`, `replicas` et `clickhouseKeeper`
- [Comment scaler verticalement ClickHouse](./scale-resources.md) -- Ajuster les ressources CPU et memoire
- [Comment gerer les utilisateurs et profils](./manage-users.md) -- Gestion des acces utilisateurs
