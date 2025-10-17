---
sidebar_position: 3
title: Référence API
---

# Référence API Kubernetes

Cette page documente l'intégralité des paramètres de configuration disponibles pour déployer et gérer des clusters Kubernetes sur Hikube.

---

## Structure de Base

### **Ressource Kubernetes**

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: cluster-name
  namespace: default
  labels:
    environment: production
    team: platform
spec:
  # Configuration détaillée ci-dessous
```

---

## Paramètres Généraux

### **Configuration Cluster**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `host` | `string` | Nom d'hôte pour accéder au cluster API | `""` (nom du cluster) | Non |
| `storageClass` | `string` | Classe de stockage par défaut | `"replicated"` | Non |

```yaml
spec:
  host: "k8s-production.company.com"
  storageClass: "replicated"
```

### **Plan de Contrôle**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `controlPlane.replicas` | `int` | Nombre de réplicas du control plane | `2` | Non |

```yaml
spec:
  controlPlane:
    replicas: 3  # Pour haute disponibilité maximale
```

---

## 👥 Configuration des Node Groups

### **Paramètres Node Groups**

Les node groups définissent les pools de nœuds workers avec des caractéristiques spécifiques.

```yaml
spec:
  nodeGroups:
    <group-name>:
      minReplicas: 1
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: "50Gi"
      roles: []
      resources:
        cpu: ""
        memory: ""
```

#### **Paramètres Détaillés**

| **Paramètre** | **Type** | **Description** | **Défaut** | **Requis** |
|---------------|----------|-----------------|------------|------------|
| `minReplicas` | `int` | Nombre minimum de nœuds | `0` | Oui |
| `maxReplicas` | `int` | Nombre maximum de nœuds | `10` | Oui |
| `instanceType` | `string` | Type d'instance VM (S1/U1/M1 - voir types disponibles) | `"s1.medium"` | Oui |
| `ephemeralStorage` | `string` | Taille du stockage éphémère | `"20Gi"` | Non |
| `roles` | `[]string` | Rôles spéciaux assignés aux nœuds | `[]` | Non |
| `resources.cpu` | `string` | Override CPU personnalisé | `""` | Non |
| `resources.memory` | `string` | Override mémoire personnalisé | `""` | Non |

#### **Types d'Instances Disponibles**

##### **Série S (Standard) - Ratio 1:2**
Optimisée pour workloads généraux avec CPU partagé et burstable.

```yaml
# Instances disponibles
instanceType: "s1.small"     # 1 vCPU, 2 GB RAM
instanceType: "s1.medium"    # 2 vCPU, 4 GB RAM
instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
instanceType: "s1.xlarge"    # 8 vCPU, 16 GB RAM
instanceType: "s1.3large"    # 12 vCPU, 24 GB RAM
instanceType: "s1.2xlarge"   # 16 vCPU, 32 GB RAM
instanceType: "s1.3xlarge"   # 24 vCPU, 48 GB RAM
instanceType: "s1.4xlarge"   # 32 vCPU, 64 GB RAM
instanceType: "s1.8xlarge"   # 64 vCPU, 128 GB RAM
```

##### **Série U (Universal) - Ratio 1:4**
Optimisée pour workloads équilibrés avec plus de mémoire.

```yaml
# Instances disponibles
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

##### **Série M (Memory Optimized) - Ratio 1:8**
Optimisée pour applications nécessitant beaucoup de mémoire.

```yaml
# Instances disponibles
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

#### **Guide de Sélection des Types d'Instances**

| **Série** | **Cas d'Usage Recommandé** | **Exemples** |
|-----------|---------------------------|--------------|
| **S1** | Applications web, APIs, charges légères | Ingress controllers, applications stateless |
| **U1** | Workloads équilibrés, calcul général | Microservices, applications business, CI/CD |
| **M1** | Applications gourmandes en mémoire | Bases de données, cache, analytics, monitoring |

#### **Rôles de Nœuds Disponibles**

| **Rôle** | **Description** | **Usage** |
|----------|-----------------|-----------|
| `ingress-nginx` | Contrôleur Ingress NGINX | Exposition HTTP/HTTPS |
| `monitoring` | Services de monitoring | Métriques et observabilité |
| `storage` | Nœuds dédiés stockage | Workloads I/O intensives |

### **Exemples de Node Groups**

#### **Node Group Général**
```yaml
nodeGroups:
  general:
    minReplicas: 2
    maxReplicas: 10
    instanceType: "s1.large"
    ephemeralStorage: 50Gi
    roles:
      - ingress-nginx
```

#### **Node Group Compute Intensif**
```yaml
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

#### **Node Group Memory Optimized**
```yaml
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU au lieu de 4
      memory: "48Gi" # Override: 48 GB au lieu de 32
```

---

## 🚦 Add-ons Disponibles

### **Cert-Manager**

Gestion automatisée des certificats SSL/TLS.

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        installCRDs: true
        prometheus:
          enabled: true
```

#### **Configuration Avancée Cert-Manager**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        # Configuration des issuers par défaut
        global:
          leaderElection:
            namespace: cert-manager
        # Métriques Prometheus
        prometheus:
          enabled: true
          servicemonitor:
            enabled: true
        # Resources des pods
        resources:
          requests:
            cpu: 10m
            memory: 32Mi
          limits:
            cpu: 100m
            memory: 128Mi
```

### **Ingress NGINX**

Contrôleur d'ingress pour l'exposition HTTP/HTTPS.

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "app1.example.com"
        - "app2.example.com"
        - "*.api.example.com"  # Wildcard support
      valuesOverride: {}
```

#### **Configuration Avancée Ingress NGINX**

```yaml
spec:
  addons:
    ingressNginx:
      enabled: true
      hosts:
        - "production.company.com"
        - "*.apps.company.com"
      valuesOverride:
        controller:
          # Réplication pour haute disponibilité
          replicaCount: 3

          # Configuration des ressources
          resources:
            requests:
              cpu: 100m
              memory: 90Mi
            limits:
              cpu: 500m
              memory: 500Mi

          # Configuration du service LoadBalancer
          service:
            type: LoadBalancer
            annotations:
              service.beta.kubernetes.io/aws-load-balancer-type: nlb

          # Métriques
          metrics:
            enabled: true
            serviceMonitor:
              enabled: true

          # Configuration SSL
          config:
            ssl-protocols: "TLSv1.2 TLSv1.3"
            ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"

          # Logging
          enableSnippets: true
```

### **Flux CD**

Déploiement GitOps pour l'automatisation des déploiements.

```yaml
spec:
  addons:
    fluxcd:
      enabled: true
      valuesOverride:
        # Configuration du Git repository
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
          path: "./clusters/production"
```

#### **Configuration Avancée Flux CD**

```yaml
spec:
  addons:
    fluxcd:
      enabled: true
      valuesOverride:
        # Source Controller
        sourceController:
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Kustomize Controller
        kustomizeController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Helm Controller
        helmController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi

        # Notification Controller
        notificationController:
          resources:
            requests:
              cpu: 100m
              memory: 64Mi
            limits:
              cpu: 1000m
              memory: 1Gi
```

### **Agents de Monitoring**

Collecte de logs et métriques avec FluentBit et autres agents.

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        # Configuration FluentBit
        fluentbit:
          enabled: true
          config:
            outputs: |
              [OUTPUT]
                  Name forward
                  Match *
                  Host fluent-aggregator.logging
                  Port 24224
```

#### **Configuration Avancée Monitoring**

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        # FluentBit pour les logs
        fluentbit:
          enabled: true
          resources:
            requests:
              cpu: 5m
              memory: 10Mi
            limits:
              cpu: 50m
              memory: 60Mi
          config:
            service: |
              [SERVICE]
                  Flush         1
                  Log_Level     info
                  Daemon        off
                  Parsers_File  parsers.conf
            inputs: |
              [INPUT]
                  Name              tail
                  Path              /var/log/containers/*.log
                  Parser            cri
                  Tag               kube.*
                  Refresh_Interval  5
                  Mem_Buf_Limit     50MB
            outputs: |
              [OUTPUT]
                  Name  forward
                  Match *
                  Host  logs.company.com
                  Port  24224

        # Node Exporter pour les métriques système
        nodeExporter:
          enabled: true
          resources:
            requests:
              cpu: 10m
              memory: 32Mi
            limits:
              cpu: 200m
              memory: 128Mi
```

---

## Exemples Complets

### **Cluster de Production**

```yaml title="production-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: production
  namespace: company-prod
  labels:
    environment: production
    criticality: high
    team: platform
spec:
  # Configuration cluster
  host: "k8s-prod.company.com"
  storageClass: "replicated"

  # Plan de contrôle haute disponibilité
  controlPlane:
    replicas: 3

  # Node groups spécialisés
  nodeGroups:
    # Nœuds généraux avec Ingress
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nœuds compute pour workloads intensifs
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
      ephemeralStorage: 100Gi
      roles: []

    # Nœuds monitoring dédiés
    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  # Add-ons complets
  addons:
    # Certificats SSL automatiques
    certManager:
      enabled: true
      valuesOverride:
        prometheus:
          enabled: true

    # Exposition HTTP/HTTPS
    ingressNginx:
      enabled: true
      hosts:
        - "app.company.com"
        - "api.company.com"
        - "*.services.company.com"
      valuesOverride:
        controller:
          replicaCount: 3
          resources:
            requests:
              cpu: 200m
              memory: 256Mi

    # GitOps pour déploiements
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-production"
          branch: "main"

    # Monitoring complet
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

### **Cluster de Développement**

```yaml title="development-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: development
  namespace: company-dev
  labels:
    environment: development
    auto-cleanup: "7d"
spec:
  # Configuration basique
  host: "k8s-dev.company.local"
  storageClass: "replicated"

  # Plan de contrôle minimal
  controlPlane:
    replicas: 1  # Économie de ressources

  # Node group unique polyvalent
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "s1.medium"
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  # Add-ons essentiels uniquement
  addons:
    certManager:
      enabled: true

    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.company.local"
      valuesOverride:
        controller:
          replicaCount: 1  # Réplication minimale
```

### **Cluster ML/AI avec GPU**

```yaml title="ml-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: machine-learning
  namespace: company-ai
  labels:
    environment: ai
    workload: gpu
spec:
  host: "k8s-ai.company.com"
  storageClass: "fast-ssd"  # Stockage haute performance

  controlPlane:
    replicas: 2

  nodeGroups:
    # Nœuds standard pour orchestration
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Nœuds GPU pour ML workloads
    gpu:
      minReplicas: 0      # Scaling à zéro possible
      maxReplicas: 10
      instanceType: "u1.2xlarge"  # Instance avec GPU
      ephemeralStorage: 500Gi      # Stockage important pour datasets
      roles: []

  addons:
    certManager:
      enabled: true

    monitoringAgents:
      enabled: true
      valuesOverride:
        # Monitoring spécialisé GPU
        dcgmExporter:
          enabled: true
```

---

## 🔐 Accès et Sécurité

### **Récupération du Kubeconfig**

Une fois le cluster déployé, récupérez les credentials d'accès :

```bash
# Kubeconfig admin complet
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Kubeconfig lecture seule (si configuré)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

### **Configuration RBAC**

Après déploiement, configurez les accès utilisateurs :

```bash
# Se connecter au cluster
export KUBECONFIG=cluster-admin.yaml

# Créer des rôles et bindings
kubectl apply -f rbac-config.yaml
```

---

## 📊 Monitoring et Observabilité

### **Métriques du Cluster**

```bash
# Status général du cluster Hikube
kubectl get kubernetes <cluster-name> -o yaml

# Nœuds du cluster Kubernetes
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Métriques de ressources
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

### **Logs et Debugging**

```bash
# Events du cluster
kubectl describe kubernetes <cluster-name>

# Logs des components
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Status détaillé des machines
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

## 🛠️ Gestion du Cycle de Vie

### **Mise à Jour**

```bash
# Mise à jour du cluster
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # Nouvelle version Kubernetes
'
```

### **Scaling**

```bash
# Scaling d'un node group
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Augmenter la limite
'
```

### **Suppression**

```bash
# ATTENTION: Suppression irréversible du cluster
kubectl delete kubernetes <cluster-name>
```

---

## 🚨 Troubleshooting

### **Problèmes Courants**

```bash
# Cluster bloqué en création
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Nœuds non prêts
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-ons en erreur
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

### **Logs Détaillés**

```bash
# Logs Cluster API
kubectl logs -n capi-system -l control-plane=controller-manager

# Logs Kamaji (control plane)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# Logs KubeVirt (workers)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```

---

:::tip 💡 Bonnes Pratiques
- **Utilisez des labels** pour organiser vos clusters par environnement
- **Configurez RBAC** dès la création pour sécuriser l'accès
- **Activez le monitoring** pour une observabilité complète
- **Planifiez la capacité** avec des node groups appropriés
- **Testez les sauvegardes** régulièrement
:::

:::warning ⚠️ Attention
- **Les suppressions sont irréversibles** - pensez aux sauvegardes
- **Les mises à jour** peuvent avoir un impact sur les workloads
- **Vérifiez la compatibilité** des add-ons avec les versions Kubernetes
:::

---

**📚 Ressources Additionnelles :**
- [Documentation Kubernetes officielle](https://kubernetes.io/docs/)
- [Cluster API Book](https://cluster-api.sigs.k8s.io/)
- [Kamaji Documentation](https://github.com/clastix/kamaji)
