---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Welche Instanztypen sind verfügbar?

Hikube bietet drei Instanzreihen für Kubernetes-Knoten:

| Reihe | Präfix | Verhältnis vCPU:RAM | Empfohlene Verwendung |
|-------|--------|---------------------|----------------------|
| **Standard** | `s1` | 1:2 | Allgemeine Workloads, Webserver |
| **Universal** | `u1` | 1:4 | Geschäftsanwendungen, Datenbanken |
| **Memory** | `m1` | 1:8 | Cache, Analytics, In-Memory-Verarbeitung |

Jede Reihe ist in Größen von `small` bis `8xlarge` verfügbar. Zum Beispiel: `s1.small`, `u1.large`, `m1.2xlarge`.

---

### Wie funktioniert die `storageClass` in einem Kubernetes-Cluster?

Die im Cluster-Manifest gewählte storageClass wird **innerhalb des Tenant-Clusters repliziert**. Wenn Ihre Workloads PVCs im Cluster erstellen, wird der Speicher mit dieser storageClass auf Infrastrukturebene bereitgestellt.

Die verfügbaren storageClasses sind: `local`, `replicated` und `replicated-async`.

| Eigenschaft | `local` | `replicated` / `replicated-async` |
|-------------|---------|-------------------------------------|
| **Replikation** | Ein einzelnes Rechenzentrum | Multi-Rechenzentrum (synchron oder asynchron) |
| **Leistung** | Schneller (niedrige Latenz) | Etwas langsamer |
| **Hochverfügbarkeit** | Nein (Speicherebene) | Ja |

:::tip
Die Standardempfehlung für Kubernetes ist **`replicated`**, die die Datenhaltbarkeit auf Speicherebene gewährleistet.
:::

:::note
**Aktuelle Einschränkung**: Nur eine storageClass kann an den Tenant-Cluster übergeben werden. Eine Verbesserung ist in Arbeit, um alle storageClasses zu übergeben und den Kunden je nach Bedarf wählen zu lassen.
:::

---

### Welche Addons sind verfügbar?

Folgende Addons können auf Ihrem Cluster aktiviert werden:

| Addon | Beschreibung |
|-------|-------------|
| `certManager` | Automatische Verwaltung von TLS-Zertifikaten (Let's Encrypt) |
| `ingressNginx` | NGINX Ingress Controller für HTTP/HTTPS-Routing |
| `fluxcd` | Kontinuierliches GitOps-Deployment |
| `monitoringAgents` | Monitoring-Agenten (Metriken, Logs) |
| `gpuOperator` | NVIDIA GPU Operator für GPU-Workloads |

Jedes Addon wird im Cluster-Manifest aktiviert:

```yaml title="cluster.yaml"
spec:
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
```

---

### Wie rufe ich meine kubeconfig ab?

Die kubeconfig ist in einem Kubernetes-Secret gespeichert, das automatisch bei der Cluster-Erstellung generiert wird:

```bash
kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
```

Anschließend können Sie sie verwenden:

```bash
export KUBECONFIG=kubeconfig.yaml
kubectl get nodes
```

---

### Wie skaliere ich die nodeGroups?

Die Skalierung wird durch die Parameter `minReplicas` und `maxReplicas` jeder nodeGroup gesteuert. Der Autoscaler passt die Anzahl der Knoten automatisch zwischen diesen beiden Grenzen je nach Last an.

Um die Grenzen zu ändern, aktualisieren Sie Ihr Manifest und wenden Sie es an:

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

### Wie füge ich GPU-Knoten zu meinem Cluster hinzu?

Fügen Sie eine dedizierte nodeGroup mit dem Feld `gpus` hinzu, das das gewünschte GPU-Modell angibt:

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
- Vergessen Sie nicht, das Addon `gpuOperator` zu aktivieren, damit die NVIDIA-Treiber automatisch auf den GPU-Knoten installiert werden.
- Jeder Knoten der GPU-NodeGroup verbraucht **1 physische GPU**. Eine NodeGroup mit `minReplicas: 4` benötigt 4 verfügbare GPUs, mit direkter Auswirkung auf die Abrechnung.
:::
