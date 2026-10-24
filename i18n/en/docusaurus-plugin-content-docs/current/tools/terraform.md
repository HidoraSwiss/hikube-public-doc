---
sidebar_position: 1
title: Terraform (legacy)
---

# Infrastructure as Code with Hikube (legacy)

:::danger Retired method
This method drove Hikube through a project kubeconfig and Kubernetes manifests. The project kubeconfig is **no longer available**: this method no longer works. This page is kept for reference.
:::

:::info Automation: the public API
To automate the management of your resources, use the [Hikube public API](../../api/overview), with [API keys](../../api/authentication) attached to a project; it is currently in preview. A dedicated Terraform provider, built on this API, is being considered. To manage your resources by hand, use the [Hikube console](https://console.hikube.cloud).
:::

You can use **Terraform** to manage your Hikube infrastructure in a declarative and reproducible way, through the Kubernetes providers.

---

## Configuration

### Prerequisites

- **A project kubeconfig.** It is no longer available: see the warning at the top of the page.
- [Terraform](https://www.terraform.io/downloads) (version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Kubernetes provider

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
  description = "Public SSH key for VM access"
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

### Deploy a Kubernetes cluster

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
        # Example GPU group (requires the gpuOperator addon below)
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
        # Required to expose GPUs to the pods of a GPU node group
        # gpuOperator = {
        #   enabled = true
        # }
      }
    }
  })
}

# Retrieve the kubeconfig
data "kubernetes_secret" "cluster_kubeconfig" {
  depends_on = [kubectl_manifest.kubernetes_cluster]
  
  metadata {
    name = "kubernetes-${var.cluster_name}-admin-kubeconfig"
  }
}

# Save the kubeconfig
resource "local_file" "kubeconfig" {
  content = base64decode(
    data.kubernetes_secret.cluster_kubeconfig.data["super-admin.conf"]
  )
  filename = "${path.module}/${var.cluster_name}-kubeconfig.yaml"
  file_permission = "0600"
}
```

### Deploy a virtual machine

```hcl title="virtual-machine.tf"
# The disk is a separate VMDisk resource, referenced by the VM
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

### Deploy a VM with a GPU

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
          # Models: nvidia.com/AD102GL_L40S, nvidia.com/GA100_A100_PCIE_80GB,
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

## Outputs and variables

### Useful outputs

```hcl title="outputs.tf"
output "cluster_kubeconfig" {
  description = "Path to the cluster kubeconfig"
  value       = local_file.kubeconfig.filename
}

output "vm_status" {
  description = "Command to check the VM status"
  value       = "kubectl get vminstance ${var.vm_name}"
}

output "postgres_connection" {
  description = "Command to connect to PostgreSQL"
  value       = "kubectl exec -it postgres-terraform-postgres-0 -- psql -U admin -d myapp"
  sensitive   = true
}
```

### terraform.tfvars file

```hcl title="terraform.tfvars"
# Basic configuration
cluster_name = "my-prod-cluster"
vm_name      = "my-app-vm"

# Your public SSH key
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... user@hostname"

# PostgreSQL password
postgres_password = "your-secure-password-here"
```

---

## Best practices

### Project structure

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

### Useful commands

```bash
# Initialize Terraform
terraform init

# Plan the changes
terraform plan

# Apply the configuration
terraform apply

# Check the created resources
terraform show

# Clean up the resources
terraform destroy
```

---

## References

- [Kubernetes provider](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)
- [kubectl provider](https://registry.terraform.io/providers/gavinbunney/kubectl/latest/docs)
- [Terraform documentation](https://developer.hashicorp.com/terraform/docs)

