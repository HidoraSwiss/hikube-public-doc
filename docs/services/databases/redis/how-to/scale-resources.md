---
title: "Comment scaler verticalement Redis"
---

# Comment scaler verticalement Redis

Ce guide explique comment ajuster les ressources CPU, memoire et stockage de votre instance Redis sur Hikube, soit via un preset predefini, soit en definissant des valeurs explicites.

## Prerequis

- Une instance Redis deployee sur Hikube (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le fichier YAML de configuration de votre instance Redis

## Etapes

### 1. Verifier les ressources actuelles

Consultez la configuration actuelle de votre instance Redis :

```bash
kubectl get redis my-redis -o yaml
```

Notez les valeurs de `resourcesPreset`, `resources`, `replicas` et `size` dans la section `spec`.

### 2. Option A : Modifier le resourcesPreset

Le moyen le plus simple de scaler est d'utiliser un preset predefini. Voici les presets disponibles :

| **Preset** | **CPU** | **Memoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Par exemple, pour passer de `nano` a `medium` :

```yaml title="redis-medium.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resourcesPreset: medium
  size: 2Gi
  authEnabled: true
```

### 3. Option B : Definir des ressources explicites

Pour un controle precis, specifiez directement le CPU et la memoire avec le champ `resources` :

```yaml title="redis-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 2
  resources:
    cpu: 2000m
    memory: 4Gi
  size: 5Gi
  authEnabled: true
```

:::warning
Si le champ `resources` est defini, la valeur de `resourcesPreset` est entierement ignoree. Supprimez `resourcesPreset` du manifeste pour eviter toute confusion.
:::

### 4. Ajuster le nombre de replicas si necessaire

Vous pouvez egalement augmenter le nombre de replicas pour repartir la charge de lecture :

```yaml title="redis-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Redis
metadata:
  name: my-redis
spec:
  replicas: 3
  resourcesPreset: large
  size: 5Gi
  storageClass: replicated
  authEnabled: true
```

### 5. Appliquer la mise a jour

```bash
kubectl apply -f redis-medium.yaml
```

:::tip
Redis est un data store in-memory : la memoire allouee (`resources.memory` ou celle du preset) doit etre suffisante pour contenir l'ensemble de votre dataset. Surveillez l'utilisation memoire avant de scaler.
:::

## Verification

Verifiez que les ressources ont ete mises a jour :

```bash
# Verifier la configuration de la ressource Redis
kubectl get redis my-redis -o yaml | grep -A 5 resources

# Verifier l'etat des pods Redis
kubectl get pods -l app.kubernetes.io/instance=my-redis
```

**Resultat attendu :**

```console
NAME              READY   STATUS    RESTARTS   AGE
my-redis-0        1/1     Running   0          2m
my-redis-1        1/1     Running   0          2m
```

## Pour aller plus loin

- [Référence API](../api-reference.md) -- Parametres `resources`, `resourcesPreset` et `replicas`
- [Comment configurer la haute disponibilite](./configure-ha.md) -- Configuration Redis HA avec Sentinel
