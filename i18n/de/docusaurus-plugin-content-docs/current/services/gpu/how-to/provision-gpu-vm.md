---
title: "Eine GPU für eine VM bereitstellen"
---

# Eine GPU für eine VM bereitstellen

Mit Hikube können Sie eine oder mehrere NVIDIA-GPUs an eine virtuelle Maschine anbinden, bei der Erstellung oder nachträglich. Diese Anleitung erklärt, wie Sie die GPU wählen, sie in der Konsole hinzufügen und prüfen, ob sie nutzbar ist.

## Voraussetzungen

- Ein Hikube-Konto und ein Projekt mit ausreichenden Quotas (8 vCPU und 32 GB Arbeitsspeicher pro GPU empfohlen)
- Ein öffentlicher SSH-Schlüssel
- Vertrautheit mit den [virtuellen Maschinen](../../compute/overview.md) von Hikube

## Schritte

### 1. Das GPU-Modell wählen

| Modell | Speicher | Anwendungsfall |
|--------|---------|-------------|
| **NVIDIA L40S** | 48 GB | Inferenz, Entwicklung, Prototyping |
| **NVIDIA A100 80GB** | 80 GB | ML-Training, Fine-Tuning |
| **NVIDIA H100 80GB** | 80 GB | Training und Inferenz großer Modelle |
| **NVIDIA RTX 6000 Pro** | 96 GB | LLM, rechenintensive Aufgaben |

:::tip Welche GPU wählen?
Beginnen Sie mit einer **L40S** für Entwicklung und Prototyping. Wechseln Sie für das Training zu einer **A100** oder **H100** und reservieren Sie die **RTX 6000 Pro** für die Modelle mit dem größten Speicherbedarf.
:::

### 2. Die GPU bei der Erstellung der VM hinzufügen

1. Öffnen Sie **Infrastructure** > **VM Instances** > **Create an Instance**.
2. Schritt **Configuration**:
   - Wählen Sie unter **Resources (CPU / RAM)** einen passenden Instanztyp, zum Beispiel **Universal (U)** > **2XLarge** (8 vCPU, 32 GB) für eine GPU;
   - Klicken Sie unter **Hardware Acceleration (GPU)** auf die Karte des gewünschten Modells. Verwenden Sie **+**, um weitere GPUs desselben Modells hinzuzufügen, oder klicken Sie auf eine andere Karte, um Modelle zu kombinieren.
3. Schritt **Storage**: Wählen Sie das Image (zum Beispiel **ubuntu** 24.04) und mindestens **50 GB**.
4. Schritt **Network**: Fügen Sie Ihren SSH-Schlüssel und die benötigten Ports hinzu (zum Beispiel `8888` für Jupyter, über **Custom port...**).
5. Schritt **Summary**: Prüfen Sie die Zeile **Hardware Acceleration (GPU)** und die geschätzten Kosten und klicken Sie dann auf **Create instance**.

:::warning Mehrere GPUs in einer VM
Alle GPUs einer VM müssen auf demselben physischen Server frei sein. Ist das nicht der Fall, schlägt die Bereitstellung mit **The following GPUs are not available: …** fehl. Verringern Sie dann die Anzahl der GPUs oder wählen Sie ein anderes Modell. Dimensionieren Sie den Instanztyp entsprechend: Ein `u1.8xlarge` (32 vCPU, 128 GB) eignet sich für 4 GPUs.
:::

### 3. Bei einer bestehenden VM eine GPU hinzufügen oder wechseln

1. Öffnen Sie die Detailseite der VM und klicken Sie auf **Edit**.
2. Passen Sie unter **Resources (CPU / RAM)** die Auswahl **Hardware Acceleration (GPU)** an (Hinzufügen, Entfernen, Modellwechsel). Passen Sie bei Bedarf den Instanztyp an.
3. Klicken Sie auf **Save**. Die Konsole zeigt **Restart required** an: Die VM wird mit der neuen Konfiguration neu gestartet.

### 4. Die Treiber installieren

Die Hikube-Images enthalten keine NVIDIA-Treiber. Folgen Sie [CUDA und die GPU-Treiber installieren](../../compute/how-to/install-cuda-drivers.md) oder fügen Sie das cloud-init-Skript dieser Anleitung bei der Erstellung in **Cloud-Init script (User Data)** ein.

## Überprüfung

1. **In der Konsole**: Die Detailseite zeigt den Status **Running** und die GPU unter **GPUs** (Abschnitt **Resources & Characteristics**) unter ihrem technischen Namen an: `l40s`, `a100-80gb`, `h100-80gb` oder `rtx-6000-pro`.
2. **In der VM**:

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@<public-ip>
lspci | grep -i nvidia
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv
```

**Erwartetes Ergebnis** (nach Installation der Treiber):

```
name, memory.total [MiB], driver_version
NVIDIA L40S, 46068 MiB, 560.xx.xx
```

:::note Stoppen einer VM mit GPU
**Stop** gibt die GPUs der VM frei. Wurde eine GPU beim nächsten Start einem anderen Workload zugewiesen, öffnet die Konsole **Select an alternative GPU**: Wählen Sie ein Modell unter **Available GPU** und dann **Update and Start**.
:::

## Weiterführende Informationen

- [Eine GPU auf Kubernetes bereitstellen](./provision-gpu-kubernetes.md)
- [CUDA und die GPU-Treiber installieren](../../compute/how-to/install-cuda-drivers.md)
- [GPU-Fehlerbehebung](../troubleshooting.md)
