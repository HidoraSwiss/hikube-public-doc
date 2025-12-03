---

sidebar_position: 6
title: API Reference
--------------------

# Complete Examples

## **Production Cluster**

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
  # Cluster configuration
  host: "k8s-prod.company.com"
  storageClass: "replicated"

  # High-availability control plane
  controlPlane:
    replicas: 3

  # Specialized node groups
  nodeGroups:
    # General nodes with Ingress
    web:
      minReplicas: 3
      maxReplicas: 10
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # Compute nodes for intensive workloads
    compute:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
      ephemeralStorage: 100Gi
      roles: []

    # Dedicated monitoring nodes
    monitoring:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
      ephemeralStorage: 200Gi
      roles:
        - monitoring

  # Complete add-ons
  addons:
    # Automatic SSL certificates
    certManager:
      enabled: true
      valuesOverride:
        prometheus:
          enabled: true

    # HTTP/HTTPS exposure
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

    # GitOps for deployments
    fluxcd:
      enabled: true
      valuesOverride:
        gitRepository:
          url: "https://github.com/company/k8s-production"
          branch: "main"

    # Full monitoring
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

## **Development Cluster**

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
  # Basic configuration
  host: "k8s-dev.company.local"
  storageClass: "replicated"

  # Minimal control plane
  controlPlane:
    replicas: 1  # Resource saving

  # Single multipurpose node group
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 3
      instanceType: "s1.medium"
      ephemeralStorage: 30Gi
      roles:
        - ingress-nginx

  # Essential add-ons only
  addons:
    certManager:
      enabled: true

    ingressNginx:
      enabled: true
      hosts:
        - "*.dev.company.local"
      valuesOverride:
        controller:
          replicaCount: 1  # Minimal replication
```

## **ML/AI Cluster with GPU**

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
  storageClass: "fast-ssd"  # High-performance storage

  controlPlane:
    replicas: 2

  nodeGroups:
    # Standard nodes for orchestration
    system:
      minReplicas: 2
      maxReplicas: 4
      instanceType: "s1.large"
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx

    # GPU nodes for ML workloads
    gpu:
      minReplicas: 0      # Zero-scaling allowed
      maxReplicas: 10
      instanceType: "u1.2xlarge"
      gpus: # Instance with GPU
        - name: nvidia.com/AD102GL_L40S # Nvidia L40S
      ephemeralStorage: 500Gi      # Large storage for datasets
      roles: []

  addons:
    certManager:
      enabled: true

    monitoringAgents:
      enabled: true
      valuesOverride:
        # GPU-specific monitoring
        dcgmExporter:
          enabled: true
```

---

:::tip 💡 Best Practices

* **Use labels** to organize clusters by environment
* **Configure RBAC** from the start to secure access
* **Enable monitoring** for full observability
* **Plan capacity** using appropriate node groups
* **Test backups** regularly
  :::

:::warning ⚠️ Warning

* **Deletions are irreversible** — ensure backups exist
* **Updates** may impact workloads
* **Check compatibility** of add-ons with Kubernetes versions
  :::
