---
title: "Comment restaurer une sauvegarde (PITR)"
---

# Comment restaurer une sauvegarde (PITR)

Ce guide explique comment restaurer une base de données PostgreSQL à un instant précis grâce au mécanisme de **Point-In-Time Recovery (PITR)** intégré à Hikube.

:::warning
La restauration PITR crée une **nouvelle instance** PostgreSQL avec un nom différent. Elle ne restaure pas l'instance existante en place. L'ancienne instance n'est pas modifiée.
:::

## Prérequis

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance PostgreSQL d'origine avec les **sauvegardes activées** (`backup.enabled: true`)
- Les sauvegardes doivent avoir été correctement envoyées vers le bucket S3
- Le **nom de l'ancienne instance** PostgreSQL (`bootstrap.oldName`)
- (Optionnel) Un **timestamp RFC 3339** pour la restauration à un instant précis

## Étapes

### 1. Identifier le point de restauration

Déterminez l'instant auquel vous souhaitez restaurer vos données. Le timestamp doit être au format **RFC 3339** :

```
YYYY-MM-DDTHH:MM:SSZ
```

**Exemples :**

| Timestamp | Description |
|-----------|-------------|
| `2025-06-15T10:30:00Z` | 15 juin 2025 à 10h30 UTC |
| `2025-06-15T14:00:00+02:00` | 15 juin 2025 à 14h00 (heure de Paris) |
| _(vide)_ | Restauration au dernier état disponible |

:::tip
Si vous laissez `recoveryTime` vide, la restauration s'effectue jusqu'au dernier WAL disponible, c'est-à-dire l'état le plus récent possible.
:::

### 2. Préparer le manifeste de la nouvelle instance

Créez un manifeste pour la nouvelle instance PostgreSQL. Le nom doit être **différent** de l'instance d'origine. La configuration (replicas, resources, stockage) doit être **identique** à celle de l'instance d'origine.

Ajoutez la section `bootstrap` pour activer la restauration :

```yaml title="postgresql-restored.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database-restored
spec:
  replicas: 3
  resourcesPreset: medium
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin

  backup:
    enabled: true
    schedule: "0 2 * * *"
    retentionPolicy: 30d
    destinationPath: s3://backups/postgresql/my-database-restored/
    endpointURL: http://minio-gateway-service:9000
    s3AccessKey: oobaiRus9pah8PhohL1ThaeTa4UVa7gu
    s3SecretKey: ju3eum4dekeich9ahM1te8waeGai0oog

  bootstrap:
    enabled: true
    oldName: "my-database"
    recoveryTime: "2025-06-15T10:30:00Z"
```

**Paramètres clés de la section `bootstrap` :**

| Paramètre | Description | Requis |
|-----------|-------------|--------|
| `bootstrap.enabled` | Active la restauration depuis une sauvegarde | Oui |
| `bootstrap.oldName` | Nom de l'ancienne instance PostgreSQL | Oui |
| `bootstrap.recoveryTime` | Timestamp RFC 3339 du point de restauration. Vide = dernier état disponible | Non |

:::note
Le champ `bootstrap.oldName` correspond au `metadata.name` de l'instance d'origine. Dans cet exemple, l'ancienne instance s'appelait `my-database`.
:::

### 3. Appliquer le manifeste

```bash
kubectl apply -f postgresql-restored.yaml
```

La création de la nouvelle instance et la restauration peuvent prendre plusieurs minutes selon le volume de données.

### 4. Vérifier la restauration

Surveillez l'état de la nouvelle instance :

```bash
kubectl get postgres my-database-restored
```

**Résultat attendu :**

```console
NAME                      READY   AGE     VERSION
my-database-restored      True    3m12s   0.18.0
```

Vérifiez que les pods sont en état `Running` :

```bash
kubectl get po | grep postgres-my-database-restored
```

**Résultat attendu :**

```console
postgres-my-database-restored-1   1/1     Running   0   3m
postgres-my-database-restored-2   1/1     Running   0   2m
postgres-my-database-restored-3   1/1     Running   0   1m
```

### 5. Valider les données restaurées

Récupérez les identifiants de connexion de la nouvelle instance :

```bash
kubectl get secret postgres-my-database-restored-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

Connectez-vous à la base et vérifiez que les données sont présentes :

```bash
kubectl port-forward svc/postgres-my-database-restored-rw 5432:5432
```

```bash
psql -h 127.0.0.1 -U admin myapp
```

```sql
-- Vérifier les tables et les données
\dt
SELECT count(*) FROM votre_table;
```

## Vérification

La restauration est réussie si :

- L'instance `my-database-restored` est en état `READY: True`
- Les pods PostgreSQL sont tous en état `Running`
- Les données sont présentes et cohérentes au timestamp demandé
- La connexion `psql` fonctionne correctement

:::tip
Une fois la restauration validée, pensez à mettre à jour vos applications pour pointer vers la nouvelle instance (`postgres-my-database-restored-rw` au lieu de `postgres-my-database-rw`).
:::

## Pour aller plus loin

- **[Référence API PostgreSQL](../api-reference.md)** : documentation complète des paramètres `bootstrap`
- **[Comment configurer les sauvegardes automatiques](./configure-backups.md)** : activer les sauvegardes sur la nouvelle instance
