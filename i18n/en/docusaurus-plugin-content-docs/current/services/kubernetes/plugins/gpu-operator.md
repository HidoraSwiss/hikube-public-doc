---
sidebar_position: 7
title: GPU Operator
---

# 🧩 Détails du champ `addons.gpuOperator`

Le champ `addons.gpuOperator` définit la configuration de l’add-on **NVIDIA GPU Operator**, utilisé pour gérer automatiquement les **GPU** dans un cluster Kubernetes.
Ce composant installe et maintient les pilotes NVIDIA, les plugins d’exécution, le `device plugin`, ainsi que les outils de monitoring nécessaires à l’exploitation des GPU.

```yaml
addons:
  gpuOperator:
    enabled: true
    valuesOverride:
      driver:
        enabled: true
      toolkit:
        enabled: true
      devicePlugin:
        enabled: true
```

---

## `gpuOperator` (Object) — **Obligatoire**

### Description
Le champ `gpuOperator` regroupe la configuration principale de l’add-on NVIDIA GPU Operator.
Il permet d’activer le déploiement du composant et d’ajuster sa configuration.

### Exemple
```yaml
gpuOperator:
  enabled: true
  valuesOverride:
    driver:
      enabled: true
```

---

## `enabled` (boolean) — **Obligatoire**

### Description
Indique si le **GPU Operator** est activé (`true`) ou désactivé (`false`) dans le cluster.
Lorsqu’il est activé, l’opérateur déploie automatiquement les composants nécessaires à la gestion des GPU NVIDIA.

### Exemple
```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description
Le champ `valuesOverride` permet de **surcharger les valeurs par défaut** du GPU Operator.
Il est utilisé pour personnaliser le comportement du déploiement (activation du driver, du toolkit, des plugins, ou configuration des ressources).

### Exemple
```yaml
valuesOverride:
  driver:
    enabled: true
  toolkit:
    enabled: true
  devicePlugin:
    enabled: true
```

---

## 💡 Bonnes pratiques

- Activer `enabled: true` sur les nœuds dotés de GPU pour que l’opérateur gère automatiquement les composants NVIDIA.
- Utiliser `valuesOverride` pour adapter la configuration aux besoins spécifiques (ex. activer ou désactiver le `driver` si déjà installé manuellement).
- Déployer le GPU Operator uniquement sur les environnements où des workloads GPU (IA, ML, calcul scientifique) sont nécessaires.
