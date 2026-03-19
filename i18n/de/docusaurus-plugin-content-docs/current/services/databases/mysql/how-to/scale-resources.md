---
title: "Skalierung von verticalement"
---

# Skalierung von verticalement

Ce guide vous explique comment ajuster les ressources CPU et mémoire de votre instance MySQL auf Hikube, soit via un preset prédéterminé, soit en définissant des valeurs explicites.

## Voraussetzungen

- **kubectl** configuré avec votre kubeconfig Hikube
- Une instance **MySQL** déployée sur votre tenant
- Connaissance des besoins en ressources de votre charge de travail

## Schritte

### 1. Vérifier les ressources actuelles

Consultez la configuration actuelle de votre instance MySQL :

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

**Erwartetes Ergebnis (avec preset) :**

```console
  resourcesPreset: nano
```

**Erwartetes Ergebnis (avec ressources explicites) :**

```console
  resources:
    cpu: 1000m
    memory: 1Gi
```

### 2. Choisir la méthode de scaling

Hikube bietet deux approches pour définir les ressources :

#### Option A : Utiliser un `resourcesPreset`

Les presets offrent des profils de ressources prédéfinis et adaptés à différents cas d'usage :

| Preset | CPU | Mémoire | Anwendungsfälle |
|---|---|---|---|
| `nano` | 250m | 128Mi | Tests, développement minimal |
| `micro` | 500m | 256Mi | Développement, petites applications |
| `small` | 1 | 512Mi | Applications légères |
| `medium` | 1 | 1Gi | Applications standard |
| `large` | 2 | 2Gi | Charges de travail modérées |
| `xlarge` | 4 | 4Gi | Production standard |
| `2xlarge` | 8 | 8Gi | Production intensive |

#### Option B : Définir des ressources explicites

Pour un contrôle précis, définissez directement les valeurs `resources.cpu` et `resources.memory`.

:::warning
Si le champ `resources` est défini (CPU et mémoire explicites), la valeur de `resourcesPreset` est **ignorée**. Les deux approches sont mutuellement exclusives.
:::

### 3. Option A : Modifier le resourcesPreset

Pour passer d'un preset à un autre, utilisez `kubectl patch` :

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resourcesPreset: medium
'
```

Ou modifiez directement le manifeste :

```yaml title="mysql-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resourcesPreset: medium
```

```bash
kubectl apply -f mysql-scaled.yaml
```

### 4. Option B : Définir des ressources explicites

Pour un contrôle fin des ressources, spécifiez les valeurs CPU et mémoire directement :

```bash
kubectl patch mariadb example --type='merge' -p='
spec:
  resources:
    cpu: 2000m
    memory: 4Gi
'
```

Ou via le manifeste complet :

```yaml title="mysql-custom-resources.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MariaDB
metadata:
  name: example
spec:
  replicas: 3
  size: 10Gi
  resources:
    cpu: 2000m
    memory: 4Gi
```

```bash
kubectl apply -f mysql-custom-resources.yaml
```

:::tip
Pour revenir à un preset après avoir utilisé des ressources explicites, supprimez le champ `resources` et définissez `resourcesPreset` dans votre manifeste.
:::

## Überprüfung

Suivez le rolling update des pods MySQL :

```bash
kubectl get pods -w | grep mysql-example
```

**Erwartetes Ergebnis :**

```console
mysql-example-0   1/1     Running   0   5m
mysql-example-1   1/1     Running   0   3m
mysql-example-2   1/1     Running   0   1m
```

Überprüfen Sie, ob les nouvelles ressources sont bien appliquées :

```bash
kubectl get mariadb example -o yaml | grep -A 5 -E "resources:|resourcesPreset"
```

:::note
Le scaling vertical entraîne un **rolling update** des pods. Les réplicas sont redémarrés un par un pour minimiser l'impact sur la disponibilité. Pendant ce processus, le cluster reste accessible en lecture via les réplicas déjà aktualisiert.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) : liste complète des presets et paramètres de ressources
