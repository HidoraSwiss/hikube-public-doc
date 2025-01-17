---
title: FerretDB
---

# FerretDB

FerretDB est une base de données compatible avec MongoDB, s'appuyant sur PostgreSQL comme backend. Elle permet de bénéficier de la simplicité de MongoDB tout en exploitant la robustesse de PostgreSQL.

---

## Restaurer un Backup

Vous pouvez restaurer un backup de ClickHouse à l'aide de Restic. Voici les étapes principales :

### Trouver un Snapshot

Utilisez la commande suivante pour lister les snapshots disponibles dans votre bucket S3 :

```bash
restic -r s3:s3.example.org/clickhouse-backups/table_name snapshots
```

### Restaurer le Snapshot

Pour restaurer le snapshot le plus récent, exécutez la commande suivante en spécifiant une cible de restauration :

```bash
restic -r s3:s3.example.org/clickhouse-backups/table_name restore latest --target /tmp/
````

Pour en savoir plus sur l'utilisation de Restic, consultez [cet article détaillé](https://blog.aenix.io/restic-effective-backup-from-stdin-4bc1e8f083c1).

---

## Paramètres Configurables

### **Paramètres Généraux**

Ces paramètres permettent de configurer les aspects fondamentaux de FerretDB.

| **Nom**                 | **Description**                                                                                          | **Valeur Par Défaut** |
|--------------------------|----------------------------------------------------------------------------------------------------------|------------------------|
| `external`              | Permet l'accès externe à FerretDB depuis l'extérieur du cluster.                                         | `false`               |
| `size`                  | Taille du volume persistant principal.                                                                   | `10Gi`                |
| `replicas`              | Nombre de réplicas PostgreSQL pour FerretDB.                                                             | `2`                   |
| `storageClass`          | Classe de stockage Kubernetes utilisée pour les données.                                                 | `""` (non spécifié)   |
| `quorum.minSyncReplicas`| Nombre minimum de réplicas synchrones nécessaires pour qu'une transaction soit considérée comme validée. | `0`                   |
| `quorum.maxSyncReplicas`| Nombre maximum de réplicas synchrones pouvant valider une transaction (doit être inférieur au nombre total d'instances). | `0`                   |

---

### **Paramètres de Configuration**

Ces paramètres concernent les configurations spécifiques à FerretDB.

| **Nom**  | **Description**                       | **Valeur Par Défaut** |
|----------|---------------------------------------|------------------------|
| `users`  | Configuration des utilisateurs (sous forme d'objet YAML). | `{}`                  |

---

### **Paramètres de Backup**

Ces paramètres permettent de configurer les sauvegardes périodiques de FerretDB.

| **Nom**                  | **Description**                                           | **Valeur Par Défaut**                         |
|---------------------------|-----------------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Active ou désactive les sauvegardes périodiques.          | `false`                                      |
| `backup.s3Region`        | Région AWS S3 où les sauvegardes sont stockées.           | `us-east-1`                                  |
| `backup.s3Bucket`        | Nom du bucket S3 utilisé pour le stockage des sauvegardes. | `s3.example.org/postgres-backups`            |
| `backup.schedule`        | Planification des sauvegardes (au format Cron).           | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Stratégie pour nettoyer les anciennes sauvegardes.        | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | Clé d'accès AWS S3 pour l'authentification.               | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | Clé secrète AWS S3 pour l'authentification.               | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Mot de passe utilisé pour chiffrer les sauvegardes Restic. | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Exemple de Configuration

Voici un exemple de configuration pour FerretDB avec des sauvegardes activées et une personnalisation des réplicas :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: FerretDB
metadata:
  name: ferretdb-example
spec:
  external: true
  size: 20Gi
  replicas: 3
  storageClass: "fast-storage"
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  backup:
    enabled: true
    s3Region: "us-east-1"
    s3Bucket: "s3.example.org/postgres-backups"
    schedule: "0 2 * * *"
    cleanupStrategy: "--keep-last=5 --keep-daily=5 --keep-within-weekly=1m"
    s3AccessKey: "your-s3-access-key"
    s3SecretKey: "your-s3-secret-key"
    resticPassword: "your-restic-password"
```

---

## Ressources Additionnelles

Pour approfondir vos connaissances sur FerretDB et ses fonctionnalités, voici quelques ressources utiles :

- [**Documentation Officielle FerretDB**](https://github.com/FerretDB/FerretDB)  
  Découvrez les détails techniques, les options de configuration et les exemples d'utilisation de FerretDB.

- [**Guide Restic**](https://restic.readthedocs.io/)  
  Apprenez à utiliser Restic pour la gestion des sauvegardes, y compris les meilleures pratiques pour le chiffrement et la restauration.

- [**Tutoriel : Format Cron**](https://crontab.guru/)  
  Un outil pratique pour créer et comprendre les expressions Cron utilisées pour les sauvegardes planifiées.

- [**Documentation AWS S3**](https://docs.aws.amazon.com/s3/index.html)  
  Guide officiel pour configurer et utiliser les buckets S3 pour le stockage des sauvegardes.

- [**Documentation Kubernetes - StorageClass**](https://kubernetes.io/docs/concepts/storage/storage-classes/)  
  En savoir plus sur la configuration des StorageClasses, essentielles pour gérer le stockage persistant.
  