---
sidebar_position: 1
title: Terraform avec Kubernetes
---

# 🏗️ Terraform avec Kubernetes sur Hikube

Utilisez **Terraform** pour automatiser le déploiement et la gestion de vos ressources Hikube via l'API. Cette approche **Infrastructure as Code** vous permet de gérer clusters Kubernetes et VMs de manière déclarative et versionnée.

---

## 🚀 Configuration Terraform

### **Provider Kubernetes**

Configurez le provider Kubernetes pour Terraform :

```hcl title="main.tf"
terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14"
    }
  }
}

# Configuration du provider Kubernetes
provider "kubernetes" {
  config_path = "~/.kube/config"  # Votre kubeconfig Hikube
  # Ou utiliser config_context pour un contexte spécifique
  # config_context = "hikube-context"
}

# Provider kubectl pour les ressources CRD
provider "kubectl" {
  config_path = "~/.kube/config"
}
```

### **Variables Terraform**

```hcl title="variables.tf"
variable "ssh_public_key" {
  description = "Clé SSH publique pour l'accès aux VMs"
  type        = string
}

variable "cluster_name" {
  description = "Nom du cluster Kubernetes"
  type        = string
  default     = "terraform-cluster"
}

variable "vm_name" {
  description = "Nom de la machine virtuelle"
  type        = string
  default     = "terraform-vm"
}


```

---

## ☸️ Déployer un Cluster Kubernetes

### **Cluster Kubernetes avec Terraform**

```hcl title="kubernetes-cluster.tf"
resource "kubectl_manifest" "kubernetes_cluster" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Kubernetes"
    metadata = {
      name      = var.cluster_name
      namespace = "default"
    }
    spec = {
      # Configuration du plan de contrôle
      controlPlane = {
        replicas = 2  # Haute disponibilité
      }
      
      # Configuration des nœuds workers
      nodeGroups = {
        general = {
          minReplicas      = 1
          maxReplicas      = 5
          instanceType     = "s1.large"     # 4 vCPU, 8 GB RAM
          ephemeralStorage = "50Gi"
          roles = [
            "ingress-nginx"  # Support Ingress
          ]
        }
      }
      
      # Classe de stockage par défaut
      storageClass = "replicated"
      
      # Add-ons essentiels activés
      addons = {
        certManager = {
          enabled = true
        }
        ingressNginx = {
          enabled = true
          hosts = [
            "${var.cluster_name}.hikube.local"
          ]
        }
      }
    }
  })
}

# Attendre que le cluster soit prêt
resource "kubectl_manifest" "wait_cluster_ready" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  yaml_body = yamlencode({
    apiVersion = "v1"
    kind       = "ConfigMap"
    metadata = {
      name      = "${var.cluster_name}-ready"
      namespace = "default"
    }
    data = {
      status = "waiting"
    }
  })
  
  wait_for_rollout = true
}
```

### **Récupération du Kubeconfig**

```hcl title="kubeconfig.tf"
# Récupérer le kubeconfig du cluster Kubernetes
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  metadata {
    name      = "${var.cluster_name}-admin-kubeconfig"
    namespace = "default"
  }
}

# Sauvegarder le kubeconfig dans un fichier local
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  
  # Permissions restrictives pour la sécurité
  file_permission = "0600"
}

# Output pour utiliser le kubeconfig
output "kubeconfig_path" {
  description = "Chemin vers le fichier kubeconfig"
  value       = local_file.kubeconfig.filename
}

output "kubectl_command" {
  description = "Commande pour utiliser kubectl avec ce cluster"
  value       = "export KUBECONFIG=${local_file.kubeconfig.filename} && kubectl get nodes"
}
```

---

## 🖥️ Déployer des Machines Virtuelles

### **VM Standard avec Terraform**

```hcl title="virtual-machine.tf"
# Disque pour la VM
resource "kubectl_manifest" "vm_disk" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMDisk"
    metadata = {
      name = "${var.vm_name}-disk"
    }
    spec = {
      source = {
        http = {
          url = "https://cloud-images.ubuntu.com/jammy/current/jammy-server-cloudimg-amd64.img"
        }
      }
      optical      = false
      storage      = "20Gi"
      storageClass = "replicated"
    }
  })
}

# Machine virtuelle
resource "kubectl_manifest" "virtual_machine" {
  depends_on = [kubectl_manifest.vm_disk]
  
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMInstance"
    metadata = {
      name = var.vm_name
    }
    spec = {
      external       = true
      externalMethod = "WholeIP"
      externalPorts = [22, 80, 443]
      running        = true
      instanceType   = "u1.xlarge"
      instanceProfile = "ubuntu"
      disks = [
        {
          name = "${var.vm_name}-disk"
        }
      ]
      sshKeys = [var.ssh_public_key]
      cloudInit = <<-EOT
        #cloud-config
        users:
          - name: ubuntu
            sudo: ALL=(ALL) NOPASSWD:ALL
            shell: /bin/bash
            ssh_authorized_keys:
              - ${var.ssh_public_key}
        
        package_update: true
        packages:
          - curl
          - wget
          - git
          - docker.io
        
        runcmd:
          - systemctl enable docker
          - systemctl start docker
          - usermod -aG docker ubuntu
      EOT
    }
  })
}
```

### **Récupérer l'IP de la VM**

```hcl title="vm-outputs.tf"
# Récupérer les informations de la VM
data "kubectl_path_documents" "vm_status" {
  depends_on = [kubectl_manifest.virtual_machine]
  pattern    = "${path.module}/vm-status.yaml"
  vars = {
    vm_name = var.vm_name
  }
}

# Output de l'IP externe
output "vm_external_ip" {
  description = "IP externe de la machine virtuelle"
  value       = "Vérifiez avec: kubectl get vminstance ${var.vm_name} -o jsonpath='{.status.externalIP}'"
}

output "ssh_command" {
  description = "Commande SSH pour se connecter à la VM"
  value       = "ssh ubuntu@$(kubectl get vminstance ${var.vm_name} -o jsonpath='{.status.externalIP}')"
}
```



---

## 🗂️ Structure de Projet Complète

### **Fichier terraform.tfvars**

```hcl title="terraform.tfvars"
# Configuration de base
cluster_name = "my-prod-cluster"
vm_name      = "my-app-vm"

# Votre clé SSH publique
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@hostname"
```

### **Outputs Terraform**

```hcl title="outputs.tf"
output "cluster_info" {
  description = "Informations du cluster Kubernetes"
  value = {
    name           = var.cluster_name
    kubeconfig     = local_file.kubeconfig.filename
    namespace      = "default"
  }
}

output "vm_info" {
  description = "Informations des machines virtuelles"
  value = {
    standard_vm = {
      name = var.vm_name
      type = "VMInstance"
    }
  }
}

output "useful_commands" {
  description = "Commandes utiles"
  value = {
    kubeconfig    = "export KUBECONFIG=${local_file.kubeconfig.filename}"
    check_cluster = "kubectl get kubernetes ${var.cluster_name}"
    check_vms     = "kubectl get vminstance,virtualmachine"
  }
}
```

---

## 🚀 Utilisation et Déploiement

### **Commandes Terraform**

```bash
# Initialiser Terraform
terraform init

# Planifier les changements
terraform plan

# Appliquer la configuration
terraform apply

# Vérifier les ressources créées
terraform show

# Nettoyer les ressources
terraform destroy
```

### **Après le Déploiement**

```bash
# Configurer kubectl pour le nouveau cluster
export KUBECONFIG=./my-prod-cluster-kubeconfig.yaml

# Vérifier les VMs
kubectl get vmi
```

---

## 🔧 Bonnes Pratiques

### **Gestion des États**

```hcl title="backend.tf"
# Option 1: Backend avec Buckets Hikube (recommandé)
terraform {
  backend "s3" {
    bucket   = "my-terraform-state"
    key      = "hikube/terraform.tfstate"
    endpoint = "https://s3.hikube.cloud"  # Endpoint Hikube
    # Hikube utilise des datacenters suisses, pas de régions AWS
    skip_region_validation      = true
    skip_credentials_validation = true
    force_path_style           = true
  }
}

# Option 2: Backend HTTP (alternative)
# terraform {
#   backend "http" {
#     address = "https://api.hikube.cloud/terraform/state"
#     lock_address = "https://api.hikube.cloud/terraform/lock"
#     unlock_address = "https://api.hikube.cloud/terraform/unlock"
#   }
# }

# Option 3: Backend local (développement uniquement)
# terraform {
#   backend "local" {
#     path = "./terraform.tfstate"
#   }
# }
```

### **Modules Terraform**

```hcl title="modules/hikube-cluster/main.tf"
# Module réutilisable pour cluster Hikube
variable "cluster_config" {
  type = object({
    name         = string
    node_groups  = map(any)
    addons       = map(bool)
  })
}

resource "kubectl_manifest" "cluster" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Kubernetes"
    metadata = {
      name = var.cluster_config.name
    }
    spec = var.cluster_config
  })
}
```

### **Validation et Sécurité**

```hcl
# Données sensibles
variable "ssh_private_key" {
  description = "Clé privée SSH (sensible)"
  type        = string
  sensitive   = true
}
```

---

## 📚 Ressources Avancées

### **Integration avec CI/CD**

```yaml title=".github/workflows/terraform.yml"
name: 'Terraform Hikube'

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Terraform
      uses: hashicorp/setup-terraform@v2
      with:
        terraform_version: 1.6.0
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > ~/.kube/config
    
    - name: Terraform Init
      run: terraform init
    
    - name: Terraform Plan
      run: terraform plan
    
    - name: Terraform Apply
      if: github.ref == 'refs/heads/main'
      run: terraform apply -auto-approve
```

:::tip Terraform + Hikube 🚀
Terraform avec Hikube vous permet de gérer votre infrastructure cloud-native de manière déclarative, versionnée et reproductible !
:::

:::warning Sécurité 🔒
Toujours stocker vos clés SSH et kubeconfigs de manière sécurisée. Utilisez des backends distants pour l'état Terraform en production.
:::

---