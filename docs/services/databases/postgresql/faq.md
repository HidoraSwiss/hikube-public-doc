---
sidebar_position: 6
title: FAQ
---

# FAQ — PostgreSQL

### Quelle est la difference entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources predetermine pour chaque replica PostgreSQL. Si le champ `resources` (CPU/memoire explicites) est defini, `resourcesPreset` est **entierement ignore**.

| **Preset** | **CPU** | **Memoire** |
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

  # OU configuration explicite (le preset est alors ignore)
  resources:
    cpu: 2000m
    memory: 2Gi
```

### Comment choisir entre `storageClass` local et replicated ?

Hikube propose deux types de classes de stockage :

- **`local`** : les donnees sont stockees sur le noeud physique ou s'execute le pod. Ce mode offre les **meilleures performances** (latence minimale) mais ne protege pas contre la panne d'un noeud.
- **`replicated`** : les donnees sont repliquees sur plusieurs noeuds physiques. Ce mode assure la **haute disponibilite multi-DC** et protege contre la perte d'un noeud, au prix d'une latence legerement superieure.

:::tip
En production, privilegiez `storageClass: replicated` pour garantir la durabilite des donnees. En developpement, `local` peut suffire pour de meilleures performances.
:::

### Comment se connecter a PostgreSQL depuis l'interieur du cluster ?

Le service PostgreSQL est accessible via le nom de service Kubernetes suivant :

- **Service en lecture-ecriture** : `pg-<name>-rw` sur le port `5432`

Les identifiants de connexion sont stockes dans un Secret Kubernetes nomme `pg-<name>-app`.

```bash
# Recuperer le mot de passe
kubectl get secret pg-mydb-app -o jsonpath='{.data.password}' | base64 -d

# Recuperer le nom d'utilisateur
kubectl get secret pg-mydb-app -o jsonpath='{.data.username}' | base64 -d

# Se connecter depuis un pod
psql -h pg-mydb-rw -p 5432 -U <username> -d <database>
```

### Comment configurer la replication synchrone ?

La replication synchrone garantit qu'une transaction n'est confirmee que lorsqu'elle a ete ecrite sur un nombre minimum de replicas. Configurez les parametres `quorum` dans votre manifeste :

```yaml title="postgresql.yaml"
spec:
  replicas: 3
  quorum:
    minSyncReplicas: 1    # Au moins 1 replica doit confirmer
    maxSyncReplicas: 2    # Au maximum 2 replicas confirment
```

- **`minSyncReplicas`** : nombre minimum de replicas synchrones qui doivent accuser reception d'une transaction.
- **`maxSyncReplicas`** : nombre maximum de replicas synchrones pouvant accuser reception.

:::warning
La replication synchrone augmente la latence d'ecriture. Assurez-vous d'avoir suffisamment de replicas (`replicas` >= `maxSyncReplicas` + 1).
:::

### Comment activer le backup PITR ?

PostgreSQL sur Hikube utilise **CloudNativePG** avec l'archivage WAL pour permettre la restauration a un instant donne (PITR). Configurez la section `backup` avec un stockage S3 compatible :

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

Les sauvegardes incluent automatiquement les fichiers WAL, ce qui permet de restaurer la base a n'importe quel instant entre deux sauvegardes.

### Comment ajouter des extensions PostgreSQL ?

Vous pouvez activer des extensions PostgreSQL pour chaque base de donnees via le champ `databases[name].extensions` :

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

Les extensions sont activees automatiquement lors de la creation de la base. Les extensions disponibles dependent de la version de PostgreSQL deployee.

### Peut-on creer plusieurs bases et utilisateurs ?

Oui. Utilisez les maps `users` et `databases` pour definir autant d'utilisateurs et de bases que necessaire. Chaque base peut avoir des roles `admin` et `readonly` distincts :

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
