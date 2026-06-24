---
sidebar_position: 3
title: API Reference
---

## API Reference – Machines Virtuelles

Cette référence décrit de manière exhaustive les APIs **VMInstance** et **VMDisk** d’Hikube : paramètres disponibles, valeurs par défaut, exemples d’utilisation et bonnes pratiques recommandées.

Les champs documentés ci-dessous correspondent au schéma réellement exposé par la plateforme (`apps.cozystack.io/v1alpha1`).

---

## VMInstance

### Vue d’ensemble

L’API `VMInstance` permet de créer, configurer et gérer des machines virtuelles dans Hikube. Une VM s’appuie sur un ou plusieurs disques décrits séparément via la ressource [`VMDisk`](#vmdisk).

```yaml title="vm-instance.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Configuration détaillée ci-dessous
```

:::warning Kind correct
La ressource s’appelle **`VMInstance`** (et non `VirtualMachine`). Le disque n’est **pas** un champ `systemDisk` intégré : il faut créer une ressource `VMDisk` distincte et la référencer dans `disks`.
:::

---

### Spécification complète

| Paramètre         | Type             | Description                                                                 | Défaut       | Requis |
| ----------------- | ---------------- | --------------------------------------------------------------------------- | ------------ | ------ |
| `external`        | `boolean`        | Active l’exposition réseau depuis l’extérieur du cluster                     | `false`      | non    |
| `externalMethod`  | `string`         | Méthode d’exposition : `PortList` ou `WholeIP`                              | `PortList`   | non    |
| `externalPorts`   | `[]integer`      | Ports à transférer depuis l’extérieur (utilisé avec `PortList`)            | `[22]`       | non    |
| `runStrategy`     | `string`         | État d’exécution souhaité (voir [runStrategy](#runstrategy))                | `Always`     | non    |
| `instanceType`    | `string`         | Gabarit CPU / mémoire (voir [types d’instances](#types-dinstances))         | `u1.medium`  | non    |
| `instanceProfile` | `string`         | Profil OS / préférences (drivers, kernel) — voir [profils](#profils-dos)    | `ubuntu`     | non    |
| `disks`           | `[]object`       | Liste des `VMDisk` à attacher (voir [disks](#disques))                       | `[]`         | non    |
| `subnets`         | `[]object`       | Sous-réseaux additionnels (VPC) — voir [subnets](#sous-réseaux)             | `[]`         | non    |
| `gpus`            | `[]object`       | GPU à attacher en passthrough (voir [gpus](#gpu))                            | `[]`         | non    |
| `resources`       | `object`         | Surcharge explicite CPU / mémoire / sockets (voir [resources](#ressources)) | `{}`         | non    |
| `cpuModel`        | `string`         | Modèle de CPU exposé à la VM (ex : `host-passthrough`)                       | `""`         | non    |
| `sshKeys`         | `[]string`       | Clés SSH publiques injectées                                                | `[]`         | non    |
| `cloudInit`       | `string`         | Configuration cloud-init (user-data YAML)                                    | `""`         | non    |
| `cloudInitSeed`   | `string`         | Seed servant à générer un UUID SMBIOS stable                                | `""`         | non    |

:::note
Tous les champs sont optionnels : une VM minimale ne nécessite qu’un disque amorçable référencé dans `disks`. Les valeurs par défaut ci-dessus sont celles appliquées par la plateforme.
:::

---

### runStrategy

`runStrategy` contrôle l’état d’exécution de la VM. Il remplace l’ancien champ booléen `running`.

| Valeur            | Comportement                                                            |
| ----------------- | ----------------------------------------------------------------------- |
| `Always`          | La VM est maintenue démarrée (redémarre automatiquement si elle s’arrête) |
| `Halted`          | La VM est arrêtée                                                       |
| `Manual`          | L’état est piloté manuellement (`virtctl start` / `stop`)              |
| `RerunOnFailure`  | Redémarre uniquement après un échec                                     |
| `Once`            | Démarre une seule fois, sans redémarrage automatique                    |

```yaml
spec:
  runStrategy: Always
```

Pour arrêter/redémarrer une VM existante :

```bash
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Halted"}}'
kubectl patch vminstance my-vm --type='merge' -p '{"spec":{"runStrategy":"Always"}}'
```

---

### Configuration réseau

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22
    - 80
    - 443
```

Voir [Méthodes d’exposition réseau](#méthodes-dexposition-réseau).

---

### Types d’instances

`instanceType` référence un `VirtualMachineClusterInstancetype`. Hikube expose plusieurs séries, chacune avec les tailles `nano` → `8xlarge` :

| Série | Usage                                                                 |
| ----- | --------------------------------------------------------------------- |
| `s1`  | **Standard** — CPU partagés/burstables, ratio vCPU:RAM 1:2            |
| `u1`  | **Universal** — usage général, ratio 1:4 (par défaut)                |
| `m1`  | **Memory optimized** — ratio 1:8                                      |

```yaml
# Exemples de la série Universal (ratio 1:4)
instanceType: u1.medium    # 1 vCPU, 4 Go RAM
instanceType: u1.large     # 2 vCPU, 8 Go RAM
instanceType: u1.xlarge    # 4 vCPU, 16 Go RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 Go RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 Go RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 Go RAM
```

```yaml
# Série Standard (ratio 1:2)
instanceType: s1.small     # 1 vCPU, 2 Go RAM
instanceType: s1.medium    # 2 vCPU, 4 Go RAM
instanceType: s1.large     # 4 vCPU, 8 Go RAM
instanceType: s1.xlarge    # 8 vCPU, 16 Go RAM
instanceType: s1.2xlarge   # 16 vCPU, 32 Go RAM
```

```yaml
# Série Memory optimized (ratio 1:8)
instanceType: m1.large     # 2 vCPU, 16 Go RAM
instanceType: m1.xlarge    # 4 vCPU, 32 Go RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 Go RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 Go RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 Go RAM
```

:::tip GPU et `instanceType`
Pour attacher un GPU, choisissez une série généraliste (`u1`, `s1`…) et déclarez le GPU via le champ [`gpus`](#gpu). Le pilote NVIDIA requiert **au moins 4 Gio de RAM**.
:::

---

### Profils d’OS

`instanceProfile` charge les **préférences KubeVirt** (drivers, modèle de machine, kernel) adaptées à l’OS. Il ne définit **pas** l’image — celle-ci est portée par le `VMDisk`. C’est surtout déterminant pour Windows (drivers virtio).

Valeurs disponibles (extrait) :

| Famille     | Profils                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| Ubuntu      | `ubuntu`                                                                                 |
| RHEL        | `rhel.7`, `rhel.8`, `rhel.9`, `rhel.10` (+ variantes `.desktop`, `.arm64`, `.dpdk`, `.realtime`) |
| CentOS      | `centos.7`, `centos.stream8`, `centos.stream9`, `centos.stream10` (+ `.desktop`, `.dpdk`) |
| Fedora      | `fedora`, `fedora.arm64`                                                                  |
| openSUSE    | `opensuse.leap`, `opensuse.tumbleweed`                                                    |
| SLES        | `sles`                                                                                    |
| Autres      | `alpine`, `cirros`                                                                        |
| Windows     | `windows.2k22.virtio`, `windows.2k25.virtio`, `windows.10.virtio`, `windows.11.virtio` (variantes `.virtio` **recommandées**) ; variantes sans virtio également disponibles (`windows.2k22`…) |

:::note
Il n’existe **pas** de profil `debian` ni `rocky`/`almalinux` dédié. Pour ces distributions, utilisez `ubuntu` (base Debian) ou laissez `instanceProfile: ""`. Pour Windows, utilisez toujours une variante `.virtio` (ex : `windows.2k25.virtio`) afin de charger les drivers virtio.
:::

---

### Disques

`disks` est une **liste d’objets** référençant des ressources [`VMDisk`](#vmdisk) par leur nom. Le premier disque listé est généralement le disque amorçable.

| Champ           | Type     | Description                                          |
| --------------- | -------- | ---------------------------------------------------- |
| `disks[].name`  | `string` | Nom du `VMDisk` à attacher                           |
| `disks[].bus`   | `string` | Type de bus (`virtio`, `sata`, `scsi`) — optionnel  |

```yaml
spec:
  disks:
    - name: vm-system-disk
    - name: vm-data-disk
      bus: scsi
```

:::warning
La VM ne prend pas en compte un nouveau disque tant qu’elle n’est pas redémarrée (`virtctl restart` ou bascule `runStrategy`).
:::

---

### GPU

`gpus` attache un ou plusieurs GPU NVIDIA en passthrough PCI.

| Champ          | Type     | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `gpus[].name`  | `string` | Nom de la ressource GPU (`nvidia.com/...`) |

```yaml
spec:
  instanceType: u1.2xlarge
  gpus:
    - name: nvidia.com/AD102GL_L40S
```

Les modèles disponibles sur Hikube sont détaillés dans la [référence API GPU](../gpu/api-reference.md). Un GPU est attribué de façon **exclusive** à une VM.

---

### Sous-réseaux

`subnets` rattache la VM à des sous-réseaux additionnels d’un VPC.

| Champ             | Type     | Description           |
| ----------------- | -------- | --------------------- |
| `subnets[].name`  | `string` | Nom du sous-réseau    |

```yaml
spec:
  subnets:
    - name: subnet-ab2c3e47
```

---

### Ressources

Par défaut, le dimensionnement CPU/mémoire est porté par `instanceType`. Le bloc `resources` permet de **surcharger** explicitement ces valeurs (et de définir une topologie de sockets).

| Champ                | Type            | Description                          |
| -------------------- | --------------- | ------------------------------------ |
| `resources.cpu`      | `int`/`string`  | Nombre de cœurs CPU alloués          |
| `resources.memory`   | `int`/`string`  | Quantité de mémoire allouée          |
| `resources.sockets`  | `int`/`string`  | Nombre de sockets CPU (topologie)    |

```yaml
spec:
  resources:
    cpu: "4"
    memory: 8Gi
    sockets: "2"
```

---

### Configuration SSH

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
  # Seed optionnel pour fixer l’UUID SMBIOS (licences, identité machine)
  cloudInitSeed: ""
```

---

### Exemple complet VMInstance

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

### Vue d’ensemble

L’API `VMDisk` gère les disques virtuels attachés aux VMs. Elle supporte plusieurs sources d’image : **HTTP**, **Golden Image** préchargée, ou disque vide.

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

### Paramètres principaux

| Paramètre      | Type            | Description                                  | Défaut       | Requis |
| -------------- | --------------- | -------------------------------------------- | ------------ | ------ |
| `storage`      | `int`/`string`  | Taille du disque                             | `5Gi`        | ✅     |
| `storageClass` | `string`        | Classe de stockage                           | `replicated` | ✅     |
| `source`       | `object`        | Source de l’image disque (voir ci-dessous)   | `{}`         | non    |
| `optical`      | `boolean`       | Disque optique / ISO (installeur)            | `false`      | non    |

---

## Sources d’images

### Source HTTP / HTTPS

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

### Golden Images (images préchargées Hikube)

Les **Golden Images** sont des images système maintenues et préchargées dans Hikube, pour un provisionnement rapide et sans dépendance externe.

```yaml
spec:
  source:
    image:
      name: ubuntu-2404
```

#### Images disponibles

| Nom | Système d'exploitation | Type | Stockage min. |
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

:::warning Images ISO
Les images de type **ISO** (Windows, Proxmox) sont des installeurs et non des images cloud prêtes à l’emploi. Prévoyez une installation initiale via la console VNC. Pour Windows, voir le guide [Installer une VM Windows](how-to/install-windows-vm.md).
:::

### Disque vide

```yaml
spec:
  source: {}
```

Un disque vide est utile pour les volumes de données additionnels.

---

### Exemple VMDisk via Golden Image

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

## Classes de stockage

Hikube expose plusieurs `storageClass` basées sur LINSTOR. Pour une VM, `replicated` est recommandé.

| Classe                                 | Réplication | Chiffrement | Notes                                            |
| -------------------------------------- | :---------: | :---------: | ------------------------------------------------ |
| `local`                                | ❌          | ❌          | Stockage local au nœud (défaut), non résilient   |
| `local-encrypted`                      | ❌          | ✅ (LUKS)   | Local + chiffré                                  |
| `replicated`                           | ✅          | ❌          | Répliqué synchrone — **recommandé** pour les VMs |
| `replicated-encrypted`                 | ✅          | ✅ (LUKS)   | Répliqué + chiffré                               |
| `replicated-async`                     | ✅ (async)  | ❌          | Réplication asynchrone                           |
| `replicated-async-encrypted`           | ✅ (async)  | ✅ (LUKS)   | Réplication asynchrone + chiffré                 |
| `replicated-async-windows`             | ✅ (async)  | ❌          | Variante adaptée aux disques Windows             |
| `replicated-async-windows-encrypted`   | ✅ (async)  | ✅ (LUKS)   | Variante Windows + chiffré                       |

:::note
Les variantes `-windows` sont optimisées pour les disques de VMs Windows. Le chiffrement (`-encrypted`) s’appuie sur LUKS au niveau du volume.
:::

---

## Méthodes d’exposition réseau

### PortList

* Pare-feu automatique
* Seuls les ports listés dans `externalPorts` sont accessibles
* **Recommandé en production**

### WholeIP

* Une IP publique dédiée, tous les ports exposés
* Aucun filtrage réseau côté plateforme
* Réserver au développement ou aux passerelles maîtrisées

:::warning Sécurité
Avec `WholeIP`, la VM est entièrement exposée sur Internet. Un pare-feu OS est indispensable.
:::

---

## Bonnes pratiques

### Sécurité

* Authentification par clés SSH uniquement
* Pare-feu OS actif, `PortList` plutôt que `WholeIP`

### Stockage

* `replicated` (ou variantes chiffrées/Windows) en production
* Séparer disque système et disques de données

### Performance

* Adapter `instanceType` au workload, ou surcharger via `resources`
* Pour les GPU, prévoir ≥ 4 Gio de RAM et un ratio CPU/RAM adapté

:::tip Architecture recommandée
En production, utilisez au minimum **2 disques** (système + données) en stockage répliqué.
:::
