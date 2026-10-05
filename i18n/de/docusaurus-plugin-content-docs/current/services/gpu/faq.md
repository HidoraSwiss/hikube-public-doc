---
sidebar_position: 6
title: FAQ
---

# FAQ — GPU

### Wo befindet sich die GPU-Seite in der Konsole?

Es gibt keine: Die GPU wird im Assistenten der Ressource gewählt, die sie nutzt.

- **VM**: **VM Instances** > **Create an Instance**, Schritt **Configuration**, Abschnitt **Hardware Acceleration (GPU)**; oder **Edit** bei einer bestehenden VM.
- **Kubernetes**: **Kubernetes** > **Create cluster** (oder **Edit**), Schritt **Nodes**, Abschnitt **GPU** einer Node-Gruppe.

---

### Welche GPU-Modelle sind verfügbar?

| Modell | Speicher | Anwendungsfall |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 GB | Inferenz, Rendering, Prototyping |
| **NVIDIA A100 80GB** | 80 GB | ML-Training, wissenschaftliches Rechnen |
| **NVIDIA H100 80GB** | 80 GB | Training und Inferenz großer Modelle |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, rechenintensive Aufgaben |

Die Auswahl zeigt alle Modelle an; diejenigen ohne freie Einheit sind als **Unavailable** markiert.

---

### Warum ist ein Modell als Unavailable markiert?

Alle seine Einheiten sind anderen Workloads zugewiesen. Die Konsole gibt die Anzahl freier Einheiten nicht an. Versuchen Sie es später erneut, wählen Sie ein anderes Modell oder wenden Sie sich bei Kapazitätsbedarf an [sales@hidora.io](mailto:sales@hidora.io).

---

### Kann ich mehrere GPUs in eine VM einbauen?

Ja: Klicken Sie auf eine Karte und verwenden Sie dann **+**, um GPUs desselben Modells hinzuzufügen, oder wählen Sie mehrere Modelle aus. Alle müssen auf demselben physischen Server frei sein; andernfalls schlägt die Bereitstellung mit **The following GPUs are not available: …** fehl.

---

### Was ist der Unterschied zwischen GPU in einer VM und GPU in Kubernetes?

| Aspekt | GPU in VM | GPU in Kubernetes |
|--------|----------|-------------------|
| **Zugriff** | GPU der VM fest zugeordnet | GPU vom Scheduler den Pods zugewiesen |
| **Treiber** | Im Betriebssystem zu installieren (cloud-init oder manuell) | Vom Addon GPU Operator installiert |
| **Teilen** | Nein | Ja, mit dem Addon HAMi |
| **Anwendungsfall** | Workstation, CUDA-Entwicklung | Containerisierte Workloads, Batch, Inferenz |

---

### Welches CPU/GPU-Verhältnis wird empfohlen?

Planen Sie **8 bis 16 vCPU pro GPU** ein, vorzugsweise in der Serie **Universal (U)**:

| Konfiguration | Instanz | vCPU | RAM |
|--------------|----------|------|-----|
| 1 GPU | `u1.2xlarge` | 8 | 32 GB |
| 1 GPU (intensiv) | `u1.4xlarge` | 16 | 64 GB |
| Multi-GPU | `u1.8xlarge` | 32 | 128 GB |

---

### Wie werden die NVIDIA-Treiber installiert?

**In einer VM**: von Ihnen, im Betriebssystem. Folgen Sie [CUDA und die GPU-Treiber installieren](../compute/how-to/install-cuda-drivers.md); dort finden Sie auch ein cloud-init-Skript zum Einfügen in **Cloud-Init script (User Data)**.

**In Kubernetes**: durch das Addon **GPU Operator**, das automatisch aktiviert wird, sobald eine Node-Gruppe GPUs hat.

---

### Was passiert, wenn ich eine VM mit GPU stoppe?

Die GPU wird freigegeben und kann einem anderen Workload zugewiesen werden. Die Konsole weist Sie in der Bestätigung zum Stoppen darauf hin. Ist die GPU beim Start nicht mehr verfügbar, schlägt Ihnen der Dialog **Select an alternative GPU** ein anderes Modell vor.

---

### Kann ich einer bestehenden Kubernetes-Node-Gruppe GPUs hinzufügen?

Nicht einer Gruppe, die ohne GPU erstellt wurde: Fügen Sie eine neue Node-Gruppe mit GPU hinzu. Eine mit GPU erstellte Gruppe kann Modell oder Anzahl ändern, behält aber mindestens eine GPU.

---

### Wie fordere ich in einem Kubernetes-Pod eine GPU an?

```yaml title="pod-gpu.yaml"
apiVersion: v1
kind: Pod
metadata:
  name: gpu-workload
spec:
  containers:
    - name: cuda-app
      image: nvidia/cuda:12.4.1-base-ubuntu22.04
      command: ["sleep", "infinity"]
      resources:
        limits:
          nvidia.com/gpu: 1
```

:::note
Ohne das Addon HAMi kann ein Pod keinen Bruchteil einer GPU anfordern: Der Wert von `nvidia.com/gpu` ist eine ganze Zahl physischer GPUs.
:::

---

### Wie prüfe ich, ob die GPU erkannt wird?

**In einer VM**:

```bash
lspci | grep -i nvidia   # die GPU ist sichtbar
nvidia-smi               # die Treiber sind installiert
```

**In Kubernetes** (mit dem Kubeconfig des Clusters, Schaltfläche **Kubeconfig** auf der Seite des Clusters):

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
kubectl exec -it <pod> -- nvidia-smi
```
