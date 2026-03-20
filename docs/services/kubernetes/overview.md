---
sidebar_position: 1
title: Vue d'ensemble
---

import NavigationFooter from '@site/src/components/NavigationFooter';

<!--- Présentation du Kubernetes Managé sur Hikube
- Schéma architecture (parlé de la réplication, des controls plane, workers, infra, addons, versionning k8s)
- Composition des différents éléments de configuration du k8s géré
- Explication du fonctionnement :
  - control plane
  - worker/nodeGroup
    - Exemple
  - storageclass
  - versionning
  - addons-->

# Présentation du Kubernetes Managé sur Hikube

Hikube propose un service de **Kubernetes managé** conçu pour offrir une infrastructure hautement disponible, sécurisée et performante.
Le plan de contrôle est entièrement géré par la plateforme, tandis que les **nœuds workers** sont déployés dans votre tenant sous forme de machines virtuelles.

---

## 🏗️ Schéma d’Architecture

### **Vue d’ensemble**

Les clusters Kubernetes Hikube s’appuient sur une **infrastructure multi-datacenter** (3 sites suisses) garantissant la réplication, la tolérance aux pannes et la continuité de service.

- **Plan de contrôle (Control Plane)** : hébergé et opéré par Hikube
  Composé de :
  - `kube-apiserver`
  - `etcd`
  - `kube-scheduler`
  - `kube-controller-manager`
- **Nœuds workers** : machines virtuelles dans votre tenant
- **Réseau** : CNI avec support `LoadBalancer`, `Ingress` et politiques réseau (`NetworkPolicy`)
- **Stockage** : volumes persistants répliqués sur les 3 datacenters
- **Add-ons** : intégration cert-manager, FluxCD, monitoring, etc.
- **Versioning Kubernetes** : support multi-versions avec mises à jour progressives

---

## ⚙️ Composition et Configuration du Cluster

Les clusters sont entièrement déclaratifs et configurables via API ou manifest YAML.
Les principaux éléments de configuration incluent :

| Élément | Description |
|----------|--------------|
| **nodeGroups** | Groupes de nœuds homogènes (taille, rôle, GPU, etc.) |
| **storageClass** | Définit le type de persistance et la réplication |
| **addons** | Ensemble des fonctionnalités optionnelles activables |
| **version** | Version du serveur Kubernetes utilisée |
| **network** | Gestion du CNI, LoadBalancer et Ingress |

---

## ⚙️ Fonctionnement Détaillé

### 🧠 **Control Plane**

- Géré par Hikube, sans maintenance nécessaire côté client
- Composants critiques répliqués sur plusieurs sites
- Gestion de la haute disponibilité, du monitoring et des mises à jour automatiques
- Accès via l’API standard Kubernetes (`kubectl`, client SDK, etc.)

### 🧩 **Worker Nodes / NodeGroups**

Les **NodeGroups** permettent d’adapter les ressources à vos besoins. Chaque groupe peut être configuré avec un type d’instance, des rôles et un scaling automatique.

#### Exemple de NodeGroup

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

#### Caractéristiques principales

- **Autoscaling** : paramètres `minReplicas` et `maxReplicas`
- **Support GPU** : attachement dynamique de GPU NVIDIA
- **Instance types** : `S1` (standard), `U1` (universal), `M1` (memory-optimized)

---

## 💾 Stockage Persistant

### **Classe de stockage : `replicated`**

- Réplication automatique sur les **3 datacenters suisses**
- Provisioning dynamique des volumes persistants (PVC)
- Tolérance aux pannes et haute disponibilité native

Exemple d’utilisation :

```yaml
storageClassName: replicated
resources:
  requests:
    storage: 20Gi
```

---

## 🔢 Versionning Kubernetes

- Les clusters peuvent être créés avec une **version Kubernetes spécifique**
- Hikube assure les mises à jour mineures et correctives de manière contrôlée
- Le client garde la possibilité de planifier les upgrades majeurs

Exemple :

```yaml
version: "1.30.3"
```

---

## 🧩 Add-ons Intégrés

### **Cert-Manager**

- Gestion automatisée des certificats SSL/TLS
- Support Let's Encrypt et autorités privées
- Renouvellement automatique

### **Ingress NGINX**

- Contrôleur d’ingress intégré
- Support wildcard, SNI et Prometheus metrics

### **Flux CD (GitOps)**

- Synchronisation continue avec vos dépôts Git
- Déploiement automatisé et rollback

### **Monitoring Stack**

- **Node Exporter**, **FluentBit**, **Kube-State-Metrics**
- Intégration complète avec Grafana et Prometheus du tenant

---

## 🚀 Exemples de Cas d’Usage

### **Applications Web**

```yaml
nodeGroups:
  web:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    roles: ["ingress-nginx"]
```

### **Workloads ML/AI**

```yaml
nodeGroups:
  ml:
    minReplicas: 1
    maxReplicas: 5
    instanceType: "u1.xlarge"
    gpus:
      - name: "nvidia.com/AD102GL_L40S"
```

### **Applications Critiques**

```yaml
nodeGroups:
  production:
    minReplicas: 3
    maxReplicas: 20
    instanceType: "m1.large"
```

---

## 📚 Ressources

- **[Concepts et Architecture](./concepts.md)** → Comprendre comment est déployé un cluster Kubernetes Hikube
- **[Démarrage rapide](./quick-start.md)** → Créez votre premier cluster Hikube
- **[API Reference](./api-reference.md)** → Documentation complète de la configuration

---

## 💡 Points Clés

- **Plan de contrôle managé** : aucune maintenance des masters requise
- **Nœuds dans votre tenant** : contrôle complet sur les workers
- **Scaling automatique** : ajustement dynamique selon la charge
- **Multi-datacenter** : haute disponibilité native et réplication
- **Compatibilité totale** : API Kubernetes standard supportée

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Démarrage rapide", href: "../quick-start"},
  ]}
/>
