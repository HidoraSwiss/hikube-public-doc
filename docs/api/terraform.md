---
title: Terraform avec Hikube
---

# Infrastructure as Code avec Hikube

Hikube étant basé sur Kubernetes, vous pouvez utiliser **Terraform** pour gérer votre infrastructure de manière déclarative et reproductible. Cette approche vous permet de versionner, tester et déployer votre infrastructure Hikube de façon automatisée.

---

## Aperçu

### Pourquoi utiliser Terraform avec Hikube ?

- **🔄 Reproductibilité** : Déployez la même infrastructure partout
- **📝 Versioning** : Gérez vos configurations dans Git
- **🧪 Testing** : Testez vos configurations avant production
- **👥 Collaboration** : Travaillez en équipe sur l'infrastructure
- **📊 Audit** : Traçabilité complète des changements

### Architecture Hikube + Terraform

```
Terraform Provider
    ↓
Kubernetes API
    ↓
Hikube Platform
    ↓
Infrastructure (VMs, Storage, Networks)
```

---

## Installation et Configuration

### Prérequis

- [Terraform](https://www.terraform.io/downloads) (version >= 1.0)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Accès à un tenant Hikube
- Kubeconfig configuré

### Configuration initiale

1. **Créer un projet Terraform**

```bash
mkdir hikube-terraform
cd hikube-terraform
```

2. **Initialiser Terraform**

```bash
terraform init
```

3. **Configurer le provider Kubernetes**

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"  # Votre kubeconfig Hikube
}
```

---

## Exemples d'Usage

### Déployer un Tenant

```hcl
# tenant.tf
resource "kubernetes_manifest" "tenant_example" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Tenant"
    metadata = {
      name = "terraform-tenant"
    }
    spec = {
      host      = "terraform.example.org"
      etcd      = true
      monitoring = true
      ingress   = true
      isolated  = true
    }
  }
}
```

### Déployer PostgreSQL

```hcl
# postgresql.tf
resource "kubernetes_manifest" "postgres_example" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Postgres"
    metadata = {
      name = "terraform-postgres"
    }
    spec = {
      external = false
      size     = "20Gi"
      replicas = 2
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
  }
}

variable "postgres_password" {
  description = "Password for PostgreSQL admin user"
  type        = string
  sensitive   = true
}
```

### Déployer Kubernetes Cluster

```hcl
# kubernetes.tf
resource "kubernetes_manifest" "k8s_cluster" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Kubernetes"
    metadata = {
      name = "terraform-k8s"
    }
    spec = {
      host = "k8s.terraform.example.org"
      controlPlane = {
        replicas = 2
      }
      storageClass = "replicated"
      nodeGroups = {
        md0 = {
          minReplicas = 1
          maxReplicas = 5
          instanceType = "cx1.medium"
          ephemeralStorage = "20Gi"
          roles = ["ingress-nginx"]
        }
      }
      addons = {
        certManager = {
          enabled = true
        }
        ingressNginx = {
          enabled = true
          hosts = ["terraform.example.org"]
        }
      }
    }
  }
}
```

### Déployer une Machine Virtuelle

```hcl
# virtual-machine.tf
resource "kubernetes_manifest" "vm_example" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "VirtualMachine"
    metadata = {
      name = "terraform-vm"
    }
    spec = {
      instanceType = "cx1.medium"
      guestOS      = "ubuntu"
      disks = [
        {
          name         = "root-disk"
          size         = "20Gi"
          storageClass = "replicated"
        }
      ]
      networks = [
        {
          name = "default"
          type = "bridge"
        }
      ]
    }
  }
}
```

---

## Variables et Sensibilité

### Définition des variables

```hcl
# variables.tf
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "domain" {
  description = "Base domain for services"
  type        = string
  default     = "example.org"
}

variable "postgres_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "vm_ssh_key" {
  description = "SSH public key for VMs"
  type        = string
}
```

### Utilisation des variables

```hcl
# main.tf
locals {
  full_domain = "${var.environment}.${var.domain}"
}

resource "kubernetes_manifest" "tenant" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Tenant"
    metadata = {
      name = "tenant-${var.environment}"
    }
    spec = {
      host = local.full_domain
      # ... autres paramètres
    }
  }
}
```

---

## Modules Terraform

### Structure recommandée

```
hikube-terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
├── modules/
│   ├── tenant/
│   ├── database/
│   ├── kubernetes/
│   └── virtual-machine/
└── shared/
    ├── variables.tf
    └── outputs.tf
```

### Module Tenant

```hcl
# modules/tenant/main.tf
resource "kubernetes_manifest" "tenant" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Tenant"
    metadata = {
      name = var.tenant_name
    }
    spec = {
      host      = var.host
      etcd      = var.enable_etcd
      monitoring = var.enable_monitoring
      ingress   = var.enable_ingress
      isolated  = var.isolated
    }
  }
}

# modules/tenant/variables.tf
variable "tenant_name" {
  description = "Name of the tenant"
  type        = string
}

variable "host" {
  description = "Host domain for the tenant"
  type        = string
}

variable "enable_etcd" {
  description = "Enable etcd for the tenant"
  type        = bool
  default     = false
}

variable "enable_monitoring" {
  description = "Enable monitoring for the tenant"
  type        = bool
  default     = false
}

variable "enable_ingress" {
  description = "Enable ingress for the tenant"
  type        = bool
  default     = false
}

variable "isolated" {
  description = "Enable network isolation"
  type        = bool
  default     = false
}

# modules/tenant/outputs.tf
output "tenant_name" {
  description = "Name of the created tenant"
  value       = var.tenant_name
}
```

---

## Bonnes Pratiques

### 1. Gestion des Secrets

```hcl
# Utiliser des variables sensibles
variable "database_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Ou utiliser des secrets Kubernetes
resource "kubernetes_secret" "database_credentials" {
  metadata {
    name = "database-credentials"
  }
  data = {
    password = var.database_password
  }
}
```

### 2. Tags et Labels

```hcl
resource "kubernetes_manifest" "postgres" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Postgres"
    metadata = {
      name = "my-postgres"
      labels = {
        environment = var.environment
        managed-by  = "terraform"
        project     = var.project_name
      }
    }
    # ... spec
  }
}
```

### 3. Validation des Données

```hcl
# validation.tf
variable "instance_type" {
  description = "VM instance type"
  type        = string
  validation {
    condition = contains([
      "cx1.medium", "cx1.large", "cx1.xlarge",
      "m1.large", "m1.xlarge", "m1.2xlarge"
    ], var.instance_type)
    error_message = "Invalid instance type. Must be one of the supported types."
  }
}
```

---

## Workflow de Déploiement

### 1. Planification

```bash
# Vérifier les changements
terraform plan

# Vérifier la syntaxe
terraform validate
```

### 2. Déploiement

```bash
# Appliquer les changements
terraform apply

# Déploiement automatique avec approbation
terraform apply -auto-approve
```

### 3. Destruction

```bash
# Supprimer l'infrastructure
terraform destroy

# Vérifier avant destruction
terraform plan -destroy
```

---



---

## Troubleshooting

### Erreurs Communes

#### Erreur : "connection refused"
```bash
# Vérifier la configuration kubectl
kubectl config current-context
kubectl get pods
```

#### Erreur : "resource already exists"
```bash
# Importer la ressource existante
terraform import kubernetes_manifest.postgres_example default/postgres-example
```

#### Erreur : "invalid manifest"
```bash
# Valider la syntaxe YAML
kubectl apply --dry-run=client -f -
```

### Commandes Utiles

```bash
# Voir l'état actuel
terraform show

# Voir les outputs
terraform output

# Rafraîchir l'état
terraform refresh

# Voir les logs
terraform console
```

---

## Ressources Additionnelles

- **[Documentation Terraform officielle](https://www.terraform.io/docs)**
- **[Provider Kubernetes Terraform](https://registry.terraform.io/providers/hashicorp/kubernetes/latest/docs)**
- **[Best Practices Terraform](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)**
- **[HashiCorp Learn](https://learn.hashicorp.com/terraform)**

---

*Cette documentation vous permet de gérer votre infrastructure Hikube de manière déclarative et reproductible avec Terraform.*