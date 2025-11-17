---
sidebar_position: 2
title: Quick Start
---

# 🚀 Deploy Kubernetes in 5 minutes

This guide walks you through creating your first Kubernetes cluster on Hikube, from basic configuration to deploying a test application.

---

## Prerequisites

Before starting, make sure you have:

- **Access to a Hikube tenant** with appropriate permissions
- **kubectl CLI configured** to interact with the Hikube API
- **Basic Kubernetes knowledge** (pods, services, deployments)

---

## Step 1: Cluster Configuration

### **Basic Kubernetes Cluster**

Create a `my-first-cluster.yaml` file with the following configuration:

```yaml title="my-first-cluster.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kubernetes
metadata:
  name: my-first-cluster
  namespace: default
spec:
  # Control plane configuration
  controlPlane:
    replicas: 2  # High availability
  
  # Worker nodes configuration
  nodeGroups:
    general:
      minReplicas: 1
      maxReplicas: 5
      instanceType: "s1.large"     # 4 vCPU, 8 GB RAM
      ephemeralStorage: 50Gi
      roles:
        - ingress-nginx           # Ingress support
  
  # Default storage class
  storageClass: "replicated"
  
  # Essential add-ons enabled
  addons:
    certManager:
      enabled: true
    ingressNginx:
      enabled: true
      hosts:
        - my-app.example.com
```

### **Deploy the Cluster**

```bash
# Apply the configuration
kubectl apply -f my-first-cluster.yaml

# Check deployment status
kubectl get kubernetes my-first-cluster -w
```

**Wait time:** The cluster will be ready in 3-5 minutes

---

## 🔐 Step 2: Cluster Access

### **Retrieve the Kubeconfig**

Once the cluster is deployed, retrieve the access information:

```bash
# Retrieve the cluster kubeconfig
kubectl get secret my-first-cluster-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

# Configure kubectl for the new cluster
export KUBECONFIG=my-cluster-kubeconfig.yaml

# Test the connection
kubectl get nodes
```

**Expected result:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Step 3: Application Deployment

### **Demo Application**

Let's deploy a simple web application to test our cluster:

```yaml title="demo-app.yaml"
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-hikube
  labels:
    app: hello-hikube
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello-hikube
  template:
    metadata:
      labels:
        app: hello-hikube
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
        env:
        - name: WELCOME_MESSAGE
          value: "Hello from Hikube Kubernetes!"

---
# Service
apiVersion: v1
kind: Service
metadata:
  name: hello-hikube-service
spec:
  selector:
    app: hello-hikube
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hello-hikube-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: my-app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: hello-hikube-service
            port:
              number: 80
```

### **Deploy the Application**

```bash
# Deploy the application
kubectl apply -f demo-app.yaml

# Verify the deployment
kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ✅ Step 4: Verification and Tests

### **Verify Everything Works**

```bash
# Pod status
kubectl get pods -l app=hello-hikube
```

**Expected result:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### **Application Access**

```bash
# Get the external IP of the Ingress Controller
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Local test (while waiting for DNS configuration)
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Step 5: Monitoring and Observability

### **Integrated Dashboards**

If you enabled monitoring when configuring the tenant:

```bash
# Check monitoring services
kubectl get pods -n monitoring

# Access Grafana (according to tenant configuration)
kubectl get ingress -n monitoring
```

### **Cluster Metrics**

```bash
# Node metrics
kubectl top nodes

# Pod metrics
kubectl top pods

# Cluster events
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Step 6: Management and Scaling

### **Cluster Scaling**

The Hikube cluster can automatically adjust the number of nodes based on demand:

```bash
# Check current number of nodes
kubectl get nodes

# View nodeGroup configuration
kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

# Automatic scaling triggers based on requested resources
# Example: deploying more pods will require more nodes
kubectl scale deployment hello-hikube --replicas=6
```

### **Observe Scaling**

```bash
# Watch automatic node addition
kubectl get nodes -w

# Check scaling metrics
kubectl describe hpa  # If HPA is configured
```

---

## 🔧 Step 7: Next Actions

### **Advanced Configuration**

Now that your cluster is working, explore advanced features:

```bash
# To add node groups, modify the YAML file and re-apply
# Example in my-first-cluster.yaml:
# nodeGroups:
#   general:
#     # ... existing configuration
#   compute:
#     minReplicas: 0
#     maxReplicas: 3
#     instanceType: "s1.2xlarge"
#     ephemeralStorage: 100Gi

# Then apply the changes
kubectl apply -f my-first-cluster.yaml
```

### **Persistent Storage**

```yaml title="persistent-app.yaml"
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-storage
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: replicated  # Highly available storage
  resources:
    requests:
      storage: 10Gi
```

---

## 🚨 Quick Troubleshooting

### **Common Issues**

```bash
# Cluster creation taking too long
kubectl describe kubernetes my-first-cluster

# Nodes not Ready
kubectl describe nodes

# Pods in error
kubectl logs -l app=hello-hikube
kubectl describe pod <pod-name>

# Ingress not working
kubectl describe ingress hello-hikube-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

### **Cleanup**

```bash
# Delete the test application
kubectl delete -f demo-app.yaml

# Delete the cluster (WARNING: irreversible action)
kubectl delete kubernetes my-first-cluster
```

---

## 📋 Summary

You have created:

- A Kubernetes cluster with managed control plane
- Worker nodes with automatic scaling (1-5 nodes)
- A sample application with Ingress
- Automatic SSL certificate via cert-manager

## 🚀 Next Steps

- **[API Reference](./api-reference.md)** → Complete cluster configuration
- **[Databases](../databases/postgresql/overview.md)** → PostgreSQL, MySQL, Redis and other services
- **[GPU](../gpu/overview.md)** → Use GPUs with Kubernetes

---

**💡 Pro Tip:** Keep your `kubeconfig` file secure and consider configuring RBAC to control access to your cluster according to your teams and environments.

