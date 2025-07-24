---
sidebar_position: 3
title: Référence API - Virtual Machines
---

# API Reference - Machines Virtuelles

Cette référence complète détaille les APIs **VMInstance** et **VMDisk** d'Hikube, leurs paramètres, exemples d'usage et bonnes pratiques.

---

## 🖥️ VMInstance

### **Vue d'ensemble**

L'API `VMInstance` permet de créer et gérer des machines virtuelles dans Hikube. 

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
spec:
  # Configuration détaillée ci-dessous
```

### **Spécification Complète**

#### **Paramètres Généraux**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `external` | `boolean` | Active l'accès externe depuis l'extérieur du cluster | `false` | ✅ |
| `externalMethod` | `string` | Méthode d'exposition externe (WholeIP, PortList) | `PortList` | ✅ |
| `externalPorts` | `[]int` | Liste des ports à exposer externellement | `[]` | ✅ |
| `running` | `boolean` | État de fonctionnement souhaité de la VM | `true` | ✅ |
| `instanceType` | `string` | Type d'instance définissant CPU/Memory | - | ✅ |
| `instanceProfile` | `string` | Profil OS prédéfini pour la VM | - | ✅ |
| `disks` | `[]string` | Liste des noms des VMDisks à attacher | `[]` | ✅ |
| `sshKeys` | `[]string` | Clés SSH publiques pour l'accès | `[]` | ✅ |
| `cloudInit` | `string` | Configuration cloud-init YAML | `""` | ✅ |
| `cloudInitSeed` | `string` | Données seed pour cloud-init | `""` | ✅ |

#### **Configuration Réseau**

```yaml
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22    # SSH
    - 80    # HTTP
    - 443   # HTTPS
    - 8080  # Application custom
```

#### **Types d'Instances**

##### **Série S (Standard) - Ratio 1:2**
Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
# Instances disponibles
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

##### **Série U (Universal) - Ratio 1:4**
Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
# Instances disponibles
instanceType: "u1.medium"  # 1 vCPU, 4 GB RAM
instanceType: "u1.large"  # 2 vCPU, 8 GB RAM  
instanceType: "u1.xlarge"  # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"  # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"  # 32 vCPU, 128 GB RAM
```

##### **Série M (Memory Optimized) - Ratio 1:8**
Optimisée pour applications nécessitant beaucoup de mémoire.

```yaml
# Instances disponibles
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

#### **Profils d'OS**

Hikube supporte de nombreux profils OS prédéfinis :

```yaml
# Linux
instanceProfile: "alpine"                    # Alpine
instanceProfile: "centos.7"                  # CentOS 7
instanceProfile: "centos.7.desktop"          # CentOS 7 Desktop
instanceProfile: "centos.stream10"           # CentOS Stream 10
instanceProfile: "centos.stream10.desktop"   # CentOS Stream 10 Desktop
instanceProfile: "centos.stream8"            # CentOS Stream 8
instanceProfile: "centos.stream8.desktop"    # CentOS Stream 8 Desktop
instanceProfile: "centos.stream9"            # CentOS Stream 9
instanceProfile: "centos.stream9.desktop"    # CentOS Stream 9 Desktop
instanceProfile: "cirros"                    # Cirros
instanceProfile: "fedora"                    # Fedora
instanceProfile: "opensuse.leap"             # OpenSUSE Leap
instanceProfile: "opensuse.tumbleweed"       # OpenSUSE Tumbleweed
instanceProfile: "rhel.10"                   # Red Hat Enterprise Linux 10 Beta
instanceProfile: "rhel.7"                    # Red Hat Enterprise Linux 7
instanceProfile: "rhel.7.desktop"            # Red Hat Enterprise Linux 7 Desktop
instanceProfile: "rhel.8"                    # Red Hat Enterprise Linux 8
instanceProfile: "rhel.8.desktop"            # Red Hat Enterprise Linux 8 Desktop
instanceProfile: "rhel.9"                    # Red Hat Enterprise Linux 9
instanceProfile: "rhel.9.desktop"            # Red Hat Enterprise Linux 9 Desktop
instanceProfile: "sles"                      # SUSE Linux Enterprise Server
instanceProfile: "ubuntu"                    # Ubuntu

# Windows
instanceProfile: "windows.2k16"        # Microsoft Windows Server 2016
instanceProfile: "windows.2k16.virtio" # Microsoft Windows Server 2016 (virtio)
instanceProfile: "windows.2k19"        # Microsoft Windows Server 2019
instanceProfile: "windows.2k19.virtio" # Microsoft Windows Server 2019 (virtio)
instanceProfile: "windows.2k22"        # Microsoft Windows Server 2022
instanceProfile: "windows.2k22.virtio" # Microsoft Windows Server 2022 (virtio)
instanceProfile: "windows.2k25"        # Microsoft Windows Server 2025
instanceProfile: "windows.2k25.virtio" # Microsoft Windows Server 2025 (virtio)
```

#### **Configuration SSH**

```yaml
spec:
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@host"
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... user2@host"
```

#### **Cloud-Init Configuration**

```yaml
spec:
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."
    
    packages:
      - htop
      - docker.io
      - curl
      - jq
    
    write_files:
      - path: /etc/motd
        content: |
          Bienvenue sur votre VM Hikube !
          
    runcmd:
      - systemctl enable docker
      - systemctl start docker
      - usermod -aG docker admin
      - echo "Setup terminé" > /tmp/setup-done
    
    final_message: "VM prête après $UPTIME secondes"
```

### **Exemple Complet VMInstance**

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
  instanceProfile: "ubuntu"
  disks:
    - vm-system-disk
  resources:
    cpu: ""
    memory: ""
  sshKeys:
    - ssh-rsa AAAAB3Nza...
  cloudInit: |
    #cloud-config
  cloudInitSeed: ""
```

---

## 💾 VMDisk

### **Vue d'ensemble**

L'API `VMDisk` gère les disques virtuels utilisés par les machines virtuelles. Elle supporte diverses sources d'images et options de stockage.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: disk-example
spec:
  source:
    http:
      url: https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img
  optical: false
  storage: 30Gi
  storageClass: "replicated"
```

### **Spécification Complète**

#### **Paramètres Principaux**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `source` | `object` | Source de l'image disque | `{}` | ✅ |
| `optical` | `boolean` | Disque optique (ISO/CD-ROM) | `false` | ✅ |
| `storage` | `string` | Taille du disque | - | ✅ |
| `storageClass` | `string` | Classe de stockage | `replicated` | ✅ |

#### **Sources d'Images**

##### **Source HTTP/HTTPS**
```yaml
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
```

##### **Disque Vide**
```yaml
spec:
  source: {}  # Crée un disque vide
```

### **Exemples VMDisk**

#### **Disque Système Ubuntu**
```yaml title="ubuntu-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-system-disk
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  optical: false
  storage: 20Gi
  storageClass: "replicated"
```

#### **Disque de Données**
```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: application-data
spec:
  source: {}  # Disque vide
  optical: false
  storage: 500Gi
  storageClass: "replicated"
```

#### **ISO d'Installation**
```yaml title="ubuntu-iso.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-server-iso
spec:
  source:
    http:
      url: "https://releases.ubuntu.com/22.04/ubuntu-22.04.4-live-server-amd64.iso"
  optical: true  # Disque optique
  storage: 2Gi
  storageClass: "replicated"
```



---

## 🔧 Gestion des Ressources

### **Classes de Stockage**

| **Classe** | **Description** | **Réplication** | 
|------------|-----------------|-----------------|
| `local` | Stockage local sur le nœud | ❌ |
| `replicated` | Stockage répliqué 3x | ✅ |

### **Méthodes d'Exposition**

| **Méthode** | **Description** | **Usage** | **Firewall** |
|-------------|-----------------|-----------|--------------|
| `PortList` | Exposition avec liste de ports contrôlée | Exposition sélective via IP dédiée | ✅ Ports spécifiés uniquement |
| `WholeIP` | IP publique complète pour la VM | Accès direct complet | ❌ Aucune protection réseau |

#### **Détails des Méthodes**

**🔒 PortList**
- **Sécurité** : Firewall automatique - seuls les ports dans `externalPorts` sont accessibles
- **Configuration** : Requiert `externalPorts` pour spécifier les ports autorisés
- **Usage recommandé** : Production, environnements sécurisés, applications web
- **Exemple** : `externalMethod: PortList` + `externalPorts: [22, 80, 443]`

**🌍 WholeIP**  
- **Sécurité** : Aucune protection - tous les ports TCP/UDP sont accessibles depuis Internet
- **Configuration** : `externalPorts` ignoré et inutile (tous les ports sont ouverts)
- **Usage recommandé** : Développement, debug, accès administratif complet
- **Exemple** : `externalMethod: WholeIP` (sans `externalPorts`)

:::warning Sécurité WholeIP ⚠️
Avec `WholeIP`, votre VM est entièrement exposée sur Internet. Configurez impérativement un firewall dans l'OS (UFW, iptables) pour sécuriser l'accès.
:::

---

## 📋 Exemples Complets

### **VM de Production avec Données**

```yaml title="production-complete.yaml"
---
# Disque système
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: prod-system
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  optical: false
  storage: 50Gi
  storageClass: "replicated"

---
# Disque données
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: prod-data
spec:
  source: {}
  optical: false
  storage: 200Gi
  storageClass: "replicated"

---
# Machine virtuelle
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: vm-production
spec:
  external: true
  externalMethod: PortList
  externalPorts:
    - 22    # SSH
    - 80    # HTTP
    - 443   # HTTPS
  running: true
  instanceType: "u1.2xlarge"  # 8 vCPU, 32 GB RAM
  instanceProfile: "ubuntu"
  disks:
    - prod-system
    - prod-data
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... admin@company.com"
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..."
    
    packages:
      - nginx
      - certbot
      - htop
    
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
      - ufw allow ssh
      - ufw allow http
      - ufw allow https
      - ufw --force enable
```
---

## ⚠️ Bonnes Pratiques

### **Sécurité**
- Utilisez toujours des **clés SSH** plutôt que des mots de passe
- Activez le **firewall UFW** avec règles restrictives par défaut

### **Stockage**
- Utilisez `replicated` pour les **environnements de production**
- Prévoyez de l'espace supplémentaire pour les **logs et données temporaires**
- Configurez des **snapshots réguliers** pour les sauvegardes

### **Performance**
- Choisissez le **type d'instance approprié** selon votre workload
- Surveillez l'utilisation via `kubectl top pod`
- Adaptez les ressources selon les besoins réels

### **Monitoring**
- Surveillez les métriques des VMs via Kubernetes
- Gardez un historique des performances pour l'optimisation

---

:::tip Architecture Recommandée
Pour la production, utilisez au minimum 2 disques séparés (système + données) avec la classe `replicated` pour garantir la haute disponibilité.
:::



