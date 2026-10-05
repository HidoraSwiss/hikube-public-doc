---
title: Access and tools
---

# Access and tools

This guide explains how to access a Hikube Kubernetes cluster once it is created, and gathers useful commands for operating it. The cluster lifecycle (creation, modification, deletion) is managed in the console; everything else is done in the cluster with your usual tools.

## Download the kubeconfig

1. In the console, open **Infrastructure** > **Kubernetes** and click the cluster.
2. Wait until the cluster has the **Ready** status.
3. In the **Actions** section of the detail page, click **Kubeconfig**.

The browser downloads the `kubeconfig-<cluster-name>.yaml` file. It grants administrator access to the cluster.

:::warning
Keep this file in a safe place (secrets manager, vault) and never commit it to version control. To give access to other people, create dedicated permissions for them with RBAC rather than sharing this file.
:::

## Use the kubeconfig

```bash
# For the current session
export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml

# Or for a single command
kubectl --kubeconfig ~/Downloads/kubeconfig-<cluster-name>.yaml get nodes

# Check the connection
kubectl cluster-info
kubectl get nodes
```

The same file works with `helm`, `k9s`, `flux` or any Kubernetes client.

## Configure RBAC

Create dedicated roles and accounts for your teams and pipelines, for example read-only access to a namespace:

```yaml title="rbac-readonly.yaml"
apiVersion: v1
kind: Namespace
metadata:
  name: production
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: viewer
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: viewer-view
  namespace: production
subjects:
  - kind: ServiceAccount
    name: viewer
    namespace: production
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
```

```bash
kubectl apply -f rbac-readonly.yaml
```

---

## Monitoring and observability

### In the console

The cluster detail page shows the status, the version, the control plane, the **Node Pools** (number of active nodes per group) and the enabled extensions.

### In the cluster

```bash
# Cluster nodes
kubectl get nodes -o wide

# Resource consumption
kubectl top nodes
kubectl top pods -A

# Recent events
kubectl get events -A --sort-by=.metadata.creationTimestamp
```

---

## Lifecycle management

These operations are done in the console:

| Operation | Where |
|-----------|----|
| Upgrade the version | **Edit** > **Kubernetes Version** ([guide](./upgrade-cluster.md)) |
| Add, modify or delete a node group | **Edit** > **Node groups** ([guide](./manage-node-groups.md)) |
| Adjust scaling | **Edit** > **Minimum nodes** / **Maximum nodes** ([guide](./configure-autoscaling.md)) |
| Enable or configure an addon | **Edit** > **Extensions & Addons** |
| Delete the cluster | **Delete**, then confirm the name ([quick start](../quick-start.md), step 7) |

---

## Diagnostics

```bash
# Nodes not ready
kubectl describe node <node-name>

# Pods in error
kubectl get pods -A --field-selector=status.phase!=Running
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous

# Addon components (Cilium, CoreDNS, Ingress NGINX, etc.)
kubectl get pods -A | grep -E "cilium|coredns|ingress-nginx|cert-manager"
```

If a cluster stays **Creating**, if an addon does not deploy or if a node never joins the cluster, [contact support](mailto:support@hidora.io), specifying the cluster name and the project.
