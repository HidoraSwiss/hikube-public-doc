---
sidebar_position: 3
title: Riferimento API
---

## Riferimento API – Macchine Virtuali

Questo riferimento descrive in modo esaustivo le API **VMInstance** e **VMDisk** di Hikube: parametri disponibili, esempi di utilizzo e buone pratiche raccomandate.

---

## VMInstance

### Panoramica

L'API `VMInstance` permette di creare, configurare e gestire macchine virtuali in Hikube.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Configurazione dettagliata qui sotto
```

---

### Specifica completa

#### Parametri generali

| Parametro         | Tipo       | Descrizione                                  | Default    | Richiesto |
| ----------------- | ---------- | -------------------------------------------- | ---------- | ------ |
| `external`        | `boolean`  | Attiva l'esposizione di rete esterna della VM  | `false`    | ✅      |
| `externalMethod`  | `string`   | Metodo di esposizione (`PortList`, `WholeIP`) | `PortList` | ✅      |
| `externalPorts`   | `[]int`    | Porte esposte verso l'esterno               | `[]`       | ✅      |
| `running`         | `boolean`  | Stato desiderato della VM                       | `true`     | ✅      |
| `instanceType`    | `string`   | Modello CPU / memoria                        | –          | ✅      |
| `instanceProfile` | `string`   | Profilo OS della VM                           | –          | ✅      |
| `disks`           | `[]string` | Lista dei `VMDisk` collegati                  | `[]`       | ✅      |
| `sshKeys`         | `[]string` | Chiavi SSH pubbliche iniettate                 | `[]`       | ✅      |
| `cloudInit`       | `string`   | Configurazione cloud-init (YAML)              | `""`       | ✅      |
| `cloudInitSeed`   | `string`   | Dati seed cloud-init                      | `""`       | ✅      |

---

### Configurazione di rete

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
```

---

### Tipi di istanze

#### Serie S – Standard (rapporto 1:2)

Workload generali, CPU condivisi e burstable.

```yaml
instanceType: s1.small     # 1 vCPU, 2 GB RAM
instanceType: s1.medium    # 2 vCPU, 4 GB RAM
instanceType: s1.large     # 4 vCPU, 8 GB RAM
instanceType: s1.xlarge    # 8 vCPU, 16 GB RAM
instanceType: s1.3large    # 12 vCPU, 24 GB RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 GB RAM
instanceType: s1.3xlarge   # 24 vCPU, 48 GB RAM
instanceType: s1.4xlarge   # 32 vCPU, 64 GB RAM
instanceType: s1.8xlarge   # 64 vCPU, 128 GB RAM
```

#### Serie U – Universal (rapporto 1:4)

```yaml
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

#### Serie M – Memory Optimized (rapporto 1:8)

```yaml
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

---

### Profili OS supportati

I profili seguenti sono disponibili per configurare il sistema operativo della VM:

| Profilo | Descrizione |
|--------|-------------|
| `ubuntu` | Ubuntu Server (raccomandato) |
| `centos` | CentOS Stream |
| `debian` | Debian |
| `fedora` | Fedora Server |
| `windows` | Windows Server |

---

### Configurazione SSH

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
      - curl
```

---

### Esempio completo VMInstance

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
  running: true
  instanceType: u1.2xlarge
  instanceProfile: ubuntu
  disks:
    - vm-system-disk
  sshKeys:
    - ssh-rsa AAAA...
```

---

## VMDisk

### Panoramica

L'API `VMDisk` permette di gestire i dischi virtuali associati alle VM.
Supporta **diverse sorgenti di immagini**: HTTP, disco vuoto e **Golden Image**.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://...
  optical: false
  storage: 30Gi
  storageClass: replicated
```

---

### Parametri principali

| Parametro      | Tipo      | Descrizione              | Default      | Richiesto |
| -------------- | --------- | ------------------------ | ------------ | ------ |
| `source`       | `object`  | Sorgente dell'immagine disco | `{}`         | ✅      |
| `optical`      | `boolean` | Disco ottico (ISO)     | `false`      | ✅      |
| `storage`      | `string`  | Dimensione del disco         | –            | ✅      |
| `storageClass` | `string`  | Classe di storage       | `replicated` | ✅      |

---

## Sorgenti di immagini

### Sorgente HTTP / HTTPS

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

---

### Disco vuoto

```yaml
spec:
  source: {}
```

---

### Golden Image (Immagini precaricate Hikube)

Le **Golden Image** sono immagini di sistema mantenute e precaricate in Hikube.
Permettono un **provisioning rapido**, standardizzato e senza dipendenze esterne.

:::tip Convenzione di denominazione
Le immagini seguono il formato `{os}-{version}` (es.: `ubuntu-2404`, `rocky-9`).
Specificate sempre la versione per garantire la compatibilità dei vostri workload.
:::

#### Utilizzo

```yaml
spec:
  source:
    image:
      name: ubuntu-2404
```

#### Immagini disponibili

| Nome | Sistema operativo | Tipo | Storage min. |
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
| `proxmox-8` | Proxmox VE 8 | ISO | 2 Gi |
| `proxmox-9` | Proxmox VE 9 | ISO | 2 Gi |
| `talos-112` | Talos Linux 1.12 | Cloud | 8 Gi |

:::warning Immagini ISO
Le immagini di tipo **ISO** (Proxmox) sono installer, non immagini cloud pronte all'uso.
Richiedono un'installazione manuale tramite la console VNC.
:::

---

### Esempi VMDisk

#### Disco di sistema tramite Golden Image

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

## Classi di storage

| Classe       | Descrizione         | Replica |
| ------------ | ------------------- | ----------- |
| `local`      | Storage locale nodo | ❌           |
| `replicated` | Storage replicato   | ✅           |

---

## Metodi di esposizione di rete

### PortList

* Firewall automatico
* Porte esplicitamente autorizzate
* **Raccomandato in produzione**

### WholeIP

* Tutte le porte esposte
* Nessun filtraggio di rete
* Solo per sviluppo

:::warning Sicurezza
Con `WholeIP`, la VM è interamente esposta su Internet.
Un firewall OS è indispensabile.
:::

---

## Buone pratiche

### Sicurezza

* Solo chiavi SSH
* Firewall OS attivo

### Archiviazione

* `replicated` in produzione
* Dischi separati sistema / dati

### Prestazioni

* Adattare il tipo di istanza al workload
* Monitorare l'utilizzo reale

:::tip Architettura raccomandata
In produzione, utilizzate come minimo **2 dischi** (sistema + dati) con storage replicato.
:::
