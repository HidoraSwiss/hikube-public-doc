---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer MySQL en 5 minutes

Ce guide vous accompagne dans le déploiement de votre première base de données **MySQL** sur Hikube, depuis l’installation jusqu’à la première connexion.

---

## Objectifs

À la fin de ce guide, vous aurez :  

- Une base de données **MySQL** opérationnelle sur Hikube  
- Un cluster répliqué avec un **primary** et des **réplicas** pour assurer la haute disponibilité  
- Des **utilisateurs et mots de passe** pour accéder à vos applications  
- Un **stockage persistant** attaché à chaque instance pour garantir la durabilité des données  
- (Optionnel) La possibilité d’activer des **sauvegardes automatiques** vers un stockage compatible S3  

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :  

- **kubectl** configuré avec votre kubeconfig Hikube  
- **Droits administrateur** sur votre tenant  
- Un **namespace** disponible pour héberger votre base de données  
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez activer les sauvegardes automatiques via MariaDB-Operator  

---

## Étape 1 : Création yaml pour déployer MySQL

### **Préparez le fichier manifest**

Créez un fichier `mysql.yaml` comme ci-dessous:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
  namespace: default
spec:
  backup:
    cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
    enabled: false
    resticPassword: <password>
    s3AccessKey: <your-access-key>
    s3Bucket: s3.example.org/mysql-backups
    s3Region: us-east-1
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * *
  databases:
    myapp1:
      roles:
        admin:
        - user1
        readonly:
        - user2
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 10Gi
  storageClass: ""
  users:
    user1:
      maxUserConnections: 1000
      password: hackme
    user2:
      maxUserConnections: 1000
      password: hackme
```

### **Déployez le yaml MySQL**

```bash
# Appliquer le yaml
kubectl apply -f mysql.yaml
```

Une fois l'application déployé, vérifier que tout fonctionne :

```bash
# Vérifier le statut (peut prendre 1-2 minutes)
➜  ~ kubectl get mysql 
NAME      READY   AGE   VERSION
example   True    1m16s   0.10.0

# Vérifier si les pods applicatifs sont running
# En prenant mon exemple vous devriez donc avoir 3 pods "example" sur des datacenters différents
➜  ~ kubectl get po -o wide  | grep mysql
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>

# Vérifier que nous avons bien 3 PVC (1 PVC par MySQL)
➜  ~ kubectl get pvc | grep mysql
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m

# Vous pouvez récupérer le username, password de votre MySQL en cas de besoin
➜  ~ kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

root: cr42msoxKhnEajfo
user1: hackme
user2: hackme

# Faire un port-forward du service pour y accéder depuis votre poste de travail, ou modifier le paramètre external comme ceci "external: true"
# Il est recommdé de ne pas ouvrir la BDD vers l'exétiruer si vous en avez pas le besoin
➜  ~ kubectl get svc | grep mysql    
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m

# Test de connexion depuis mon terminal
➜  ~ mysql -h 91.223.132.64 -u user1 -p myapp1
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1214
Server version: 11.0.2-MariaDB-1:11.0.2+maria~ubu2204-log mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myapp1             |
+--------------------+
2 rows in set (0.00 sec)

mysql> 
```

## 📋 Résumé

Vous avez déployé :  

- Une base de données **MySQL** sur votre tenant Hikube  
- Un cluster répliqué avec un **primary** et des **réplicas** pour assurer la continuité de service  
- Des utilisateurs créés automatiquement, avec leurs identifiants stockés dans des Secrets Kubernetes  
- Un stockage persistant (PVC) dédié à chaque pod MySQL pour garantir la durabilité des données  
- Un accès sécurisé via le client `mysql` (port-forward ou LoadBalancer)  
- La possibilité de configurer des **sauvegardes S3** et de restaurer en cas de besoin  
