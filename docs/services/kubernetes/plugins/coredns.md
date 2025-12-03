---
sidebar_position: 2
title: CoreDNS
---

  <!--coredns     <Object> -required-
    valuesOverride    <Object> -required--->

# 🧩 Détails du champ `addons.coredns`

Le champ `addons.coredns` définit la configuration de l’add-on **CoreDNS**, utilisé comme **service DNS** du cluster Kubernetes.
CoreDNS gère la résolution des noms de services et des pods internes au cluster, et peut être personnalisé via des paramètres Helm.

```yaml
addons:
  coredns:
    valuesOverride:
        coredns:
          replicaCount: 2
          servers:
            - plugins:
                - name: errors
                - configBlock: lameduck 10s
                  name: health
                - name: ready
                - configBlock: |-
                    pods insecure
                    fallthrough in-addr.arpa ip6.arpa
                    ttl 33
                  name: kubernetes
                  parameters: cluster.local in-addr.arpa ip6.arpa
                - name: prometheus
                  parameters: 0.0.0.0:9153
                - name: forward
                  parameters: . 10.1.1.2 10.4.1.11
                - name: cache
                  parameters: 333
                - name: loop
                - name: reload
                - name: loadbalance
              port: 53
              zones:
                - use_tcp: true
                  zone: .
```

---

## `coredns` (Object) — **Obligatoire**

### Description

Le champ `coredns` regroupe la configuration principale du service DNS du cluster.
Il définit les paramètres nécessaires au déploiement et au bon fonctionnement de CoreDNS.

### Exemple

```yaml
coredns:
  valuesOverride:
    corends:
      replicaCount: 2
```

---

## `valuesOverride` (Object) — **Obligatoire**

### Description

Le champ `valuesOverride` permet de **surcharger les valeurs par défaut** du déploiement CoreDNS, généralement via Helm.
Il est utilisé pour personnaliser les ressources, le nombre de réplicas, ou encore la configuration du service DNS (ex : plugins, zones, caches).
Voir les autres options : https://github.com/coredns/helm/blob/master/charts/coredns/values.yaml

### Exemple

```yaml
valuesOverride:
  corends:
    replicaCount: 2
    resources:
      limits:
        cpu: 500m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 128Mi
```

---

## 💡 Bonnes pratiques

- Toujours définir `valuesOverride` pour ajuster les ressources selon la taille du cluster.
- Configurer `replicaCount` à **au moins 2** pour assurer la haute disponibilité du service DNS.
- Surveiller l’utilisation mémoire : CoreDNS peut consommer plus selon le nombre de services et de requêtes DNS.
- Adapter la configuration des plugins (ex : `forward`, `cache`, `rewrite`) selon les besoins de ton environnement.
- Éviter de modifier manuellement le `ConfigMap` de CoreDNS : préférer un déploiement géré via `valuesOverride`.

---
