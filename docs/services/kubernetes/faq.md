---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Quels sont les types d'instances disponibles ?

Hikube propose trois gammes d'instances pour les nœuds Kubernetes :

| Gamme | Préfixe | Ratio vCPU:RAM | Usage recommandé |
|-------|---------|----------------|------------------|
| **Standard** | `s1` | 1:2 | Workloads généraux, serveurs web |
| **Universal** | `u1` | 1:4 | Applications métier, bases de données |
| **Memory** | `m1` | 1:8 | Cache, analytics, traitements en mémoire |

Chaque gamme est disponible en tailles allant de `small` à `8xlarge`. Par exemple : `s1.small`, `u1.large`, `m1.2xlarge`.

---

### Quelle est la différence entre `storageClass` local et replicated ?

Les trois storageClasses disponibles sont : `local`, `replicated` et `replicated-async`.

| Caractéristique | `local` | `replicated` / `replicated-async` |
|----------------|---------|-------------------------------------|
| **Réplication** | Un seul datacenter | Multi-datacenter (synchrone ou asynchrone) |
| **Performance** | Plus rapide (latence faible) | Légèrement plus lent |
| **Haute disponibilité** | Non (niveau stockage) | Oui |
| **Cas d'usage** | Clusters K8s (les nœuds assurent la HA applicative) | Instances isolées, données critiques sans réplication applicative |

:::tip
Pour un cluster Kubernetes, les nœuds fournissent déjà la haute disponibilité au niveau applicatif. Utilisez `local` pour de meilleures performances. Réservez `replicated` aux workloads mono-instance sans réplication applicative intégrée.
:::

---

### Quels addons sont disponibles ?

Les addons suivants peuvent être activés sur votre cluster :

| Addon | Description |
|-------|-------------|
| `certManager` | Gestion automatique des certificats TLS (Let's Encrypt) |
| `ingressNginx` | Contrôleur Ingress NGINX pour le routage HTTP/HTTPS |
| `fluxcd` | Déploiement GitOps continu |
| `monitoringAgents` | Agents de monitoring (métriques, logs) |
| `gpuOperator` | Opérateur NVIDIA GPU pour workloads GPU |

Chaque addon s'active dans le manifeste du cluster :

```yaml title="cluster.yaml"
spec:
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
```

---

### Comment récupérer mon kubeconfig ?

Le kubeconfig est stocké dans un Secret Kubernetes généré automatiquement lors de la création du cluster :

```bash
kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
```

Vous pouvez ensuite l'utiliser :

```bash
export KUBECONFIG=kubeconfig.yaml
kubectl get nodes
```

---

### Comment scaler les nodeGroups ?

Le scaling est contrôlé par les paramètres `minReplicas` et `maxReplicas` de chaque nodeGroup. L'autoscaler ajuste automatiquement le nombre de nœuds entre ces deux bornes en fonction de la charge.

Pour modifier les limites, mettez à jour votre manifeste et appliquez-le :

```yaml title="cluster.yaml"
spec:
  nodeGroups:
    workers:
      minReplicas: 3
      maxReplicas: 15
      instanceType: "s1.large"
```

```bash
kubectl apply -f cluster.yaml
```

---

### Comment ajouter des nœuds GPU à mon cluster ?

Ajoutez un nodeGroup dédié avec le champ `gpus` spécifiant le modèle de GPU souhaité :

```yaml title="cluster-gpu.yaml"
spec:
  nodeGroups:
    gpu-workers:
      minReplicas: 1
      maxReplicas: 4
      instanceType: "u1.2xlarge"
      gpus:
        - name: "nvidia.com/AD102GL_L40S"
  addons:
    gpuOperator:
      enabled: true
```

:::warning
N'oubliez pas d'activer l'addon `gpuOperator` pour que les drivers NVIDIA soient automatiquement installés sur les nœuds GPU.
:::

---

### Pourquoi `kubectl get ... -A` retourne Forbidden ?

L'accès aux clusters Hikube est limité au scope de votre tenant. Les requêtes cluster-scope (avec le flag `-A` ou `--all-namespaces`) sont interdites par le RBAC en place.

**Ce qui ne fonctionne pas :**

```bash
kubectl get pods -A
# Error: pods is forbidden: User "..." cannot list resource "pods" at the cluster scope
```

**Ce qui fonctionne :**

```bash
kubectl get pods
kubectl get pods -n mon-namespace
```

:::note
Cette restriction est une mesure de sécurité multi-tenant. Vous ne pouvez interroger que les namespaces auxquels votre tenant a accès.
:::
