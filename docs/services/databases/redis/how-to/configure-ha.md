---
title: "Comment configurer la haute disponibilite Redis"
---

# Comment configurer la haute disponibilite Redis

Ce guide explique comment deployer un cluster Redis hautement disponible sur Hikube. Le service s'appuie sur l'operateur **Spotahome Redis Operator** qui utilise **Redis Sentinel** pour assurer le failover automatique lorsque 3 replicas ou plus sont configures.

## Prerequis

- `kubectl` configure pour interagir avec l'API Hikube
- Connaissance des bases de Redis (voir le [demarrage rapide](../quick-start.md))
- Un environnement de production necessitant de la haute disponibilite

## Etapes

### 1. Configurer le manifeste avec 3+ replicas

Pour activer la haute disponibilite, configurez au minimum 3 replicas. Redis Sentinel est automatiquement deploye par l'operateur Spotahome pour orchestrer l'election du leader et le failover :

```yaml title="redis-ha.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis-ha
spec:
  replicas: 3
  resourcesPreset: medium
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

:::note
Le `storageClass: replicated` garantit que les volumes persistants sont repliques au niveau du stockage, protegeant les donnees contre la perte d'un noeud physique.
:::

### 2. Appliquer la configuration

```bash
kubectl apply -f redis-ha.yaml
```

### 3. Verifier le cluster Redis

Attendez que tous les pods soient prets :

```bash
# Verifier l'etat des pods Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha -w
```

**Resultat attendu :**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-redis-ha-0       1/1     Running   0          3m
my-redis-ha-1       1/1     Running   0          2m
my-redis-ha-2       1/1     Running   0          1m
```

Verifiez egalement le statut de Redis Sentinel :

```bash
# Verifier les pods Sentinel
kubectl get pods -l app.kubernetes.io/component=sentinel,app.kubernetes.io/instance=my-redis-ha
```

### 4. Comprendre le failover automatique

Avec 3 replicas, Redis Sentinel assure les fonctions suivantes :

- **Detection de panne** : Sentinel surveille en continu le noeud maitre et les replicas
- **Election automatique** : si le maitre tombe, Sentinel elit un nouveau maitre parmi les replicas disponibles
- **Reconfiguration** : les replicas restants sont automatiquement reconfigures pour repliquer depuis le nouveau maitre

:::tip
Le failover est entierement automatique. Aucune intervention manuelle n'est necessaire. Le temps de basculement est generalement de quelques secondes.
:::

### 5. Recuperer le mot de passe

Avec `authEnabled: true`, un mot de passe est genere automatiquement et stocke dans un Secret Kubernetes :

```bash
# Recuperer le nom du secret
kubectl get secrets | grep my-redis-ha

# Extraire le mot de passe
kubectl get secret my-redis-ha -o jsonpath='{.data.password}' | base64 -d
```

:::warning
Activez toujours `authEnabled: true` en production. Sans authentification, toute application ayant acces au reseau du cluster peut lire et ecrire dans Redis.
:::

## Verification

Verifiez que le cluster HA fonctionne correctement :

```bash
# Verifier la ressource Redis
kubectl get redis my-redis-ha

# Verifier que tous les pods sont Running
kubectl get pods -l app.kubernetes.io/instance=my-redis-ha

# Verifier les services exposes
kubectl get svc -l app.kubernetes.io/instance=my-redis-ha
```

**Resultat attendu :**

```console
NAME                     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)     AGE
my-redis-ha              ClusterIP   10.96.xxx.xxx   <none>        6379/TCP    5m
my-redis-ha-sentinel     ClusterIP   10.96.xxx.xxx   <none>        26379/TCP   5m
```

## Pour aller plus loin

- [Reference API](../api-reference.md) -- Parametres `replicas`, `authEnabled` et `storageClass`
- [Comment scaler verticalement Redis](./scale-resources.md) -- Ajuster les ressources CPU et memoire
