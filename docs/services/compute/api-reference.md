---
sidebar_position: 3
title: API Reference
---

## API Reference – Machines Virtuelles

Cette référence décrit de manière exhaustive les APIs **VMInstance** et **VMDisk** d’Hikube : paramètres disponibles, exemples d’utilisation et bonnes pratiques recommandées.

---

## VMInstance

### Vue d’ensemble

L’API `VMInstance` permet de créer, configurer et gérer des machines virtuelles dans Hikube.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Configuration détaillée ci-dessous
```

---

### Spécification complète

#### Paramètres généraux

| Paramètre         | Type       | Description                                  | Défaut     | Requis |
| ----------------- | ---------- | -------------------------------------------- | ---------- | ------ |
| `external`        | `boolean`  | Active l’exposition réseau externe de la VM  | `false`    | ✅      |
| `externalMethod`  | `string`   | Méthode d’exposition (`PortList`, `WholeIP`) | `PortList` | ✅      |
| `externalPorts`   | `[]int`    | Ports exposés vers l’extérieur               | `[]`       | ✅      |
| `running`         | `boolean`  | État souhaité de la VM                       | `true`     | ✅      |
| `instanceType`    | `string`   | Gabarit CPU / mémoire                        | –          | ✅      |
| `instanceProfile` | `string`   | Profil OS de la VM                           | –          | ✅      |
| `disks`           | `[]string` | Liste des `VMDisk` attachés                  | `[]`       | ✅      |
| `sshKeys`         | `[]string` | Clés SSH publiques injectées                 | `[]`       | ✅      |
| `cloudInit`       | `string`   | Configuration cloud-init (YAML)              | `""`       | ✅      |
| `cloudInitSeed`   | `string`   | Données seed cloud-init                      | `""`       | ✅      |

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

---

### Types d’instances

#### Série S – Standard (ratio 1:2)

Workloads généraux, CPU partagés et burstables.

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

#### Série U – Universal (ratio 1:4)

```yaml
instanceType: u1.medium    # 1 vCPU, 4 GB RAM
instanceType: u1.large     # 2 vCPU, 8 GB RAM
instanceType: u1.xlarge    # 4 vCPU, 16 GB RAM
instanceType: u1.2xlarge   # 8 vCPU, 32 GB RAM
instanceType: u1.4xlarge   # 16 vCPU, 64 GB RAM
instanceType: u1.8xlarge   # 32 vCPU, 128 GB RAM
```

#### Série M – Memory Optimized (ratio 1:8)

```yaml
instanceType: m1.large     # 2 vCPU, 16 GB RAM
instanceType: m1.xlarge    # 4 vCPU, 32 GB RAM
instanceType: m1.2xlarge   # 8 vCPU, 64 GB RAM
instanceType: m1.4xlarge   # 16 vCPU, 128 GB RAM
instanceType: m1.8xlarge   # 32 vCPU, 256 GB RAM
```

---

### Profils d’OS supportés

Les profils suivants sont disponibles pour configurer le système d'exploitation de la VM :

| Profil | Description |
|--------|-------------|
| `ubuntu` | Ubuntu Server (recommandé) |
| `centos` | CentOS Stream |
| `debian` | Debian |
| `fedora` | Fedora Server |
| `windows` | Windows Server |

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
      - curl
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

### Vue d’ensemble

L’API `VMDisk` permet de gérer les disques virtuels associés aux VMs.
Elle supporte **plusieurs sources d’images** : HTTP, disque vide et **Golden Images**.

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

### Paramètres principaux

| Paramètre      | Type      | Description              | Défaut       | Requis |
| -------------- | --------- | ------------------------ | ------------ | ------ |
| `source`       | `object`  | Source de l’image disque | `{}`         | ✅      |
| `optical`      | `boolean` | Disque optique (ISO)     | `false`      | ✅      |
| `storage`      | `string`  | Taille du disque         | –            | ✅      |
| `storageClass` | `string`  | Classe de stockage       | `replicated` | ✅      |

---

## Sources d’images

### Source HTTP / HTTPS

```yaml
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
```

---

### Disque vide

```yaml
spec:
  source: {}
```

---

### Golden Images (Images préchargées Hikube)

Les **Golden Images** sont des images système maintenues et préchargées dans Hikube.
Elles permettent un **provisionnement rapide**, standardisé et sans dépendance externe.

#### Utilisation

```yaml
spec:
  source:
    image:
      name: ubuntu
```

#### Images disponibles

| Nom             |
| --------------- |
| `almalinux`     |
| `centos-stream` |
| `cloudlinux`    |
| `debian`        |
| `fedora`        |
| `opensuse`      |
| `oracle`        |
| `proxmox`       |
| `rocky`         |
| `talos`         |
| `ubuntu`        |

---

### Exemples VMDisk

#### Disque système via Golden Image

```yaml title="ubuntu-golden-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-system
spec:
  source:
    image:
      name: ubuntu
  optical: false
  storage: 20Gi
  storageClass: replicated
```

---

## Classes de stockage

| Classe       | Description         | Réplication |
| ------------ | ------------------- | ----------- |
| `local`      | Stockage local nœud | ❌           |
| `replicated` | Stockage répliqué   | ✅           |

---

## Méthodes d’exposition réseau

### PortList

* Firewall automatique
* Ports explicitement autorisés
* **Recommandé en production**

### WholeIP

* Tous les ports exposés
* Aucun filtrage réseau
* Usage développement uniquement

:::warning Sécurité
Avec `WholeIP`, la VM est entièrement exposée sur Internet.
Un firewall OS est indispensable.
:::

---

## Bonnes pratiques

### Sécurité

* Clés SSH uniquement
* Firewall OS actif

### Stockage

* `replicated` en production
* Disques séparés système / données

### Performance

* Adapter le type d’instance au workload
* Suivre l’utilisation réelle

:::tip Architecture recommandée
En production, utilisez au minimum **2 disques** (système + données) en stockage répliqué.
:::
