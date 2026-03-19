---
title: "Konfiguration von les sauvegardes automatiques"
---

# Konfiguration von les sauvegardes automatiques

Ce guide vous explique comment aktiviertr et configurer les sauvegardes automatiques de votre base de données MySQL auf Hikube. Les sauvegardes utilisent **Restic** et sont stockées dans un bucket **S3-compatible**, ce qui permet une restauration fiable en cas de perte de données.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **MySQL** déployée sur votre tenant
- Un **bucket S3-compatible** accessible (Hikube Object Storage, AWS S3, MinIO, etc.)
- Les **identifiants d'accès S3** (Access Key et Secret Key)

## Schritte

### 1. Préparer le stockage S3 et les identifiants

Avant de configurer les sauvegardes, assurez-vous de disposer des informations suivantes :

| Information | Exemple | Beschreibung |
|---|---|---|
| **Région S3** | `eu-central-1` | Région du bucket S3 |
| **Bucket S3** | `s3.hikube.cloud/mysql-backups` | Chemin complet du bucket |
| **Access Key** | `HIKUBE123ACCESSKEY` | Clé d'accès S3 |
| **Secret Key** | `HIKUBE456SECRETKEY` | Clé secrète S3 |
| **Mot de passe Restic** | `SuperStrongResticPassword!` | Mot de passe pour le chiffrement des sauvegardes |

:::warning
Conservez le **mot de passe Restic** en lieu sûr. Sans ce mot de passe, il est impossible de restaurer les sauvegardes chiffrées.
:::

### 2. Configurer la section backup dans le manifeste

Créez ou modifiez votre manifeste MySQL pour inclure la section `backup` :

```yaml title="mysql-with-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: small

  users:
    appuser:
      password: strongpassword
      maxUserConnections: 100

  databases:
    myapp:
      roles:
        admin:
          - appuser

  backup:
    enabled: true
    schedule: "0 2 * * *"                                              # Tous les jours à 2h du matin
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```

#### Paramètres de backup

| Paramètre | Beschreibung | Wert par défaut |
|---|---|---|
| `backup.enabled` | Active les sauvegardes | `false` |
| `backup.schedule` | Planification cron | `"0 2 * * *"` |
| `backup.s3Region` | Région AWS S3 | `"us-east-1"` |
| `backup.s3Bucket` | Bucket S3 | - |
| `backup.s3AccessKey` | Clé d'accès S3 | - |
| `backup.s3SecretKey` | Clé secrète S3 | - |
| `backup.resticPassword` | Mot de passe Restic | - |
| `backup.cleanupStrategy` | Stratégie de rétention | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` |

:::tip
Adaptez le `schedule` selon vos besoins. Quelques exemples courants :
- `"0 2 * * *"` : tous les jours à 2h du matin
- `"0 */6 * * *"` : toutes les 6 heures
- `"0 3 * * 0"` : chaque dimanche à 3h du matin
:::

### 3. Konfiguration anwenden

```bash
kubectl apply -f mysql-with-backup.yaml
```

### 4. Adapter la stratégie de rétention

La `cleanupStrategy` utilise les options de rétention de Restic. Voici quelques exemples :

| Stratégie | Beschreibung |
|---|---|
| `--keep-last=3` | Conserver les 3 derniers snapshots |
| `--keep-daily=7` | Conserver 1 snapshot par jour pendant 7 jours |
| `--keep-weekly=4` | Conserver 1 snapshot par semaine pendant 4 semaines |
| `--keep-within-weekly=1m` | Conserver tous les snapshots hebdomadaires du dernier mois |

Exemple pour un environnement de production :

```yaml title="mysql-production-backup.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: production
spec:
  replicas: 3
  resourcesPreset: medium
  size: 50Gi

  backup:
    enabled: true
    schedule: "0 */6 * * *"
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    s3AccessKey: "PROD_ACCESS_KEY"
    s3SecretKey: "PROD_SECRET_KEY"
    resticPassword: "ProdResticPassword!"
```

## Überprüfung

Überprüfen Sie, ob la configuration a été appliquée correctement :

```bash
kubectl get mariadb example -o yaml | grep -A 10 backup
```

**Erwartetes Ergebnis :**

```console
  backup:
    enabled: true
    schedule: "0 2 * * *"
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
```

:::note
La première sauvegarde sera exécutée selon le planning cron défini dans `schedule`. Vous pouvez vérifier les snapshots disponibles avec la commande Restic (voir le guide [Comment restaurer une sauvegarde](./restore-backup.md)).
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) : liste complète des paramètres de backup
- [Comment restaurer une sauvegarde](./restore-backup.md) : procédure de restauration depuis un snapshot Restic
