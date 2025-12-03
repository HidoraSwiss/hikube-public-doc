---
sidebar_position: 4
title: Pod Auto Scaler
---

# 🧩 Détails du champ `addons.verticalPodAutoscaler`

Le champ `addons.verticalPodAutoscaler` définit la configuration de l’add-on **Vertical Pod Autoscaler (VPA)**, responsable de l’ajustement automatique des ressources CPU et mémoire des Pods.
Il analyse en continu la consommation réelle des workloads et recommande ou applique des ajustements pour optimiser les performances et l’utilisation des ressources.

```yaml
addons:
  verticalPodAutoscaler:
    valuesOverride:
      verticalPodAutoscaler:
        recommender:
          enabled: true
        updater:
          enabled: true
        admissionController:
          enabled: true
```

---

## `verticalPodAutoscaler` (Object) — **Obligatoire**

### Description

Le champ `verticalPodAutoscaler` regroupe la configuration principale de l’add-on VPA.
Il permet de déployer et personnaliser les composants du Vertical Pod Autoscaler afin d’automatiser la gestion des ressources des Pods.

### Exemple

```yaml
verticalPodAutoscaler:
  valuesOverride:
    verticalPodAutoscaler:
      recommender:
        enabled: true
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Le champ `valuesOverride` permet de **surcharger les valeurs Helm** du déploiement du Vertical Pod Autoscaler.
Il est utilisé pour activer ou désactiver les différents sous-composants :

| Composant | Description |
|------------|--------------|
| `recommender` | Analyse les métriques et recommande des ressources optimales pour les Pods. |
| `updater` | Met à jour automatiquement les Pods lorsque les recommandations changent. |
| `admissionController` | Intercepte les requêtes de création/modification de Pods pour ajuster les ressources à la volée. |

### Exemple

```yaml
valuesOverride:
  verticalPodAutoscaler:
    recommender:
      enabled: true
    updater:
      enabled: true
    admissionController:
      enabled: true
```

---

## 💡 Bonnes pratiques

- Toujours activer `recommender` pour bénéficier des suggestions automatiques de ressources.
- Utiliser `updater.enabled: false` dans un premier temps pour observer les recommandations avant d’appliquer les changements.
- Adapter la configuration via `valuesOverride` selon les besoins de charge et les environnements (staging, production).
