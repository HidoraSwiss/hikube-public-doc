---
title: Machines Virtuelles sur Hikube
---

# Machines Virtuelles - Compute managé

Les **Machines Virtuelles** sur Hikube offrent une infrastructure de calcul flexible et performante, basée sur KubeVirt. Ce service vous permet de déployer et gérer des machines virtuelles dans un environnement Kubernetes natif.

---

## Qu'est-ce que les Machines Virtuelles ?

Les Machines Virtuelles sur Hikube sont des instances de calcul isolées qui s'exécutent sur l'infrastructure Kubernetes. Elles offrent la flexibilité des VMs traditionnelles avec la puissance de l'orchestration Kubernetes.

### Avantages sur Hikube

- **🚀 Performance** : Accès direct au matériel avec KubeVirt
- **🔧 Flexibilité** : Support de multiples OS et configurations
- **📈 Scalabilité** : Création et destruction automatiques
- **🔒 Isolation** : Séparation complète des environnements
- **💾 Persistance** : Stockage persistant intégré
- **🌐 Réseau** : Intégration native avec les réseaux Kubernetes

### Cas d'usage

- **Applications legacy** : Migration d'applications existantes
- **Environnements de test** : Développement et staging
- **Workloads spécialisés** : Applications nécessitant un OS spécifique
- **Isolation** : Séparation des environnements critiques
- **GPU Computing** : Workloads nécessitant des GPU

---

## Architecture

```
┌─────────────────────────────────────┐
│         Application Layer           │
├─────────────────────────────────────┤
│         Kubernetes API              │
├─────────────────────────────────────┤
│  KubeVirt Controller │ VM Pods     │
├─────────────────────────────────────┤
│         Hypervisor (KVM)           │
├─────────────────────────────────────┤
│         Hardware Layer              │
└─────────────────────────────────────┘
```

### Composants

- **KubeVirt** : Extension Kubernetes pour les VMs
- **Virt-Controller** : Gestionnaire de VMs
- **Virt-Handler** : Agent sur chaque node
- **Virt-Launcher** : Pod qui héberge la VM
- **Hypervisor** : KVM pour la virtualisation

---

## Types d'instances

### Instance Types disponibles

| **Type**      | **CPU** | **RAM** | **Stockage** | **Usage** |
|---------------|---------|---------|--------------|-----------|
| `cx1.medium`  | 2 vCPU  | 4 GB    | 20 GB        | Développement |
| `cx1.large`   | 4 vCPU  | 8 GB    | 40 GB        | Production légère |
| `cx1.xlarge`  | 8 vCPU  | 16 GB   | 80 GB        | Production |
| `m1.large`    | 4 vCPU  | 8 GB    | 40 GB        | Mémoire optimisée |
| `m1.xlarge`   | 8 vCPU  | 16 GB   | 80 GB        | Mémoire optimisée |
| `m1.2xlarge`  | 16 vCPU | 32 GB   | 160 GB       | Mémoire optimisée |

### Systèmes d'exploitation supportés

- **Ubuntu** : 20.04 LTS, 22.04 LTS
- **CentOS** : 7, 8, Stream
- **Debian** : 11, 12
- **Windows** : Server 2019, Server 2022
- **Custom** : Images personnalisées

---

## Fonctionnalités

### Gestion des ressources

- **CPU** : Allocation dynamique et dédiée
- **RAM** : Mémoire dédiée et swap configurable
- **Stockage** : Disques persistants et éphémères
- **Réseau** : Interfaces multiples et isolation

### Réseau et connectivité

- **Bridge** : Connexion directe au réseau
- **Overlay** : Réseau virtuel isolé
- **Load Balancer** : Distribution de charge
- **VPN** : Connexions sécurisées

### Stockage

- **Disques persistants** : Données permanentes
- **Disques éphémères** : Stockage temporaire
- **Snapshots** : Sauvegardes instantanées
- **Cloning** : Copie rapide de VMs

### Monitoring et métriques

- **CPU Usage** : Utilisation des processeurs
- **Memory Usage** : Utilisation de la mémoire
- **Network I/O** : Trafic réseau
- **Disk I/O** : Activité disque
- **Custom Metrics** : Métriques personnalisées

---

## Comparaison avec d'autres solutions

| Fonctionnalité | VMs Hikube | AWS EC2 | GCP Compute | Azure VM |
|----------------|-------------|---------|-------------|----------|
| **Intégration K8s** | ✅ Native | ⚠️ Partielle | ⚠️ Partielle | ⚠️ Partielle |
| **Setup** | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané | ⚡ Instantané |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Variable | 💰 Variable |
| **Réseau** | 🌐 K8s natif | 🌐 VPC | 🌐 VPC | 🌐 VNet |
| **Stockage** | 💾 K8s PV | 💾 EBS | 💾 PD | 💾 Managed Disk |
| **Monitoring** | 📊 Intégré | 📊 CloudWatch | 📊 Cloud Monitoring | 📊 Azure Monitor |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

Les VMs s'intègrent parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Services** : Découverte de service
- **Ingress** : Exposition des services
- **Secrets** : Gestion sécurisée des credentials

### Stockage

Intégration avec les services de stockage :

- **Buckets** : Sauvegardes et archives
- **PostgreSQL** : Bases de données
- **Redis** : Cache et sessions
- **Monitoring** : Métriques et alertes

### Réseau

Connectivité avec les services réseau :

- **VPN** : Connexions sécurisées
- **Load Balancers** : Distribution de charge
- **DNS** : Résolution de noms
- **Firewall** : Sécurité réseau

---

## Exemples d'usage

### Développement

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: dev-vm
spec:
  running: true
  template:
    spec:
      domain:
        devices:
          disks:
          - name: containerdisk
            disk: {}
          - name: cloudinitdisk
            disk: {}
        resources:
          requests:
            memory: 4Gi
            cpu: 2
          limits:
            memory: 4Gi
            cpu: 2
      volumes:
      - name: containerdisk
        containerDisk:
          image: ubuntu:20.04
      - name: cloudinitdisk
        cloudInitNoCloud:
          userData: |
            #cloud-config
            password: password
            chpasswd: 
              expire: False
```

### Production

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: prod-vm
spec:
  running: true
  template:
    spec:
      domain:
        devices:
          disks:
          - name: rootdisk
            disk: {}
          - name: datadisk
            disk: {}
          interfaces:
          - name: default
            bridge: {}
        resources:
          requests:
            memory: 16Gi
            cpu: 8
          limits:
            memory: 16Gi
            cpu: 8
      volumes:
      - name: rootdisk
        persistentVolumeClaim:
          claimName: prod-vm-root
      - name: datadisk
        persistentVolumeClaim:
          claimName: prod-vm-data
```

### GPU Computing

```yaml
apiVersion: kubevirt.io/v1
kind: VirtualMachine
metadata:
  name: gpu-vm
spec:
  running: true
  template:
    spec:
      domain:
        devices:
          disks:
          - name: containerdisk
            disk: {}
          gpus:
          - deviceName: nvidia.com/gpu
            name: gpu1
        resources:
          requests:
            memory: 32Gi
            cpu: 16
            nvidia.com/gpu: 1
          limits:
            memory: 32Gi
            cpu: 16
            nvidia.com/gpu: 1
```

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Créez votre première VM en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants
5. **[GPU Computing](gpu/)** : Utilisation des GPU 