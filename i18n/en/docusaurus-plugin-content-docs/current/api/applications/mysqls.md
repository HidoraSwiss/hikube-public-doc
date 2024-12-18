---
title: MySQL
---

# MySQL

Le service **Managed MariaDB** offre une solution de base de données relationnelle puissante et largement utilisée. Ce service permet de créer et gérer facilement un cluster MariaDB répliqué.

---

## Détails du Déploiement

Ce service managé est géré par le **mariadb-operator**, garantissant une gestion efficace et une opération fluide des clusters MariaDB.

## Tutoriels

### Bascule Master/Slave

1. Modifiez l'instance MariaDB pour définir une nouvelle réplique principale. Utilisez la commande suivante pour éditer l'instance :

```bash
kubectl edit mariadb <instance>
```

2. Modifiez la configuration pour définir le pod principal :

```yaml
spec.replication.primary.podIndex: 1
```

3. Vérifiez l'état du cluster :

```bash
kubectl get mariadb
```

### Restaurer un Backup

1. Trouvez un snapshot disponible dans votre bucket S3 :

```bash
restic -r s3:s3.example.org/mariadb-backups/database_name snapshots
```

2. Restaurez le dernier snapshot :

```bash restic -r s3:s3.example.org/mariadb-backups/database_name restore latest --target /tmp/
```

3. Consultez les détails pour plus d'informations :
   - [https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)

---

## Problèmes Connus

- **La réplication ne se termine pas correctement** :
  - Si les journaux binlog ont été purgés, suivez ces étapes manuelles pour résoudre le problème :  
    [Issue sur GitHub](https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231)

- **Indices corrompus** :  
  - Si certains indices sont corrompus sur la réplique principale, vous pouvez les récupérer depuis une réplique secondaire :
    - Exportez la table depuis la réplique secondaire.
    - Réimportez la table dans la réplique principale.

---

## Paramètres Configurables

### **Paramètres Généraux**

| **Nom**        | **Description**                                      | **Valeur Par Défaut** |
|-----------------|------------------------------------------------------|------------------------|
| `external`     | Permet l'accès externe depuis l'extérieur du cluster. | `false`               |
| `size`         | Taille du volume persistant pour les données.         | `10Gi`                |
| `replicas`     | Nombre de réplicas MariaDB.                           | `2`                   |
| `storageClass` | Classe de stockage utilisée.                          | `""` (non spécifié)   |

---

### **Paramètres de Configuration**

| **Nom**      | **Description**                   | **Valeur Par Défaut** |
|--------------|-----------------------------------|------------------------|
| `users`      | Configuration des utilisateurs.  | `{}`                  |
| `databases`  | Configuration des bases de données. | `{}`                  |

---

### **Paramètres de Backup**

| **Nom**                  | **Description**                                    | **Valeur Par Défaut**                         |
|---------------------------|----------------------------------------------------|-----------------------------------------------|
| `backup.enabled`         | Active ou désactive les sauvegardes périodiques.  | `false`                                      |
| `backup.s3Region`        | Région AWS S3 pour les sauvegardes.               | `us-east-1`                                  |
| `backup.s3Bucket`        | Bucket S3 utilisé pour les sauvegardes.           | `s3.example.org/mariadb-backups`             |
| `backup.schedule`        | Planification des sauvegardes (format Cron).      | `0 2 * * *`                                  |
| `backup.cleanupStrategy` | Stratégie pour nettoyer les anciennes sauvegardes. | `--keep-last=3 --keep-daily=3 --keep-within-weekly=1m` |
| `backup.s3AccessKey`     | Clé d'accès AWS S3 pour l'authentification.       | `oobaiRus9pah8PhohL1ThaeTa4UVa7gu`           |
| `backup.s3SecretKey`     | Clé secrète AWS S3 pour l'authentification.       | `ju3eum4dekeich9ahM1te8waeGai0oog`           |
| `backup.resticPassword`  | Mot de passe pour le chiffrement Restic.          | `ChaXoveekoh6eigh4siesheeda2quai0`           |

------

## Exemple de Configuration

Voici un exemple de configuration YAML pour un déploiement MariaDB avec deux réplicas et des sauvegardes activées :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: mariadb-example
spec:
  external: true
  size: 20Gi
  replicas: 2
  storageClass: "fast-storage"
  users:
    admin:
      password: "secure-password"
  databases:
    mydb:
      charset: utf8mb4
      collation: utf8mb4_general_ci
  backup:
    enabled: true
    s3Region: "us-east-1"
    s3Bucket: "s3.example.org/mariadb-backups"
    schedule: "0 2 * * *"
    cleanupStrategy: "--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"
    s3AccessKey: "your-s3-access-key"
    s3SecretKey: "your-s3-secret-key"
    resticPassword: "your-restic-password"
```

---

## Ressources Additionnelles

Pour approfondir vos connaissances sur MariaDB et son opérateur, consultez les ressources suivantes :

- **[Documentation Officielle MariaDB](https://mariadb.com/kb/en/documentation/)**  
  Guide complet pour utiliser et configurer MariaDB.

- **[GitHub MariaDB Operator](https://github.com/mariadb-operator/mariadb-operator)**  
  Informations détaillées sur l'opérateur MariaDB, incluant les fonctionnalités et les limitations.

- **[Guide Restic](https://itnext.io/restic-effective-backup-from-stdin-4bc1e8f083c1)**  
  Découvrez comment utiliser Restic pour gérer vos sauvegardes, avec des exemples pratiques.

- **[Issue GitHub : Réplication MariaDB](https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231)**  
  Étapes pour résoudre les problèmes de réplication liés aux journaux binlog purgés.

---

Cette page fournit une vue complète pour configurer et utiliser MariaDB dans un environnement managé, avec des tutoriels, des exemples de configuration, et des liens vers des ressources supplémentaires pour une meilleure maîtrise du service.