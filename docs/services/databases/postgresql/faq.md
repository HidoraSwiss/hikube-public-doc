---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources prédéterminé pour chaque réplica PostgreSQL. Si le champ `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est **entièrement ignoré**.

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="postgresql.yaml"
spec:
  # Utilisation d'un preset
  resourcesPreset: medium

  # OU configuration explicite (le preset est alors ignoré)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Comment choisir entre `storageClass` local et replicated ?

Hikube propose deux types de classes de stockage :

- **`local`** : les données sont stockées sur le nœud physique où s'exécute le pod. Ce mode offre les **meilleures performances** (latence minimale) mais ne protège pas contre la panne d'un nœud.
- **`replicated`** : les données sont répliquées sur plusieurs nœuds physiques. Ce mode assure la **haute disponibilité multi-DC** et protège contre la perte d'un nœud, au prix d'une latence légèrement supérieure.

:::tip
En production, privilégiez `storageClass: replicated` pour garantir la durabilité des données. En développement, `local` peut suffire pour de meilleures performances.
:::

### Comment se connecter à PostgreSQL depuis l'intérieur du cluster ?

Le service PostgreSQL est accessible via le nom de service Kubernetes suivant :

- **Service en lecture-écriture** : `pg-<name>-rw` sur le port `5432`

Les identifiants de connexion sont stockés dans un Secret Kubernetes nommé `pg-<name>-app`.

```bash
# Récupérer le mot de passe
kubectl get secret pg-mydb-app -o jsonpath='{.data.password}' | base64 -d

# Récupérer le nom d'utilisateur
kubectl get secret pg-mydb-app -o jsonpath='{.data.username}' | base64 -d

# Se connecter depuis un pod
psql -h pg-mydb-rw -p 5432 -U <username> -d <database>
```

### Comment configurer la réplication synchrone ?

La réplication synchrone garantit qu'une transaction n'est confirmée que lorsqu'elle a été écrite sur un nombre minimum de réplicas. Configurez les paramètres `quorum` dans votre manifeste :

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  quorum:
    minSyncReplicas: 1    # Au moins 1 réplica doit confirmer
    maxSyncReplicas: 2    # Au maximum 2 réplicas confirment
```

- **`minSyncReplicas`** : nombre minimum de réplicas synchrones qui doivent accuser réception d'une transaction.
- **`maxSyncReplicas`** : nombre maximum de réplicas synchrones pouvant accuser réception.

:::warning
La réplication synchrone augmente la latence d'écriture. Assurez-vous d'avoir suffisamment de réplicas (`replicas` >= `maxSyncReplicas` + 1).
:::

### Comment activer le backup PITR ?

PostgreSQL sur Hikube utilise **CloudNativePG** avec l'archivage WAL pour permettre la restauration à un instant donné (PITR). Configurez la section `backup` avec un stockage S3 compatible :

```yaml title="postgresql.yaml"
spec:
  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://my-bucket/postgresql-backups/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: your-access-key
    s3SecretKey: your-secret-key
```

Les sauvegardes incluent automatiquement les fichiers WAL, ce qui permet de restaurer la base à n'importe quel instant entre deux sauvegardes.

### Comment ajouter des extensions PostgreSQL ?

Vous pouvez activer des extensions PostgreSQL pour chaque base de données via le champ `databases[name].extensions` :

```yaml title="postgresql.yaml"
spec:
  databases:
    myapp:
      extensions:
        - uuid-ossp
        - pgcrypto
        - hstore
      roles:
        admin:
          - admin
```

Les extensions sont activées automatiquement lors de la création de la base. Les extensions disponibles dépendent de la version de PostgreSQL déployée.

### Peut-on créer plusieurs bases et utilisateurs ?

Oui. Utilisez les maps `users` et `databases` pour définir autant d'utilisateurs et de bases que nécessaire. Chaque base peut avoir des rôles `admin` et `readonly` distincts :

```yaml title="postgresql.yaml"
spec:
  users:
    admin:
      password: AdminPassword123
      replication: true
    appuser:
      password: AppPassword456
    analyst:
      password: AnalystPassword789

  databases:
    production:
      roles:
        admin:
          - admin
        readonly:
          - analyst
      extensions:
        - uuid-ossp
    analytics:
      roles:
        admin:
          - admin
        readonly:
          - appuser
          - analyst
```
