---
sidebar_position: 3
title: Concepts clés
---

# Concepts clés d'Hikube

Cette page vous explique les **concepts fondamentaux** qui font d'Hikube une plateforme cloud unique. Comprendre ces concepts vous permettra de tirer le meilleur parti de votre infrastructure et de prendre des décisions éclairées.

---

## Tenants : Votre Espace Privé

### **Qu'est-ce qu'un Tenant ?**
Un **tenant** est votre environnement isolé et sécurisé au sein de Hikube. C'est comme avoir votre propre "datacenter virtuel" avec :
- **Réseau isolé**
- **Utilisateurs et permissions** séparés 
- **Politiques de sécurité** personnalisées
- **Sous-tenants** à disposition

### **Pourquoi cette approche ?**
```mermaid
graph TB
    A[Entreprise] --> B[Tenant Production]
    A --> C[Tenant Développement] 
    A --> D[Tenant Staging]
    
    B --> E[App critique 1]
    B --> F[App critique 2]
    
    C --> G[Tests Dev]
    C --> H[Expérimentations]
    
    D --> I[Tests QA]
    D --> J[Validation]
```

**Avantages concrets :**
- **Isolation totale** : Aucun impact entre environnements
- **Gestion des équipes** : Permissions granulaires par tenant
- **Politiques différenciées** : Production vs développement
- **Facturation séparée** : Suivi des coûts par projet

### **Cas d'usage typiques**
| Tenant | Usage | Exemples |
|--------|-------|----------|
| **Production** | Applications critiques | Sites web, APIs, bases de données |
| **Staging** | Tests pré-production | Validation, performance tests |
| **Development** | Développement actif | Prototypes, expérimentations |
| **Sandbox** | Formation/démonstration | Tests sans risque |

---

## Sécurité : Protection Multi-Niveaux

### **Architecture Zero-Trust**
Hikube applique le principe **"never trust, always verify"** à tous les niveaux :

#### **Infrastructure**
- **Chiffrement au repos** : Données protégées sur disque
- **Chiffrement en transit** : Communications sécurisées

#### **Réseau**
- **Micro-segmentation automatique** : Isolation fine des flux
- **Firewall distribué** : Protection périmétrique avancée
- **Intrusion Detection System (IDS)** : Détection temps réel

#### **Applications**
- **Security Standards** : Conformité aux standards de sécurité
- **Network Policies par défaut** : Règles réseau restrictives
- **Secret management** : Gestion sécurisée des secrets

#### **Accès**
- **Multi-Factor Authentication (MFA)** : Double authentification
- **Role-Based Access Control (RBAC)** : Permissions granulaires
- **Audit complet des actions** : Traçabilité totale

### **Protection des Données**
- **Chiffrement transparent** : Vos données sont chiffrées automatiquement at rest
- **Compliance** : RGPD, ISO 27001, FINMA

### **Isolation Réseau**

```mermaid
flowchart TD
    subgraph TA["Tenant A"]
        A1["App 1"]
        A2["App 2"]
        NA["Private Network A"]
    end
    
    subgraph TB["Tenant B"]
        A3["App 3"]
        A4["App 4"]
        NB["Private Network B"]
    end
    
    FA["Firewall A"]
    FB["Firewall B"]
    INTERNET["Internet"]
    
    TA --> FA
    TB --> FB
    FA --> INTERNET
    FB --> INTERNET
    
    style TA fill:#e1f5fe
    style TB fill:#f3e5f5
    style FA fill:#ffecb3
    style FB fill:#ffecb3
    style INTERNET fill:#e8f5e8
```

---

## Redondance : Haute Disponibilité Native

### **Redondance Multi-Niveaux**
Hikube garantit la continuité de service grâce à une architecture redondante :

#### **Infrastructure Physique**
- **Serveurs multiples** : Pas de point de défaillance unique
- **Alimentation redondante** : Onduleurs et générateurs
- **Connexions réseau multiples** : Plusieurs fournisseurs d'accès
- **Refroidissement redondant** : Systèmes de climatisation multiples

#### **Données et Stockage**
- **Réplication synchrone** : Vos données sur 3+ datacenters
- **Backup automatique** : Sauvegardes continues et testées
- **Geo-redondance** : Copies sur sites distants

#### **Applications et Services**
- **Auto-scaling** : Adaptation automatique à la charge
- **Health checks** : Détection proactive des problèmes
- **Rolling updates** : Mises à jour sans interruption
- **Circuit breakers** : Protection contre les cascades de pannes

---

## Infrastructure as Code (IaC)

### **Pensé pour l'Industrialisation**
Hikube est conçu pour l'automatisation et l'industrialisation de votre infrastructure. Toutes les fonctionnalités sont accessibles via :

- **API complète** : Intégration native dans vos pipelines CI/CD
- **CLI puissant** : Automatisation et scripts pour vos équipes DevOps
- **Déclaratif** : Décrivez l'état souhaité, Hikube s'occupe du reste

### **Avantages de l'Approche Industrielle**
- **Reproductibilité** : Déploiements identiques à chaque fois
- **Versionning** : Suivi complet des changements infrastructure
- **Collaboration** : Code partagé entre équipes développement et ops
- **Automatisation** : Intégration transparente dans vos workflows

---

## Observabilité et Monitoring

### **Stack Monitoring Complète**

Hikube vous permet de déployer votre propre stack de monitoring dans votre tenant avec **Grafana + VictoriaMetrics + VictoriaLogs**. Cette stack peut centraliser les données de tous vos sous-tenants pour une vision globale de votre infrastructure.

```mermaid
flowchart TD
    subgraph TENANT["TENANT PRINCIPAL"]
        G[Grafana]
        VM[VictoriaMetrics]
        VL[VictoriaLogs]
    end
    
    TENANT --> SPACER[ ]
    
    subgraph SOUS["SOUS-TENANT"]
        K8S[Kubernetes]
        VMS[VMs]
        APP[Applications]
        M[Métriques]
        L[Logs]
    end
    
    G -.-> VM
    G -.-> VL
    K8S --> M
    VMS --> M
    APP --> M
    APP --> L
    
    M --> VM
    L --> VL
    
    VM --> D1[Dashboard K8s]
    VM --> D2[Dashboard VMs] 
    VM --> D3[Dashboard Apps]
    VL --> D4[Dashboard Logs]
    
    style SPACER fill:transparent,stroke:transparent
```

### **Architecture Multi-Tenant du Monitoring**

#### **Centralisation Intelligente**
- **Tenant principal** : Héberge la stack Grafana + VictoriaMetrics + VictoriaLogs
- **Sous-tenants** : Génèrent métriques et logs automatiquement
- **Remontée sécurisée** : Agrégation centralisée avec isolation des données
- **Vue globale** : Dashboard unifié de toute votre infrastructure

#### **Dashboards par Ressource**

Hikube fournit des **dashboards préconfigurés** pour chaque type de ressource :

| **Type de Ressource** | **Dashboard Inclus** | **Métriques Clés** |
|---------------------------|-------------------------|------------------------|
| **Kubernetes** | Cluster, Nodes, Pods, Services | CPU, RAM, réseau, stockage |
| **Machines Virtuelles** | Host, VM, Performance | Utilisation, I/O, disponibilité |
| **Bases de Données** | MySQL, PostgreSQL, Redis | Connexions, requêtes, cache |
| **Applications** | Performances, Erreurs | Latence, throughput, 5xx |
| **Réseau** | LoadBalancer, VPN | Trafic, latence, connexions |
| **Stockage** | Buckets, Volumes | Capacité, IOPS, transferts |

---

## Évolutivité et Performance

### **Gestion Dynamique des Ressources**

Hikube vous offre une **flexibilité totale** pour adapter vos ressources selon vos besoins :

- **Applications** : Augmentez ou diminuez CPU, RAM et stockage en temps réel
- **Machines Virtuelles** : Redimensionnement vertical (vCPU, mémoire, disques)
- **Clusters Kubernetes** : **Autoscaling automatique** avec ajout et suppression intelligente de nœuds
- **NodePools Kubernetes** : Création de **pools de nœuds séparés** avec des caractéristiques spécifiques (CPU, GPU, stockage, labels)
- **Pods Kubernetes** : **Vertical Pod Autoscaling (VPA)** pour l'optimisation automatique des ressources applicatives

Cette approche garantit des **performances optimales** tout en **maîtrisant les coûts** grâce à un dimensionnement précis et automatisé.

---

## Prochaines Étapes

Maintenant que vous maîtrisez les concepts d'Hikube, vous pouvez :

### **Mettre en Pratique**
- **[Déployer Kubernetes](../services/kubernetes/)** → Créez votre premier cluster
- **[Configurer des VMs](../services/compute/virtual-machines/)** → Infrastructure hybride
- **[Gérer le stockage](../services/storage/)** → Données persistantes

### **Automatiser**
- **[Terraform](../tools/terraform.md)** → Infrastructure as Code
- **[CLI](../tools/cli.md)** → Scripts et automatisation

### **Approfondir**
- **[FAQ](../resources/faq.md)** → Questions fréquentes
- **[Troubleshooting](../resources/troubleshooting.md)** → Résolution de problèmes

---

**Recommandation :** Commencez par explorer les **[Services](../services/)** pour voir comment ces concepts s'appliquent concrètement à chaque composant d'Hikube. 