---
sidebar_position: 3
title: API Reference
---

# Kubernetes API Reference

This page documents all available configuration parameters for deploying and managing Kubernetes clusters on Hikube.

---

## Base Structure

### **Kubernetes Resource**

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
  # Detailed configuration below
```

---

## General Parameters

### **Cluster Configuration**

| **Parameter** | **Type** | **Description** | **Default** | **Required** |
|---------------|----------|-----------------|------------|------------|
| `host` | `string` | Hostname to access the cluster API | `""` (cluster name) | No |
| `storageClass` | `string` | Default storage class | `"replicated"` | No |

```yaml
spec:
  host: "k8s-production.company.com"
  storageClass: "replicated"
```

### **Control Plane**

| **Parameter** | **Type** | **Description** | **Default** | **Required** |
|---------------|----------|-----------------|------------|------------|
| `controlPlane.replicas` | `int` | Number of control plane replicas | `2` | No |

```yaml
spec:
  controlPlane:
    replicas: 3  # For maximum high availability
```

---

## 👥 Node Groups Configuration

### **Node Groups Parameters**

Node groups define worker node pools with specific characteristics.

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

#### **Detailed Parameters**

| **Parameter** | **Type** | **Description** | **Default** | **Required** |
|---------------|----------|-----------------|------------|------------|
| `minReplicas` | `int` | Minimum number of nodes | `0` | Yes |
| `maxReplicas` | `int` | Maximum number of nodes | `10` | Yes |
| `instanceType` | `string` | VM instance type (S1/U1/M1 - see available types) | `"s1.medium"` | Yes |
| `ephemeralStorage` | `string` | Ephemeral storage size | `"20Gi"` | No |
| `roles` | `[]string` | Special roles assigned to nodes | `[]` | No |
| `resources.cpu` | `string` | Custom CPU override | `""` | No |
| `resources.memory` | `string` | Custom memory override | `""` | No |

#### **Available Instance Types**

##### **S Series (Standard) - Ratio 1:2**

Optimized for general workloads with shared and burstable CPU.

```yaml
# Available instances
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

##### **U Series (Universal) - Ratio 1:4**

Optimized for balanced workloads with more memory.

```yaml
# Available instances
instanceType: "u1.medium"    # 1 vCPU, 4 GB RAM
instanceType: "u1.large"     # 2 vCPU, 8 GB RAM  
instanceType: "u1.xlarge"    # 4 vCPU, 16 GB RAM
instanceType: "u1.2xlarge"   # 8 vCPU, 32 GB RAM
instanceType: "u1.4xlarge"   # 16 vCPU, 64 GB RAM
instanceType: "u1.8xlarge"   # 32 vCPU, 128 GB RAM
```

##### **M Series (Memory Optimized) - Ratio 1:8**

Optimized for applications requiring a lot of memory.

```yaml
# Available instances
instanceType: "m1.large"     # 2 vCPU, 16 GB RAM
instanceType: "m1.xlarge"    # 4 vCPU, 32 GB RAM
instanceType: "m1.2xlarge"   # 8 vCPU, 64 GB RAM
instanceType: "m1.4xlarge"   # 16 vCPU, 128 GB RAM
instanceType: "m1.8xlarge"   # 32 vCPU, 256 GB RAM
```

#### **Instance Type Selection Guide**

| **Series** | **Recommended Use Case** | **Examples** |
|-----------|---------------------------|--------------|
| **S1** | Web applications, APIs, light loads | Ingress controllers, stateless applications |
| **U1** | Balanced workloads, general computing | Microservices, business applications, CI/CD |
| **M1** | Memory-hungry applications | Databases, cache, analytics, monitoring |

#### **Available Node Roles**

| **Role** | **Description** | **Usage** |
|----------|-----------------|-----------|
| `ingress-nginx` | NGINX Ingress Controller | HTTP/HTTPS exposure |
| `monitoring` | Monitoring services | Metrics and observability |
| `storage` | Dedicated storage nodes | I/O intensive workloads |

### **Node Group Examples**

#### **General Node Group**

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

#### **Compute Intensive Node Group**

```yaml
nodeGroups:
  compute:
    minReplicas: 0
    maxReplicas: 5
    instanceType: "u1.4xlarge"  # 16 vCPU, 64 GB RAM
    ephemeralStorage: 100Gi
    roles: []
```

#### **Memory Optimized Node Group**

```yaml
nodeGroups:
  memory-intensive:
    minReplicas: 1
    maxReplicas: 3
    instanceType: "m1.xlarge"   # 4 vCPU, 32 GB RAM
    ephemeralStorage: 30Gi
    resources:
      cpu: "6"       # Override: 6 vCPU instead of 4
      memory: "48Gi" # Override: 48 GB instead of 32
```

---

## 🚦 Available Add-ons

### **Cert-Manager**

Automated SSL/TLS certificate management.

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

#### **Advanced Cert-Manager Configuration**

```yaml
spec:
  addons:
    certManager:
      enabled: true
      valuesOverride:
        # Default issuers configuration
        global:
          leaderElection:
            namespace: cert-manager
        # Prometheus metrics
        prometheus:
          enabled: true
          servicemonitor:
            enabled: true
        # Pod resources
        resources:
          requests:
            cpu: 10m
            memory: 32Mi
          limits:
            cpu: 100m
            memory: 128Mi
```

### **Ingress NGINX**

Ingress controller for HTTP/HTTPS exposure.

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

#### **Advanced Ingress NGINX Configuration**

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
          # Replication for high availability
          replicaCount: 3
          
          # Resource configuration
          resources:
            requests:
              cpu: 100m
              memory: 90Mi
            limits:
              cpu: 500m
              memory: 500Mi
          
          # LoadBalancer service configuration
          service:
            type: LoadBalancer
            annotations:
              service.beta.kubernetes.io/aws-load-balancer-type: nlb
          
          # Metrics
          metrics:
            enabled: true
            serviceMonitor:
              enabled: true
          
          # SSL configuration
          config:
            ssl-protocols: "TLSv1.2 TLSv1.3"
            ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256,ECDHE-RSA-AES128-GCM-SHA256"
            
          # Logging
          enableSnippets: true
```

### **Flux CD**

GitOps deployment for deployment automation.

```yaml
spec:
  addons:
    fluxcd:
      enabled: true
      valuesOverride:
        # Git repository configuration
        gitRepository:
          url: "https://github.com/company/k8s-manifests"
          branch: "main"
          path: "./clusters/production"
```

#### **Advanced Flux CD Configuration**

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

### **Monitoring Agents**

Log and metric collection with FluentBit and other agents.

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        # FluentBit configuration
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

#### **Advanced Monitoring Configuration**

```yaml
spec:
  addons:
    monitoringAgents:
      enabled: true
      valuesOverride:
        # FluentBit for logs
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
        
        # Node Exporter for system metrics
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

## Complete Examples

### **Production Cluster**

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
  
  # High availability control plane
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
    
    # Complete monitoring
    monitoringAgents:
      enabled: true
      valuesOverride:
        fluentbit:
          enabled: true
```

### **Development Cluster**

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
    replicas: 1  # Resource savings
  
  # Single versatile node group
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

### **ML/AI Cluster with GPU**

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
  storageClass: "fast-ssd"  # High performance storage
  
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
      minReplicas: 0      # Zero scaling possible
      maxReplicas: 10
      instanceType: "u1.2xlarge"  # Instance with GPU
      ephemeralStorage: 500Gi      # Large storage for datasets
      roles: []
  
  addons:
    certManager:
      enabled: true
    
    monitoringAgents:
      enabled: true
      valuesOverride:
        # Specialized GPU monitoring
        dcgmExporter:
          enabled: true
```

---

## 🔐 Access and Security

### **Kubeconfig Retrieval**

Once the cluster is deployed, retrieve the access credentials:

```bash
# Complete admin kubeconfig
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Read-only kubeconfig (if configured)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

### **RBAC Configuration**

After deployment, configure user access:

```bash
# Connect to the cluster
export KUBECONFIG=cluster-admin.yaml

# Create roles and bindings
kubectl apply -f rbac-config.yaml
```

---

## 📊 Monitoring and Observability

### **Cluster Metrics**

```bash
# General Hikube cluster status
kubectl get kubernetes <cluster-name> -o yaml

# Kubernetes cluster nodes
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Resource metrics
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

### **Logs and Debugging**

```bash
# Cluster events
kubectl describe kubernetes <cluster-name>

# Component logs
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Detailed machine status
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

## 🛠️ Lifecycle Management

### **Update**

```bash
# Cluster update
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # New Kubernetes version
'
```

### **Scaling**

```bash
# Node group scaling
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Increase limit
'
```

### **Deletion**

```bash
# WARNING: Irreversible cluster deletion
kubectl delete kubernetes <cluster-name>
```

---

## 🚨 Troubleshooting

### **Common Issues**

```bash
# Cluster stuck in creation
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Nodes not ready
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-ons in error
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

### **Detailed Logs**

```bash
# Cluster API logs
kubectl logs -n capi-system -l control-plane=controller-manager

# Kamaji logs (control plane)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# KubeVirt logs (workers)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```

---

:::tip 💡 Best Practices

- **Use labels** to organize your clusters by environment
- **Configure RBAC** from creation to secure access
- **Enable monitoring** for complete observability
- **Plan capacity** with appropriate node groups
- **Test backups** regularly
:::

:::warning ⚠️ Attention

- **Deletions are irreversible** - think about backups
- **Updates** may impact workloads
- **Check compatibility** of add-ons with Kubernetes versions
:::

---

**📚 Additional Resources:**

- [Official Kubernetes Documentation](https://kubernetes.io/docs/)
- [Cluster API Book](https://cluster-api.sigs.k8s.io/)
- [Kamaji Documentation](https://github.com/clastix/kamaji)

