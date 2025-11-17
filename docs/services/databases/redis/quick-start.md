---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer Redis en 5 minutes

Ce guide vous guide pas à pas dans le déploiement de votre premier cluster **Redis** sur Hikube, afin de l’utiliser comme cache distribué ou base de données in-memory haute performance.  

---

## Objectifs

À la fin de ce guide, vous aurez :  

- Un cluster **Redis** déployé sur Hikube  
- Une architecture composée d’un **master** et de **réplicas** pour garantir la haute disponibilité  
- Un accès Redis sécurisé avec vos identifiants d’authentification  
- Un stockage persistant attaché pour conserver les données au-delà des redémarrages  

---

## Prérequis

Avant de démarrer, assurez-vous d’avoir :  

- **kubectl** configuré avec votre kubeconfig Hikube  
- Des **droits administrateur** sur votre tenant  
- Un **namespace** dédié pour héberger votre cluster Redis  

---

## Étape 1 : Création yaml pour déployer Redis

### **Préparez le fichier manifest**

Créez un fichier `redis.yaml` comme ci-dessous:

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
  namespace: default
spec:
  authEnabled: true
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 1Gi
  storageClass: ""
```

### **Déployez le yaml Redis**

```bash
# Appliquer le yaml
kubectl apply -f redis.yaml
```

## Étape 2 : Vérification et Tests

Une fois l'application déployé, vérifier que tout fonctionne :

```bash
```bash
# Vérifier le statut (peut prendre 1-2 minutes)
➜  ~ kubectl get redis
NAME      READY   AGE     VERSION
example   True    1m39s   0.10.0

# Vérifier si les pods applicatifs sont running
# En prenant mon exemple vous devriez donc avoir 6 pods "example" sur des datacenters différents
# 3 pods redis et 3 pods redis sentinel
➜  ~ kubectl get po -o wide  | grep redis
rfr-redis-example-0                               2/2     Running     0              7m7s    10.244.2.109   gld-csxhk-006   <none>           <none>
rfr-redis-example-1                               2/2     Running     0              7m7s    10.244.2.114   luc-csxhk-005   <none>           <none>
rfr-redis-example-2                               2/2     Running     0              7m7s    10.244.2.111   plo-csxhk-004   <none>           <none>
rfs-redis-example-7b65c79ccb-dkqqz                1/1     Running     0              7m7s    10.244.2.112   luc-csxhk-005   <none>           <none>
rfs-redis-example-7b65c79ccb-kvjt8                1/1     Running     0              7m7s    10.244.2.108   gld-csxhk-006   <none>           <none>
rfs-redis-example-7b65c79ccb-xwk7v                1/1     Running     0              7m7s    10.244.2.110   plo-csxhk-004   <none>           <none

# Vous pouvez récupérer le username, password de votre PostgreSQL en cas de besoin
➜  ~ kubectl get secret redis-example-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'

password: QkP9bhppEFCQcXIXLzEAhAUBlMYEVFNZ

# Faire un port-forward du service pour y accéder depuis votre poste de travail, ou modifier le paramètre external comme ceci "external: true"
# Il est recommdé de ne pas ouvrir la BDD vers l'exétiruer si vous en avez pas le besoin

➜  ~  kubectl get svc | grep redis
redis-example-external-lb            LoadBalancer   10.96.156.151   91.223.132.41   6379/TCP                     13m
redis-example-metrics                ClusterIP      10.96.58.67     <none>          9121/TCP                     13m
rfr-redis-example                    ClusterIP      None            <none>          9121/TCP                     13m
rfrm-redis-example                   ClusterIP      10.96.109.194   <none>          6379/TCP                     13m
rfrs-redis-example                   ClusterIP      10.96.118.28    <none>          6379/TCP                     13m
rfs-redis-example                    ClusterIP      10.96.176.169   <none>          26379/TCP                    13m


# Test de connexion depuis mon terminal
# Récupérer le mot de passe
REDIS_PASSWORD=$(kubectl get secret redis-example-auth -o jsonpath="{.data.password}" | base64 -d)

# Tester la version de Redis
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" ping
PONG

# Créer une clé
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" SET hello "hikube"
OK

# Lire la clé
➜  ~ redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" GET hello
"hikube"
```
