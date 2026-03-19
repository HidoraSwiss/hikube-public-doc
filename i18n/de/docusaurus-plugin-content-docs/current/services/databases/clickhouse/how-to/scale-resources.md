---
title: "Skalierung von verticalement ClickHouse"
---

# Skalierung von verticalement ClickHouse

Dieser Leitfaden erklärt comment ajuster les ressources CPU, memoire et stockage de votre instance ClickHouse auf Hikube, soit via un preset predefini, soit en definissant des valeurs explicites.

## Voraussetzungen

- Une instance ClickHouse deployee sur Hikube (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Le fichier YAML de configuration de votre instance ClickHouse

## Schritte

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

### 4. Appliquer la Aktualisierung

```bash
kubectl apply -f clickhouse-large.yaml
```

## Überprüfung

Überprüfen Sie, ob les ressources ont ete Aktualisierungen :

```bash
# Verifier la configuration de la ressource ClickHouse
kubectl get clickhouse my-clickhouse -o yaml | grep -A 5 resources

# Verifier l'etat des pods ClickHouse
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse
```

**Erwartetes Ergebnis :**

```console
NAME                READY   STATUS    RESTARTS   AGE
my-clickhouse-0-0   1/1     Running   0          3m
my-clickhouse-0-1   1/1     Running   0          3m
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parametres `resources`, `resourcesPreset`, `size` et `storageClass`
- [Konfiguration von le sharding](./configure-sharding.md) -- Distribution horizontale des donnees
- [Verwaltung von les utilisateurs et profils](./manage-users.md) -- Gestion des acces utilisateurs
