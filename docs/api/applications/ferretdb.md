---
title: FerretDB
---

FerretDB est une base de données compatible avec MongoDB, s'appuyant sur PostgreSQL comme backend. Elle permet de bénéficier de la simplicité de MongoDB tout en exploitant la robustesse de PostgreSQL.

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
  storageClass: "replicated"
  quorum:
    minSyncReplicas: 1
    maxSyncReplicas: 2
  backup:
    enabled: false
  #  s3Region: "us-east-1"
  #  s3Bucket: "s3.tenant.hikube.cloud/postgres-backups"
  #  schedule: "0 2 * * *"
  #  cleanupStrategy: "--keep-last=5 --keep-daily=5 --keep-within-weekly=1m"
  #  s3AccessKey: "your-s3-access-key"
  #  s3SecretKey: "your-s3-secret-key"
  #  resticPassword: "your-restic-password"
```

À l'aide du kubeconfig fourni par Hikube et de ce yaml d'exemple, enregistré sous un fichier `manifest.yaml`, vous pouvez facilement tester le déploiement de l'application à l'aide de la commande suivante :

```sh
kubectl apply -f manifest.yaml
```

---

## Paramètres Configurables

### **Paramètres Généraux**

Ces paramètres permettent de configurer les aspects fondamentaux de FerretDB.

| **Nom**                 | **Description**                                                                                          | **Valeur Par Défaut** |
|--------------------------|----------------------------------------------------------------------------------------------------------|------------------------|
| `external`              | Permet l'accès externe à FerretDB depuis l'extérieur du cluster.                                         | `false`               |
| `size`                  | Taille du volume persistant principal.                                                                   | `10Gi`                |
| `replicas`              | Nombre de réplicas PostgreSQL pour FerretDB.                                                             | `2`                   |
| `storageClass`          | Classe de stockage Kubernetes utilisée pour les données.                                                 | `"replicated"` ou `"local"`   |
| `quorum.minSyncReplicas`| Nombre minimum de réplicas synchrones nécessaires pour qu'une transaction soit considérée comme validée. | `0`                   |
| `quorum.maxSyncReplicas`| Nombre maximum de réplicas synchrones pouvant valider une transaction (doit être inférieur au nombre total d'instances). | `0`                   |

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

Pour approfondir vos connaissances sur FerretDB et ses fonctionnalités, voici quelques ressources utiles :

- [**Documentation Officielle FerretDB**](https://github.com/FerretDB/FerretDB)  
  Découvrez les détails techniques, les options de configuration et les exemples d'utilisation de FerretDB.

- [**Guide Restic**](https://restic.readthedocs.io/)  
  Apprenez à utiliser Restic pour la gestion des sauvegardes, y compris les meilleures pratiques pour le chiffrement et la restauration.

- [**Tutoriel : Format Cron**](https://crontab.guru/)  
  Un outil pratique pour créer et comprendre les expressions Cron utilisées pour les sauvegardes planifiées.
