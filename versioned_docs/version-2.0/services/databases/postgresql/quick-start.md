---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer PostgreSQL en 5 minutes

Ce guide vous accompagne dans le déploiement de votre première base de données **PostgreSQL** sur Hikube, depuis l’installation jusqu’à la première connexion.

---
## Objectifs

À la fin de ce guide, vous aurez :  
- Une base de données **PostgreSQL** déployée sur Hikube  
- Un cluster répliqué avec un **primary** et des **réplicas** pour assurer la haute disponibilité  
- Un utilisateur et un mot de passe pour vous connecter  
- Un stockage persistant pour conserver vos données  

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :  
- **kubectl** configuré avec votre kubeconfig Hikube  
- **Droits administrateur** sur votre tenant  
- Un **namespace** disponible pour héberger votre base de données  
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez activer les sauvegardes automatiques via CloudNativePG  

---

## Étape 1 : Création yaml pour déployer PostgreSQL

### **Préparez le fichier manifest**

Créez un fichier `postgresql.yaml` comme ci-dessous: 

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
  namespace: default
spec:
  # configuration backup
  backup:
    enabled: false  
    destinationPath: s3://bucket/path/to/folder/
    endpointURL: http://minio-gateway-service:9000
    retentionPolicy: 30d
    s3AccessKey: <your-access-key>
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * * *
  bootstrap:
    enabled: false
    oldName: ""
    recoveryTime: ""
  # creation databases  
  databases:
    airflow:
      extensions:
      - hstore
      roles: # assign roles to the database
        admin:
        - airflow
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
  external: true # create service LoadBalancer if true (with public IP)
  # define parameters about postgresql
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0  
  replicas: 3 # total number of postgresql instance
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: micro
  size: 10Gi
  storageClass: ""
  # create users
  users:
    airflow:
      password: qwerty123
    debezium:
      replication: true
    user1:
      password: strongpassword
    user2:
      password: hackme     
```

### **Déployez le yaml PostgreSQL**

```bash
# Appliquer le yaml
kubectl apply -f postgresql.yaml
```

## Étape 2 : Vérification et Tests

Une fois l'application déployé, vérifier que tout fonctionne :

```bash
# Vérifier le statut (peut prendre 1-2 minutes)
➜  ~ kubectl get postgreses
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0


# Vérifier si les pods applicatifs sont running
# En prenant mon exemple vous devriez donc avoir 3 pods "example" sur des datacenters différents
➜  ~ kubectl get po -o wide  | grep postgres
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>

# Vérifier que nous avons bien 3 PVC (1 PVC par PostgreSQL)
➜  ~ kubectl get pvc | grep postgres
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s

# Vous pouvez récupérer le username, password de votre PostgreSQL en cas de besoin
➜  ~ kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme


# Faire un port-forward du service pour y accéder depuis votre poste de travail, ou modifier le paramètre external comme ceci "external: true"
# Il est recommdé de ne pas ouvrir la BDD vers l'exétiruer si vous en avez pas le besoin
➜  ~ kubectl get svc | grep postgre  
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m

# Test de connexion depuis mon terminal
➜  ~ psql -h 91.223.132.64 -U user1 myapp   
Password for user user1: 

psql (17.4, server 17.2 (Debian 17.2-1.pgdg110+1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

myapp=> \du
                                 List of roles
     Role name     |                         Attributes                         
-------------------+------------------------------------------------------------
 airflow           | 
 airflow_admin     | No inheritance, Cannot login
 airflow_readonly  | No inheritance, Cannot login
 app               | 
 debezium          | Replication
 myapp_admin       | No inheritance, Cannot login
 myapp_readonly    | No inheritance, Cannot login
 postgres          | Superuser, Create role, Create DB, Replication, Bypass RLS
 streaming_replica | Replication
 user1             | 
 user2             | 

myapp=> 
```
---

## 📋 Résumé

Vous avez déployé :  

- Une base de données **PostgreSQL** sur votre tenant Hikube  
- Un cluster répliqué avec un **primary** et des **standby** pour la haute disponibilité  
- Des utilisateurs et rôles configurés, avec mots de passe stockés dans des Secrets Kubernetes  
- Un stockage persistant (PVC) attaché à chaque instance PostgreSQL  
- Un accès sécurisé via `psql` (service interne ou LoadBalancer)  
- La possibilité d’activer des **sauvegardes S3** automatiques