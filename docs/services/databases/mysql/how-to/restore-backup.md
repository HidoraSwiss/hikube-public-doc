---
title: "Comment restaurer une sauvegarde"
---

# Comment restaurer une sauvegarde

Ce guide vous explique comment restaurer une base de données MySQL à partir d'une sauvegarde Restic stockée dans un bucket S3-compatible. La restauration est effectuée via le CLI **Restic** depuis votre poste de travail.

## Prérequis

- **Restic CLI** installé sur votre machine locale
- Les **identifiants S3** utilisés lors de la configuration des sauvegardes (Access Key, Secret Key)
- Le **mot de passe Restic** utilisé pour chiffrer les sauvegardes
- Le **nom du bucket S3** et le chemin du dépôt
- Un client **mysql** pour importer les données restaurées

## Étapes

### 1. Installer Restic CLI

Installez Restic selon votre système d'exploitation :

```bash
# macOS (Homebrew)
brew install restic

# Debian / Ubuntu
sudo apt install restic

# Depuis les binaires officiels
# https://github.com/restic/restic/releases
```

### 2. Configurer les variables d'environnement Restic

Exportez les variables nécessaires pour que Restic puisse accéder au dépôt de sauvegardes :

```bash
export AWS_ACCESS_KEY_ID="HIKUBE123ACCESSKEY"
export AWS_SECRET_ACCESS_KEY="HIKUBE456SECRETKEY"
export RESTIC_PASSWORD="SuperStrongResticPassword!"
export RESTIC_REPOSITORY="s3:s3.hikube.cloud/mysql-backups/example"
```

:::warning
Le chemin du dépôt (`RESTIC_REPOSITORY`) correspond au `s3Bucket` configuré dans le manifeste MySQL, suivi du **nom de l'instance**. Par exemple, pour une instance nommée `example` avec `s3Bucket: s3.hikube.cloud/mysql-backups`, le dépôt sera `s3:s3.hikube.cloud/mysql-backups/example`.
:::

### 3. Lister les snapshots disponibles

Affichez l'ensemble des sauvegardes stockées dans le dépôt :

```bash
restic snapshots
```

**Résultat attendu :**

```console
repository abc12345 opened successfully
ID        Time                 Host        Tags        Paths
---------------------------------------------------------------
a1b2c3d4  2025-01-15 02:00:05  mysql-example            /backup
e5f6g7h8  2025-01-16 02:00:03  mysql-example            /backup
i9j0k1l2  2025-01-17 02:00:04  mysql-example            /backup
---------------------------------------------------------------
3 snapshots
```

:::tip
Vous pouvez filtrer les snapshots par date avec `restic snapshots --latest 5` pour afficher uniquement les 5 plus récents.
:::

### 4. Restaurer un snapshot

Restaurez le dernier snapshot (ou un snapshot spécifique) dans un répertoire local :

```bash
# Restaurer le dernier snapshot
restic restore latest --target /tmp/mysql-restore

# Ou restaurer un snapshot spécifique par son ID
restic restore a1b2c3d4 --target /tmp/mysql-restore
```

Le contenu restauré sera disponible dans `/tmp/mysql-restore/backup/`.

### 5. Importer les données dans MySQL

Une fois les fichiers de sauvegarde extraits, importez-les dans votre instance MySQL :

```bash
# Identifier les fichiers de dump restaurés
ls /tmp/mysql-restore/backup/

# Importer le dump dans la base de données cible
mysql -h <host-mysql> -P 3306 -u <utilisateur> -p <base_de_donnees> < /tmp/mysql-restore/backup/dump.sql
```

:::note
L'adresse du host MySQL dépend de votre configuration :
- **Accès interne** (port-forward) : `127.0.0.1` après `kubectl port-forward svc/mysql-example 3306:3306`
- **Accès externe** (LoadBalancer) : l'IP externe du service `mysql-example-primary`
:::

### 6. Nettoyer les fichiers temporaires

Une fois la restauration terminée et vérifiée, supprimez les fichiers temporaires :

```bash
rm -rf /tmp/mysql-restore
```

## Vérification

Connectez-vous à l'instance MySQL et vérifiez que les données ont été correctement restaurées :

```bash
mysql -h <host-mysql> -P 3306 -u <utilisateur> -p <base_de_donnees>
```

```sql
-- Vérifier les tables présentes
SHOW TABLES;

-- Vérifier le nombre de lignes dans une table
SELECT COUNT(*) FROM <nom_table>;
```

:::warning Testez la restauration régulièrement
Il est fortement recommandé de tester la procédure de restauration de manière régulière, idéalement dans un environnement de développement. Une sauvegarde qui n'a jamais été testée ne garantit pas une restauration réussie.
:::

## Pour aller plus loin

- [Référence API](../api-reference.md) : configuration complète des paramètres de backup
- [Comment configurer les sauvegardes automatiques](./configure-backups.md) : mise en place des sauvegardes Restic + S3
