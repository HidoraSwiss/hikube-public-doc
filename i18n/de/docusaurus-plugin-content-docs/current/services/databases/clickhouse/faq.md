---
sidebar_position: 6
title: FAQ
---

# FAQ — ClickHouse

### Quelle est la différence entre shards et réplicas ?

Les **shards** et les **réplicas** jouent des rôles différents dans l'architecture ClickHouse :

- **Shards** : distribution **horizontale** des données. Chaque shard contient une partie du dataset total. Ajouter des shards augmente la capacité de stockage et de traitement.
- **Réplicas** : copies **identiques** des données au sein d'un même shard. Chaque réplica contient les mêmes données um die ... sicherzustellen Hochverfügbarkeit.

```yaml title="clickhouse.yaml"
spec:
  shards: 2       # Les données sont réparties sur 2 shards
  replicas: 3     # Chaque shard a 3 copies (total: 6 pods)
```

:::tip
En production, utilisez au moins 2 réplicas par shard pour la Hochverfügbarkeit. Augmentez le nombre de shards pour traiter des volumes de données plus importants.
:::

### À quoi sert ClickHouse Keeper ?

**ClickHouse Keeper** est le composant de coordination du cluster, basé sur le protocole **Raft**. Il remplace Apache ZooKeeper et assure :

- L'**élection du leader** pour les tables répliquées
- La **coordination** des opérations de réplication entre réplicas
- La gestion des **métadonnées** du cluster

Le nombre de réplicas Keeper doit être **impair** (3 ou 5) pour garantir le quorum (majorité nécessaire pour l'élection du leader). Le minimum recommandé est **3 réplicas**.

```yaml title="clickhouse.yaml"
spec:
  clickhouseKeeper:
    enabled: true
    replicas: 3        # Toujours impair : 3 ou 5
    resourcesPreset: micro
    size: 2Gi
```

### ClickHouse est-il adapté aux requêtes transactionnelles (OLTP) ?

**Non.** ClickHouse est un moteur de base de données **OLAP** (Online Analytical Processing) optimisé pour l'analyse de données :

- Architecture **orientée colonnes** : très performant pour les agrégations et les scans sur de grands volumes de données
- Optimisé pour les **lectures massives** et les requêtes analytiques
- **Non adapté** aux opérations transactionnelles fréquentes (`UPDATE`, `DELETE` unitaires)

Si vous avez besoin d'un moteur transactionnel (OLTP), utilisez plutôt **PostgreSQL** ou **MySQL** sur Hikube.

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources prédéterminé pour chaque réplica ClickHouse. Si le champ `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est **entièrement ignoré**.

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="clickhouse.yaml"
spec:
  # Utilisation d'un preset
  resourcesPreset: large

  # OU configuration explicite (le preset est alors ignoré)
  resources:
    cpu: 4000m
    memory: 8Gi
```

### Comment sont distribuées les données entre shards ?

Les données sont distribuées entre les shards via le moteur **Distributed** de ClickHouse :

- Chaque shard stocke une **partition** du dataset total
- Le moteur `Distributed` redirige les requêtes vers tous les shards et **fusionne les résultats**
- Les données sont **répliquées** innerhalb von chaque shard selon le nombre de réplicas configuré

Pour bénéficier de la distribution, créez des tables avec le moteur `ReplicatedMergeTree` sur chaque shard et une table `Distributed` pour les requêtes globales.

### Konfiguration von les backups ClickHouse ?

Les sauvegardes ClickHouse utilisent **Restic** pour l'envoi vers un stockage S3 compatible. Configurez la section `backup` :

```yaml title="clickhouse.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/clickhouse-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Conservez le `resticPassword` en lieu sûr. Sans ce mot de passe, les sauvegardes ne pourront pas être déchiffrées.
:::
