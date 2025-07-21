---
sidebar_position: 3
title: Référence API - Virtual Machines
---

# API Reference - Machines Virtuelles

Cette référence complète détaille les APIs **VMInstance** et **VMDisk** d'Hikube, leurs paramètres, exemples d'usage et bonnes pratiques.

---

## 🖥️ VMInstance

### **Vue d'ensemble**

L'API `VMInstance` permet de créer et gérer des machines virtuelles dans Hikube. Basée sur KubeVirt, elle offre une intégration native avec Kubernetes.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMInstance
metadata:
  name: example-vm
  namespace: default
spec:
  # Configuration détaillée ci-dessous
```

### **Spécification Complète**

#### **Paramètres Généraux**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `external` | `boolean` | Active l'accès externe depuis l'extérieur du cluster | `false` | Non |
| `externalPorts` | `array` | Liste des ports à exposer externellement | `[]` | Non |
| `running` | `boolean` | État de fonctionnement souhaité de la VM | `true` | Non |
| `instanceType` | `string` | Type d'instance définissant CPU/Memory | `u1.medium` | Non |
| `instanceProfile` | `string` | Profil OS prédéfini pour la VM | `ubuntu` | Non |

#### **Configuration Réseau**

```yaml
spec:
  external: true
  externalPorts:
    - port: 22          # Port SSH
      protocol: TCP
    - port: 80          # Port HTTP  
      protocol: TCP
    - port: 443         # Port HTTPS
      protocol: TCP
```

**Options `externalPorts` :**
- `port` : Numéro de port (1-65535)
- `protocol` : TCP ou UDP
- `targetPort` : Port interne (optionnel, par défaut = port)

#### **Types d'Instances**

##### **Série U (Universal) - Shared CPU**
Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
# Instances disponibles
instanceType: "u1.small"    # 1 vCPU, 4 GB RAM
instanceType: "u1.medium"   # 2 vCPU, 8 GB RAM  
instanceType: "u1.large"    # 4 vCPU, 16 GB RAM
instanceType: "u1.xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.2xlarge"  # 16 vCPU, 64 GB RAM
```

##### **Série CX (Compute Optimized) - Dedicated CPU**
Optimisée pour calcul intensif avec CPU dédié et NUMA.

```yaml
# Instances disponibles  
instanceType: "cx1.medium"   # 2 vCPU, 4 GB RAM
instanceType: "cx1.large"    # 4 vCPU, 8 GB RAM
instanceType: "cx1.xlarge"   # 8 vCPU, 16 GB RAM
instanceType: "cx1.2xlarge"  # 16 vCPU, 32 GB RAM
instanceType: "cx1.4xlarge"  # 32 vCPU, 64 GB RAM
```

##### **Série M (Memory Optimized) - High Memory**
Optimisée pour applications nécessitant beaucoup de mémoire.

```yaml
# Instances disponibles
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
```

##### **Série RT (Real-Time) - Real-Time**
Pour applications temps réel avec garanties strictes.

```yaml
# Instances disponibles
instanceType: "rt1.medium"   # 2 vCPU, 8 GB RAM
instanceType: "rt1.large"    # 4 vCPU, 16 GB RAM
instanceType: "rt1.xlarge"   # 8 vCPU, 32 GB RAM
```

#### **Profils d'OS**

Hikube supporte de nombreux profils OS prédéfinis :

```yaml
# Linux
instanceProfile: "ubuntu"       # Ubuntu LTS
instanceProfile: "centos-stream" # CentOS Stream
instanceProfile: "rhel"         # Red Hat Enterprise Linux  
instanceProfile: "fedora"       # Fedora
instanceProfile: "opensuse"     # openSUSE
instanceProfile: "alpine"       # Alpine Linux
instanceProfile: "cirros"       # Cirros (tests)

# Windows
instanceProfile: "windows-10"   # Windows 10
instanceProfile: "windows-11"   # Windows 11  
instanceProfile: "windows-server-2022" # Windows Server 2022
```

#### **Configuration du Stockage**

```yaml
spec:
  disks:
    - name: "root-disk"           # Nom du disque
      size: "20Gi"               # Taille 
      storageClass: "replicated" # Classe de stockage
    - name: "data-disk"          # Disque additionnel
      size: "100Gi"
      storageClass: "local"
```

**Classes de Stockage :**
- `replicated` : Stockage répliqué haute disponibilité
- `local` : Stockage local haute performance
- `nfs` : Stockage réseau NFS

#### **Ressources Personnalisées**

```yaml
spec:
  resources:
    cpu: "4"        # Nombre de vCPUs
    memory: "8Gi"   # Quantité de RAM
    # Override des instanceType prédéfinis
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
  name: production-web-server
  namespace: production
  labels:
    app: web-server
    environment: production
spec:
  # Accès externe activé
  external: true
  externalPorts:
    - port: 22
      protocol: TCP
    - port: 80
      protocol: TCP
    - port: 443
      protocol: TCP
  
  # VM en fonctionnement
  running: true
  
  # Instance haute performance
  instanceType: "cx1.large"  # 4 vCPU, 8 GB RAM dédié
  instanceProfile: "ubuntu"
  
  # Stockage multiple
  disks:
    - name: "root-disk"
      size: "50Gi"
      storageClass: "replicated"
    - name: "app-data"
      size: "200Gi" 
      storageClass: "local"
  
  # Clés SSH multiples
  sshKeys:
    - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... admin@company.com"
    - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... deploy@ci.company.com"
  
  # Configuration automatisée
  cloudInit: |
    #cloud-config
    users:
      - name: admin
        sudo: ALL=(ALL) NOPASSWD:ALL
        shell: /bin/bash
        ssh_authorized_keys:
          - "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... admin@company.com"
      - name: deploy
        sudo: ["ALL=(ALL) NOPASSWD: /usr/bin/systemctl"]
        shell: /bin/bash
        ssh_authorized_keys:
          - "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... deploy@ci.company.com"
    
    packages:
      - nginx
      - htop
      - iotop
      - ncdu
      - fail2ban
      - ufw
    
    write_files:
      - path: /etc/nginx/sites-available/default
        content: |
          server {
              listen 80;
              location / {
                  return 200 'Hello from Hikube VM!';
                  add_header Content-Type text/plain;
              }
          }
    
    runcmd:
      - systemctl enable nginx
      - systemctl start nginx
      - ufw allow 22
      - ufw allow 80
      - ufw allow 443
      - echo y | ufw enable
      - echo "Production VM ready!" > /var/log/hikube-setup.log
    
    final_message: "Production VM déployée avec succès en $UPTIME secondes"
```

---

## 💾 VMDisk

### **Vue d'ensemble**

L'API `VMDisk` gère les disques virtuels utilisés par les machines virtuelles. Elle supporte diverses sources d'images et options de stockage.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: example-disk
  namespace: default
spec:
  # Configuration détaillée ci-dessous
```

### **Spécification Complète**

#### **Paramètres Principaux**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `source` | `object` | Source de l'image disque | `{}` | Non |
| `optical` | `boolean` | Disque optique (ISO/CD-ROM) | `false` | Non |
| `storage` | `string` | Taille du disque | `5Gi` | Non |
| `storageClass` | `string` | Classe de stockage | `replicated` | Non |

#### **Sources d'Images**

##### **Source HTTP/HTTPS**
```yaml
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
      # Options avancées
      headers:
        Authorization: "Bearer token123"
      checksum: "sha256:abc123..."
```

##### **Source Registry (Container)**
```yaml
spec:
  source:
    registry:
      url: "docker://quay.io/kubevirt/cirros-container-disk-demo"
```

##### **Source PVC Existant**
```yaml
spec:
  source:
    pvc:
      name: "source-disk"
      namespace: "default"
```

##### **Source Snapshot**
```yaml
spec:
  source:
    snapshot:
      name: "vm-snapshot-123"
      namespace: "default"
```

##### **Disque Vide**
```yaml
spec:
  source: {}  # Crée un disque vide
```

#### **Types de Disques**

##### **Disque Standard**
```yaml
spec:
  optical: false    # Disque dur standard
  storage: "20Gi"
  storageClass: "replicated"
```

##### **Disque Optique (ISO)**
```yaml
spec:
  optical: true     # Disque optique/CD-ROM
  source:
    http:
      url: "https://releases.ubuntu.com/22.04/ubuntu-22.04.3-live-server-amd64.iso"
  storage: "5Gi"
```

#### **Classes de Stockage**

```yaml
# Haute disponibilité (défaut)
storageClass: "replicated"

# Performance locale  
storageClass: "local"

# Stockage réseau
storageClass: "nfs"

# SSD haute performance
storageClass: "fast-ssd"
```

### **Images OS Courantes**

#### **Ubuntu Cloud Images**
```yaml
# Ubuntu 24.04 LTS (Noble)
source:
  http:
    url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"

# Ubuntu 22.04 LTS (Jammy)  
source:
  http:
    url: "https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img"
```

#### **CentOS/RHEL**
```yaml
# CentOS Stream 9
source:
  http:
    url: "https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-latest.x86_64.qcow2"

# Rocky Linux 9
source:
  http:
    url: "https://download.rockylinux.org/pub/rocky/9/images/x86_64/Rocky-9-GenericCloud.latest.x86_64.qcow2"
```

#### **Fedora**
```yaml
# Fedora 40 Cloud
source:
  http:
    url: "https://download.fedoraproject.org/pub/fedora/linux/releases/40/Cloud/x86_64/images/Fedora-Cloud-Base-Generic.x86_64-40-1.14.qcow2"
```

#### **Alpine Linux**
```yaml
# Alpine 3.20
source:
  http:
    url: "https://dl-cdn.alpinelinux.org/alpine/v3.20/releases/cloud/nocloud_alpine-3.20.2-x86_64-bios-tiny-r0.qcow2"
```

#### **Images Spécialisées**
```yaml
# Cirros (tests)
source:
  http:
    url: "https://download.cirros-cloud.net/0.6.2/cirros-0.6.2-x86_64-disk.img"

# Talos Linux (Kubernetes-optimized)
source:
  http:
    url: "https://github.com/siderolabs/talos/releases/download/v1.7.6/nocloud-amd64.raw.xz"
```

### **Exemples VMDisk**

#### **Disque Ubuntu Standard**
```yaml title="ubuntu-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: ubuntu-24-disk
  namespace: default
  labels:
    os: ubuntu
    version: "24.04"
spec:
  source:
    http:
      url: "https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
  optical: false
  storage: 30Gi
  storageClass: "replicated"
```

#### **Disque de Données**
```yaml title="data-disk.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: application-data
  namespace: production
  labels:
    type: data
    app: web-server
spec:
  source: {}  # Disque vide
  optical: false
  storage: 500Gi
  storageClass: "local"  # Performance optimale
```

#### **ISO d'Installation**
```yaml title="windows-iso.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: VMDisk
metadata:
  name: windows-server-2022-iso
  namespace: default
spec:
  source:
    http:
      url: "https://example.com/windows-server-2022.iso"
  optical: true  # Disque optique
  storage: 5Gi
  storageClass: "replicated"
```

---

## 🔧 Gestion et Opérations

### **Commandes kubectl Utiles**

```bash
# Lister les VMs et disques
kubectl get vminstance
kubectl get vmdisk

# Détails d'une VM
kubectl describe vminstance <name>

# Logs d'une VM  
kubectl logs -l kubevirt.io=<vm-name>

# Scale/Stop une VM
kubectl patch vminstance <name> --type merge -p '{"spec":{"running":false}}'

# Supprimer (avec précaution)
kubectl delete vminstance <name>
kubectl delete vmdisk <name>
```

### **Monitoring et Debugging**

```bash
# Événements d'une VM
kubectl get events --field-selector involvedObject.name=<vm-name>

# Métriques temps réel
kubectl top pod -l kubevirt.io=<vm-name>

# Status détaillé
kubectl get vminstance <name> -o yaml

# Accès console pour debug
virtctl console <vm-name>
```

---

## 💡 Bonnes Pratiques

### **Sécurité**
- ✅ Utilisez **toujours** des clés SSH plutôt que mots de passe
- ✅ Configurez **fail2ban** dans cloud-init
- ✅ Activez **UFW** avec règles strictes
- ✅ Mettez à jour régulièrement les images OS

### **Performance**
- ✅ Série **CX** pour workloads compute-intensifs
- ✅ Série **M** pour applications mémoire-intensives  
- ✅ Stockage **local** pour bases de données
- ✅ **Hugepages** pour VMs haute performance

### **Haute Disponibilité**
- ✅ Stockage **replicated** pour données critiques
- ✅ **Anti-affinity** pour VMs redondantes
- ✅ **Snapshots** automatisés réguliers
- ✅ **Monitoring** avec alertes

### **Gestion des Coûts**
- ✅ Série **U** pour workloads non-critiques
- ✅ **Auto-scaling** selon la charge
- ✅ **Arrêt automatique** des VMs de dev/test
- ✅ **Nettoyage** régulier des ressources inutilisées

---

:::tip Ressources Avancées
- [Guide KubeVirt officiel](https://kubevirt.io/user-guide/)
- [Documentation Cloud-Init](https://cloud-init.readthedocs.io/)
- [Virtctl CLI Reference](https://kubevirt.io/user-guide/virtual_machines/accessing_vms/)
:::

:::warning Limitations
- Windows nécessite une licence valide
- GPU passthrough disponible sur demande
- Nested virtualization non supportée par défaut
::: 