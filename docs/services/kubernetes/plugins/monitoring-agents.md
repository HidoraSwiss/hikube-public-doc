---
sidebar_position: 10
title: Monitoring Agents
---

# Monitoring Agents

L'addon **Monitoring Agents** déploie dans le cluster les agents de collecte des **métriques** et des **logs**, qui transmettent les données à la supervision de la plateforme Hikube. Aucune option n'est à activer dans le projet.

| Composant | Rôle |
|-----------|------|
| **VictoriaMetrics Agent** (`vmagent`) | Collecte et envoie les métriques |
| **Fluent Bit** | Collecte et envoie les logs des conteneurs |
| **kube-state-metrics** | Expose l'état des objets Kubernetes sous forme de métriques |
| **Node exporter** | Expose les métriques système des nœuds |

## Dans la console

1. À la création, étape **Addons**, **Monitoring Agents** est coché par défaut.
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez ou décochez **Monitoring Agents**, puis **Enregistrer**.

La page de détail du cluster affiche **Monitoring Agents** dans la section **Extensions** lorsqu'il est actif.

:::note
L'accès aux tableaux de bord de supervision du projet n'est pas proposé dans la console ; contactez le support.
:::

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît, mais la plateforme ne l'applique pas pour cet addon : une surcharge saisie ici reste sans effet. Les destinations des métriques et des logs sont définies par la plateforme. Pour adapter le comportement des agents (ressources, filtres de collecte), contactez le support.

## Utilisation dans le cluster

```bash
# Pods des agents (namespace cozy-monitoring)
kubectl get pods -n cozy-monitoring

# Métriques de ressources
kubectl top nodes
kubectl top pods -A
```

Voir [Comment configurer le monitoring](../how-to/configure-monitoring.md).

## Bonnes pratiques

- Gardez l'addon activé sur les clusters de production pour conserver l'historique des métriques et des logs.
- Écrivez vos logs applicatifs sur la sortie standard des conteneurs : c'est ce que Fluent Bit collecte.
