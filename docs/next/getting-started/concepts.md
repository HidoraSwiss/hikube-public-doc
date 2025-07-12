---
sidebar_position: 3
title: Concepts clés
---

# Concepts clés d'Hikube

Comprendre les concepts fondamentaux d'Hikube vous aidera à utiliser la plateforme efficacement.

## Architecture générale

Hikube est basé sur une architecture en couches :

```
┌─────────────────────────────────────┐
│           Applications              │
│  (PostgreSQL, VMs, Kubernetes)     │
├─────────────────────────────────────┤
│           Kubernetes                │
│      (Orchestration)               │
├─────────────────────────────────────┤
│         Virtualization             │
│      (KubeVirt, VMs)              │
├─────────────────────────────────────┤
│         Infrastructure             │
│    (Storage, Network, Compute)     │
└─────────────────────────────────────┘
```

## Tenants

### Qu'est-ce qu'un Tenant ?

Un **Tenant** est l'unité principale d'isolation et d'organisation sur Hikube. C'est comparable à un namespace Kubernetes avec des fonctionnalités étendues.

### Caractéristiques des Tenants

- **🔒 Isolation** : Chaque tenant est isolé des autres
- **🌐 Domaine propre** : Chaque tenant a son propre domaine
- **📊 Services dédiés** : etcd, monitoring, ingress propres
- **🔄 Héritage** : Les tenants peuvent hériter des services parent

### Hiérarchie des Tenants

```
Tenant Root (example.org)
├── Tenant Dev (dev.example.org)
│   ├── PostgreSQL
│   ├── Kubernetes Cluster
│   └── VMs
└── Tenant Prod (prod.example.org)
    ├── PostgreSQL
    ├── Kubernetes Cluster
    └── VMs
```

## Services managés

### Bases de données

Hikube propose des bases de données managées avec :

- **🔄 Réplication automatique** : Haute disponibilité
- **💾 Sauvegardes intégrées** : Récupération de données
- **📊 Monitoring** : Métriques et alertes
- **🔒 Sécurité** : Chiffrement et isolation

### Virtualisation

Les machines virtuelles sur Hikube offrent :

- **⚡ Performance** : Optimisations matérielles
- **🔄 Flexibilité** : Différents types d'instances
- **🌐 Réseau** : Configuration réseau avancée
- **💾 Stockage** : Disques persistants

### Kubernetes

Kubernetes sur Hikube fournit :

- **🎯 Orchestration** : Gestion des conteneurs
- **📈 Auto-scaling** : Adaptation automatique
- **🔧 Add-ons** : Ingress, cert-manager, monitoring
- **🔄 Rolling updates** : Mises à jour sans interruption

## Stockage

### Types de stockage

- **Replicated** : Stockage répliqué pour haute disponibilité
- **Local** : Stockage local pour performance
- **Object** : Stockage d'objets pour données non structurées

### Classes de stockage

```yaml
storageClass: "replicated"  # Haute disponibilité
storageClass: "local"       # Performance
```

## Réseau

### Isolation réseau

- **🔒 Network Policies** : Contrôle du trafic
- **🌐 Ingress** : Accès HTTP/HTTPS
- **🔗 VPN** : Connexions sécurisées
- **⚖️ Load Balancing** : Équilibrage de charge

### Domaines

Chaque service obtient automatiquement un domaine :

```
tenant.example.org
├── postgres.tenant.example.org
├── k8s.tenant.example.org
└── vm.tenant.example.org
```

## Sécurité

### Multi-tenancy

- **🔒 Isolation** : Tenants complètement isolés
- **👥 RBAC** : Contrôle d'accès granulaire
- **🔐 Secrets** : Gestion sécurisée des secrets
- **🛡️ Network Policies** : Contrôle du trafic réseau

### Conformité

- **🔒 Chiffrement** : Données chiffrées en transit et au repos
- **📊 Audit** : Logs complets des actions
- **🔄 Backup** : Sauvegardes sécurisées
- **🔍 Monitoring** : Surveillance continue

## Monitoring et Observabilité

### Métriques

- **📊 Infrastructure** : CPU, mémoire, réseau
- **📈 Applications** : Performance des services
- **🔍 Logs** : Logs centralisés
- **🚨 Alertes** : Notifications automatiques

### Outils intégrés

- **Prometheus** : Collecte de métriques
- **Grafana** : Visualisation
- **FluentBit** : Collecte de logs
- **AlertManager** : Gestion des alertes

## Infrastructure as Code

### Terraform

Hikube supporte Terraform pour :

- **📝 Déploiement déclaratif** : Infrastructure versionnée
- **🔄 Reproductibilité** : Même infrastructure partout
- **👥 Collaboration** : Travail en équipe
- **🧪 Testing** : Tests automatisés

### Exemple Terraform

```hcl
resource "kubernetes_manifest" "postgres" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Postgres"
    metadata = {
      name = "my-postgres"
    }
    spec = {
      size = "20Gi"
      replicas = 2
    }
  }
}
```

## Glossaire

- **Tenant** : Unité d'isolation et d'organisation
- **Service managé** : Service avec opérations automatisées
- **StorageClass** : Type de stockage (replicated/local)
- **Ingress** : Contrôleur d'accès HTTP/HTTPS
- **RBAC** : Contrôle d'accès basé sur les rôles
- **CRD** : Custom Resource Definition (ressource Kubernetes personnalisée) 