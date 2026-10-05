---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

:::info Disponibilité
ClickHouse n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

### Quelle est la différence entre shards et réplicas ?

Les **shards** et les **réplicas** jouent des rôles différents dans l'architecture ClickHouse :

- **Shards** : distribution **horizontale** des données. Chaque shard contient une partie du dataset total. Ajouter des shards augmente la capacité de stockage et de traitement.
- **Réplicas** : copies **identiques** des données au sein d'un même shard, pour la haute disponibilité.

Par exemple, 2 shards avec 3 réplicas chacun représentent 6 nœuds ClickHouse.

:::tip
En production, prévoyez au moins 2 réplicas par shard pour la haute disponibilité. Augmentez le nombre de shards pour traiter des volumes de données plus importants.
:::

### À quoi sert ClickHouse Keeper ?

**ClickHouse Keeper** est le composant de coordination du cluster, basé sur le protocole **Raft**. Il remplace Apache ZooKeeper et assure :

- L'**élection du leader** pour les tables répliquées
- La **coordination** des opérations de réplication entre réplicas
- La gestion des **métadonnées** du cluster

Le nombre d'instances Keeper doit être **impair** (3 ou 5) pour garantir le quorum. Le minimum recommandé est **3**.

### ClickHouse est-il adapté aux requêtes transactionnelles (OLTP) ?

**Non.** ClickHouse est un moteur **OLAP** (Online Analytical Processing) optimisé pour l'analyse de données :

- Architecture **orientée colonnes** : très performant pour les agrégations et les scans sur de grands volumes
- Optimisé pour les **lectures massives** et les requêtes analytiques
- **Non adapté** aux opérations transactionnelles fréquentes (`UPDATE`, `DELETE` unitaires)

Pour un moteur transactionnel, utilisez plutôt [PostgreSQL](../postgresql/overview.md) ou [MariaDB](../mariadb/overview.md), disponibles dans la console.

### Quels presets sont disponibles ?

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Le preset s'applique à chaque réplica. Indiquez-le dans votre demande au support.

### Comment sont distribuées les données entre shards ?

Les données sont distribuées entre les shards via le moteur **Distributed** de ClickHouse :

- Chaque shard stocke une **partition** du dataset total
- Le moteur `Distributed` redirige les requêtes vers tous les shards et **fusionne les résultats**
- Les données sont **répliquées** au sein de chaque shard selon le nombre de réplicas

Créez des tables `ReplicatedMergeTree` sur chaque shard et une table `Distributed` pour les requêtes globales. Voir [Configurer le sharding](./how-to/configure-sharding.md).

### Comment configurer les backups ClickHouse ?

Les sauvegardes ClickHouse envoient des snapshots chiffrés vers un stockage compatible S3. Leur mise en place se fait sur demande : [contactez le support](mailto:support@hidora.io) en précisant la fréquence et la rétention souhaitées.
