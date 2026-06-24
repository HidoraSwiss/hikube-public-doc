---
sidebar_position: 3
title: API-Referenz
---

## API-Referenz – Virtuelle Maschinen

Diese Referenz beschreibt umfassend die **VMInstance**- und **VMDisk**-APIs von Hikube: verfügbare Parameter, Standardwerte, Verwendungsbeispiele und empfohlene Best Practices.

Die unten dokumentierten Felder entsprechen dem tatsächlich von der Plattform exponierten Schema (`apps.cozystack.io/v1alpha1`).

---

## VMInstance

### Übersicht

Die `VMInstance`-API ermöglicht das Erstellen, Konfigurieren und Verwalten von virtuellen Maschinen in Hikube. Eine VM stützt sich auf eine oder mehrere Festplatten, die separat über die Ressource [`VMDisk`](#vmdisk) beschrieben werden.

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Detaillierte Konfiguration unten
```

:::warning Korrektes Kind
Die Ressource heißt **`VMInstance`** (und nicht `VirtualMachine`). Die Festplatte ist **kein** integriertes Feld `systemDisk`: Sie müssen eine separate Ressource `VMDisk` erstellen und sie in `disks` referenzieren.
:::

---

### Vollständige Spezifikation

| Parameter         | Typ              | Beschreibung                                                                | Standard     | Erforderlich |
| ----------------- | ---------------- | --------------------------------------------------------------------------- | ------------ | ------------ |
| `external`        | `boolean`        | Aktiviert die Netzwerk-Exposition von außerhalb des Clusters                | `false`      | nein         |
| `externalMethod`  | `string`         | Expositionsmethode: `PortList` oder `WholeIP`                               | `PortList`   | nein         |
| `externalPorts`   | `[]integer`      | Von außen weiterzuleitende Ports (verwendet mit `PortList`)                 | `[22]`       | nein         |
| `runStrategy`     | `string`         | Gewünschter Ausführungszustand (siehe [runStrategy](#runstrategy))          | `Always`     | nein         |
| `instanceType`    | `string`         | CPU-/Speicher-Vorlage (siehe [Instanztypen](#instanztypen))                 | `u1.medium`  | nein         |
| `instanceProfile` | `string`         | OS-Profil / Präferenzen (Treiber, Kernel) — siehe [Profile](#os-profile)    | `ubuntu`     | nein         |
| `disks`           | `[]object`       | Liste der anzuhängenden `VMDisk` (siehe [disks](#festplatten))              | `[]`         | nein         |
| `subnets`         | `[]object`       | Zusätzliche Subnetze (VPC) — siehe [subnets](#subnetze)                     | `[]`         | nein         |
| `gpus`            | `[]object`       | Im Passthrough anzuhängende GPUs (siehe [gpus](#gpu))                        | `[]`         | nein         |
| `resources`       | `object`         | Explizite Überschreibung von CPU / Speicher / Sockets (siehe [resources](#ressourcen)) | `{}` | nein   |
| `cpuModel`        | `string`         | Der VM exponiertes CPU-Modell (z.B.: `host-passthrough`)                    | `""`         | nein         |
| `sshKeys`         | `[]string`       | Injizierte öffentliche SSH-Schlüssel                                        | `[]`         | nein         |
| `cloudInit`       | `string`         | Cloud-init-Konfiguration (user-data YAML)                                   | `""`         | nein         |
| `cloudInitSeed`   | `string`         | Seed zur Generierung einer stabilen SMBIOS-UUID                             | `""`         | nein         |

:::note
Alle Felder sind optional: Eine minimale VM benötigt nur eine in `disks` referenzierte bootfähige Festplatte. Die obigen Standardwerte sind diejenigen, die von der Plattform angewendet werden.
:::

---

### runStrategy

`runStrategy` steuert den Ausführungszustand der VM. Es ersetzt das frühere boolesche Feld `running`.

| Wert              | Verhalten                                                               |
| ----------------- | ----------------------------------------------------------------------- |
| `Always`          | Die VM wird gestartet gehalten (startet automatisch neu, wenn sie stoppt) |
| `Halted`          | Die VM ist gestoppt                                                     |
| `Manual`          | Der Zustand wird manuell gesteuert (`virtctl start` / `stop`)           |
| `RerunOnFailure`  | Startet nur nach einem Fehlschlag neu                                   |
| `Once`            | Startet ein einziges Mal, ohne automatischen Neustart                   |

```yaml
spec:
  runStrategy: Always
```

Um eine bestehende VM zu stoppen/neu zu starten:

```bash
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

---

### Netzwerkkonfiguration

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
```

Siehe [Netzwerk-Expositionsmethoden](#netzwerk-expositionsmethoden).

---

### Instanztypen

`instanceType` referenziert einen `VirtualMachineClusterInstancetype`. Hikube exponiert mehrere Serien, jeweils mit den Größen `nano` → `8xlarge`:

| Serie | Verwendung                                                            |
| ----- | --------------------------------------------------------------------- |
| `s1`  | **Standard** — geteilte/burstable CPUs, vCPU:RAM-Verhältnis 1:2       |
| `u1`  | **Universal** — allgemeine Verwendung, Verhältnis 1:4 (Standard)      |
| `m1`  | **Memory optimized** — Verhältnis 1:8                                 |

```yaml
# Beispiele der Universal-Serie (Verhältnis 1:4)
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

```yaml
# Standard-Serie (Verhältnis 1:2)
instanceType: s1.small     # 1 vCPU, 2 GB RAM
instanceType: s1.medium    # 2 vCPU, 4 GB RAM
instanceType: s1.large     # 4 vCPU, 8 GB RAM
instanceType: s1.xlarge    # 8 vCPU, 16 GB RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 GB RAM
```

```yaml
# Memory-optimized-Serie (Verhältnis 1:8)
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

:::tip GPU und `instanceType`
Um eine GPU anzuhängen, wählen Sie eine universelle Serie (`u1`, `s1`…) und deklarieren Sie die GPU über das Feld [`gpus`](#gpu). Der NVIDIA-Treiber erfordert **mindestens 4 GiB RAM**.
:::

---

### OS-Profile

`instanceProfile` lädt die **KubeVirt-Präferenzen** (Treiber, Maschinenmodell, Kernel), die an das OS angepasst sind. Es definiert **nicht** das Image — dieses wird vom `VMDisk` getragen. Es ist vor allem für Windows ausschlaggebend (virtio-Treiber).

Verfügbare Werte (Auszug):

| Familie     | Profile                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| Ubuntu      | `ubuntu`                                                                                 |
| RHEL        | `rhel.7`, `rhel.8`, `rhel.9`, `rhel.10` (+ Varianten `.desktop`, `.arm64`, `.dpdk`, `.realtime`) |
| CentOS      | `centos.7`, `centos.stream8`, `centos.stream9`, `centos.stream10` (+ `.desktop`, `.dpdk`) |
| Fedora      | `fedora`, `fedora.arm64`                                                                  |
| openSUSE    | `opensuse.leap`, `opensuse.tumbleweed`                                                    |
| SLES        | `sles`                                                                                    |
| Andere      | `alpine`, `cirros`                                                                        |
| Windows     | `windows.2k22.virtio`, `windows.2k25.virtio`, `windows.10.virtio`, `windows.11.virtio` (`.virtio`-Varianten **empfohlen**); Varianten ohne virtio ebenfalls verfügbar (`windows.2k22`…) |

:::note
Es existiert **kein** dediziertes Profil `debian` noch `rocky`/`almalinux`. Verwenden Sie für diese Distributionen `ubuntu` (Debian-Basis) oder lassen Sie `instanceProfile: ""`. Verwenden Sie für Windows immer eine `.virtio`-Variante (z.B.: `windows.2k25.virtio`), um die virtio-Treiber zu laden.
:::

---

### Festplatten

`disks` ist eine **Liste von Objekten**, die [`VMDisk`](#vmdisk)-Ressourcen über ihren Namen referenzieren. Die erste aufgelistete Festplatte ist in der Regel die bootfähige Festplatte.

| Feld            | Typ      | Beschreibung                                         |
| --------------- | -------- | ---------------------------------------------------- |
| `disks[].name`  | `string` | Name des anzuhängenden `VMDisk`                      |
| `disks[].bus`   | `string` | Bus-Typ (`virtio`, `sata`, `scsi`) — optional        |

```yaml
spec:
  disks:
    - name: vm-system-disk
    - name: vm-data-disk
      bus: scsi
```

:::warning
Die VM berücksichtigt eine neue Festplatte erst, wenn sie neu gestartet wird (`virtctl restart` oder Umschalten von `runStrategy`).
:::

---

### GPU

`gpus` hängt eine oder mehrere NVIDIA-GPUs im PCI-Passthrough an.

| Feld           | Typ      | Beschreibung                               |
| -------------- | -------- | ------------------------------------------ |
| `gpus[].name`  | `string` | Name der GPU-Ressource (`nvidia.com/...`)  |

```yaml
spec:
  instanceType: u1.2xlarge
  gpus:
    - name: nvidia.com/AD102GL_L40S
```

Die auf Hikube verfügbaren Modelle sind in der [GPU-API-Referenz](../gpu/api-reference.md) ausführlich beschrieben. Eine GPU wird einer VM **exklusiv** zugewiesen.

---

### Subnetze

`subnets` bindet die VM an zusätzliche Subnetze eines VPC an.

| Feld              | Typ      | Beschreibung          |
| ----------------- | -------- | --------------------- |
| `subnets[].name`  | `string` | Name des Subnetzes    |

```yaml
spec:
  subnets:
    - name: subnet-ab2c3e47
```

---

### Ressourcen

Standardmäßig wird die CPU-/Speicher-Dimensionierung von `instanceType` getragen. Der Block `resources` ermöglicht es, diese Werte explizit zu **überschreiben** (und eine Socket-Topologie zu definieren).

| Feld                 | Typ             | Beschreibung                         |
| -------------------- | --------------- | ------------------------------------ |
| `resources.cpu`      | `int`/`string`  | Anzahl der zugewiesenen CPU-Kerne    |
| `resources.memory`   | `int`/`string`  | Menge des zugewiesenen Speichers     |
| `resources.sockets`  | `int`/`string`  | Anzahl der CPU-Sockets (Topologie)   |

```yaml
spec:
  resources:
    cpu: "4"
    memory: 8Gi
    sockets: "2"
```

---

### SSH-Konfiguration

```yaml
spec:
  sshKeys:
    - ssh-rsa AAAA... user@host
    - ssh-ed25519 AAAA... user2@host
```

---

### Cloud-init

```yaml
spec:
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - ssh-rsa AAAA...
    packages:
      - htop
      - docker.io
  # Optionaler Seed zum Festlegen der SMBIOS-UUID (Lizenzen, Maschinenidentität)
  cloudInitSeed: ""
```

---

### Vollständiges VMInstance-Beispiel

```yaml title="production-vm.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-example
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
  runStrategy: Always
  instanceType: u1.2xlarge
  instanceProfile: ubuntu
  disks:
    - name: vm-system-disk
  sshKeys:
    - ssh-rsa AAAA...
```

---

## VMDisk

### Übersicht

Die `VMDisk`-API verwaltet die an VMs angehängten virtuellen Festplatten. Sie unterstützt mehrere Image-Quellen: **HTTP**, vorgeladenes **Golden Image** oder leere Festplatte.

```yaml title="disk-example.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    image:
      name: ubuntu-2404
  optical: false
  storage: 30Gi
  storageClass: replicated
```

### Hauptparameter

| Parameter      | Typ             | Beschreibung                                 | Standard     | Erforderlich |
| -------------- | --------------- | -------------------------------------------- | ------------ | ------------ |
| `storage`      | `int`/`string`  | Festplattengröße                             | `5Gi`        | ✅           |
| `storageClass` | `string`        | Speicherklasse                               | `replicated` | ✅           |
| `source`       | `object`        | Quelle des Festplatten-Images (siehe unten)  | `{}`         | nein         |
| `optical`      | `boolean`       | Optische Festplatte / ISO (Installer)        | `false`      | nein         |

---

## Image-Quellen

### HTTP-/HTTPS-Quelle

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

### Golden Images (vorgeladene Hikube-Images)

Die **Golden Images** sind Systemimages, die in Hikube gepflegt und vorgeladen werden, für eine schnelle Bereitstellung ohne externe Abhängigkeit.

```yaml
spec:
  source:
    image:
      name: ubuntu-2404
```

#### Verfügbare Images

| Name | Betriebssystem | Typ | Min. Speicher |
| --- | ---------------------- | ---- | :-----------: |
| `almalinux-8` | AlmaLinux 8 | Cloud | 11 Gi |
| `almalinux-9` | AlmaLinux 9 | Cloud | 11 Gi |
| `almalinux-10` | AlmaLinux 10 | Cloud | 11 Gi |
| `rocky-8` | Rocky Linux 8 | Cloud | 11 Gi |
| `rocky-9` | Rocky Linux 9 | Cloud | 11 Gi |
| `rocky-10` | Rocky Linux 10 | Cloud | 11 Gi |
| `debian-11` | Debian 11 (Bullseye) | Cloud | 4 Gi |
| `debian-12` | Debian 12 (Bookworm) | Cloud | 4 Gi |
| `debian-13` | Debian 13 (Trixie) | Cloud | 4 Gi |
| `ubuntu-2204` | Ubuntu 22.04 LTS (Jammy) | Cloud | 4 Gi |
| `ubuntu-2404` | Ubuntu 24.04 LTS (Noble) | Cloud | 4 Gi |
| `centos-stream-9` | CentOS Stream 9 | Cloud | 11 Gi |
| `centos-stream-10` | CentOS Stream 10 | Cloud | 11 Gi |
| `oracle-8` | Oracle Linux 8 | Cloud | 40 Gi |
| `oracle-9` | Oracle Linux 9 | Cloud | 40 Gi |
| `oracle-10` | Oracle Linux 10 | Cloud | 40 Gi |
| `opensuse-156` | openSUSE Leap 15.6 | Cloud | 1 Gi |
| `opensuse-160` | openSUSE Leap 16.0 | Cloud | 2 Gi |
| `cloudlinux-8` | CloudLinux 8 | Cloud | 8 Gi |
| `cloudlinux-9` | CloudLinux 9 | Cloud | 9 Gi |
| `windows-server-2022` | Windows Server 2022 | ISO | 28 Gi |
| `windows-server-2025` | Windows Server 2025 | ISO | 28 Gi |
| `proxmox-8` | Proxmox VE 8 | ISO | 2 Gi |
| `proxmox-9` | Proxmox VE 9 | ISO | 2 Gi |
| `talos-112` | Talos Linux 1.12 | Cloud | 8 Gi |

:::warning ISO-Images
Images vom Typ **ISO** (Windows, Proxmox) sind Installer und keine sofort einsatzbereiten Cloud-Images. Planen Sie eine Erstinstallation über die VNC-Konsole ein. Für Windows siehe die Anleitung [Eine Windows-VM installieren](how-to/install-windows-vm.md).
:::

### Leere Festplatte

```yaml
spec:
  source: {}
```

Eine leere Festplatte ist nützlich für zusätzliche Datenvolumes.

---

### VMDisk-Beispiel via Golden Image

```yaml title="ubuntu-golden-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-system
spec:
  source:
    image:
      name: ubuntu-2404
  optical: false
  storage: 20Gi
  storageClass: replicated
```

---

## Speicherklassen

Hikube exponiert mehrere `storageClass` auf Basis von LINSTOR. Für eine VM wird `replicated` empfohlen.

| Klasse                                 | Replikation | Verschlüsselung | Hinweise                                         |
| -------------------------------------- | :---------: | :-------------: | ------------------------------------------------ |
| `local`                                | ❌          | ❌              | Knotenlokaler Speicher (Standard), nicht resilient |
| `local-encrypted`                      | ❌          | ✅ (LUKS)       | Lokal + verschlüsselt                            |
| `replicated`                           | ✅          | ❌              | Synchron repliziert — **empfohlen** für VMs      |
| `replicated-encrypted`                 | ✅          | ✅ (LUKS)       | Repliziert + verschlüsselt                       |
| `replicated-async`                     | ✅ (async)  | ❌              | Asynchrone Replikation                           |
| `replicated-async-encrypted`           | ✅ (async)  | ✅ (LUKS)       | Asynchrone Replikation + verschlüsselt           |
| `replicated-async-windows`             | ✅ (async)  | ❌              | An Windows-Festplatten angepasste Variante       |
| `replicated-async-windows-encrypted`   | ✅ (async)  | ✅ (LUKS)       | Windows-Variante + verschlüsselt                 |

:::note
Die `-windows`-Varianten sind für die Festplatten von Windows-VMs optimiert. Die Verschlüsselung (`-encrypted`) stützt sich auf LUKS auf Volume-Ebene.
:::

---

## Netzwerk-Expositionsmethoden

### PortList

* Automatische Firewall
* Nur die in `externalPorts` aufgelisteten Ports sind erreichbar
* **Empfohlen für die Produktion**

### WholeIP

* Eine dedizierte öffentliche IP, alle Ports exponiert
* Keine Netzwerkfilterung seitens der Plattform
* Nur für Entwicklung oder kontrollierte Gateways vorbehalten

:::warning Sicherheit
Mit `WholeIP` ist die VM vollständig im Internet exponiert. Eine OS-Firewall ist unerlässlich.
:::

---

## Best Practices

### Sicherheit

* Authentifizierung ausschließlich über SSH-Schlüssel
* Aktive OS-Firewall, `PortList` statt `WholeIP`

### Speicher

* `replicated` (oder verschlüsselte/Windows-Varianten) in der Produktion
* System- und Datenfestplatten trennen

### Leistung

* `instanceType` an den Workload anpassen oder über `resources` überschreiben
* Für GPUs ≥ 4 GiB RAM und ein angepasstes CPU/RAM-Verhältnis vorsehen

:::tip Empfohlene Architektur
Verwenden Sie in der Produktion mindestens **2 Festplatten** (System + Daten) mit repliziertem Speicher.
:::
