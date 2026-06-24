---
sidebar_position: 6
title: Riferimento API
---

# Riferimento API – Kubernetes

Questo riferimento descrive l'API **`Kubernetes`** di Hikube (`apps.cozystack.io/v1alpha1`), che effettua il provisioning di cluster Kubernetes gestiti (control plane Kamaji + worker KubeVirt). I campi sottostanti corrispondono allo schema realmente esposto dalla piattaforma.

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

## Specifica

| Parametro       | Tipo      | Descrizione                                                            | Predefinito  |
| --------------- | --------- | --------------------------------------------------------------------- | ------------ |
| `version`       | `string`  | Versione Kubernetes (`major.minor`) — vedi [versioni](#version)       | `v1.35`      |
| `storageClass`  | `string`  | Classe di archiviazione per i volumi persistenti                      | `replicated` |
| `host`          | `string`  | Nome host esterno del cluster. Predefinito `<cluster>.<tenant-host>`  | `""`         |
| `controlPlane`  | `object`  | Configurazione del piano di controllo — vedi [Concetti](concepts.md#control-plane) | `{}` |
| `nodeGroups`    | `object`  | Mappa dei gruppi di worker — vedi [nodeGroups](#nodegroups)           | vedi predefinito |
| `addons`        | `object`  | Moduli aggiuntivi del cluster — vedi [addons](#addons)               | `{}`         |

---

## version

`version` seleziona la versione minore di Kubernetes da distribuire.

| Valori supportati |
| ----------------- |
| `v1.35` (predefinito), `v1.34`, `v1.33`, `v1.32`, `v1.31`, `v1.30` |

```yaml
spec:
  version: v1.34
```

Vedi la guida [Aggiornare un cluster](how-to/upgrade-cluster.md) per l'avanzamento di versione.

---

## nodeGroups

`nodeGroups` è una **mappa** (`<nome>: {…}`) che descrive i gruppi di worker. Ogni gruppo è soggetto ad autoscaling tra `minReplicas` e `maxReplicas`.

| Campo              | Tipo            | Descrizione                                                       | Predefinito |
| ------------------ | --------------- | ----------------------------------------------------------------- | ----------- |
| `minReplicas`      | `integer`       | Numero minimo di nodi (0 = scale-to-zero possibile)              | `0`         |
| `maxReplicas`      | `integer`       | Numero massimo di nodi                                           | `10`        |
| `instanceType`     | `string`        | Profilo dei nodi (vedi [tipi di istanze](../compute/api-reference.md#tipi-di-istanze)) | `u1.medium` |
| `ephemeralStorage` | `int`/`string`  | Dimensione dell'archiviazione effimera per nodo (es: `20Gi`)     | `20Gi`      |
| `resources`        | `object`        | Override esplicito `cpu` / `memory` per nodo                     | `{}`        |
| `gpus`             | `[]object`      | GPU collegate ai nodi (`gpus[].name`) — vedi [GPU con Kubernetes](../gpu/api-reference.md) | `[]` |
| `roles`            | `[]string`      | Ruoli dei nodi (es: `ingress-nginx`)                             | `[]`        |

:::note `ephemeralStorage` è uno scalare
Indicate direttamente una dimensione (`ephemeralStorage: 20Gi`), non un oggetto `{size: …}`.
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

Vedi [Concetti → Node Groups](concepts.md#node-groups) per il dettaglio dei campi.

---

## addons

Il blocco `addons` attiva i moduli aggiuntivi installati nel cluster tenant. La maggior parte espone `enabled` e `valuesOverride` (override dei valori Helm).

| Addon                  | Campi                                           | Ruolo                                                     |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `certManager`          | `enabled`, `valuesOverride`                     | Gestione automatica dei certificati TLS                   |
| `ingressNginx`         | `enabled`, `exposeMethod`, `hosts`, `valuesOverride` | Controller Ingress NGINX (vedi sotto)                |
| `fluxcd`               | `enabled`, `valuesOverride`                     | GitOps (Flux)                                             |
| `gatewayAPI`           | `enabled`                                       | Supporto della Gateway API                                |
| `gpuOperator`          | `enabled`, `valuesOverride`                     | NVIDIA GPU Operator (**richiesto** per i worker GPU)      |
| `monitoringAgents`     | `enabled`, `valuesOverride`                     | Agenti di monitoring/log                                  |
| `velero`               | `enabled`, `valuesOverride`                     | Backup / ripristino                                       |
| `cilium`               | `valuesOverride`                                | CNI Cilium (sempre attivo, solo override)                 |
| `coredns`              | `valuesOverride`                                | CoreDNS (sempre attivo, solo override)                    |
| `verticalPodAutoscaler`| `valuesOverride`                                | Vertical Pod Autoscaler (sempre attivo)                   |

:::note
`cilium`, `coredns` e `verticalPodAutoscaler` non hanno un campo `enabled` (componenti di base) — solo `valuesOverride` è utilizzabile. `gatewayAPI` espone solo `enabled`.
:::

### certManager / fluxcd / velero / monitoringAgents / gpuOperator

```yaml
spec:
  addons:
    certManager:
      enabled: true
    gpuOperator:
      enabled: true     # indispensabile se dei nodeGroups portano delle gpus
    velero:
      enabled: true
    monitoringAgents:
      enabled: true
    fluxcd:
      enabled: true
```

### ingressNginx

| Campo            | Tipo       | Descrizione                                                                  | Predefinito |
| ---------------- | ---------- | ---------------------------------------------------------------------------- | ----------- |
| `enabled`        | `boolean`  | Attiva il controller (richiede nodi con il ruolo `ingress-nginx`)           | `false`     |
| `exposeMethod`   | `string`   | Metodo di esposizione: `Proxied` o `LoadBalancer`                           | `Proxied`   |
| `hosts`          | `[]string` | Domini instradati verso questo cluster quando `exposeMethod: Proxied`       | `[]`        |
| `valuesOverride` | `object`   | Override dei valori Helm                                                     | `{}`        |

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

## Esempi completi

### Cluster di produzione

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

### Cluster di sviluppo

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
spec:
  storageClass: replicated

  controlPlane:
    replicas: 1   # risparmio di risorse (nessuna HA)

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

### Cluster ML/AI con GPU

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
      minReplicas: 0          # scale-to-zero fuori carico
      maxReplicas: 10
      instanceType: u1.2xlarge
      ephemeralStorage: 500Gi # dataset
      gpus:
        - name: nvidia.com/AD102GL_L40S
      roles: []

  addons:
    certManager:
      enabled: true
    # Richiesto per esporre le GPU ai pod (nvidia.com/gpu)
    gpuOperator:
      enabled: true
    monitoringAgents:
      enabled: true
```

:::tip Buone pratiche
- `controlPlane.replicas: 3` in produzione (quorum etcd / HA).
- Separate i workload in node group dedicati (web, compute, GPU).
- Per le GPU: node group con `gpus` **e** `addons.gpuOperator.enabled: true`.
- Attivate il monitoring e i backup (Velero) sui cluster critici.
:::

:::warning Attenzione
- Le eliminazioni di cluster sono **irreversibili** — verificate i vostri backup.
- Senza l'addon `gpuOperator`, le GPU collegate ai worker non vengono esposte ai pod.
:::
