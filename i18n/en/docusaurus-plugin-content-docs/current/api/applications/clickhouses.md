---
title: ClickHouse
---

# ClickHouse

ClickHouse est une base de données analytique orientée colonnes, conçue pour des requêtes rapides et efficaces. Cette page décrit les options de configuration disponibles pour ClickHouse, y compris la gestion des sauvegardes.

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

Ces paramètres permettent de configurer les aspects fondamentaux de ClickHouse, notamment la taille du stockage et le nombre de réplicas.

| **Nom**           | **Description**                                    | **Valeur Par Défaut** |
|--------------------|----------------------------------------------------|------------------------|
| `size`            | Taille du volume persistant principal.             | `10Gi`                |
| `logStorageSize`  | Taille du volume persistant utilisé pour les logs.  | `2Gi`                 |
| `shards`          | Nombre de shards ClickHouse (équivalents à des réplicas). | `1`                   |
| `replicas`        | Nombre de réplicas pour chaque shard.               | `2`                   |
| `storageClass`    | Classe de stockage Kubernetes utilisée pour les données. | `""` (non spécifié)   |
| `logTTL`          | Durée de rétention (en jours) pour les journaux de requêtes (`query_log`, `query_thread_log`). | `15`                  |

---

### **Paramètres de Configuration**

Ces paramètres concernent la configuration interne de ClickHouse, tels que les utilisateurs.

| **Nom**    | **Description**                       | **Valeur Par Défaut** |
|------------|---------------------------------------|------------------------|
| `users`    | Configuration des utilisateurs (sous forme d'objet YAML). | `{}`                  |

---

### **Paramètres de Backup**

Ces paramètres contrôlent la gestion des sauvegardes automatiques via Restic et S3.

| **Nom**                  | **Description**                                           | **Valeur Par Défaut**                         |
|---------------------------|-----------------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Active ou désactive les sauvegardes périodiques.          | `false`                                      |
| `backup.s3Region`        | Région AWS S3 où les sauvegardes sont stockées.           | `us-east-1`                                  |
| `backup.s3Bucket`        | Nom du bucket S3 utilisé pour le stockage des sauvegardes. | `s3.example.org/clickhouse-backups`          |
| `backup.schedule`        | Planification des sauvegardes (au format Cron).           | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Stratégie pour nettoyer les anciennes sauvegardes.        | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | Clé d'accès AWS S3 pour l'authentification.               | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | Clé secrète AWS S3 pour l'authentification.               | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Mot de passe utilisé pour chiffrer les sauvegardes Restic. | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Exemple de Configuration

Voici un exemple d'utilisation avec les paramètres personnalisés :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-example
spec:
  size: 20Gi
  logStorageSize: 5Gi
  shards: 2
  replicas: 3
  storageClass: "fast-storage"
  logTTL: 30
  backup:
    enabled: true
    s3Region: "us-east-1"
    s3Bucket: "s3.example.org/clickhouse-backups"
    schedule: "0 2 * * *"
    cleanupStrategy: "--keep-last=5 --keep-daily=5 --keep-within-weekly=1m"
    s3AccessKey: "your-s3-access-key"
    s3SecretKey: "your-s3-secret-key"
    resticPassword: "your-restic-password"
```

---

## Ressources Additionnelles

Pour approfondir votre compréhension et exploiter pleinement ClickHouse dans votre infrastructure, voici quelques ressources utiles :

- [**Documentation Officielle ClickHouse**](https://clickhouse.com/docs/)  
  La documentation officielle de ClickHouse, couvrant les concepts, la configuration, et les bonnes pratiques.

- [**Guide Restic**](https://restic.readthedocs.io/)  
  Documentation complète de Restic, outil utilisé pour les sauvegardes et les restaurations.

- [**Article : Restic - Effective Backup from Stdin**](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)  
  Un tutoriel détaillé pour utiliser Restic de manière efficace pour les sauvegardes via stdin.

- [**Format Cron - Crontab Guru**](https://crontab.guru/)  
  Un outil en ligne pratique pour comprendre et créer des expressions Cron.

---

En cas de questions ou de besoins spécifiques, n'hésitez pas à consulter ces ressources ou à contacter notre support.
