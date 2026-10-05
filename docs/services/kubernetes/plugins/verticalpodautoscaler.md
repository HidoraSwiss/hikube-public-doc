---
sidebar_position: 4
title: Vertical Pod Autoscaler
---

# Vertical Pod Autoscaler

Le **Vertical Pod Autoscaler (VPA)** ajuste automatiquement les ressources CPU et mémoire des pods. Il analyse en continu la consommation réelle des workloads, puis recommande ou applique des ajustements.

| Composant | Rôle |
|-----------|------|
| `recommender` | Analyse les métriques et recommande des ressources pour les pods |
| `updater` | Recrée les pods lorsque les recommandations changent |
| `admissionController` | Applique les ressources recommandées à la création des pods |

## Dans la console

Le Vertical Pod Autoscaler fait partie de la **Configuration avancée** de l'étape **Addons** : il est toujours présent dans le cluster et ne se désactive pas. Vous pouvez seulement surcharger sa configuration.

1. À la création (étape **Addons**) ou depuis **Modifier** > **Extensions & Addons**, dépliez le bloc **Vertical Pod Autoscaler** de la section **Configuration avancée**.
2. Saisissez vos valeurs dans **Configuration Helm (YAML) — optionnel**.
3. Validez avec **Suivant** puis **Déployer** (création) ou **Enregistrer** (modification).

:::warning
Sur un cluster existant, la console n'enregistre pas une première surcharge saisie depuis **Modifier** : le bouton **Enregistrer** confirme la mise à jour, mais la valeur est ignorée. Définissez la surcharge à la création du cluster, ou [contactez le support](mailto:support@hidora.io). Une surcharge définie à la création reste modifiable depuis **Modifier**.
:::

Sur la page de détail du cluster, la ligne **VPA** de la section **Réseau** indique **VPA** lorsque l'addon est configuré.

## Surcharger la configuration

La valeur YAML est transmise au chart Helm du VPA, sous la clé `vertical-pod-autoscaler`. Par exemple, pour désactiver l'updater et n'utiliser que les recommandations :

```yaml title="vpa-override.yaml"
vertical-pod-autoscaler:
  updater:
    enabled: false
```

Les options disponibles sont décrites dans le [chart Helm du Vertical Pod Autoscaler](https://github.com/cowboysysop/charts/tree/master/charts/vertical-pod-autoscaler).

## Utilisation dans le cluster

Créez un objet `VerticalPodAutoscaler` pour chaque workload à suivre :

```yaml title="vpa-my-app.yaml"
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Off"
```

```bash
kubectl apply -f vpa-my-app.yaml

# Lire les recommandations
kubectl describe vpa my-app
```

## Bonnes pratiques

- Commencez avec `updateMode: "Off"` pour observer les recommandations avant de les appliquer.
- N'utilisez pas le VPA et un `HorizontalPodAutoscaler` sur la même métrique (CPU ou mémoire) d'un même workload.
- Combinez le VPA avec l'[autoscaling des groupes de nœuds](../how-to/configure-autoscaling.md) pour adapter à la fois les pods et la capacité du cluster.
