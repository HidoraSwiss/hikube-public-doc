---
sidebar_position: 1
title: Terraform avec Hikube
---

# Infrastructure as Code avec Hikube

Hikube étant basé sur Kubernetes, vous pouvez utiliser **Terraform** pour gérer votre infrastructure de manière déclarative et reproductible. Cette approche vous permet de versionner, tester et déployer votre infrastructure Hikube de façon automatisée.

---

## Configuration

### Prérequis

- [Terraform](https://www.terraform.io/downloads) (version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Accès à un tenant Hikube
- Kubeconfig configuré

### Provider Kubernetes

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

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "kubectl" {
  config_path = "~/.kube/config"
}
```

### Variables

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

## Exemples

### Déployer un Cluster Kubernetes

```hcl title="kubernetes.tf"
resource "kubectl_manifest" "kubernetes_cluster" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Kubernetes"
    metadata = {
      name      = var.cluster_name
      namespace = "default"
    }
    spec = {
      controlPlane = {
        replicas = 2
      }
      
      nodeGroups = {
        general = {
          minReplicas      = 1
          maxReplicas      = 5
          instanceType     = "s1.large"
          ephemeralStorage = "50Gi"
          roles = ["ingress-nginx"]
        }
      }
      
      storageClass = "replicated"
      
      addons = {
        certManager = {
          enabled = true
        }
        ingressNginx = {
          enabled = true
          hosts = [
            "${var.cluster_name}.example.com"
          ]
        }
      }
    }
  })
}

# Récupérer le kubeconfig
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  metadata {
    name      = "${var.cluster_name}-admin-kubeconfig"
    namespace = "default"
  }
}

# Sauvegarder le kubeconfig
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  file_permission = "0600"
}
```

### Déployer une Machine Virtuelle

```hcl title="virtual-machine.tf"
resource "kubectl_manifest" "virtual_machine" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VirtualMachine"
    metadata = {
      name = var.vm_name
    }
    spec = {
      running         = true
      instanceProfile = "ubuntu"
      instanceType    = "u1.xlarge"
      
      systemDisk = {
        size         = "50Gi"
        storageClass = "replicated"
      }
      
      external       = true
      externalMethod = "PortList"
      externalPorts  = [22, 80, 443]
      
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

### Déployer une VM avec GPU

```hcl title="vm-gpu.tf"
resource "kubectl_manifest" "vm_gpu" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VirtualMachine"
    metadata = {
      name = "gpu-vm"
    }
    spec = {
      running         = true
      instanceProfile = "ubuntu"
      instanceType    = "u1.xlarge"
      
      gpus = [
        {
          name = "nvidia.com/AD102GL_L40S"
        }
      ]
      
      systemDisk = {
        size         = "100Gi"
        storageClass = "replicated"
      }
      
      external       = true
      externalMethod = "PortList"
      externalPorts  = [22, 8888]
      
      sshKeys = [var.ssh_public_key]
      
      cloudInit = <<-EOT
        #cloud-config
        users:
          - name: ubuntu
            sudo: ALL=(ALL) NOPASSWD:ALL
            shell: /bin/bash
        
        package_update: true
        packages:
          - curl
          - wget
          - build-essential
        
        runcmd:
          # Installation pilotes NVIDIA
          - wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
          - dpkg -i cuda-keyring_1.0-1_all.deb
          - apt-get update
          - apt-get install -y cuda-toolkit nvidia-driver-535
          - nvidia-smi -pm 1
      EOT
    }
  })
}
```

### Déployer PostgreSQL

```hcl title="postgresql.tf"
resource "kubectl_manifest" "postgres" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Postgres"
    metadata = {
      name = "terraform-postgres"
    }
    spec = {
      external     = false
      size         = "20Gi"
      replicas     = 2
      storageClass = "replicated"
      
      users = {
        admin = {
          password = var.postgres_password
        }
      }
      
      databases = {
        myapp = {
          roles = {
            admin = ["admin"]
          }
        }
      }
    }
  })
}

variable "postgres_password" {
  description = "Password for PostgreSQL admin user"
  type        = string
  sensitive   = true
}
```

---

## Outputs et Variables

### Outputs utiles

```hcl title="outputs.tf"
output "cluster_kubeconfig" {
  description = "Chemin vers le kubeconfig du cluster"
  value       = local_file.kubeconfig.filename
}

output "vm_status" {
  description = "Commande pour vérifier le statut de la VM"
  value       = "kubectl get virtualmachine ${var.vm_name}"
}

output "postgres_connection" {
  description = "Commande pour se connecter à PostgreSQL"
  value       = "kubectl exec -it postgres-terraform-postgres-0 -- psql -U admin -d myapp"
  sensitive   = true
}
```

### Fichier terraform.tfvars

```hcl title="terraform.tfvars"
# Configuration de base
cluster_name = "my-prod-cluster"
vm_name      = "my-app-vm"

# Votre clé SSH publique
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@hostname"

# Mot de passe PostgreSQL
postgres_password = "your-secure-password-here"
```

---

## Bonnes Pratiques

### Structure de projet

```
hikube-terraform/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
├── modules/
│   ├── kubernetes/
│   ├── vm/
│   └── database/
└── shared/
    ├── variables.tf
    └── outputs.tf
```

### Commandes utiles

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

---

## Références

- [Provider Kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [Provider kubectl](https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs)
- [Documentation Terraform](https://developer.hashicorp.com/terraform/docs)