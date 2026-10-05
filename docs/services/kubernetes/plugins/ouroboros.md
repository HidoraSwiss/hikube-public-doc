---
sidebar_position: 12
title: Ouroboros
---

# Ouroboros

L'addon **Ouroboros** corrige le **NAT en épingle** (*hairpin NAT*) d'Ingress NGINX lorsque le PROXY protocol est utilisé. Sans lui, un pod du cluster qui appelle un domaine public servi par l'Ingress du même cluster peut voir sa requête échouer.

## Dans la console

Ouroboros nécessite l'addon [Ingress NGINX](./ingress-nginx.md).

1. À la création, étape **Addons**, cochez **Ouroboros** (désactivé par défaut). Si **Ingress NGINX** n'est pas coché, la console affiche « Nécessite l'addon Ingress NGINX » et bloque la suite.
2. Sur un cluster existant : **Modifier** > **Extensions & Addons**, cochez **Ouroboros**, puis **Enregistrer**.

La page de détail du cluster affiche **Ouroboros** dans la section **Extensions** lorsqu'il est actif.

## Surcharger la configuration

Une fois l'addon coché, le champ **Configuration Helm (YAML) — optionnel** apparaît. La valeur est transmise au chart Helm d'Ouroboros, sous la clé `ouroboros`. Dans la plupart des cas, aucune surcharge n'est nécessaire.

## Utilisation dans le cluster

```bash
# Pods Ouroboros
kubectl get pods -A | grep -i ouroboros

# Tester l'accès à un domaine public servi par l'Ingress du cluster, depuis un pod
kubectl run hairpin-test --rm -it --image=curlimages/curl --restart=Never -- curl -sv https://app.example.com
```

## Bonnes pratiques

- Activez Ouroboros dès que des applications du cluster s'appellent entre elles par leurs domaines publics.
