---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Eine VM mit GPU erstellen

Diese Anleitung erstellt in der [Hikube-Konsole](https://console.hikube.cloud) eine Ubuntu-VM mit einer NVIDIA-GPU und prüft anschließend, ob die GPU nutzbar ist. Für GPUs in einem Kubernetes-Cluster siehe [Eine GPU auf Kubernetes bereitstellen](./how-to/provision-gpu-kubernetes.md).

---

## Voraussetzungen

- Ein Hikube-Konto und ein **Projekt** (siehe [Hikube-Schnellstart](../../getting-started/quick-start.md)).
- Verfügbare Quotas: mindestens 8 vCPU, 32 GB Arbeitsspeicher und 50 GB Speicher.
- Ein öffentlicher SSH-Schlüssel (`cat ~/.ssh/id_ed25519.pub`).

---

## Schritt 1: Den Erstellungsassistenten öffnen

1. Öffnen Sie im Seitenmenü **Infrastructure** > **VM Instances**.
2. Klicken Sie auf **Create an Instance**.
3. Schritt **General**: Geben Sie den **Instance name** ein, zum Beispiel `vm-gpu01`, und klicken Sie dann auf **Next**.

---

## Schritt 2: Konfigurieren und bestätigen

### Configuration: Instanztyp und GPU

1. Wählen Sie unter **Resources (CPU / RAM)** **Universal (U)** > **2XLarge** (8 vCPU, 32 GB).
2. Klicken Sie unter **Hardware Acceleration (GPU)** auf die Karte **NVIDIA L40S** (oder ein anderes verfügbares Modell). Das Badge **1 GPU total** erscheint. Mit den Schaltflächen **+** und **−** der Karte passen Sie die Anzahl der GPUs an.
3. Klicken Sie auf **Next**.

Als **Unavailable** markierte Modelle können derzeit nicht ausgewählt werden.

### Storage

1. Wählen Sie unter **Operating System** **ubuntu** in der Version **24.04**.
2. Setzen Sie **Size (GB)** auf `50`: Die Treiber, CUDA und die ML-Frameworks belegen mehrere Dutzend GB.
3. Klicken Sie auf **Next**.

### Network

1. Lassen Sie **Public IPv4 Address** aktiviert und **SSH (22)** unter **Allowed Ports** angehakt.
2. Fügen Sie Ihren Schlüssel unter **Authorized SSH keys** hinzu.
3. Optional: Aktivieren Sie **Cloud-Init script (User Data)**, um die Treiber automatisch zu installieren (Skript in [CUDA installieren](../compute/how-to/install-cuda-drivers.md)).
4. Klicken Sie auf **Next**.

### Summary

Die **Summary** zeigt eine Zeile **Hardware Acceleration (GPU)** mit Modell und Anzahl an. Prüfen Sie die geschätzten Kosten und klicken Sie dann auf **Create instance**.

---

## Schritt 3: Den Zustand prüfen

Warten Sie in der Liste **VM Instances** auf den Status **Running**. Auf der Detailseite führt der Abschnitt **Resources & Characteristics** die GPU unter **GPUs** auf.

**Erwartetes Ergebnis:** Status **Running** und ein Badge pro GPU unter **GPUs** in **Resources & Characteristics**. Das Badge trägt den technischen Namen des Modells (zum Beispiel `l40s` für eine NVIDIA L40S).

---

## Schritt 4: Die Verbindungsinformationen abrufen

Kopieren Sie den Befehl aus dem Block **SSH Connection** (Abschnitt **Network & Security** der Detailseite), zum Beispiel `ssh ubuntu@203.0.113.20`.

---

## Schritt 5: Verbindung und Tests

```bash
ssh -i ~/.ssh/id_ed25519 ubuntu@203.0.113.20

# Die GPU ist auf dem PCI-Bus sichtbar
lspci | grep -i nvidia
```

**Erwartetes Ergebnis:**

```
06:00.0 3D controller: NVIDIA Corporation ...
```

Installieren Sie anschließend die NVIDIA-Treiber und CUDA gemäß [CUDA und die GPU-Treiber installieren](../compute/how-to/install-cuda-drivers.md) und führen Sie dann aus:

```bash
nvidia-smi
```

**Erwartetes Ergebnis:** Die Tabelle von `nvidia-smi` führt die GPU (zum Beispiel `NVIDIA L40S`) mit ihrem Speicher auf.

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Maßnahme |
|----------|--------|
| Der Abschnitt **Hardware Acceleration (GPU)** erscheint nicht | Die Plattform bietet derzeit keine GPU an: Wenden Sie sich an den [Support](mailto:support@hidora.io). |
| Alle Karten sind **Unavailable** | Keine freie GPU: Versuchen Sie es später erneut oder wenden Sie sich an den Support. |
| **The following GPUs are not available: …** bei der Bereitstellung | Die angeforderten GPUs sind nicht gemeinsam auf demselben Server frei: Verringern Sie die Anzahl der GPUs oder wechseln Sie das Modell. |
| `lspci` zeigt keine NVIDIA-GPU | Prüfen Sie auf der Detailseite, ob die GPU aufgeführt ist; andernfalls fügen Sie sie über **Edit** hinzu. |
| `nvidia-smi: command not found` | Die Treiber sind nicht installiert: siehe [CUDA installieren](../compute/how-to/install-cuda-drivers.md). |

Weitere Fälle finden Sie in der [GPU-Fehlerbehebung](./troubleshooting.md).

---

## Schritt 7: Aufräumen

1. Klicken Sie auf der Detailseite der VM auf **Delete**.
2. Geben Sie den Namen der VM ein und klicken Sie auf **Permanently delete**.
3. Die System-Disk bleibt im Menü **Disks**: Löschen Sie sie dort, wenn Sie sie nicht mehr benötigen.

:::tip Stoppen statt löschen?
**Stop** gibt die GPU der VM frei, die dann einem anderen Workload zugewiesen werden kann: Beim Neustart müssen Sie eventuell ein anderes Modell wählen. Löschen Sie die VM, wenn Sie sie nicht mehr benötigen, und stoppen Sie sie, wenn Sie sie wieder starten möchten.
:::

---

## Nächste Schritte

- [Eine GPU auf Kubernetes bereitstellen](./how-to/provision-gpu-kubernetes.md)
- [GPU-Konzepte](./concepts.md)
- [FAQ](./faq.md)

<NavigationFooter
  nextSteps={[
    {label: "Praktische Anleitungen", href: "../how-to/provision-gpu-vm"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Rechenressourcen", href: "../../compute/"},
  ]}
/>
