---
title: "Comment scaler verticalement"
---

# Comment scaler verticalement

Ce guide explique comment ajuster les ressources CPU et mémoire de votre instance PostgreSQL sur Hikube, soit via un preset prédéfini, soit avec des valeurs explicites.

## Prerequisitiiti

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **PostgreSQL** déployée sur Hikube

## Presets disponibles

Hikube propose des presets de ressources prédéfinis pour simplifier le dimensionnement :

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Si le champ `resources` (CPU/mémoire explicites) est défini, la valeur de `resourcesPreset` est **entièrement ignorée**. Assurez-vous de vider le champ `resources` si vous souhaitez utiliser un preset.
:::

## Passi

### 1. Vérifier les ressources actuelles

Consultez la configuration actuelle de votre instance :

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Exemple de résultat avec un preset :**

```console
  resourcesPreset: micro
  resources: {}
```

**Exemple de résultat avec des ressources explicites :**

```console
  resourcesPreset: micro
  resources:
    cpu: 2000m
    memory: 2Gi
```

### 2. Option A : changer le preset de ressources

Pour passer d'un preset à un autre (par exemple de `micro` à `large`), appliquez un patch :

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resourcesPreset: large
  resources: {}
'
```

:::note
Il est important de remettre `resources: {}` lors du passage à un preset, afin que le preset soit bien pris en compte. Si `resources` contient des valeurs explicites, le preset est ignoré.
:::

Vous pouvez aussi modifier le manifeste YAML complet :

```yaml title="postgresql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resourcesPreset: large
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

Puis appliquer :

```bash
kubectl apply -f postgresql-scaled.yaml
```

### 3. Option B : définir des ressources explicites

Pour un contrôle fin, définissez directement les valeurs CPU et mémoire :

```bash
kubectl patch postgres my-database --type='merge' -p='
spec:
  resources:
    cpu: 4000m
    memory: 4Gi
'
```

Ou via le manifeste complet :

```yaml title="postgresql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: my-database
spec:
  replicas: 3
  resources:
    cpu: 4000m
    memory: 4Gi
  size: 20Gi

  users:
    admin:
      password: SecureAdminPassword

  databases:
    myapp:
      roles:
        admin:
          - admin
```

```bash
kubectl apply -f postgresql-custom-resources.yaml
```

:::tip
Pour le dimensionnement PostgreSQL, une bonne règle de départ est d'allouer `shared_buffers` à environ 25% de la mémoire totale. Ajustez les paramètres PostgreSQL en conséquence via la section `postgresql.parameters`.
:::

### 4. Vérifier le rolling update

Après le changement de ressources, l'opérateur effectue un **rolling update** des pods PostgreSQL. Surveillez la progression :

```bash
kubectl get po -w | grep postgres-my-database
```

**Risultato atteso (pendant le rolling update) :**

```console
postgres-my-database-2   1/1     Terminating   0   45m
postgres-my-database-2   0/1     Pending       0   0s
postgres-my-database-2   1/1     Running       0   30s
```

Attendez que tous les pods soient en état `Running` :

```bash
kubectl get po | grep postgres-my-database
```

```console
postgres-my-database-1   1/1     Running   0   2m
postgres-my-database-2   1/1     Running   0   4m
postgres-my-database-3   1/1     Running   0   6m
```

## Verifica

Confirmez que les nouvelles ressources sont appliquées :

```bash
kubectl get postgres my-database -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

Vérifiez que l'instance est fonctionnelle :

```bash
kubectl get postgres my-database
```

**Risultato atteso :**

```console
NAME          READY   AGE   VERSION
my-database   True    1h    0.18.0
```

## Per approfondire

- **[Référence API PostgreSQL](../api-reference.md)** : documentation complète des paramètres `resources`, `resourcesPreset` et tableau des presets
