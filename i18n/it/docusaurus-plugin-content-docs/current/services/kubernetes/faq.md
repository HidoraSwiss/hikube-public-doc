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

### Comment fonctionne la `storageClass` dans un cluster Kubernetes ?

La storageClass choisie dans le manifeste du cluster est **répliquée à l'intérieur du cluster tenant**. Lorsque vos workloads créent des PVC dans le cluster, le stockage est provisionné avec cette storageClass côté infrastructure.

Les storageClasses disponibles sont : `local`, `replicated` et `replicated-async`.

| Caractéristique | `local` | `replicated` / `replicated-async` |
|----------------|---------|-------------------------------------|
| **Réplication** | Un seul datacenter | Multi-datacenter (synchrone ou asynchrone) |
| **Performance** | Plus rapide (latence faible) | Légèrement plus lent |
| **Haute disponibilité** | Non (niveau stockage) | Oui |

:::tip
La recommandation par défaut pour Kubernetes est **`replicated`**, qui assure la durabilité des données au niveau stockage.
:::

:::note
**Limitation actuelle** : une seule storageClass peut être passée au cluster tenant. Une amélioration est en cours pour permettre de passer toutes les storageClasses et laisser le client choisir selon ses besoins.
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
- N'oubliez pas d'activer l'addon `gpuOperator` pour que les drivers NVIDIA soient automatiquement installés sur les nœuds GPU.
- Chaque nœud du nodeGroup GPU consomme **1 GPU physique**. Un nodeGroup avec `minReplicas: 4` nécessite 4 GPUs disponibles, avec un impact direct sur la facturation.
:::

