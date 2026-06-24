---
sidebar_position: 6
title: API-Referenz
---

# API-Referenz – Kubernetes

Diese Referenz beschreibt die **`Kubernetes`**-API von Hikube (`apps.cozystack.io/v1alpha1`), die verwaltete Kubernetes-Cluster bereitstellt (Control Plane Kamaji + KubeVirt-Workers). Die folgenden Felder entsprechen dem tatsächlich von der Plattform bereitgestellten Schema.

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

## Spezifikation

| Parameter       | Typ       | Beschreibung                                                          | Standard     |
| --------------- | --------- | --------------------------------------------------------------------- | ------------ |
| `version`       | `string`  | Kubernetes-Version (`major.minor`) — siehe [Versionen](#version)      | `v1.35`      |
| `storageClass`  | `string`  | Speicherklasse für persistente Volumes                                | `replicated` |
| `host`          | `string`  | Externer Hostname des Clusters. Standardmäßig `<cluster>.<tenant-host>` | `""`       |
| `controlPlane`  | `object`  | Konfiguration der Steuerungsebene — siehe [Konzepte](concepts.md#control-plane) | `{}` |
| `nodeGroups`    | `object`  | Map der Worker-Gruppen — siehe [nodeGroups](#nodegroups)              | siehe Standard |
| `addons`        | `object`  | Zusatzmodule des Clusters — siehe [addons](#addons)                   | `{}`         |

---

## version

`version` wählt die bereitzustellende Kubernetes-Minor-Version aus.

| Unterstützte Werte |
| ------------------ |
| `v1.35` (Standard), `v1.34`, `v1.33`, `v1.32`, `v1.31`, `v1.30` |

```yaml
spec:
  version: v1.34
```

Siehe den Leitfaden [Einen Cluster aktualisieren](how-to/upgrade-cluster.md) für das Versions-Upgrade.

---

## nodeGroups

`nodeGroups` ist eine **Map** (`<name>: {…}`), die die Worker-Gruppen beschreibt. Jede Gruppe wird zwischen `minReplicas` und `maxReplicas` automatisch skaliert.

| Feld               | Typ             | Beschreibung                                                      | Standard    |
| ------------------ | --------------- | ----------------------------------------------------------------- | ----------- |
| `minReplicas`      | `integer`       | Minimale Anzahl von Knoten (0 = Skalierung auf Null möglich)      | `0`         |
| `maxReplicas`      | `integer`       | Maximale Anzahl von Knoten                                        | `10`        |
| `instanceType`     | `string`        | Gabarit der Knoten (siehe [Instanztypen](../compute/api-reference.md#instanztypen)) | `u1.medium` |
| `ephemeralStorage` | `int`/`string`  | Größe des ephemeren Speichers pro Knoten (z.B.: `20Gi`)          | `20Gi`      |
| `resources`        | `object`        | Explizite Überschreibung von `cpu` / `memory` pro Knoten         | `{}`        |
| `gpus`             | `[]object`      | An die Knoten angehängte GPUs (`gpus[].name`) — siehe [GPU mit Kubernetes](../gpu/api-reference.md) | `[]` |
| `roles`            | `[]string`      | Rollen der Knoten (z.B.: `ingress-nginx`)                        | `[]`        |

:::note `ephemeralStorage` ist ein Skalar
Geben Sie direkt eine Größe an (`ephemeralStorage: 20Gi`), kein Objekt `{size: …}`.
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

Siehe [Konzepte → Node Groups](concepts.md#node-groups) für die Details der Felder.

---

## addons

Der Block `addons` aktiviert die im Tenant-Cluster installierten Zusatzmodule. Die meisten stellen `enabled` und `valuesOverride` (Überschreibung von Helm-Werten) bereit.

| Addon                  | Felder                                          | Rolle                                                     |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------- |
| `certManager`          | `enabled`, `valuesOverride`                     | Automatische Verwaltung der TLS-Zertifikate               |
| `ingressNginx`         | `enabled`, `exposeMethod`, `hosts`, `valuesOverride` | Ingress-NGINX-Controller (siehe unten)               |
| `fluxcd`               | `enabled`, `valuesOverride`                     | GitOps (Flux)                                             |
| `gatewayAPI`           | `enabled`                                       | Unterstützung der Gateway API                             |
| `gpuOperator`          | `enabled`, `valuesOverride`                     | NVIDIA GPU Operator (**erforderlich** für GPU-Workers)    |
| `monitoringAgents`     | `enabled`, `valuesOverride`                     | Monitoring-/Log-Agents                                    |
| `velero`               | `enabled`, `valuesOverride`                     | Sicherung / Wiederherstellung                             |
| `cilium`               | `valuesOverride`                                | CNI Cilium (immer aktiv, nur Überschreibung)              |
| `coredns`              | `valuesOverride`                                | CoreDNS (immer aktiv, nur Überschreibung)                 |
| `verticalPodAutoscaler`| `valuesOverride`                                | Vertical Pod Autoscaler (immer aktiv)                     |

:::note
`cilium`, `coredns` und `verticalPodAutoscaler` haben kein `enabled`-Feld (Basiskomponenten) — nur `valuesOverride` ist nutzbar. `gatewayAPI` stellt ausschließlich `enabled` bereit.
:::

### certManager / fluxcd / velero / monitoringAgents / gpuOperator

```yaml
spec:
  addons:
    certManager:
      enabled: true
    gpuOperator:
      enabled: true     # unverzichtbar, wenn nodeGroups GPUs tragen
    velero:
      enabled: true
    monitoringAgents:
      enabled: true
    fluxcd:
      enabled: true
```

### ingressNginx

| Feld             | Typ        | Beschreibung                                                                 | Standard   |
| ---------------- | ---------- | ---------------------------------------------------------------------------- | ---------- |
| `enabled`        | `boolean`  | Aktiviert den Controller (erfordert Knoten mit der Rolle `ingress-nginx`)    | `false`    |
| `exposeMethod`   | `string`   | Expositionsmethode: `Proxied` oder `LoadBalancer`                            | `Proxied`  |
| `hosts`          | `[]string` | Domains, die zu diesem Cluster geroutet werden, wenn `exposeMethod: Proxied` | `[]`       |
| `valuesOverride` | `object`   | Überschreibung von Helm-Werten                                               | `{}`       |

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

## Vollständige Beispiele

### Produktions-Cluster

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

### Entwicklungs-Cluster

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
spec:
  storageClass: replicated

  controlPlane:
    replicas: 1   # Ressourcenersparnis (keine HA)

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

### ML/AI-Cluster mit GPU

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
      minReplicas: 0          # Skalierung auf Null außerhalb der Last
      maxReplicas: 10
      instanceType: u1.2xlarge
      ephemeralStorage: 500Gi # Datasets
      gpus:
        - name: nvidia.com/AD102GL_L40S
      roles: []

  addons:
    certManager:
      enabled: true
    # Erforderlich, um die GPUs den Pods bereitzustellen (nvidia.com/gpu)
    gpuOperator:
      enabled: true
    monitoringAgents:
      enabled: true
```

:::tip Best Practices
- `controlPlane.replicas: 3` in der Produktion (etcd-Quorum / HA).
- Trennen Sie die Workloads in dedizierte Node Groups (web, compute, GPU).
- Für GPUs: Node Group mit `gpus` **und** `addons.gpuOperator.enabled: true`.
- Aktivieren Sie das Monitoring und die Sicherungen (Velero) auf kritischen Clustern.
:::

:::warning Achtung
- Cluster-Löschungen sind **irreversibel** — überprüfen Sie Ihre Sicherungen.
- Ohne das Addon `gpuOperator` werden die an die Workers angehängten GPUs den Pods nicht bereitgestellt.
:::
