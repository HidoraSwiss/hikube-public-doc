---
sidebar_position: 7
title: GPU Operator
---

# GPU Operator

Das Addon **GPU Operator** installiert den **NVIDIA GPU Operator**, der die GPUs des Clusters automatisch verwaltet: NVIDIA-Treiber, Container-Runtime, `device plugin` und die für den Betrieb der GPUs nötigen Monitoring-Werkzeuge.

## In der Konsole

- **Mit GPU-Nodes**: Sobald eine Node-Gruppe GPUs hat (Abschnitt **GPU** im Schritt **Nodes**), aktiviert die Konsole **GPU Operator** und verhindert das Abwählen („Required when a node group has GPUs“).
- **Ohne GPU-Nodes**: Wählen Sie **GPU Operator** im Schritt **Addons** oder über **Edit** > **Extensions & Addons** aus und klicken Sie dann auf **Save**. Standardmäßig ist es deaktiviert.

Die Detailseite des Clusters zeigt **GPU Operator** im Abschnitt **Extensions** an, wenn es aktiv ist.

Siehe [Eine Node-Gruppe hinzufügen und ändern](../how-to/manage-node-groups.md#5-gpus-hinzufügen) zum Hinzufügen von GPUs.

## Die Konfiguration überschreiben

Sobald das Addon ausgewählt ist, erscheint das Feld **Helm Configuration (YAML) — optional**. Der Wert wird unter dem Schlüssel `gpu-operator` an das Helm-Chart des GPU Operator übergeben.

```yaml title="gpu-operator-override.yaml"
gpu-operator:
  dcgmExporter:
    enabled: true
```

Die verfügbaren Optionen sind in der [Dokumentation des NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/getting-started.html) beschrieben.

:::warning
Treiber und Device Plugin sind von der Plattform für die Hikube-Nodes vorkonfiguriert. Deaktivieren Sie sie nicht per Override: Die GPUs würden den Pods sonst nicht mehr bereitgestellt.
:::

## Nutzung im Cluster

```bash
# Pods des GPU Operator
kubectl get pods -A | grep -i -E "gpu-operator|nvidia"

# Zuweisbare GPUs pro Node
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
```

Beispiel für einen Pod, der eine GPU anfordert:

```yaml title="gpu-test.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-test
spec:
  restartPolicy: Never
  containers:
    - name: cuda
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["nvidia-smi"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

```bash
kubectl apply -f gpu-test.yaml
kubectl logs gpu-test
```

Siehe auch [GPUs in Kubernetes bereitstellen](../../gpu/how-to/provision-gpu-kubernetes.md).

## Best Practices

- Platzieren Sie GPU-Workloads auf einer eigenen Node-Gruppe, mit einem Minimum von 0 Nodes bei gelegentlicher Nutzung.
- Um eine GPU zwischen mehreren Pods zu teilen, aktivieren Sie [HAMi](./hami.md).
