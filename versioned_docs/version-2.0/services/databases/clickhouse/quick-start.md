---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer ClickHouse en 5 minutes

Ce guide vous accompagne dans le déploiement de votre première base de données **ClickHouse** sur Hikube en **quelques minutes**!

---

## Objectifs

À la fin de ce guide, vous aurez :  

- Une base de données **ClickHouse** déployée sur Hikube  
- Une configuration initiale avec **shards** et **réplicas** adaptée à vos besoins  
- Un utilisateur et un mot de passe pour vous connecter  
- Un stockage persistant pour conserver vos données  

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :  

- **kubectl** configuré avec votre kubeconfig Hikube  
- **Droits administrateur** sur votre tenant  
- Un **namespace** disponible pour héberger votre base de données  
- (Optionnel) Un bucket **S3-compatible** si vous souhaitez activer les sauvegardes automatiques  

---

## Étape 1 : Création yaml Clickhouse

### **Préparez le fichier manifest**

Créez un fichier `clickhouse.yaml` comme ci-dessous:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: example
spec:
#   backup:
#     cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
#     enabled: false
#     resticPassword: <password>
#     s3AccessKey: <your-access-key>
#     s3Bucket: s3.example.org/clickhouse-backups
#     s3Region: us-east-1
#     s3SecretKey: <your-secret-key>
#     schedule: 0 2 * * *
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  logStorageSize: 2Gi
  logTTL: 15
  replicas: 2
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: small
  shards: 1
  size: 10Gi
  storageClass: ""
  users:
    user1:
      password: strongpassword
    user2:
        readonly: true
        password: hackme      
```

### **Déployez le yaml clickhouse**

```bash
# Appliquer le yaml
kubectl apply -f clickhouse.yaml
```

## Étape 2 : Vérification et Tests

Une fois l'application déployé, vérifier que tout fonctionne :

```bash
# Vérifier le statut (peut prendre 1-2 minutes)
➜  ~ kubectl get clickhouse
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0

# Vérifier si les pods applicatifs sont running
➜  ~ kubectl get po | grep clickhouse
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s

# Vous pouvez récupérer le username, password de votre BDD
  ~ kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme



# Faire un port-forward du service pour y accéder en local, ou modifier le service en tant que LoadBalancer
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000

# Dans un autre terminal se connecter et vérifier la version de clickhouse
➜  ~ clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES; "
INFORMATION_SCHEMA
default
information_schema
system
```

---

## 📋 Résumé

Vous avez déployé :  

- Une base de données **ClickHouse** sur votre tenant Hikube  
- Une configuration initiale avec **shards** et **réplicas**  
- Un composant **ClickHouse Keeper** pour la coordination du cluster  
- Un stockage persistant attaché pour vos données et logs  
- Des utilisateurs avec mots de passe générés et stockés dans un Secret Kubernetes  
- Un accès à votre base via `clickhouse-client`
- La possibilité de configurer des **sauvegardes S3** automatiques  
