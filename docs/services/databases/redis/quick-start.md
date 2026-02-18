---
sidebar_position: 2
title: Démarrage rapide
---

# Déployer Redis en 5 minutes

Ce guide vous accompagne pas à pas dans le déploiement de votre premier cluster **Redis** sur Hikube, du manifeste YAML jusqu'aux premiers tests de connexion.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **Redis** déployé sur Hikube
- Une architecture composée d'un **master** et de **réplicas** pour garantir la haute disponibilité
- **Redis Sentinel** configuré pour l'auto-failover
- Un accès Redis sécurisé avec vos identifiants d'authentification
- Un stockage persistant attaché pour conserver les données au-delà des redémarrages

---

## Prérequis

Avant de démarrer, assurez-vous d'avoir :

- **kubectl** configuré avec votre kubeconfig Hikube
- Des **droits administrateur** sur votre tenant
- Un **namespace** dédié pour héberger votre cluster Redis
- **redis-cli** installé sur votre poste (optionnel, pour les tests de connexion)

---

## Étape 1 : Créer le manifeste Redis

Créez un fichier `redis.yaml` avec la configuration suivante :

```yaml title="redis.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: example
spec:
  # Nombre de réplicas Redis (haute dispo si >1)
  replicas: 3

  # Profil de ressources prédéfini (nano, micro, small, medium, large, xlarge, 2xlarge)
  resourcesPreset: nano

  # Ou définir les ressources explicitement (remplace resourcesPreset)
  resources:
    cpu: 3000m
    memory: 3Gi

  # Taille du disque persistant par instance
  size: 1Gi
  storageClass: ""

  # Activer l'authentification Redis
  authEnabled: true

  # Exposer le service Redis à l'extérieur du cluster
  external: true
```

:::tip
Si `resources` est défini, la valeur de `resourcesPreset` est ignorée. Consultez la [Référence API](./api-reference.md) pour la liste complète des presets disponibles.
:::

---

## Étape 2 : Déployer le cluster Redis

Appliquez le manifeste et vérifiez que le déploiement démarre :

```bash
# Appliquer le manifeste
kubectl apply -f redis.yaml
```

Vérifiez le statut du cluster (peut prendre 1-2 minutes) :

```bash
kubectl get redis
```

**Résultat attendu :**

```console
NAME      READY   AGE     VERSION
example   True    1m39s   0.10.0
```

---

## Étape 3 : Vérification des pods

Vérifiez que tous les pods sont en état `Running` :

```bash
kubectl get po -o wide | grep redis
```

**Résultat attendu :**

```console
rfr-redis-example-0                               2/2     Running     0     7m7s    10.244.2.109   gld-csxhk-006   <none>   <none>
rfr-redis-example-1                               2/2     Running     0     7m7s    10.244.2.114   luc-csxhk-005   <none>   <none>
rfr-redis-example-2                               2/2     Running     0     7m7s    10.244.2.111   plo-csxhk-004   <none>   <none>
rfs-redis-example-7b65c79ccb-dkqqz                1/1     Running     0     7m7s    10.244.2.112   luc-csxhk-005   <none>   <none>
rfs-redis-example-7b65c79ccb-kvjt8                1/1     Running     0     7m7s    10.244.2.108   gld-csxhk-006   <none>   <none>
rfs-redis-example-7b65c79ccb-xwk7v                1/1     Running     0     7m7s    10.244.2.110   plo-csxhk-004   <none>   <none>
```

Avec `replicas: 3`, vous obtenez **6 pods** répartis sur différents datacenters :

| Préfixe | Rôle | Nombre |
|---------|------|--------|
| `rfr-redis-example-*` | **Redis** (master + réplicas) | 3 |
| `rfs-redis-example-*` | **Redis Sentinel** (supervision et auto-failover) | 3 |

---

## Étape 4 : Récupérer les identifiants

Si `authEnabled: true`, un mot de passe est généré automatiquement dans un Secret Kubernetes :

```bash
kubectl get secret redis-example-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Résultat attendu :**

```console
password: QkP9bhppEFCQcXIXLzEAhAUBlMYEVFNZ
```

---

## Étape 5 : Connexion et tests

### Accès externe (si `external: true`)

Récupérez l'IP externe du LoadBalancer :

```bash
kubectl get svc | grep redis
```

```console
redis-example-external-lb            LoadBalancer   10.96.156.151   91.223.132.41   6379/TCP    13m
redis-example-metrics                ClusterIP      10.96.58.67     <none>          9121/TCP    13m
rfr-redis-example                    ClusterIP      None            <none>          9121/TCP    13m
rfrm-redis-example                   ClusterIP      10.96.109.194   <none>          6379/TCP    13m
rfrs-redis-example                   ClusterIP      10.96.118.28    <none>          6379/TCP    13m
rfs-redis-example                    ClusterIP      10.96.176.169   <none>          26379/TCP   13m
```

Le service `redis-example-external-lb` expose Redis sur l'IP externe `91.223.132.41`.

### Accès via port-forward (si `external: false`)

```bash
kubectl port-forward svc/rfrm-redis-example 6379:6379 &
```

### Tests avec redis-cli

```bash
# Récupérer le mot de passe
REDIS_PASSWORD=$(kubectl get secret redis-example-auth -o jsonpath="{.data.password}" | base64 -d)

# Test PING
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" ping
# PONG

# Créer une clé
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" SET hello "hikube"
# OK

# Lire la clé
redis-cli -h 91.223.132.41 -p 6379 -a "$REDIS_PASSWORD" GET hello
# "hikube"
```

:::note
Si vous utilisez le port-forward, remplacez `91.223.132.41` par `127.0.0.1` dans les commandes ci-dessus.
Il est recommandé de ne pas exposer la base de données à l'extérieur si vous n'en avez pas le besoin.
:::

---

## Étape 6 : Dépannage rapide

### Pods en CrashLoopBackOff

```bash
# Vérifier les logs du pod en erreur
kubectl logs rfr-redis-example-0

# Vérifier les events
kubectl describe pod rfr-redis-example-0
```

**Causes fréquentes :** mémoire insuffisante (`resources.memory` trop faible), volume de stockage plein.

### Redis non accessible

```bash
# Vérifier que le service existe
kubectl get svc | grep redis

# Vérifier que le LoadBalancer a bien une IP externe
kubectl describe svc redis-example-external-lb
```

**Causes fréquentes :** `external: false` dans le manifeste, LoadBalancer en attente d'attribution d'IP.

### Sentinel ne détecte pas le master

```bash
# Vérifier les logs Sentinel
kubectl logs rfs-redis-example-7b65c79ccb-dkqqz

# Vérifier la topologie Sentinel
kubectl exec -it rfs-redis-example-7b65c79ccb-dkqqz -- redis-cli -p 26379 SENTINEL masters
```

### Commandes de diagnostic générales

```bash
# Events récents sur le namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# État détaillé du cluster Redis
kubectl describe redis example
```

---

## Étape 7 : Nettoyage

Pour supprimer les ressources de test :

```bash
kubectl delete -f redis.yaml
```

:::warning
Cette action supprime le cluster Redis et toutes les données associées. Cette opération est **irréversible**.
:::

---

## Résumé

Vous avez déployé :

- Un cluster Redis avec **3 réplicas** répartis sur des datacenters différents
- **3 pods Sentinel** pour la supervision et l'auto-failover
- Un accès sécurisé par mot de passe généré automatiquement
- Un stockage persistant pour la durabilité des données

---

## Prochaines étapes

- **[Référence API](./api-reference.md)** : Configuration complète de toutes les options Redis
- **[Vue d'ensemble](./overview.md)** : Architecture détaillée et cas d'usage Redis sur Hikube
