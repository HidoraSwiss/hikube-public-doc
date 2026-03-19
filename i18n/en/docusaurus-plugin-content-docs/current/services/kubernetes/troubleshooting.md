---
sidebar_position: 7
title: Troubleshooting
---

# Troubleshooting — Kubernetes

### Nodes in NotReady state

**Cause**: one or more nodes are no longer responding to the control plane. This can be due to insufficient resources, a storage issue, or a kubelet failure.

**Solution**:

1. Check node status and conditions:
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Review events to identify the cause (DiskPressure, MemoryPressure, PIDPressure):
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```
3. Verify that the chosen `instanceType` provides enough resources for deployed workloads.
4. If the issue persists, increase the nodeGroup `maxReplicas` to allow the cluster to provision new healthy nodes.

---

### Pods in Pending state (insufficient resources)

**Cause**: no node has enough CPU or memory to schedule the pod. The Kubernetes scheduler cannot find a placement.

**Solution**:

1. Identify the reason for Pending:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Look for the `FailedScheduling` message in events.

2. Check available resources on nodes:
   ```bash
   kubectl top nodes
   ```

3. If nodes are saturated, increase the `maxReplicas` of your nodeGroup:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       workers:
         minReplicas: 2
         maxReplicas: 10
   ```

4. If the pod is stuck on a PVC, verify that the PVC is properly provisioned:
   ```bash
   kubectl get pvc
   ```

---

### Expired or invalid kubeconfig

**Cause**: the client certificate in the kubeconfig has expired (`x509: certificate has expired` error) or the credentials are invalid (`Unauthorized` error).

**Solution**:

1. Regenerate the kubeconfig from the source Secret:
   ```bash
   kubectl get secret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
   ```

2. Replace your old kubeconfig file:
   ```bash
   export KUBECONFIG=kubeconfig.yaml
   ```

3. Verify connectivity:
   ```bash
   kubectl cluster-info
   ```

---

### Ingress returns 404

**Cause**: the Ingress resource is misconfigured or the ingressNginx addon is not enabled on the cluster.

**Solution**:

1. Verify that the `ingressNginx` addon is enabled in the cluster configuration:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       ingressNginx:
         enabled: true
   ```

2. Verify that `ingressClassName` is specified in your Ingress:
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

3. Verify that the backend (Service + Pod) is running:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```

4. Check the host and path configuration in the Ingress rule.

---

### PVC in Pending state

**Cause**: the requested `storageClass` does not exist or the storage capacity is insufficient.

**Solution**:

1. Check available storageClasses:
   ```bash
   kubectl get storageclass
   ```

2. Make sure the name used in your PVC matches an existing storageClass (`local` or `replicated`):
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

3. Check events related to the PVC:
   ```bash
   kubectl describe pvc my-data
   ```

4. If capacity is insufficient, reduce the requested size or contact Hikube support.
