---
sidebar_position: 6
title: API Reference
---

# Exemples Complets

## **Cluster de Production**

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

## **Cluster de Développement**

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

## **Cluster ML/AI avec GPU**

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
      instanceType: "u1.2xlarge"
      gpus: # Instance avec GPU
        - name: nvidia.com/AD102GL_L40S # Nvidia L40S
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
