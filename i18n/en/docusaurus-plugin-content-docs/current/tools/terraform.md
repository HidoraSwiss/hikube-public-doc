---
sidebar_position: 1
title: Terraform with Hikube
---

# Infrastructure as Code with Hikube

Since Hikube is based on Kubernetes, you can use **Terraform** to manage your infrastructure in a declarative and reproducible way. This approach allows you to version, test, and deploy your Hikube infrastructure in an automated manner.

---

## Configuration

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) (version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Access to a Hikube tenant
- Configured kubeconfig

### Kubernetes Provider

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
  description = "SSH public key for VM access"
  type        = string
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
  default     = "terraform-cluster"
}

variable "vm_name" {
  description = "Virtual machine name"
  type        = string
  default     = "terraform-vm"
}
```

---

## Examples

### Deploy a Kubernetes Cluster

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

# Retrieve kubeconfig
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  metadata {
    name      = "${var.cluster_name}-admin-kubeconfig"
    namespace = "default"
  }
}

# Save kubeconfig
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  file_permission = "0600"
}
```

### Deploy a Virtual Machine

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

### Deploy a VM with GPU

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
          # Install NVIDIA drivers
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

### Deploy PostgreSQL

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

## Outputs and Variables

### Useful Outputs

```hcl title="outputs.tf"
output "cluster_kubeconfig" {
  description = "Path to cluster kubeconfig"
  value       = local_file.kubeconfig.filename
}

output "vm_status" {
  description = "Command to check VM status"
  value       = "kubectl get virtualmachine ${var.vm_name}"
}

output "postgres_connection" {
  description = "Command to connect to PostgreSQL"
  value       = "kubectl exec -it postgres-terraform-postgres-0 -- psql -U admin -d myapp"
  sensitive   = true
}
```

### terraform.tfvars File

```hcl title="terraform.tfvars"
# Basic configuration
cluster_name = "my-prod-cluster"
vm_name      = "my-app-vm"

# Your SSH public key
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@hostname"

# PostgreSQL password
postgres_password = "your-secure-password-here"
```

---

## Best Practices

### Project Structure

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

### Useful Commands

```bash
# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply configuration
terraform apply

# Check created resources
terraform show

# Clean up resources
terraform destroy
```

---

## References

- [Kubernetes Provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [kubectl Provider](https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)

