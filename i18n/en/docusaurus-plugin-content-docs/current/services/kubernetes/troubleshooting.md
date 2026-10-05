---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Kubernetes

### The cluster stays in creation

**Cause**: provisioning of the control plane or the nodes does not complete.

**Solution**:

1. In **Infrastructure** > **Kubernetes**, check the cluster status. A newly created cluster goes from **Creating** to **Ready** in a few minutes.
2. On the detail page, check in **Node Pools** that nodes are becoming active.
3. If the status does not change, [contact support](mailto:support@hidora.io), specifying the cluster name and the project.

---

### The wizard blocks creation (quota)

**Cause**: the project does not have enough CPU, memory or storage quota. The quota is calculated on the control plane and on the **maximum number** of nodes of each group, including ephemeral storage ("Storage quota exceeded for this project (including maximum auto-scaling)").

**Solution**:

1. Check the wizard's **Project Quotas** gauges to identify the exceeded resource.
2. Reduce the **Maximum nodes**, the instance type or the **Ephemeral storage size** of the groups.
3. If the need is real, ask support for a quota increase.

---

### The kubeconfig download fails

**Cause**: the console shows "Could not download the kubeconfig file." when the cluster is not ready yet or the service is temporarily unavailable.

**Solution**:

1. Wait until the cluster has the **Ready** status.
2. Click **Kubeconfig** again in the **Actions** section of the detail page.
3. If the error persists, contact support.

---

### Expired or invalid kubeconfig

**Cause**: `kubectl` returns `x509: certificate has expired`, `Unauthorized`, or can no longer reach the server (file from a cluster that was deleted and then recreated, for example).

**Solution**:

1. Download a new kubeconfig from the cluster detail page (**Kubeconfig** button).
2. Replace the old file:
   ```bash
   export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
   ```
3. Check connectivity:
   ```bash
   kubectl cluster-info
   ```

---

### Nodes in NotReady state

**Cause**: one or more nodes no longer respond to the control plane. This may be due to insufficient resources, a full ephemeral disk or a kubelet failure.

**Solution**:

1. Check the state of the nodes and their conditions:
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Check the events to identify the cause (`DiskPressure`, `MemoryPressure`, `PIDPressure`):
   ```bash
   kubectl get events -A --sort-by='.lastTimestamp'
   ```
3. In case of `DiskPressure`, increase the group's **Ephemeral storage size** (**Edit** > **Node groups**).
4. Check that the instance type provides enough resources for the deployed workloads.
5. If the problem persists, contact support.

---

### Pods in Pending (insufficient resources)

**Cause**: no node has enough CPU or memory to schedule the pod.

**Solution**:

1. Identify the reason for the Pending state:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Look for the `FailedScheduling` message in the events.
2. Check the resources available on the nodes:
   ```bash
   kubectl top nodes
   ```
3. If the nodes are saturated while the group has reached its maximum, increase the **Maximum nodes** (**Edit** > **Node groups**), or add a group with a larger instance type.
4. If the pod is blocked on a PVC, check that the PVC is provisioned:
   ```bash
   kubectl get pvc
   ```

---

### Ingress returns 404 or does not respond

**Cause**: the Ingress resource is misconfigured, the Ingress NGINX addon is not enabled, or no node group hosts the controller.

**Solution**:

1. On the cluster detail page, check that **Ingress NGINX** appears in the **Extensions** section. Otherwise, enable it via **Edit** > **Extensions & Addons**.
2. Check that at least one node group is **Exposed on the internet (Public IP)** and that the controller has an external IP:
   ```bash
   kubectl get svc -A | grep ingress-nginx-controller
   ```
3. Check that `ingressClassName` is specified in your Ingress:
   ```yaml title="ingress.yaml"
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: my-app
   spec:
     ingressClassName: nginx
     rules:
       - host: app.example.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: my-app-svc
                   port:
                     number: 80
   ```
4. Check that the backend (Service and pods) is working:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```
5. Check that your DNS record points to the controller's external IP, and check the host and path configuration in the Ingress rule.

---

### PVC in Pending state

**Cause**: the requested storage class does not exist in the cluster or the storage capacity is insufficient.

**Solution**:

1. List the storage classes available in the cluster:
   ```bash
   kubectl get storageclass
   ```
2. Make sure the name used in your PVC matches an existing class, for example `replicated`:
   ```yaml title="pvc.yaml"
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: my-data
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: replicated
     resources:
       requests:
         storage: 10Gi
   ```
3. Check the events related to the PVC:
   ```bash
   kubectl describe pvc my-data
   ```
4. If the capacity is insufficient, reduce the requested size or contact Hikube support.

---

### Saving changes fails

**Cause**: the console shows an error after **Save**, for example "Conflict during the update (e.g. resource in use)." or a validation message.

**Solution**:

1. Read the message: it indicates the field to correct (for example, GPUs added to an existing group, maximum lower than minimum, invalid override YAML).
2. In case of conflict, wait for the current operation on the cluster to finish, reload the edit page and try again.
3. To add GPUs, create a new node group rather than modifying an existing group without GPUs.
