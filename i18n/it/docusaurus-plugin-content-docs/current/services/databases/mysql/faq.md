---
sidebar_position: 6
title: FAQ
---

# FAQ — MySQL

### Pourquoi Hikube utilise MariaDB pour le service MySQL ?

Le service MySQL sur Hikube est basé sur **MariaDB**, déployé via le **MariaDB Operator**. MariaDB est un fork open-source de MySQL, entièrement compatible avec le protocole et la syntaxe MySQL. Ce choix garantit :

- Une **compatibilité totale** avec les clients et applications MySQL existants
- Un développement **open-source** actif et transparent
- Des fonctionnalités avancées (compression de colonnes, moteur Aria, etc.)

Vos applications MySQL fonctionnent sans modification avec le service MySQL Hikube.

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources prédéterminé pour chaque réplica MySQL. Si le champ `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est **entièrement ignoré**.

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="mysql.yaml"
spec:
  # Utilisation d'un preset
  resourcesPreset: small

  # OU configuration explicite (le preset est alors ignoré)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Comment fonctionne la réplication MySQL sur Hikube ?

La réplication MySQL sur Hikube utilise la **réplication binlog** (binary log) gérée par le MariaDB Operator :

- Un nœud est désigné comme **primary** (lecture-écriture)
- Les autres nœuds sont des **réplicas** (lecture seule)
- Le basculement automatique (**auto-failover**) est géré par l'opérateur en cas de panne du primary

Avec 3 réplicas, vous obtenez 1 primary + 2 réplicas, ce qui assure la haute disponibilité.

### Comment configurer les backups avec Restic ?

Les sauvegardes MySQL utilisent **Restic** pour le chiffrement et la compression. Configurez la section `backup` avec un stockage S3 compatible :

```yaml title="mysql.yaml"
spec:
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.example.com/mysql-backups
    schedule: "0 3 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
    resticPassword: your-restic-password
```

:::warning
Conservez le `resticPassword` en lieu sûr. Sans ce mot de passe, les sauvegardes ne pourront pas être déchiffrées.
:::

### Comment effectuer un switchover de primary ?

Pour basculer le rôle de primary vers un autre réplica, modifiez le champ `spec.replication.primary.podIndex` dans votre manifeste :

```yaml title="mysql.yaml"
spec:
  replication:
    primary:
      podIndex: 1    # Index du pod qui deviendra le nouveau primary
```

Appliquez ensuite la modification :

```bash
kubectl apply -f mysql.yaml
```

:::note
Le switchover entraîne une **brève interruption** des écritures pendant la bascule. Les lectures restent disponibles sur les réplicas.
:::

### Comment gérer les utilisateurs et bases de données ?

Utilisez les maps `users` et `databases` pour définir vos utilisateurs et bases. Chaque utilisateur peut avoir une limite de connexions, et chaque base des rôles `admin` et `readonly` :

```yaml title="mysql.yaml"
spec:
  users:
    appuser:
      password: SecurePassword123
      maxUserConnections: 100
    analyst:
      password: AnalystPassword456
      maxUserConnections: 20

  databases:
    production:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
    analytics:
      roles:
        admin:
          - appuser
        readonly:
          - analyst
```
