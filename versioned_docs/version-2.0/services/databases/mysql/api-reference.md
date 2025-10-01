---
sidebar_position: 3
title: Référence API
---

# Référence API MySQL

Cette référence détaille l’utilisation de **MySQL** sur Hikube, en mettant en avant son déploiement en cluster répliqué avec un primary et des réplicas pour la haute disponibilité, ainsi que la possibilité d’activer des sauvegardes automatiques vers un stockage compatible S3.

---

## Structure de Base

### **Ressource MySQL**
#### Exemple de configuration YAML
```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
```
---

## Paramètres

### **Paramètres Communs**

| **Paramètre**      | **Type**   | **Description**                                                                 | **Défaut** | **Requis** |
|---------------------|------------|---------------------------------------------------------------------------------|------------|------------|
| `replicas`          | `int`      | Nombre de réplicas MariaDB dans le cluster                                      | `2`        | Oui        |
| `resources`         | `object`   | Configuration explicite CPU et mémoire pour chaque réplica. Si vide, `resourcesPreset` est appliqué | `{}`       | Non        |
| `resources.cpu`     | `quantity` | CPU disponible pour chaque réplica                                              | `null`     | Non        |
| `resources.memory`  | `quantity` | Mémoire (RAM) disponible pour chaque réplica                                    | `null`     | Non        |
| `resourcesPreset`   | `string`   | Profil de ressources par défaut (`nano`, `micro`, `small`, `medium`, `large`, `xlarge`, `2xlarge`) | `nano`     | Oui        |
| `size`              | `quantity` | Taille du volume persistant (PVC) pour stocker les données                      | `10Gi`     | Oui        |
| `storageClass`      | `string`   | StorageClass utilisée pour stocker les données                                  | `""`       | Non        |
| `external`          | `bool`     | Activer un accès externe au cluster (LoadBalancer)                              | `false`    | Non        |

#### Exemple de configuration YAML

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example              # Nom de l'instance
  namespace: default         # Namespace cible
spec:
  replicas: 3                # Nombre de réplicas (1 primary + 2 réplica)

  resources:
    cpu: 1000m               # CPU par réplica
    memory: 1Gi              # RAM par réplica

  resourcesPreset: nano      # Profil par défaut si resources est vide
  size: 10Gi                 # Taille du volume persistant
  storageClass: ""           # Classe de stockage
  external: false            # Accès externe (LoadBalancer)
```

### **Paramètres d'application spécifique**

| **Paramètre**                     | **Type**             | **Description**                                   | **Défaut** | **Requis** |
|-----------------------------------|----------------------|---------------------------------------------------|------------|------------|
| `users`                           | `map[string]object`  | Configuration des utilisateurs                    | `{...}`    | Oui        |
| `users[name].password`            | `string`             | Mot de passe de l’utilisateur                     | `""`       | Oui        |
| `users[name].maxUserConnections`  | `int`                | Nombre maximum de connexions pour l’utilisateur   | `0`        | Non        |
| `databases`                       | `map[string]object`  | Configuration des bases de données                | `{...}`    | Oui        |
| `databases[name].roles`           | `object`             | Rôles associés à la base                          | `null`     | Non        |
| `databases[name].roles.admin`     | `[]string`           | Liste des utilisateurs avec droits admin          | `[]`       | Non        |
| `databases[name].roles.readonly`  | `[]string`           | Liste des utilisateurs avec droits en lecture     | `[]`       | Non        |

#### Exemple de configuration YAML
```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: nano
  # Définition des utilisateurs MySQL
  users:
    appuser:
      password: strongpassword     # Mot de passe de l’utilisateur applicatif
      maxUserConnections: 50       # Limite de connexions simultanées
    readonly:
      password: readonlypass       # Utilisateur avec droits restreints
      maxUserConnections: 10

  # Définition des bases de données
  databases:
    myapp:
      roles:
        admin:
          - appuser                # appuser = admin de la base "myapp"
        readonly:
          - readonly               # readonly = accès en lecture seule
    analytics:
      roles:
        admin:
          - appuser                # appuser = admin de la base "analytics"
```

### **Paramètres de backup**

| **Paramètre**           | **Type**  | **Description**                                        | **Défaut**                              | **Requis** |
|--------------------------|-----------|--------------------------------------------------------|------------------------------------------|------------|
| `backup`                 | `object`  | Configuration des sauvegardes                          | `{}`                                     | Non        |
| `backup.enabled`         | `bool`    | Activer les sauvegardes régulières                     | `false`                                  | Non        |
| `backup.s3Region`        | `string`  | Région AWS S3 où sont stockées les sauvegardes         | `"us-east-1"`                            | Oui        |
| `backup.s3Bucket`        | `string`  | Bucket S3 utilisé pour stocker les sauvegardes         | `"s3.example.org/mysql-backups"`         | Oui        |
| `backup.schedule`        | `string`  | Planification des sauvegardes (cron)                   | `"0 2 * * *"`                            | Non        |
| `backup.cleanupStrategy` | `string`  | Stratégie de rétention pour nettoyer les anciennes sauvegardes | `"--keep-last=3 --keep-daily=3 --keep-within-weekly=1m"` | Non |
| `backup.s3AccessKey`     | `string`  | Clé d’accès S3 (authentification)                      | `"<your-access-key>"`                    | Oui        |
| `backup.s3SecretKey`     | `string`  | Clé secrète S3 (authentification)                      | `"<your-secret-key>"`                    | Oui        |
| `backup.resticPassword`  | `string`  | Mot de passe utilisé pour le chiffrement Restic        | `"<password>"`                           | Oui        |


#### Exemple de configuration YAML
```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
  replicas: 2
  size: 10Gi
  resourcesPreset: small

  # Configuration des sauvegardes automatiques
  backup:
    enabled: true
    s3Region: eu-central-1
    s3Bucket: s3.hikube.cloud/mysql-backups
    schedule: "0 3 * * *"                       # Sauvegarde tous les jours à 3h du matin
    cleanupStrategy: "--keep-last=7 --keep-daily=7 --keep-weekly=4"
    s3AccessKey: "HIKUBE123ACCESSKEY"
    s3SecretKey: "HIKUBE456SECRETKEY"
    resticPassword: "SuperStrongResticPassword!"
```


### resources et resourcesPreset  

Le champ `resources` permet de définir explicitement la configuration CPU et mémoire de chaque réplique MySQL.  
Si ce champ est laissé vide, la valeur du paramètre `resourcesPreset` est utilisée.  

#### Exemple de configuration YAML
```yaml title="mysql.yaml"
resources:
cpu: 4000m
memory: 4Gi
```  

⚠️ Attention : si resources est défini, la valeur de resourcesPreset est ignorée.

| **Preset name** | **CPU** | **Mémoire** |
|-----------------|---------|-------------|
| `nano`          | 250m    | 128Mi       |
| `micro`         | 500m    | 256Mi       |
| `small`         | 1       | 512Mi       |
| `medium`        | 1       | 1Gi         |
| `large`         | 2       | 2Gi         |
| `xlarge`        | 4       | 4Gi         |
| `2xlarge`       | 8       | 8Gi         |

## Comment faire ?
### Basculer le rôle Primary dans un cluster MySQL/MariaDB

Dans un cluster **MySQL/MariaDB managé**, un nœud est défini comme **primary** (gérant les écritures) et les autres comme **réplicas** (lecture).  
Il est parfois nécessaire de changer le rôle du primary, par exemple lors d’une maintenance ou pour répartir la charge.

1. **Éditer la ressource MariaDB**  

```bash
kubectl edit mariadb  mysql-example
```   
Modifiez la section suivante pour désigner un nouveau primary :

```yaml
spec:
  replication:
    primary:
      podIndex: 1   # Indique l’index du pod à promouvoir en primary
```      

2. **Vérifier l'état du cluster**  
```bash
➜  ~ kubectl get mariadb
NAME            READY   STATUS    PRIMARY           UPDATES                    AGE
mysql-example   True    Running   mysql-example-1   ReplicasFirstPrimaryLast   84m
➜  ~ 
```   

### ♻️ Restaurer une sauvegarde MariaDB/MySQL

Les sauvegardes sont gérées avec **Restic** et stockées dans un bucket S3-compatible.  
La restauration permet de retrouver une base de données à partir d’un snapshot existant.

##### 1. Lister les snapshots disponibles
Pour afficher toutes les sauvegardes stockées :  
```bash
restic -r s3:s3.example.org/mariadb-backups/database_name snapshots
```

##### 2. Restaurer le dernier snapshot
```bash
restic -r s3:s3.example.org/mariadb-backups/database_name restore latest --target /tmp/
```

## Problèmes connus

- Replication can't be finished with various errors
- Replication can't be finished in case if binlog purged Until mariadbbackup is not used to bootstrap a node by mariadb-operator (this feature is not inmplemented yet), follow these manual steps to fix it: https://github.com/mariadb-operator/mariadb-operator/issues/141#issuecomment-1804760231
- Corrupted indicies Sometimes some indecies can be corrupted on master replica, you can recover them from slave

```bash
mysqldump -h <slave> -P 3306 -u<user> -p<password> --column-statistics=0 <database> <table> ~/tmp/fix-table.sql
mysql -h <master> -P 3306 -u<user> -p<password> <database> < ~/tmp/fix-table.sql
```