---
title: "Eine GPU auf Kubernetes bereitstellen"
---

# Eine GPU auf Kubernetes bereitstellen

Mit Hikube können Sie Ihren verwalteten Kubernetes-Clustern Node-Gruppen mit NVIDIA-GPUs hinzufügen. Diese Anleitung erklärt, wie Sie diese Gruppe in der Konsole konfigurieren und anschließend Pods bereitstellen, die die GPU nutzen.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt mit ausreichenden Quotas
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) auf Ihrem Rechner installiert
- Vertrautheit mit dem [verwalteten Kubernetes](../../kubernetes/overview.md) von Hikube

## Schritte

### 1. Eine GPU-Node-Gruppe hinzufügen

**Neuer Cluster**: Öffnen Sie **Infrastructure** > **Kubernetes** > **Create cluster**, füllen Sie den Schritt **General** aus und wechseln Sie dann zum Schritt **Nodes**.

**Bestehender Cluster**: Öffnen Sie den Cluster, klicken Sie auf **Edit** und gehen Sie zu **Node groups**.

Dann:

1. Klicken Sie auf **Add node group**.
2. **Group name**: zum Beispiel `gpu-workers`.
3. **Instance type**: Wählen Sie Serie und Größe, zum Beispiel **Universal (U)** > **2XLarge** (8 vCPU, 32 GB).
4. **Ephemeral storage size**: Sehen Sie genügend Platz für die CUDA-Container-Images vor, zum Beispiel `100` GB.
5. **Minimum nodes** und **Maximum nodes**: zum Beispiel `1` und `3`.
6. Abschnitt **GPU**: Klicken Sie auf die Karte des gewünschten Modells (zum Beispiel **NVIDIA L40S**); **+** und **−** stellen die Anzahl der GPUs **pro Node** ein.

:::tip CPU und GPU trennen
Behalten Sie eine Node-Gruppe ohne GPU für klassische Workloads und reservieren Sie die GPU-Gruppe für die Pods, die sie benötigen: Jede Gruppe wird unabhängig dimensioniert.
:::

:::warning Bestehende Gruppen
Eine **ohne** GPU erstellte Gruppe kann keine erhalten (**This node group was created without GPUs and cannot get any.**). Eine **mit** GPU erstellte Gruppe kann Modell oder Anzahl ändern, muss aber mindestens eine GPU behalten. Um die Kategorie zu wechseln, fügen Sie eine neue Node-Gruppe hinzu.
:::

### 2. Die Addons prüfen

Im Schritt **Addons** (Abschnitt **Extensions & Addons** beim Bearbeiten) ist **GPU Operator** angehakt und gesperrt (**Required when a node group has GPUs**): Er installiert die NVIDIA-Treiber und das Device Plugin auf den GPU-Nodes.

Aktivieren Sie auch **HAMi**, wenn Sie dieselbe GPU zwischen mehreren Pods teilen möchten.

### 3. Bereitstellen

Im Schritt **Summary** zeigt die GPU-Gruppe Modell und Anzahl an (zum Beispiel `l40s (x1)`). Klicken Sie auf **Create cluster** (oder **Save** für einen bestehenden Cluster).

Warten Sie, bis der Cluster in der Liste der Cluster **Ready** oder **Running** ist.

### 4. Das Kubeconfig des Clusters abrufen

Klicken Sie auf der Detailseite des Clusters auf **Kubeconfig**. Die Konsole lädt `kubeconfig-<cluster-name>.yaml` herunter.

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

### 5. Die GPUs auf den Nodes prüfen

Sobald die Pods des GPU Operator gestartet sind (einige Minuten nach dem Hinzukommen der Nodes):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

**Erwartetes Ergebnis:** Die Nodes der GPU-Gruppe zeigen `1` an (oder die gewählte Anzahl GPUs pro Node), die anderen `<none>`.

### 6. Einen Pod mit GPU bereitstellen

```yaml title="gpu-pod.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
  - name: cuda-test
    image: nvidia/cuda:12.4.1-base-ubuntu22.04
    command: ["nvidia-smi"]
    resources:
      limits:
        nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-pod.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/gpu-test --timeout=300s
kubectl logs gpu-test
```

**Erwartetes Ergebnis:** Die Tabelle von `nvidia-smi` führt die GPU auf (zum Beispiel `NVIDIA L40S`).

### 7. Ein GPU-Modell gezielt ansprechen

Wenn Ihre Gruppen unterschiedliche Modelle verwenden, sprechen Sie sie über das Label an, das der GPU Operator setzt (Erkennung der GPU-Funktionen):

```bash
kubectl get nodes -L nvidia.com/gpu.product
```

```yaml title="inference-deployment.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: model-serving
spec:
  replicas: 2
  selector:
    matchLabels:
      app: model-serving
  template:
    metadata:
      labels:
        app: model-serving
    spec:
      nodeSelector:
        nvidia.com/gpu.product: <value-shown-by-previous-command>
      containers:
      - name: inference
        image: my-model:latest
        resources:
          limits:
            nvidia.com/gpu: 1
```

## Überprüfung

```bash
# Zuweisbare GPUs pro Node
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'

# Bereits vergebene GPUs auf einem Node
kubectl describe node <node-name> | grep -A 8 "Allocated resources"

# Pods des GPU Operator
kubectl get pods -A | grep -i gpu-operator
```

## Weiterführende Informationen

- [Plugin GPU Operator](../../kubernetes/plugins/gpu-operator.md)
- [Node-Gruppen verwalten](../../kubernetes/how-to/manage-node-groups.md)
- [Autoscaling konfigurieren](../../kubernetes/how-to/configure-autoscaling.md)
- [Eine GPU für eine VM bereitstellen](./provision-gpu-vm.md)
