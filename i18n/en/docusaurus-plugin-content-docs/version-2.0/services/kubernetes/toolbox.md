---

sidebar_position: 7
title: Toolbox
--------------

# 🔐 Access & Security

## **Retrieve the Kubeconfig**

Once the cluster is deployed, retrieve the access credentials:

```bash
# Full admin kubeconfig
kubectl get secret <cluster-name>-admin-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
  > cluster-admin.yaml

# Read-only kubeconfig (if configured)
kubectl get secret <cluster-name>-readonly-kubeconfig \
  -o go-template='{{ printf "%s\n" (index .data "readonly.conf" | base64decode) }}' \
  > cluster-readonly.yaml
```

## **RBAC Configuration**

After deployment, configure user access:

```bash
# Connect to the cluster
export KUBECONFIG=cluster-admin.yaml

# Create roles and bindings
kubectl apply -f rbac-config.yaml
```

---

# 📊 Monitoring & Observability

## **Cluster Metrics**

```bash
# General Hikube cluster status
kubectl get kubernetes <cluster-name> -o yaml

# Kubernetes cluster nodes
kubectl --kubeconfig=cluster-admin.yaml get nodes

# Resource metrics
kubectl --kubeconfig=cluster-admin.yaml top nodes
kubectl --kubeconfig=cluster-admin.yaml top pods
```

## **Logs & Debugging**

```bash
# Cluster events
kubectl describe kubernetes <cluster-name>

# Component logs
kubectl logs -n kamaji -l app.kubernetes.io/instance=<cluster-name>

# Detailed machine status
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>
```

---

# 🛠️ Lifecycle Management

## **Upgrade**

```bash
# Cluster upgrade
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  version: "v1.29.0"  # New Kubernetes version
'
```

## **Scaling**

```bash
# Scale a node group
kubectl patch kubernetes <cluster-name> --type='merge' -p='
spec:
  nodeGroups:
    compute:
      maxReplicas: 20  # Increase limit
'
```

## **Deletion**

```bash
# WARNING: Irreversible cluster deletion
kubectl delete kubernetes <cluster-name>
```

---

# 🚨 Troubleshooting

## **Common Issues**

```bash
# Cluster stuck during creation
kubectl describe kubernetes <cluster-name>
kubectl get events --field-selector involvedObject.name=<cluster-name>

# Nodes not ready
kubectl --kubeconfig=cluster-admin.yaml describe nodes
kubectl get machines -l cluster.x-k8s.io/cluster-name=<cluster-name>

# Add-ons failing
kubectl --kubeconfig=cluster-admin.yaml get pods -A
kubectl --kubeconfig=cluster-admin.yaml describe helmreleases -A
```

## **Detailed Logs**

```bash
# Cluster API logs
kubectl logs -n capi-system -l control-plane=controller-manager

# Kamaji logs (control plane)
kubectl logs -n kamaji-system -l app.kubernetes.io/name=kamaji

# KubeVirt logs (workers)
kubectl logs -n kubevirt -l kubevirt.io=virt-controller
```
