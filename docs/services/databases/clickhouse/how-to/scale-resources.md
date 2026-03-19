---
title: "Comment scaler verticalement ClickHouse"
---

# Comment scaler verticalement ClickHouse

Ce guide explique comment ajuster les ressources CPU, memoire et stockage de votre instance ClickHouse sur Hikube, soit via un preset predefini, soit en definissant des valeurs explicites.

## Prerequis

- Une instance ClickHouse deployee sur Hikube (voir le [demarrage rapide](../quick-start.md))
- `kubectl` configure pour interagir avec l'API Hikube
- Le fichier YAML de configuration de votre instance ClickHouse

## Etapes

### 1. Verifier les ressources actuelles

Consultez la configuration actuelle de votre instance ClickHouse :

```bash
kubectl get clickhouse my-clickhouse -o yaml
```

Notez les valeurs de `resourcesPreset`, `resources`, `replicas`, `shards` et `size` dans la section `spec`.

### 2. Modifier le resourcesPreset ou les resources explicites

#### Option A : Utiliser un preset

Voici les presets disponibles :

| **Preset** | **CPU** | **Memoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

Par exemple, pour passer de `small` (valeur par defaut) a `large` :

```yaml title="clickhouse-large.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: large
  size: 20Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

#### Option B : Definir des ressources explicites

Pour un controle precis, specifiez directement le CPU et la memoire :

```yaml title="clickhouse-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resources:
    cpu: 4000m
    memory: 8Gi
  size: 50Gi
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 2Gi
```

:::warning
Si le champ `resources` est defini, la valeur de `resourcesPreset` est entierement ignoree. Supprimez `resourcesPreset` du manifeste pour eviter toute confusion.
:::

### 3. Ajuster le stockage si necessaire

ClickHouse stocke les donnees sur disque (contrairement a Redis). Pensez a augmenter le volume persistant (`size`) en fonction du volume de donnees attendu :

```yaml title="clickhouse-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse
spec:
  replicas: 2
  shards: 1
  resourcesPreset: xlarge
  size: 100Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
```

:::tip
Utilisez `storageClass: replicated` en production pour proteger les donnees contre la perte d'un noeud physique.
:::

### 4. Appliquer la mise a jour

```bash
kubectl apply -f clickhouse-large.yaml
```

## Verification

Verifiez que les ressources ont ete mises a jour :

```bash
# Verifier la configuration de la ressource ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 5 resources

# Verifier l'etat des pods ClickHouse
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

**Resultat attendu :**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-clickhouse-0-0   1/1     Running   0          3m
my-clickhouse-0-1   1/1     Running   0          3m
```

## Pour aller plus loin

- [Reference API](../api-reference.md) -- Parametres `resources`, `resourcesPreset`, `size` et `storageClass`
- [Comment configurer le sharding](./configure-sharding.md) -- Distribution horizontale des donnees
- [Comment gerer les utilisateurs et profils](./manage-users.md) -- Gestion des acces utilisateurs
