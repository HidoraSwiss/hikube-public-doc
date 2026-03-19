---
sidebar_position: 1
title: Terraform mit Hikube
---

# Infrastructure as Code mit Hikube

Da Hikube auf Kubernetes basiert, können Sie **Terraform** verwenden, um Ihre Infrastruktur deklarativ und reproduzierbar zu verwalten. Dieser Ansatz ermöglicht es Ihnen, Ihre Hikube-Infrastruktur automatisiert zu versionieren, zu testen und bereitzustellen.

---

## Konfiguration

### Voraussetzungen

- [Terraform](https://www.terraform.io/downloads) (Version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Zugang zu einem Hikube-Tenant
- Konfigurierte Kubeconfig

### Kubernetes-Provider

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

### Variablen

```hcl title="variables.tf"
variable "ssh_public_key" {
  description = "Öffentlicher SSH-Schlüssel für den VM-Zugang"
  type        = string
}

variable "cluster_name" {
  description = "Name des Kubernetes-Clusters"
  type        = string
  default     = "terraform-cluster"
}

variable "vm_name" {
  description = "Name der virtuellen Maschine"
  type        = string
  default     = "terraform-vm"
}
```

---

## Beispiele

### Kubernetes-Cluster bereitstellen

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

# Kubeconfig abrufen
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]

  metadata {
    name      = "${var.cluster_name}-admin-kubeconfig"
    namespace = "default"
  }
}

# Kubeconfig speichern
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  file_permission = "0600"
}
```

### Virtuelle Maschine bereitstellen

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

### VM mit GPU bereitstellen

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
          # NVIDIA-Treiber installieren
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

### PostgreSQL bereitstellen

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
  description = "Passwort für den PostgreSQL-Admin-Benutzer"
  type        = string
  sensitive   = true
}
```

---

## Outputs und Variablen

### Nützliche Outputs

```hcl title="outputs.tf"
output "cluster_kubeconfig" {
  description = "Pfad zur Kubeconfig des Clusters"
  value       = local_file.kubeconfig.filename
}

output "vm_status" {
  description = "Befehl zur Überprüfung des VM-Status"
  value       = "kubectl get virtualmachine ${var.vm_name}"
}

output "postgres_connection" {
  description = "Befehl zur Verbindung mit PostgreSQL"
  value       = "kubectl exec -it postgres-terraform-postgres-0 -- psql -U admin -d myapp"
  sensitive   = true
}
```

### Datei terraform.tfvars

```hcl title="terraform.tfvars"
# Grundkonfiguration
cluster_name = "my-prod-cluster"
vm_name      = "my-app-vm"

# Ihr öffentlicher SSH-Schlüssel
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@hostname"

# PostgreSQL-Passwort
postgres_password = "your-secure-password-here"
```

---

## Best Practices

### Projektstruktur

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

### Nützliche Befehle

```bash
# Terraform initialisieren
terraform init

# Änderungen planen
terraform plan

# Konfiguration anwenden
terraform apply

# Erstellte Ressourcen überprüfen
terraform show

# Ressourcen bereinigen
terraform destroy
```

---

## Referenzen

- [Provider Kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [Provider kubectl](https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs)
- [Terraform-Dokumentation](https://developer.hashicorp.com/terraform/docs)
