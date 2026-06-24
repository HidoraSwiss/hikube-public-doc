---
sidebar_position: 6
title: API Reference
---

# API Reference – Kubernetes

Cette référence décrit l'API **`Kubernetes`** d'Hikube (`apps.cozystack.io/v1alpha1`), qui provisionne des clusters Kubernetes managés (control plane Kamaji + workers KubeVirt). Les champs ci-dessous correspondent au schéma réellement exposé par la plateforme.

```yaml title="cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-cluster
spec:
  version: v1.35
  storageClass: replicated
  controlPlane:
    replicas: 2
  nodeGroups:
    md0:
      minReplicas: 1
      maxReplicas: 5
      instanceType: u1.medium
      ephemeralStorage: 20Gi
      roles:
        - ingress-nginx
  addons:
    ingressNginx:
      enabled: true
```

---

## Spécification

| Paramètre       | Type      | Description                                                            | Défaut       |
| --------------- | --------- | --------------------------------------------------------------------- | ------------ |
| `version`       | `string`  | Version Kubernetes (`major.minor`) — voir [versions](#version)        | `v1.35`      |
| `storageClass`  | `string`  | Classe de stockage pour les volumes persistants                       | `replicated` |
| `host`          | `string`  | Nom d'hôte externe du cluster. Par défaut `<cluster>.<tenant-host>`   | `""`         |
| `controlPlane`  | `object`  | Configuration du plan de contrôle — voir [Concepts](concepts.md#control-plane) | `{}` |
| `nodeGroups`    | `object`  | Carte des groupes de workers — voir [nodeGroups](#nodegroups)          | voir défaut  |
| `addons`        | `object`  | Modules complémentaires du cluster — voir [addons](#addons)           | `{}`         |

---

## version

`version` sélectionne la version mineure de Kubernetes à déployer.

| Valeurs supportées |
| ------------------ |
| `v1.35` (défaut), `v1.34`, `v1.33`, `v1.32`, `v1.31`, `v1.30` |

```yaml
spec:
  version: v1.34
```

Voir le guide [Mettre à jour un cluster](how-to/upgrade-cluster.md) pour la montée de version.

---

## nodeGroups

`nodeGroups` est une **carte** (`<nom>: {…}`) décrivant les groupes de workers. Chaque groupe est autoscalé entre `minReplicas` et `maxReplicas`.

| Champ              | Type            | Description                                                       | Défaut      |
| ------------------ | --------------- | ----------------------------------------------------------------- | ----------- |
| `minReplicas`      | `integer`       | Nombre minimal de nœuds (0 = scale-to-zero possible)              | `0`         |
| `maxReplicas`      | `integer`       | Nombre maximal de nœuds                                           | `10`        |
| `instanceType`     | `string`        | Gabarit des nœuds (voir [types d'instances](../compute/api-reference.md#types-dinstances)) | `u1.medium` |
| `ephemeralStorage` | `int`/`string`  | Taille du stockage éphémère par nœud (ex : `20Gi`)               | `20Gi`      |
| `resources`        | `object`        | Surcharge explicite `cpu` / `memory` par nœud                    | `{}`        |
| `gpus`             | `[]object`      | GPU attachés aux nœuds (`gpus[].name`) — voir [GPU](../gpu/api-reference.md#-gpu-avec-kubernetes) | `[]` |
| `roles`            | `[]string`      | Rôles des nœuds (ex : `ingress-nginx`)                            | `[]`        |

:::note `ephemeralStorage` est un scalaire
Indiquez directement une taille (`ephemeralStorage: 20Gi`), pas un objet `{size: …}`.
:::

```yaml
spec:
  nodeGroups:
    workers:
      minReplicas: 1
      maxReplicas: 10
      instanceType: u1.xlarge
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    gpu-workers:
      minReplicas: 0
      maxReplicas: 4
      instanceType: u1.2xlarge
      ephemeralStorage: 200Gi
      gpus:
        - name: nvidia.com/AD102GL_L40S
```

Voir [Concepts → Node Groups](concepts.md#node-groups) pour le détail des champs.

---

## addons

Le bloc `addons` active les modules complémentaires installés dans le cluster tenant. La plupart exposent `enabled` et `valuesOverride` (surcharge de valeurs Helm).

| Addon                  | Champs                                          | Rôle                                                      |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `certManager`          | `enabled`, `valuesOverride`                     | Gestion automatique des certificats TLS                   |
| `ingressNginx`         | `enabled`, `exposeMethod`, `hosts`, `valuesOverride` | Contrôleur Ingress NGINX (voir ci-dessous)           |
| `fluxcd`               | `enabled`, `valuesOverride`                     | GitOps (Flux)                                             |
| `gatewayAPI`           | `enabled`                                       | Support de la Gateway API                                 |
| `gpuOperator`          | `enabled`, `valuesOverride`                     | NVIDIA GPU Operator (**requis** pour les workers GPU)     |
| `monitoringAgents`     | `enabled`, `valuesOverride`                     | Agents de monitoring/logs                                 |
| `velero`               | `enabled`, `valuesOverride`                     | Sauvegarde / restauration                                 |
| `cilium`               | `valuesOverride`                                | CNI Cilium (toujours actif, surcharge uniquement)         |
| `coredns`              | `valuesOverride`                                | CoreDNS (toujours actif, surcharge uniquement)            |
| `verticalPodAutoscaler`| `valuesOverride`                                | Vertical Pod Autoscaler (toujours actif)                  |

:::note
`cilium`, `coredns` et `verticalPodAutoscaler` n'ont pas de champ `enabled` (composants de base) — seul `valuesOverride` est exploitable. `gatewayAPI` n'expose que `enabled`.
:::

### certManager / fluxcd / velero / monitoringAgents / gpuOperator

```yaml
spec:
  addons:
    certManager:
      enabled: true
    gpuOperator:
      enabled: true     # indispensable si des nodeGroups portent des gpus
    velero:
      enabled: true
    monitoringAgents:
      enabled: true
    fluxcd:
      enabled: true
```

### ingressNginx

| Champ            | Type       | Description                                                                  | Défaut     |
| ---------------- | ---------- | ---------------------------------------------------------------------------- | ---------- |
| `enabled`        | `boolean`  | Active le contrôleur (nécessite des nœuds avec le rôle `ingress-nginx`)      | `false`    |
| `exposeMethod`   | `string`   | Méthode d'exposition : `Proxied` ou `LoadBalancer`                          | `Proxied`  |
| `hosts`          | `[]string` | Domaines routés vers ce cluster lorsque `exposeMethod: Proxied`             | `[]`       |
| `valuesOverride` | `object`   | Surcharge de valeurs Helm                                                    | `{}`       |

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      exposeMethod: Proxied
      hosts:
        - app.example.com
        - "*.services.example.com"
```

---

## Exemples complets

### Cluster de production

```yaml title="production-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: production
spec:
  version: v1.34
  storageClass: replicated
  host: k8s-prod.example.com

  controlPlane:
    replicas: 3

  nodeGroups:
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: s1.large
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: u1.4xlarge
      ephemeralStorage: 100Gi
      roles: []

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      exposeMethod: Proxied
      hosts:
        - app.example.com
        - api.example.com
    fluxcd:
      enabled: true
    monitoringAgents:
      enabled: true
    velero:
      enabled: true
```

### Cluster de développement

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
spec:
  storageClass: replicated

  controlPlane:
    replicas: 1   # économie de ressources (pas de HA)

  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: s1.medium
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.example.com"
```

### Cluster ML/AI avec GPU

```yaml title="ml-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: machine-learning
spec:
  storageClass: replicated

  controlPlane:
    replicas: 2

  nodeGroups:
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: s1.large
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx
    gpu:
      minReplicas: 0          # scale-to-zero hors charge
      maxReplicas: 10
      instanceType: u1.2xlarge
      ephemeralStorage: 500Gi # datasets
      gpus:
        - name: nvidia.com/AD102GL_L40S
      roles: []

  addons:
    certManager:
      enabled: true
    # Requis pour exposer les GPU aux pods (nvidia.com/gpu)
    gpuOperator:
      enabled: true
    monitoringAgents:
      enabled: true
```

:::tip Bonnes pratiques
- `controlPlane.replicas: 3` en production (quorum etcd / HA).
- Séparez les workloads dans des node groups dédiés (web, compute, GPU).
- Pour les GPU : node group avec `gpus` **et** `addons.gpuOperator.enabled: true`.
- Activez le monitoring et les sauvegardes (Velero) sur les clusters critiques.
:::

:::warning Attention
- Les suppressions de cluster sont **irréversibles** — vérifiez vos sauvegardes.
- Sans l'addon `gpuOperator`, les GPU attachés aux workers ne sont pas exposés aux pods.
:::
