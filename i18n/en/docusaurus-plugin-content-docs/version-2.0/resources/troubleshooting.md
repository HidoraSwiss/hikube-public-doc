---
sidebar_position: 1
title: Global Troubleshooting
---

# Hikube Global Troubleshooting

This guide covers the most common issues encountered on Hikube and their solutions.

---

## 1. General diagnosis

Before looking for a specific solution, start with these diagnostic commands:

```bash
# Resource status in your namespace
kubectl get all

# Recent events (sorted by date)
kubectl get events --sort-by=.metadata.creationTimestamp

# Detailed description of a resource
kubectl describe <type> <name>

# Pod logs
kubectl logs <pod-name>

# Previous container logs (in case of crash)
kubectl logs <pod-name> --previous
```

---

## 2. Pods in error

### CrashLoopBackOff

**Symptom:** The pod restarts in a loop, the status shows `CrashLoopBackOff`.

**Diagnosis:**

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name> --previous
```

**Solutions:**
- **Insufficient memory**: increase `resources.memory` or use a higher `resourcesPreset`
- **Configuration error**: check environment variables and configuration files in the logs
- **Missing dependency**: verify that required services (database, secrets) are available

---

### Pending

**Symptom:** The pod remains in `Pending` state without starting.

**Diagnosis:**

```bash
kubectl describe pod <pod-name>
# Look for the "Events" section at the bottom of the output
```

**Solutions:**
- **Insufficient resources**: the cluster does not have enough CPU/memory. Check available nodes with `kubectl get nodes` and `kubectl top nodes`
- **Unbound PVC**: the requested persistent volume is not available (see Storage section)
- **NodeSelector/Affinity**: the pod has placement constraints that do not match any node

---

### ImagePullBackOff

**Symptom:** The pod does not start, the status shows `ImagePullBackOff` or `ErrImagePull`.

**Diagnosis:**

```bash
kubectl describe pod <pod-name>
# Look for "Failed to pull image" in the events
```

**Solutions:**
- **Image not found**: check the image name and tag in your manifest
- **Private registry**: make sure an `imagePullSecret` is configured
- **Network issue**: check connectivity to the registry

---

### OOMKilled

**Symptom:** The pod is killed with exit code `137` and reason `OOMKilled`.

**Diagnosis:**

```bash
kubectl describe pod <pod-name>
# Look for "Last State: Terminated - Reason: OOMKilled"
```

**Solutions:**
- Increase the memory limit in `resources.memory` or switch to a higher `resourcesPreset`
- Check if the application has a memory leak by monitoring consumption with `kubectl top pod`

---

## 3. Cluster access

### Invalid kubeconfig

**Symptom:** `error: You must be logged in to the server (Unauthorized)`

**Diagnosis:**

```bash
# Check the kubeconfig file being used
echo $KUBECONFIG
kubectl config current-context
```

**Solutions:**
- Regenerate the kubeconfig from your Hikube cluster:
  ```bash
  kubectl get secret <cluster-name>-admin-kubeconfig \
    -o go-template='{{ printf "%s\n" (index .data "super-admin.conf" | base64decode) }}' \
    > my-cluster-kubeconfig.yaml
  export KUBECONFIG=my-cluster-kubeconfig.yaml
  ```
- Verify that the `KUBECONFIG` variable points to the correct file

---

### Expired certificate

**Symptom:** `Unable to connect to the server: x509: certificate has expired`

**Diagnosis:**

```bash
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d | openssl x509 -text -noout | grep -A2 Validity
```

**Solution:** Retrieve an up-to-date kubeconfig from the cluster Secret (see above).

---

### Connection refused

**Symptom:** `The connection to the server was refused`

**Diagnosis:**

```bash
# Test connectivity
kubectl cluster-info
```

**Solutions:**
- Check that the cluster is in `Ready` state: `kubectl get kubernetes <cluster-name>`
- Verify that the control plane is accessible from your network
- If you are using a VPN, make sure it is active

---

## 4. Storage

### PVC in Pending state

**Symptom:** The PVC remains in `Pending` and dependent pods do not start.

**Diagnosis:**

```bash
kubectl get pvc
kubectl describe pvc <pvc-name>
```

**Solutions:**
- **Invalid StorageClass**: check that the specified `storageClass` exists with `kubectl get storageclass`
- **Insufficient capacity**: reduce the requested size or contact support to increase quotas
- **Empty StorageClass**: if `storageClass: ""`, the default class is used. Try `storageClass: replicated` explicitly

---

### Insufficient disk space

**Symptom:** Pods crash with errors such as `No space left on device`.

**Diagnosis:**

```bash
# Check PVC usage
kubectl exec -it <pod-name> -- df -h
```

**Solutions:**
- Increase the `size` value in the manifest and reapply
- Delete unnecessary data (logs, temporary files)

---

## 5. Network

### Service not accessible

**Symptom:** Unable to connect to the service from outside or between pods.

**Diagnosis:**

```bash
# Check that the service exists and has an endpoint
kubectl get svc
kubectl get endpoints <service-name>

# Test connectivity from a pod
kubectl run test-net --image=busybox --rm -it -- wget -qO- http://<service-name>:<port>
```

**Solutions:**
- **No endpoint**: the service `selector` labels do not match any pod
- **External not enabled**: add `external: true` in the manifest to create a LoadBalancer
- **Incorrect port**: check that the service port matches the port exposed by the application

---

### DNS not resolved

**Symptom:** `Could not resolve host` when accessing a service by its name.

**Diagnosis:**

```bash
# Check cluster DNS
kubectl run test-dns --image=busybox --rm -it -- nslookup <service-name>

# Check CoreDNS pods
kubectl get pods -n kube-system -l k8s-app=kube-dns
```

**Solutions:**
- Use the full DNS name: `<service>.<namespace>.svc.cluster.local`
- Check that the CoreDNS pods are in `Running` state

---

### Ingress returns 404 or 502

**Symptom:** The Ingress URL returns a 404 (Not Found) or 502 (Bad Gateway) error.

**Diagnosis:**

```bash
kubectl describe ingress <ingress-name>
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
```

**Solutions:**
- **404**: check that the Ingress `path` and `host` match your configuration
- **502**: the backend service is not responding. Check that the backend pods are in `Running` state and that the port is correct
- **Missing IngressClass**: add `ingressClassName: nginx` in the Ingress spec

---

## 6. Databases

### Connection refused

**Symptom:** `Connection refused` when attempting to connect to the database.

**Diagnosis:**

```bash
# Check the database pod status
kubectl get pods | grep <database-name>

# Check services
kubectl get svc | grep <database-name>
```

**Solutions:**
- Check that the database pods are in `Running` state
- Check the credentials: `kubectl get secret <name>-auth -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'`
- If `external: false`, use `kubectl port-forward` to connect locally

---

### Replication lag

**Symptom:** Replicas have significant replication lag compared to the master.

**Diagnosis:**

```bash
# Redis - Check replication
kubectl exec -it rfr-redis-<name>-0 -- redis-cli -a "$REDIS_PASSWORD" INFO replication

# PostgreSQL - Check lag
kubectl exec -it <name>-1 -- psql -c "SELECT * FROM pg_stat_replication;"
```

**Solutions:**
- Increase the resources (CPU/memory) for the replicas
- Check the network load between datacenters
- Reduce write load if the lag persists

---

### Failover not triggered

**Symptom:** The master is down but no replica is promoted.

**Diagnosis:**

```bash
# Redis - Check Sentinel
kubectl exec -it rfs-redis-<name>-<id> -- redis-cli -p 26379 SENTINEL masters

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp | grep <database-name>
```

**Solutions:**
- Check that `replicas > 1` in the manifest (failover requires at least one replica)
- Verify that Sentinel pods (Redis) or the operator are in `Running` state
- Check the operator logs for errors

---

## 7. Messaging (NATS, RabbitMQ)

### Producer/consumer disconnected

**Symptom:** Clients lose connection to the message broker.

**Diagnosis:**

```bash
# Check broker pod status
kubectl get pods | grep <nats|rabbitmq>

# Check logs
kubectl logs <broker-pod-name>
```

**Solutions:**
- Check that the broker pods are in `Running` state
- Implement automatic reconnection logic on the client side
- Check the configured connection limits

---

### Lost messages

**Symptom:** Sent messages are never received by consumers.

**Diagnosis:**

```bash
# RabbitMQ - Check queues
kubectl exec -it <rabbitmq-pod> -- rabbitmqctl list_queues name messages consumers

# NATS - Check JetStream streams
kubectl exec -it <nats-pod> -- nats stream ls
```

**Solutions:**
- **RabbitMQ**: use Quorum Queues to ensure message durability
- **NATS**: enable JetStream for message persistence
- Verify that consumers are connected and active
- Make sure queues/subjects exist before sending messages
