---

sidebar_position: 5
title: Quick Start
------------------

# 🚀 Deploy Kubernetes in 5 Minutes

This guide walks you through creating your first Kubernetes cluster on Hikube — from the basic configuration to deploying a test application.

---

## Prerequisites

Before you begin, ensure you have:

* **Access to a Hikube tenant** with appropriate permissions
* **kubectl CLI configured** to interact with the Hikube API
* **Basic Kubernetes knowledge** (pods, services, deployments)

---

## Step 1: Cluster Configuration

### **Basic Kubernetes Cluster**

Create a file named `my-first-cluster.yaml` with the following configuration:

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
      ephemeralStorage: 50Gi       # System partition storage
      roles:
        - ingress-nginx           # Ingress support

  # Enable storage replication
  storageClass: "replicated"

  # Essential add-ons
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

# Watch deployment status
kubectl get kubernetes my-first-cluster -w
```

**Expected wait time:** 3–5 minutes

---

## 🔐 Step 2: Access the Cluster

### **Retrieve the Kubeconfig**

Once the cluster is deployed, retrieve the access credentials:

```bash
# Fetch the cluster's kubeconfig
kubectl get secret my-first-cluster-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > my-cluster-kubeconfig.yaml

# Set kubectl to use the new cluster
export KUBECONFIG=my-cluster-kubeconfig.yaml

# Test the connection
kubectl get nodes
```

**Expected output:**

```console
NAME                         STATUS   ROLES    AGE   VERSION
my-first-cluster-md0-xxxxx   Ready    <none>   2m    v1.29.0
```

---

## 🚀 Step 3: Deploy an Application

### **Demo Application**

Deploy a simple web application to test your cluster:

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
kubectl apply -f demo-app.yaml

kubectl get deployments
kubectl get pods
kubectl get services
kubectl get ingress
```

---

## ✅ Step 4: Verification & Testing

### **Check that everything is running**

```bash
kubectl get pods -l app=hello-hikube
```

**Expected output:**

```console
NAME                           READY   STATUS    RESTARTS   AGE
hello-hikube-xxxxx-xxxx        1/1     Running   0          1m
hello-hikube-xxxxx-yyyy        1/1     Running   0          1m
hello-hikube-xxxxx-zzzz        1/1     Running   0          1m
```

### **Access the application**

```bash
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Temporary local test
kubectl port-forward svc/hello-hikube-service 8080:80 &
curl http://localhost:8080
```

---

## 📊 Step 5: Monitoring & Observability

### **Built-in Dashboards**

If monitoring is enabled in your tenant:

```bash
kubectl get pods -n monitoring
kubectl get ingress -n monitoring
```

### **Cluster Metrics**

```bash
kubectl top nodes
kubectl top pods
kubectl get events --sort-by=.metadata.creationTimestamp
```

---

## 🎛️ Step 6: Management & Scaling

### **Cluster Scaling**

Your Hikube cluster can scale nodes automatically:

```bash
kubectl get nodes

kubectl get kubernetes my-first-cluster -o yaml | grep -A 10 nodeGroups

kubectl scale deployment hello-hikube --replicas=6
```

### **Observe Scaling**

```bash
kubectl get nodes -w
kubectl describe hpa
```

---

## 🔧 Step 7: Next Steps

### **Advanced Configuration**

```bash
# Modify your YAML to add more node groups, then re-apply
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
  storageClassName: replicated
  resources:
    requests:
      storage: 10Gi
```

---

## 🚨 Troubleshooting

### **Common Issues**

```bash
kubectl describe kubernetes my-first-cluster
kubectl describe nodes
kubectl logs -l app=hello-hikube
kubectl describe pod <pod-name>
kubectl describe ingress hello-hikube-ingress
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

### **Cleanup**

```bash
kubectl delete -f demo-app.yaml
kubectl delete kubernetes my-first-cluster
```

---

## 📋 Summary

You have created:

* A Kubernetes cluster with a managed control plane
* Worker nodes with autoscaling (1–5 nodes)
* A sample application with Ingress
* Automatic SSL certificates via cert-manager

## 🚀 Next Steps

* **[API Reference](./api-reference.md)** → Full cluster configuration
* **[GPU](../gpu/overview.md)** → Using GPUs with Kubernetes

---

**💡 Tip:** Keep your kubeconfig secure and configure RBAC to control access for your teams and environments.

---
