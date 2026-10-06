---
sidebar_position: 1
title: Terraform (Legacy)
---

# Infrastructure as Code mit Hikube (Legacy)

:::danger Eingestellte Methode
Diese Methode steuerte Hikube über eine Projekt-kubeconfig und Kubernetes-Manifeste. Die Projekt-kubeconfig ist **nicht mehr verfügbar**: Diese Methode funktioniert nicht mehr. Diese Seite bleibt zu Referenzzwecken erhalten.
:::

:::info Automatisierung: die öffentliche API
Um die Verwaltung Ihrer Ressourcen zu automatisieren, verwenden Sie die [öffentliche Hikube-API](../../api/overview) mit [API-Schlüsseln](../../api/authentication), die einem Projekt zugeordnet sind; sie befindet sich derzeit in der Vorschau. Ein eigener Terraform-Provider auf Basis dieser API ist in Planung. Für die manuelle Verwaltung Ihrer Ressourcen verwenden Sie die [Hikube-Konsole](https://console.hikube.cloud).
:::

Sie können **Terraform** verwenden, um Ihre Hikube-Infrastruktur deklarativ und reproduzierbar über die Kubernetes-Provider zu verwalten.

---

## Konfiguration

### Voraussetzungen

- **Eine Projekt-kubeconfig.** Sie ist nicht mehr verfügbar: siehe den Hinweis am Anfang der Seite.
- [Terraform](https://www.terraform.io/downloads) (version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

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
  description = "Öffentlicher SSH-Schlüssel für den Zugriff auf die VMs"
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

### Einen Kubernetes-Cluster bereitstellen

```hcl title="kubernetes.tf"
resource "kubectl_manifest" "kubernetes_cluster" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Kubernetes"
    metadata = {
      name = var.cluster_name
    }
    spec = {
      version      = "v1.34"
      storageClass = "replicated"

      controlPlane = {
        replicas = 2
      }

      nodeGroups = {
        general = {
          minReplicas      = 1
          maxReplicas      = 5
          instanceType     = "s1.large"
          ephemeralStorage = "50Gi"
          roles            = ["ingress-nginx"]
        }
        # Beispiel für eine GPU-Gruppe (erfordert das Addon gpuOperator unten)
        # gpu = {
        #   minReplicas      = 0
        #   maxReplicas      = 4
        #   instanceType     = "u1.2xlarge"
        #   ephemeralStorage = "200Gi"
        #   gpus             = [{ name = "nvidia.com/AD102GL_L40S" }]
        #   roles            = []
        # }
      }

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
        # Erforderlich, um die GPUs den Pods einer GPU-Node-Gruppe bereitzustellen
        # gpuOperator = {
        #   enabled = true
        # }
      }
    }
  })
}

# kubeconfig abrufen
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  metadata {
    name = "kubernetes-${var.cluster_name}-admin-kubeconfig"
  }
}

# kubeconfig speichern
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  file_permission = "0600"
}
```

### Eine virtuelle Maschine bereitstellen

```hcl title="virtual-machine.tf"
# Die Disk ist eine eigene VMDisk-Ressource, auf die die VM verweist
resource "kubectl_manifest" "vm_disk" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMDisk"
    metadata = {
      name = "${var.vm_name}-disk"
    }
    spec = {
      source = {
        image = {
          name = "ubuntu-2404"
        }
      }
      storage      = "50Gi"
      storageClass = "replicated"
    }
  })
}

resource "kubectl_manifest" "virtual_machine" {
  depends_on = [kubectl_manifest.vm_disk]

  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMInstance"
    metadata = {
      name = var.vm_name
    }
    spec = {
      runStrategy     = "Always"
      instanceProfile = "ubuntu"
      instanceType    = "u1.xlarge"

      disks = [
        {
          name = "${var.vm_name}-disk"
        }
      ]

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

### Eine VM mit GPU bereitstellen

```hcl title="vm-gpu.tf"
resource "kubectl_manifest" "vm_gpu_disk" {
  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMDisk"
    metadata = {
      name = "gpu-vm-disk"
    }
    spec = {
      source = {
        image = {
          name = "ubuntu-2404"
        }
      }
      storage      = "100Gi"
      storageClass = "replicated"
    }
  })
}

resource "kubectl_manifest" "vm_gpu" {
  depends_on = [kubectl_manifest.vm_gpu_disk]

  yaml_body = yamlencode({
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VMInstance"
    metadata = {
      name = "gpu-vm"
    }
    spec = {
      runStrategy     = "Always"
      instanceProfile = "ubuntu"
      instanceType    = "u1.xlarge"

      gpus = [
        {
          # Modelle: nvidia.com/AD102GL_L40S, nvidia.com/GA100_A100_PCIE_80GB,
          # nvidia.com/GA100_A100_SXM4_80GB, nvidia.com/GB202GL_RTX_PRO_6000_BLACKWELL_SERVER_EDITION
          name = "nvidia.com/AD102GL_L40S"
        }
      ]

      disks = [
        {
          name = "gpu-vm-disk"
        }
      ]

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
          # Installation der NVIDIA-Treiber
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
  description = "Password for PostgreSQL admin user"
  type        = string
  sensitive   = true
}
```

---

## Outputs und Variablen

### Nützliche Outputs

```hcl title="outputs.tf"
output "cluster_kubeconfig" {
  description = "Pfad zur kubeconfig des Clusters"
  value       = local_file.kubeconfig.filename
}

output "vm_status" {
  description = "Befehl zum Prüfen des VM-Status"
  value       = "kubectl get vminstance ${var.vm_name}"
}

output "postgres_connection" {
  description = "Befehl zur Verbindung mit PostgreSQL"
  value       = "kubectl exec -it postgres-terraform-postgres-0 -- psql -U admin -d myapp"
  sensitive   = true
}
```

### Datei terraform.tfvars

```hcl title="terraform.tfvars"
# Basiskonfiguration
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

# Erstellte Ressourcen prüfen
terraform show

# Ressourcen bereinigen
terraform destroy
```

---

## Referenzen

- [Provider Kubernetes](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [Provider kubectl](https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs)
- [Terraform-Dokumentation](https://developer.hashicorp.com/terraform/docs)
