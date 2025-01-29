---
title: PostgreSQL
---

PostgreSQL est l'un des choix les plus populaires parmi les bases de données relationnelles, réputé pour ses fonctionnalités robustes et ses performances élevées. Le service **Managed PostgreSQL** offre un cluster répliqué auto-réparant.

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour un déploiement PostgreSQL avec deux réplicas et des sauvegardes activées :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: postgres-example
spec:
  external: false
  size: 20Gi
  replicas: 3
  storageClass: "local"
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  users:
    user1:
      password: "securepassword"
    user2:
      password: "readonlypassword"
    airflow:
      password: "airflowpassword"
    debezium:
      replication: true
  databases:
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
    airflow:
      roles:
        admin:
        - airflow
      extensions:
      - hstore
  backup:
    enabled: false
  #  s3Region: "us-west-2"
  #  s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
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

| **Nom**                     | **Description**                                                                                     | **Valeur Par Défaut** |
|------------------------------|-----------------------------------------------------------------------------------------------------|------------------------|
| `external`                  | Permet l'accès externe depuis l'extérieur du cluster.                                              | `false`               |
| `size`                      | Taille du volume persistant pour les données.                                                      | `10Gi`                |
| `replicas`                  | Nombre de réplicas PostgreSQL.                                                                     | `2`                   |
| `storageClass`              | Classe de stockage utilisée pour les données.                                                      | `"replicated"` ou `"local"` |
| `postgresql.parameters.max_connections` | Nombre maximal de connexions simultanées au serveur PostgreSQL.                              | `100`                 |
| `quorum.minSyncReplicas`    | Nombre minimum de réplicas synchrones nécessaires pour valider une transaction.                    | `0`                   |
| `quorum.maxSyncReplicas`    | Nombre maximum de réplicas synchrones pouvant valider une transaction (doit être inférieur au nombre total d'instances). | `0`                   |

---

### **Paramètres de Configuration**

| **Nom**      | **Description**                    | **Valeur Par Défaut** |
|--------------|------------------------------------|------------------------|
| `users`      | Configuration des utilisateurs.   | `{}`                  |
| `databases`  | Configuration des bases de données. | `{}`                  |

**Exemple :**  

```yaml
users:
  user1:
    password: strongpassword
  user2:
    password: hackme
  airflow:
    password: qwerty123
  debezium:
    replication: true

databases:
  myapp:
    roles:
      admin:
      - user1
      - debezium
      readonly:
      - user2
  airflow:
    roles:
      admin:
      - airflow
    extensions:
    - hstore
```

---

### **Paramètres de Backup**

| **Nom**                  | **Description**                                    | **Valeur Par Défaut**                         |
|---------------------------|----------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Active ou désactive les sauvegardes périodiques.  | `false`                                      |
| `backup.s3Region`        | Région AWS S3 pour les sauvegardes.               | `us-east-1`                                  |
| `backup.s3Bucket`        | Bucket S3 utilisé pour les sauvegardes.           | `s3.example.org/postgres-backups`            |
| `backup.schedule`        | Planification des sauvegardes (format Cron).      | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Stratégie pour nettoyer les anciennes sauvegardes. | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | Clé d'accès AWS S3 pour l'authentification.       | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | Clé secrète AWS S3 pour l'authentification.       | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Mot de passe pour le chiffrement Restic.          | `ChaXoveekoh6eigh4siesheeda2quai0`           |

---

## Tutoriels

### Comment basculer la réplique Master/Slave

Pour effectuer un basculement manuel des répliques dans le cluster, suivez les instructions détaillées dans la [documentation officielle CloudNativePG](https://cloudnative-pg.io/documentation/1.15/rolling_update/#manual-updates-supervised).

### Comment restaurer un backup

1. Trouvez un snapshot disponible dans votre bucket S3 :
   - Commande : `restic -r s3:s3.tenant.hikube.cloud/postgres-backups/database_name snapshots`
2. Restaurez le dernier snapshot :
   - Commande : `restic -r s3:s3.tenant.hikube.cloud/postgres-backups/database_name restore latest --target /tmp/`
3. Consultez la section **Ressources Additionnelles** pour des détails sur Restic.

---

## Ressources Additionnelles

- **[Guide Restic](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)**  
  Apprenez à utiliser Restic pour gérer vos sauvegardes.
