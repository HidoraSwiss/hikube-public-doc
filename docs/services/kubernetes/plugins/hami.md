---
sidebar_position: 11
title: HAMi
---

# HAMi

L'addon **HAMi** apporte la **virtualisation de GPU** : il permet de partager un même GPU entre plusieurs pods, au lieu d'attribuer un GPU entier à chaque pod.

## Dans la console

HAMi nécessite l'addon [GPU Operator](./gpu-operator.md), et donc un groupe de nœuds avec des GPU.

1. À la création, étape **Addons**, cochez **HAMi** (désactivé par défaut). Si **GPU Operator** n'est pas coché, la console affiche « Nécessite l'addon GPU Operator » et bloque la suite.
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez **HAMi**, puis **Enregistrer**.

La page de détail du cluster affiche **HAMi** dans la section **Extensions** lorsqu'il est actif.

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart Helm de HAMi, sous la clé `hami`. Les options disponibles sont décrites dans la [documentation HAMi](https://project-hami.io/docs).

## Utilisation dans le cluster

```bash
# Pods HAMi
kubectl get pods -A | grep -i hami
```

Les pods demandent une fraction de GPU à l'aide des ressources exposées par HAMi (mémoire GPU, part de calcul). Consultez la [documentation HAMi](https://project-hami.io/docs) pour les noms de ressources et des exemples de pods.

## Bonnes pratiques

- Réservez le partage de GPU aux charges qui n'exploitent pas un GPU entier (inférence légère, développement, notebooks).
- Fixez des limites de mémoire GPU par pod pour éviter qu'un pod n'en prive les autres.
