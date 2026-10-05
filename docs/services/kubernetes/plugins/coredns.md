---
sidebar_position: 2
title: CoreDNS
---

# CoreDNS

**CoreDNS** est le **serveur DNS** des clusters Kubernetes Hikube. Il assure la résolution des noms des services et des pods internes au cluster, et le relais des requêtes vers les noms externes.

## Dans la console

CoreDNS fait partie de la **Configuration avancée** de l'étape **Addons** : il est toujours présent dans le cluster et ne se désactive pas. Vous pouvez seulement surcharger sa configuration.

1. À la création (étape **Addons**) ou depuis **Modifier** > **Extensions & Addons**, dépliez le bloc **CoreDNS** de la section **Configuration avancée**.
2. Saisissez vos valeurs dans **Configuration Helm (YAML) — optionnel**.
3. Validez avec **Suivant** puis **Déployer** (création) ou **Enregistrer** (modification).

Sur la page de détail du cluster, la ligne **DNS** de la section **Réseau** indique **CoreDNS** lorsqu'une configuration CoreDNS est appliquée.

## Surcharger la configuration

La valeur YAML est transmise au chart Helm de CoreDNS, sous la clé `coredns`. Par exemple, pour fixer le nombre de réplicas et les ressources :

```yaml title="coredns-override.yaml"
coredns:
  replicaCount: 2
  resources:
    limits:
      cpu: 500m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

Les options disponibles (plugins, zones, cache, forward…) sont décrites dans le [chart Helm de CoreDNS](https://github.com/coredns/helm/tree/master/charts/coredns).

## Utilisation dans le cluster

```bash
# Pods CoreDNS
kubectl get pods -A | grep coredns

# Tester la résolution depuis un pod
kubectl run dns-test --rm -it --image=busybox --restart=Never -- nslookup kubernetes.default
```

## Bonnes pratiques

- Gardez au moins **2 réplicas** pour assurer la haute disponibilité du DNS.
- Surveillez la mémoire : la consommation de CoreDNS augmente avec le nombre de services et de requêtes.
- Ne modifiez pas le `ConfigMap` de CoreDNS à la main dans le cluster : passez par la surcharge dans la console, sinon vos changements seront écrasés.
