---
title: Virtual Machines
---

Les **Virtual Machines (VMs)** offrent des ressources flexibles et personnalisables pour répondre aux besoins variés des applications. Cozystack propose plusieurs séries de VM adaptées à différents scénarios, ainsi que des préférences pour les systèmes d'exploitation invités.

---

## Séries Disponibles

### **U Series**

- **Description** : Conçue pour les applications générales. Les VMs partagent les cœurs physiques sur une base temporelle.
- **Caractéristiques** :
  - **Burstable CPU Performance** : Les performances de calcul peuvent dépasser la limite de base si des ressources supplémentaires sont disponibles.
  - **vCPU-To-Memory Ratio** : 1:4, pour réduire le bruit par nœud.

---

### **O Series**

- **Description** : Basée sur la série U avec une mémoire sur-engagée.
- **Caractéristiques** :
  - **Burstable CPU Performance** : Comme la série U.
  - **Overcommitted Memory** : Permet une densité de charge plus élevée.
  - **vCPU-To-Memory Ratio** : 1:4.

---

### **CX Series**

- **Description** : Fournit des ressources exclusives pour les applications intensives en calcul.
- **Caractéristiques** :
  - **Hugepages** : Amélioration des performances mémoire.
  - **Dedicated CPU** : Chaque vCPU est associé à un cœur physique.
  - **Isolated Emulator Threads** : Réduction de l'impact des threads d'émulation.
  - **vNUMA** : Optimisation de la cache grâce à une topologie NUMA physique.
  - **vCPU-To-Memory Ratio** : 1:2.

---

### **M Series**

- **Description** : Conçue pour les applications gourmandes en mémoire.
- **Caractéristiques** :
  - **Hugepages** : Amélioration des performances mémoire.
  - **Burstable CPU Performance** : Permet des performances variables.
  - **vCPU-To-Memory Ratio** : 1:8.

---

### **RT Series**

- **Description** : Idéal pour les applications en temps réel (ex. : Oslat).
- **Caractéristiques** :
  - **Hugepages** : Optimisation des performances mémoire.
  - **Dedicated CPU** : Garanties élevées de calcul.
  - **Isolated Emulator Threads** : Réduction de l'impact des threads d'émulation.
  - **vCPU-To-Memory Ratio** : 1:4 (à partir de la taille médium).

---

## Ressources Disponibles

### **Types d'Instances**

| **Nom**       | **vCPUs** | **Mémoire** |
|---------------|-----------|-------------|
| `cx1.medium`  | 1         | 2Gi         |
| `cx1.large`   | 2         | 4Gi         |
| `cx1.xlarge`  | 4         | 8Gi         |
| `cx1.2xlarge` | 8         | 16Gi        |
| `cx1.4xlarge` | 16        | 32Gi        |
| `cx1.8xlarge` | 32        | 64Gi        |
| `m1.large`    | 2         | 16Gi        |
| `m1.xlarge`   | 4         | 32Gi        |
| `m1.2xlarge`  | 8         | 64Gi        |
| `m1.4xlarge`  | 16        | 128Gi       |
| `m1.8xlarge`  | 32        | 256Gi       |
| …             | …         | …           |

(Consultez la documentation complète pour plus de types d'instances.)

---

### **Systèmes d’Exploitation Invités**

| **Nom**                  | **Description**                           |
|--------------------------|-------------------------------------------|
| `ubuntu`                 | Ubuntu                                   |
| `fedora`                 | Fedora (amd64)                           |
| `centos.stream9`         | CentOS Stream 9                          |
| `rhel.9`                 | Red Hat Enterprise Linux 9 (amd64)       |
| `windows.11`             | Microsoft Windows 11                     |
| `windows.2k22.virtio`    | Microsoft Windows Server 2022 (virtio)   |
| `alpine`                 | Alpine                                   |
| `cirros`                 | Cirros                                   |
| …                        | …                                        |

(Consultez la documentation complète pour les options avancées.)

---

## Exemple de Configuration

Voici un exemple de configuration YAML pour une VM utilisant une instance de type CX avec Ubuntu comme système d'exploitation :

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: VirtualMachine
metadata:
  name: vm-example
spec:
  instanceType: "cx1.xlarge"
  guestOS: "ubuntu"
  disks:
    - name: "root-disk"
      size: "20Gi"
      storageClass: "replicated"
  networks:
    - name: "default"
      type: "bridge"
```

---

## Ressources Additionnelles

- **[Documentation Ubuntu Cloud Images](https://cloud-images.ubuntu.com/)**  
  Guide pour les images cloud Ubuntu.
- **[Documentation Fedora](https://getfedora.org/)**  
  Informations sur Fedora pour le cloud.
- **[Documentation HAProxy](https://www.haproxy.com/documentation/)**  
  Guide complet sur HAProxy.
- **[Documentation officielle Red Hat](https://www.redhat.com/)**  
  Références sur les systèmes Red Hat.
