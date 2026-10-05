---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — GPU

### Der GPU-Abschnitt erscheint nicht im Assistenten

**Ursache**: Der Abschnitt **Hardware Acceleration (GPU)** (VM) oder **GPU** (Kubernetes-Node-Gruppe) wird nur angezeigt, wenn die Plattform mindestens ein Modell anbietet.

**Lösung**: Laden Sie die Seite neu. Fehlt der Abschnitt weiterhin, wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Alle Modelle sind Unavailable

**Ursache**: Zum Zeitpunkt der Erstellung gibt es für diese Modelle keine freie Einheit.

**Lösung**: Versuchen Sie es später erneut oder wenden Sie sich bei Kapazitätsbedarf an [sales@hidora.io](mailto:sales@hidora.io).

---

### „The following GPUs are not available: …“ bei der Erstellung oder beim Speichern

**Ursache**: Die angeforderten GPUs sind nicht gemeinsam auf demselben physischen Server frei oder wurden zwischen dem Öffnen des Assistenten und der Bereitstellung vergeben. Eine VM läuft, wie ein Kubernetes-Node, auf einem einzigen Server.

**Lösung**:

1. Verringern Sie die Anzahl der GPUs pro VM oder pro Node.
2. Vermeiden Sie es, mehrere Modelle in derselben VM zu kombinieren.
3. Wählen Sie ein anderes verfügbares Modell.

---

### Die VM mit GPU startet nicht neu

**Ursache**: Das Stoppen hat die GPU freigegeben, die einem anderen Workload zugewiesen wurde. Die Konsole zeigt **These GPUs are no longer available, they may have been claimed by another workload: …** an.

**Lösung**:

1. Wählen Sie im Dialog **Select an alternative GPU** ein Modell unter **Available GPU**.
2. Klicken Sie auf **Update and Start**: Die Konfiguration der VM wird aktualisiert, dann startet die VM.
3. Zeigt der Dialog **No GPUs are currently available.** an, versuchen Sie es später erneut.

---

### GPU in der VM nicht erkannt

**Ursache**: Die GPU ist nicht an die VM angebunden oder die VM wurde nach dem Hinzufügen nicht neu gestartet.

**Lösung**:

1. Prüfen Sie auf der Detailseite, ob die GPU unter **GPUs** aufgeführt ist (Abschnitt **Resources & Characteristics**). Andernfalls fügen Sie sie über **Edit** > **Resources (CPU / RAM)** hinzu und klicken dann auf **Save**.
2. Warten Sie nach dem Hinzufügen, bis die VM wieder den Status **Running** hat.
3. In der VM:
   ```bash
   lspci | grep -i nvidia
   ```
4. Wenn die GPU in `lspci` erscheint, aber nicht in `nvidia-smi`, fehlen die Treiber: siehe nächsten Abschnitt.

---

### Fehlende NVIDIA-Treiber in der VM

**Ursache**: Die Hikube-Images enthalten keine NVIDIA-Treiber, oder die Kernel-Header passen nicht zur Kernel-Version.

**Lösung**:

1. Installieren Sie die Treiber gemäß [CUDA und die GPU-Treiber installieren](../compute/how-to/install-cuda-drivers.md). Prüfen Sie unter Ubuntu, ob die Kernel-Header vorhanden sind:
   ```bash
   sudo apt-get install -y linux-headers-$(uname -r)
   ```
2. Starten Sie die VM neu (`sudo reboot` oder **Restart** in der Konsole).
3. Prüfen Sie:
   ```bash
   nvidia-smi
   ```

---

### GPU-Pod im Zustand Pending

**Ursache**: Kein Node des Clusters hat eine freie GPU, die GPU-Gruppe hat 0 Nodes oder der GPU Operator ist nicht bereit.

**Lösung**:

1. Sehen Sie sich die Ereignisse des Pods an:
   ```bash
   kubectl describe pod <pod>
   ```
   Die Meldung `Insufficient nvidia.com/gpu` zeigt an, dass kein Node eine freie GPU hat.
2. Prüfen Sie die zuweisbaren GPUs:
   ```bash
   kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
   ```
3. Öffnen Sie in der Konsole den Cluster und prüfen Sie die GPU-Node-Gruppe (**Node Pools**): Anzahl aktiver Nodes, GPU-Modell. Erhöhen Sie **Maximum nodes** über **Edit**, wenn alle GPUs belegt sind.
4. Prüfen Sie, ob das Addon **GPU Operator** aktiv ist (das ist automatisch der Fall, sobald eine Gruppe GPUs hat).

---

### `nvidia-smi` schlägt in einem Pod fehl

**Ursache**: Die Komponenten des GPU Operator sind auf dem Node noch nicht bereit, oder der Pod fordert keine GPU an.

**Lösung**:

1. Prüfen Sie, ob der Pod `nvidia.com/gpu` in `resources.limits` deklariert.
2. Prüfen Sie den Zustand der Pods des GPU Operator:
   ```bash
   kubectl get pods -A | grep -i gpu-operator
   ```
3. Wenn Pods im Zustand `CrashLoopBackOff` sind, sehen Sie sich ihre Logs an:
   ```bash
   kubectl logs -n <namespace> <pod>
   ```
4. Sobald der Operator bereit ist, erstellen Sie Ihren Pod neu. Besteht das Problem weiterhin, wenden Sie sich an den [Support](mailto:support@hidora.io).

---

### Einer bestehenden Node-Gruppe kann keine GPU hinzugefügt werden

**Ursache**: Eine ohne GPU erstellte Gruppe kann keine erhalten (**GPUs cannot be added to an existing node group: add a new node group for GPUs**). Umgekehrt muss eine GPU-Gruppe mindestens eine GPU behalten.

**Lösung**: Klicken Sie unter **Edit** > **Node groups** auf **Add node group** und konfigurieren Sie die GPU in dieser neuen Gruppe.
