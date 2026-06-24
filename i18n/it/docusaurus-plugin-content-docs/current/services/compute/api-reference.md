---
sidebar_position: 3
title: Riferimento API
---

## Riferimento API – Macchine Virtuali

Questo riferimento descrive in modo esaustivo le API **VMInstance** e **VMDisk** di Hikube: parametri disponibili, valori predefiniti, esempi di utilizzo e buone pratiche raccomandate.

I campi documentati qui sotto corrispondono allo schema realmente esposto dalla piattaforma (`apps.cozystack.io/v1alpha1`).

---

## VMInstance

### Panoramica

L'API `VMInstance` permette di creare, configurare e gestire macchine virtuali in Hikube. Una VM si basa su uno o più dischi descritti separatamente tramite la risorsa [`VMDisk`](#vmdisk).

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Configurazione dettagliata qui sotto
```

:::warning Kind corretto
La risorsa si chiama **`VMInstance`** (e non `VirtualMachine`). Il disco **non** è un campo `systemDisk` integrato: occorre creare una risorsa `VMDisk` distinta e referenziarla in `disks`.
:::

---

### Specifica completa

| Parametro         | Tipo             | Descrizione                                                                 | Default      | Richiesto |
| ----------------- | ---------------- | --------------------------------------------------------------------------- | ------------ | ------ |
| `external`        | `boolean`        | Attiva l'esposizione di rete dall'esterno del cluster                       | `false`      | no    |
| `externalMethod`  | `string`         | Metodo di esposizione: `PortList` o `WholeIP`                              | `PortList`   | no    |
| `externalPorts`   | `[]integer`      | Porte da inoltrare dall'esterno (usato con `PortList`)                     | `[22]`       | no    |
| `runStrategy`     | `string`         | Stato di esecuzione desiderato (vedi [runStrategy](#runstrategy))           | `Always`     | no    |
| `instanceType`    | `string`         | Modello CPU / memoria (vedi [tipi di istanze](#tipi-di-istanze))            | `u1.medium`  | no    |
| `instanceProfile` | `string`         | Profilo OS / preferenze (driver, kernel) — vedi [profili](#profili-os)      | `ubuntu`     | no    |
| `disks`           | `[]object`       | Lista dei `VMDisk` da collegare (vedi [disks](#dischi))                      | `[]`         | no    |
| `subnets`         | `[]object`       | Sottoreti aggiuntive (VPC) — vedi [subnets](#sottoreti)                     | `[]`         | no    |
| `gpus`            | `[]object`       | GPU da collegare in passthrough (vedi [gpus](#gpu))                          | `[]`         | no    |
| `resources`       | `object`         | Override esplicito CPU / memoria / socket (vedi [resources](#risorse))      | `{}`         | no    |
| `cpuModel`        | `string`         | Modello di CPU esposto alla VM (es.: `host-passthrough`)                     | `""`         | no    |
| `sshKeys`         | `[]string`       | Chiavi SSH pubbliche iniettate                                              | `[]`         | no    |
| `cloudInit`       | `string`         | Configurazione cloud-init (user-data YAML)                                   | `""`         | no    |
| `cloudInitSeed`   | `string`         | Seed usato per generare un UUID SMBIOS stabile                              | `""`         | no    |

:::note
Tutti i campi sono opzionali: una VM minimale richiede solo un disco avviabile referenziato in `disks`. I valori predefiniti qui sopra sono quelli applicati dalla piattaforma.
:::

---

### runStrategy

`runStrategy` controlla lo stato di esecuzione della VM. Sostituisce il vecchio campo booleano `running`.

| Valore            | Comportamento                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| `Always`          | La VM è mantenuta avviata (si riavvia automaticamente se si arresta)      |
| `Halted`          | La VM è arrestata                                                        |
| `Manual`          | Lo stato è gestito manualmente (`virtctl start` / `stop`)                |
| `RerunOnFailure`  | Si riavvia solo dopo un errore                                           |
| `Once`            | Si avvia una sola volta, senza riavvio automatico                        |

```yaml
spec:
  runStrategy: Always
```

Per arrestare/riavviare una VM esistente:

```bash
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

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

Vedi [Metodi di esposizione di rete](#metodi-di-esposizione-di-rete).

---

### Tipi di istanze

`instanceType` referenzia un `VirtualMachineClusterInstancetype`. Hikube espone diverse serie, ciascuna con le taglie `nano` → `8xlarge`:

| Serie | Utilizzo                                                              |
| ----- | --------------------------------------------------------------------- |
| `s1`  | **Standard** — CPU condivise/burstable, rapporto vCPU:RAM 1:2         |
| `u1`  | **Universal** — uso generale, rapporto 1:4 (predefinito)             |
| `m1`  | **Memory optimized** — rapporto 1:8                                   |

```yaml
# Esempi della serie Universal (rapporto 1:4)
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

```yaml
# Serie Standard (rapporto 1:2)
instanceType: s1.small     # 1 vCPU, 2 GB RAM
instanceType: s1.medium    # 2 vCPU, 4 GB RAM
instanceType: s1.large     # 4 vCPU, 8 GB RAM
instanceType: s1.xlarge    # 8 vCPU, 16 GB RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 GB RAM
```

```yaml
# Serie Memory optimized (rapporto 1:8)
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

:::tip GPU e `instanceType`
Per collegare una GPU, scegliete una serie generalista (`u1`, `s1`…) e dichiarate la GPU tramite il campo [`gpus`](#gpu). Il driver NVIDIA richiede **almeno 4 GiB di RAM**.
:::

---

### Profili OS

`instanceProfile` carica le **preferenze KubeVirt** (driver, modello di macchina, kernel) adattate all'OS. **Non** definisce l'immagine — questa è gestita dal `VMDisk`. È soprattutto determinante per Windows (driver virtio).

Valori disponibili (estratto):

| Famiglia    | Profili                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| Ubuntu      | `ubuntu`                                                                                 |
| RHEL        | `rhel.7`, `rhel.8`, `rhel.9`, `rhel.10` (+ varianti `.desktop`, `.arm64`, `.dpdk`, `.realtime`) |
| CentOS      | `centos.7`, `centos.stream8`, `centos.stream9`, `centos.stream10` (+ `.desktop`, `.dpdk`) |
| Fedora      | `fedora`, `fedora.arm64`                                                                  |
| openSUSE    | `opensuse.leap`, `opensuse.tumbleweed`                                                    |
| SLES        | `sles`                                                                                    |
| Altri       | `alpine`, `cirros`                                                                        |
| Windows     | `windows.2k22.virtio`, `windows.2k25.virtio`, `windows.10.virtio`, `windows.11.virtio` (varianti `.virtio` **raccomandate**); anche le varianti senza virtio sono disponibili (`windows.2k22`…) |

:::note
**Non** esiste un profilo `debian` né `rocky`/`almalinux` dedicato. Per queste distribuzioni, usate `ubuntu` (base Debian) o lasciate `instanceProfile: ""`. Per Windows, usate sempre una variante `.virtio` (es.: `windows.2k25.virtio`) per caricare i driver virtio.
:::

---

### Dischi

`disks` è una **lista di oggetti** che referenzia risorse [`VMDisk`](#vmdisk) tramite il loro nome. Il primo disco elencato è generalmente il disco avviabile.

| Campo           | Tipo     | Descrizione                                          |
| --------------- | -------- | ---------------------------------------------------- |
| `disks[].name`  | `string` | Nome del `VMDisk` da collegare                       |
| `disks[].bus`   | `string` | Tipo di bus (`virtio`, `sata`, `scsi`) — opzionale  |

```yaml
spec:
  disks:
    - name: vm-system-disk
    - name: vm-data-disk
      bus: scsi
```

:::warning
La VM non prende in considerazione un nuovo disco finché non viene riavviata (`virtctl restart` o cambio di `runStrategy`).
:::

---

### GPU

`gpus` collega una o più GPU NVIDIA in passthrough PCI.

| Campo          | Tipo     | Descrizione                                |
| -------------- | -------- | ------------------------------------------ |
| `gpus[].name`  | `string` | Nome della risorsa GPU (`nvidia.com/...`)  |

```yaml
spec:
  instanceType: u1.2xlarge
  gpus:
    - name: nvidia.com/AD102GL_L40S
```

I modelli disponibili su Hikube sono dettagliati nel [riferimento API GPU](../gpu/api-reference.md). Una GPU è assegnata in modo **esclusivo** a una VM.

---

### Sottoreti

`subnets` collega la VM a sottoreti aggiuntive di un VPC.

| Campo             | Tipo     | Descrizione           |
| ----------------- | -------- | --------------------- |
| `subnets[].name`  | `string` | Nome della sottorete  |

```yaml
spec:
  subnets:
    - name: subnet-ab2c3e47
```

---

### Risorse

Per impostazione predefinita, il dimensionamento CPU/memoria è gestito da `instanceType`. Il blocco `resources` permette di **sovrascrivere** esplicitamente questi valori (e di definire una topologia di socket).

| Campo                | Tipo            | Descrizione                          |
| -------------------- | --------------- | ------------------------------------ |
| `resources.cpu`      | `int`/`string`  | Numero di core CPU allocati          |
| `resources.memory`   | `int`/`string`  | Quantità di memoria allocata         |
| `resources.sockets`  | `int`/`string`  | Numero di socket CPU (topologia)     |

```yaml
spec:
  resources:
    cpu: "4"
    memory: 8Gi
    sockets: "2"
```

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
  # Seed opzionale per fissare l'UUID SMBIOS (licenze, identità macchina)
  cloudInitSeed: ""
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

### Panoramica

L'API `VMDisk` gestisce i dischi virtuali collegati alle VM. Supporta diverse sorgenti di immagine: **HTTP**, **Golden Image** precaricata, oppure disco vuoto.

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

### Parametri principali

| Parametro      | Tipo            | Descrizione                                  | Default      | Richiesto |
| -------------- | --------------- | -------------------------------------------- | ------------ | ------ |
| `storage`      | `int`/`string`  | Dimensione del disco                         | `5Gi`        | ✅     |
| `storageClass` | `string`        | Classe di storage                            | `replicated` | ✅     |
| `source`       | `object`        | Sorgente dell'immagine disco (vedi sotto)    | `{}`         | no    |
| `optical`      | `boolean`       | Disco ottico / ISO (installer)               | `false`      | no    |

---

## Sorgenti di immagini

### Sorgente HTTP / HTTPS

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

### Golden Image (immagini precaricate Hikube)

Le **Golden Image** sono immagini di sistema mantenute e precaricate in Hikube, per un provisioning rapido e senza dipendenze esterne.

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
| `windows-server-2022` | Windows Server 2022 | ISO | 28 Gi |
| `windows-server-2025` | Windows Server 2025 | ISO | 28 Gi |
| `proxmox-8` | Proxmox VE 8 | ISO | 2 Gi |
| `proxmox-9` | Proxmox VE 9 | ISO | 2 Gi |
| `talos-112` | Talos Linux 1.12 | Cloud | 8 Gi |

:::warning Immagini ISO
Le immagini di tipo **ISO** (Windows, Proxmox) sono installer e non immagini cloud pronte all'uso. Prevedete un'installazione iniziale tramite la console VNC. Per Windows, vedi la guida [Installare una VM Windows](how-to/install-windows-vm.md).
:::

### Disco vuoto

```yaml
spec:
  source: {}
```

Un disco vuoto è utile per i volumi di dati aggiuntivi.

---

### Esempio VMDisk tramite Golden Image

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

Hikube espone diverse `storageClass` basate su LINSTOR. Per una VM, `replicated` è raccomandata.

| Classe                                 | Replica     | Cifratura   | Note                                             |
| -------------------------------------- | :---------: | :---------: | ------------------------------------------------ |
| `local`                                | ❌          | ❌          | Storage locale al nodo (predefinito), non resiliente |
| `local-encrypted`                      | ❌          | ✅ (LUKS)   | Locale + cifrato                                 |
| `replicated`                           | ✅          | ❌          | Replica sincrona — **raccomandato** per le VM    |
| `replicated-encrypted`                 | ✅          | ✅ (LUKS)   | Replicato + cifrato                              |
| `replicated-async`                     | ✅ (async)  | ❌          | Replica asincrona                                |
| `replicated-async-encrypted`           | ✅ (async)  | ✅ (LUKS)   | Replica asincrona + cifrato                      |
| `replicated-async-windows`             | ✅ (async)  | ❌          | Variante adatta ai dischi Windows                |
| `replicated-async-windows-encrypted`   | ✅ (async)  | ✅ (LUKS)   | Variante Windows + cifrato                       |

:::note
Le varianti `-windows` sono ottimizzate per i dischi delle VM Windows. La cifratura (`-encrypted`) si basa su LUKS a livello di volume.
:::

---

## Metodi di esposizione di rete

### PortList

* Firewall automatico
* Solo le porte elencate in `externalPorts` sono accessibili
* **Raccomandato in produzione**

### WholeIP

* Un IP pubblico dedicato, tutte le porte esposte
* Nessun filtraggio di rete lato piattaforma
* Riservare allo sviluppo o ai gateway controllati

:::warning Sicurezza
Con `WholeIP`, la VM è interamente esposta su Internet. Un firewall OS è indispensabile.
:::

---

## Buone pratiche

### Sicurezza

* Autenticazione solo tramite chiavi SSH
* Firewall OS attivo, `PortList` piuttosto che `WholeIP`

### Storage

* `replicated` (o varianti cifrate/Windows) in produzione
* Separare disco di sistema e dischi di dati

### Prestazioni

* Adattare `instanceType` al workload, oppure sovrascrivere tramite `resources`
* Per le GPU, prevedere ≥ 4 GiB di RAM e un rapporto CPU/RAM adeguato

:::tip Architettura raccomandata
In produzione, utilizzate come minimo **2 dischi** (sistema + dati) con storage replicato.
:::
