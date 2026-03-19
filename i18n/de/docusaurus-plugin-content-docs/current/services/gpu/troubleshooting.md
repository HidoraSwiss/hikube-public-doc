---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — GPU

### GPU wird in der VM nicht erkannt

**Ursache**: Das Feld `gpus` ist im Manifest nicht konfiguriert, oder der PCI Passthrough hat den GPU nicht korrekt an die VM angehängt.

**Lösung**:

1. Überprüfen Sie, dass das Feld `gpus` in Ihrem Manifest vorhanden ist:
   ```yaml title="vm-gpu.yaml"
   spec:
     gpus:
       - name: "nvidia.com/AD102GL_L40S"
   ```

2. Überprüfen Sie in der VM die PCI-Erkennung:
   ```bash
   lspci | grep -i nvidia
   ```

3. Überprüfen Sie, dass das NVIDIA-Kernelmodul geladen ist:
   ```bash
   lsmod | grep nvidia
   ```

4. Wenn kein Ergebnis erscheint, sind die Treiber nicht installiert. Konsultieren Sie den folgenden Abschnitt.

---

### Fehlende NVIDIA-Treiber

**Ursache**: Die NVIDIA-Treiber sind nicht in der VM installiert, oder die Kernel-Header stimmen nicht mit der Kernelversion überein.

**Lösung**:

1. Installieren Sie die Voraussetzungen und Treiber über cloud-init oder manuell:
   ```bash
   sudo apt-get update
   sudo apt-get install -y linux-headers-$(uname -r)
   sudo apt-get install -y nvidia-driver-550 nvidia-utils-550
   ```

2. Starten Sie die VM nach der Installation neu:
   ```bash
   sudo reboot
   ```

3. Überprüfen Sie die Installation:
   ```bash
   nvidia-smi
   ```

:::tip
Um die Installation zu automatisieren, verwenden Sie das Feld `cloudInit` in Ihrem VM-Manifest, damit die Treiber beim ersten Start installiert werden.
:::

---

### GPU-Pod im Zustand Pending

**Ursache**: Kein Knoten mit verfügbarem GPU, die GPU-Konfiguration des Clusters fehlt, oder der GPU Operator ist nicht aktiv.

**Lösung**:

1. Überprüfen Sie die Pod-Ereignisse:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Suchen Sie nach der Meldung `Insufficient nvidia.com/gpu`.

2. Überprüfen Sie, dass GPU-Knoten existieren und zuweisbare GPUs haben:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.allocatable["nvidia.com/gpu"]}'
   ```

3. Überprüfen Sie die Konfiguration der GPU-NodeGroup im Cluster-Manifest:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       gpu-workers:
         minReplicas: 1
         maxReplicas: 4
         instanceType: "u1.2xlarge"
         gpus:
           - name: "nvidia.com/AD102GL_L40S"
   ```

4. Stellen Sie sicher, dass das GPU Operator-Addon aktiviert ist:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

---

### `nvidia-smi` schlägt in einem Pod fehl

**Ursache**: Der GPU Operator ist auf dem Cluster nicht aktiviert, was die automatische Treiberinstallation und die Bereitstellung des Device Plugins verhindert.

**Lösung**:

1. Aktivieren Sie das GPU Operator-Addon auf dem Cluster:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Wenden Sie die Änderung an:
   ```bash
   kubectl apply -f cluster.yaml
   ```

3. Überprüfen Sie, dass die Pods des GPU Operators laufen:
   ```bash
   kubectl get pods -n gpu-operator
   ```

4. Sobald der GPU Operator betriebsbereit ist, erstellen Sie Ihren GPU-Pod neu.

---

### GPU Operator funktioniert nicht

**Ursache**: Das Addon ist nicht aktiviert, die Operator-Pods befinden sich im Fehlerzustand, oder die Knoten haben keine physische GPU-Hardware.

**Lösung**:

1. Überprüfen Sie, dass das Addon im Cluster-Manifest aktiviert ist:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       gpuOperator:
         enabled: true
   ```

2. Überprüfen Sie den Zustand der GPU Operator-Pods:
   ```bash
   kubectl get pods -n gpu-operator
   kubectl describe pod -n gpu-operator <pod-name>
   ```

3. Überprüfen Sie, dass die Knoten tatsächlich GPU-Hardware besitzen:
   ```bash
   kubectl get nodes -o json | jq '.items[] | {name: .metadata.name, gpu: .status.capacity["nvidia.com/gpu"]}'
   ```

4. Wenn die Pods in `CrashLoopBackOff` sind, konsultieren Sie die Logs:
   ```bash
   kubectl logs -n gpu-operator <pod-name>
   ```
