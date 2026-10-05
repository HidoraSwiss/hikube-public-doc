---
sidebar_position: 6
title: FAQ
---

# FAQ — Kubernetes

### Wie erstelle ich einen Kubernetes-Cluster?

Öffnen Sie in der [Hikube-Konsole](https://console.hikube.cloud) **Infrastructure** > **Kubernetes** und klicken Sie auf **Create cluster**. Der Assistent umfasst vier Schritte: **General**, **Nodes**, **Addons** und **Summary**. Der [Schnellstart](./quick-start.md) beschreibt jeden Schritt im Detail.

---

### Welche Instanztypen sind verfügbar?

Hikube bietet drei Instanzserien für Kubernetes-Nodes an:

| Serie | Präfix | Verhältnis vCPU:RAM | Empfohlene Nutzung |
|-------|--------|---------------------|--------------------|
| **Standard (S)** | `s1` | 1:2 | Kostengünstige Nutzung, Entwicklung, Tests |
| **Universal (U)** | `u1` | 1:4 | Allgemeine Nutzung: Webserver, Anwendungen |
| **Memory (M)** | `m1` | 1:8 | Datenbanken, Caches, In-Memory-Verarbeitung |

Jede Serie ist in mehreren Größen verfügbar, zum Beispiel `s1.small`, `u1.large`, `m1.2xlarge`. Die vollständige Liste finden Sie in den [Konzepten](./concepts.md#instanztypen).

---

### Welche Speicherklasse sollte ich in meinem Cluster verwenden?

Die persistenten Volumes Ihrer Workloads verwenden die Speicherklasse **`replicated`**, die über mehrere Rechenzentren repliziert wird:

```yaml title="pvc.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated
  resources:
    requests:
      storage: 10Gi
```

Die Wahl einer anderen Speicherklasse für den Cluster wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

---

### Welche Addons sind verfügbar?

Der Schritt **Addons** des Assistenten bietet an:

| Addon | Beschreibung | Standardmäßig aktiviert |
|-------|--------------|-------------------------|
| **Cert-Manager** | Automatische Verwaltung von SSL/TLS-Zertifikaten | Ja |
| **Ingress NGINX** | Auf NGINX basierender Ingress-Controller | Ja |
| **Gateway API** | CRDs der Kubernetes Gateway API | Nein |
| **GPU Operator** | Verwaltung der NVIDIA-GPUs | Nein (vorgegeben, wenn eine Gruppe GPUs hat) |
| **HAMi** | Teilen einer GPU zwischen mehreren Pods (erfordert GPU Operator) | Nein |
| **Flux CD** | GitOps Continuous Deployment | Nein |
| **Monitoring Agents** | Monitoring-Agents für Logs und Metriken | Ja |
| **Ouroboros** | Behebung des Hairpin-NAT von Ingress NGINX (erfordert Ingress NGINX) | Nein |
| **Velero** | Backup und Wiederherstellung | Nein |

**Cilium**, **CoreDNS** und **Vertical Pod Autoscaler** sind immer vorhanden; ihre Konfiguration wird im Abschnitt **Advanced Configuration** überschrieben. Die Addons werden bei der Erstellung oder über **Edit** > **Extensions & Addons** aktiviert. Siehe den Abschnitt Plugins, beginnend mit [Cilium](./plugins/cilium.md).

---

### Wie rufe ich meine kubeconfig ab?

Öffnen Sie die Detailseite des Clusters in der Konsole und klicken Sie im Abschnitt **Actions** auf **Kubeconfig**. Der Browser lädt die Datei `kubeconfig-<cluster-name>.yaml` herunter:

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

Siehe [Zugriff und Werkzeuge](./how-to/toolbox.md).

---

### Wie skaliere ich die Node-Gruppen?

Die Skalierung wird über **Minimum nodes** und **Maximum nodes** jeder Gruppe gesteuert. Der Autoscaler passt die Anzahl der Nodes innerhalb dieser beiden Grenzen automatisch an die Last an.

Um die Grenzen zu ändern: **Edit** > **Node groups**, klappen Sie die Gruppe auf, ändern Sie die Werte und klicken Sie dann auf **Save**. Siehe [Autoscaling konfigurieren](./how-to/configure-autoscaling.md).

---

### Wie füge ich meinem Cluster GPU-Nodes hinzu?

Fügen Sie eine neue Node-Gruppe hinzu (**Edit** > **Add node group**) und wählen Sie in ihrem Abschnitt **GPU** das Modell und die Anzahl der GPUs. Die Konsole aktiviert dann automatisch das Addon **GPU Operator**, das die NVIDIA-Treiber installiert.

:::warning
- Die gewählten GPUs werden an **jeden** Node der Gruppe angebunden, und die Reservierung wird anhand der maximalen Anzahl an Nodes berechnet: Eine Gruppe mit maximal 4 Nodes und 1 GPU pro Node reserviert 4 GPUs, mit direkter Auswirkung auf die Abrechnung.
- Eine bestehende, ohne GPU erstellte Gruppe kann keine erhalten: Erstellen Sie eine neue Gruppe.
:::

Siehe [Eine Node-Gruppe hinzufügen und ändern](./how-to/manage-node-groups.md).

---

### Kann ich die Control Plane nach der Erstellung ändern?

Nein. **Control Plane Instance Size** und **Control Plane High Availability** lassen sich nach der Erstellung in der Konsole nicht ändern; wenden Sie sich an den Support. Kubernetes-Version, API-Endpoint, Node-Gruppen und Addons bleiben änderbar.
