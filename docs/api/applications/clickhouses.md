---
title: ClickHouse
---

**ClickHouse** est une base de données analytique orientée colonnes, conçue pour des requêtes rapides et efficaces. Cette page décrit les options de configuration disponibles pour ClickHouse, y compris la gestion des sauvegardes.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un cluster ClickHouse avec deux réplicas par shard, une taille de stockage personnalisée et des sauvegardes activées :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: clickhouse-example
spec:
  size: 20Gi
  logStorageSize: 5Gi
  shards: 2
  replicas: 2
  storageClass: "replicated"
  logTTL: 30
  users:
    user1:
      password: "securepassword"
    user2:
      readonly: true
      password: "readonlypassword"
  backup:
    enabled: false
  #  s3Region: "hikube"
  #  s3Bucket: "s3.tenant.hikube.cloud/clickhouse-backups"
  #  schedule: "0 3 * * *"
  #  cleanupStrategy: "--keep-last=5 --keep-daily=7 --keep-within-weekly=2m"
  #  s3AccessKey: "your-s3-access-key"
  #  s3SecretKey: "your-s3-secret-key"
  #  resticPassword: "your-restic-password"
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier manifest.yaml, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

`kubectl apply -f manifest.yaml`

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**           | **Description**                                                                 | **Valeur Par Défaut** |
|--------------------|---------------------------------------------------------------------------------|------------------------|
| `size`            | Taille du volume persistant pour les données.                                   | `10Gi`                |
| `logStorageSize`  | Taille du volume persistant pour les journaux (logs).                           | `2Gi`                 |
| `shards`          | Nombre de shards ClickHouse.                                                    | `1`                   |
| `replicas`        | Nombre de réplicas ClickHouse dans chaque shard.                                | `2`                   |
| `storageClass`    | Classe de stockage utilisée pour les données et les journaux.                   | `"replicated"` ou `"local"`    |
| `logTTL`          | Temps de rétention pour `query_log` et `query_thread_log`, exprimé en jours.    | `15`                  |

---

### **Paramètres de Configuration**

| **Nom**  | **Description**                                                      | **Valeur Par Défaut** |
|----------|----------------------------------------------------------------------|------------------------|
| `users`  | Configuration des utilisateurs ClickHouse. Chaque utilisateur peut avoir des permissions personnalisées. | `{}`                  |

**Exemple** :

```yaml
users:
  user1:
    password: strongpassword
  user2:
    readonly: true
    password: hackme
```

---

### **Paramètres de Backup**

| **Nom**                | **Description**                                                | **Valeur Par Défaut**                         |
|-------------------------|----------------------------------------------------------------|-----------------------------------------------|
| `backup.enabled`       | Active ou désactive les sauvegardes périodiques.               | `false`                                      |
| `backup.s3Region`      | Région AWS S3 où les sauvegardes sont stockées.                | `us-east-1`                                  |
| `backup.s3Bucket`      | Nom du bucket S3 utilisé pour les sauvegardes.                 | `s3.example.org/clickhouse-backups`          |
| `backup.schedule`      | Planification des sauvegardes (format Cron).                   | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Stratégie de nettoyage pour les anciennes sauvegardes.        | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`   | Clé d'accès AWS S3 pour l'authentification.                    | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`   | Clé secrète AWS S3 pour l'authentification.                    | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword` | Mot de passe pour le chiffrement des sauvegardes Restic.      | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Restaurer un Backup

Vous pouvez restaurer un backup de ClickHouse à l'aide de Restic. Voici les étapes principales :

### Trouver un Snapshot

Utilisez la commande suivante pour lister les snapshots disponibles dans votre bucket S3 :

```bash
restic -r s3:s3.tenant.hikube.cloud/clickhouse-backups/table_name snapshots
```

### Restaurer le Snapshot

Pour restaurer le snapshot le plus récent, exécutez la commande suivante en spécifiant une cible de restauration :

```bash
restic -r s3:s3.tenant.hikube.cloud/clickhouse-backups/table_name restore latest --target /tmp/
```

---

## Ressources Additionnelles

Pour en savoir plus sur ClickHouse et sa gestion, consultez les ressources suivantes :

- **[Documentation Officielle ClickHouse](https://clickhouse.com/docs/)**  
  Guide complet pour configurer et optimiser ClickHouse.
- **[Restic Documentation](https://restic.net/)**  
  Guide pour configurer et utiliser Restic pour les sauvegardes.
- **[AWS S3 Documentation](https://aws.amazon.com/s3/)**  
  Informations sur la configuration des buckets et des permissions AWS S3.
