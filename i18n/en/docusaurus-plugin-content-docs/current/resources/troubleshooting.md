---
sidebar_position: 1
title: General troubleshooting
---

# Hikube general troubleshooting

This guide covers the most common problems encountered on Hikube. For a problem specific to a service, also see that service's **Troubleshooting** page.

---

## 1. Console access

### "No organization"

**Symptom:** after signing in, the console shows **No organization**.

**Solutions:**
- if your organization has just been created, click **Refresh**;
- otherwise, your account is not linked to any organization: [contact support](mailto:support@hidora.io).

### "Service Unavailable"

**Symptom:** the console shows **Service Unavailable**.

**Solutions:**
- the platform is under maintenance or temporarily unreachable: wait a few moments, then click **Retry**;
- if the problem persists, contact support from this page: the **Error details** are attached to your request.

### I cannot see a project

The projects shown depend on the selected organization and on your permissions. Check the **Current Organization** in the profile menu (**Change organization** if you have several), then ask an organization administrator to give you access to the project.

---

## 2. Creating a resource

### "Quota exceeded"

**Symptom:** the creation wizard blocks validation and reports that the quota is exceeded.

**Solutions:**
- reduce the requested size (instance type, preset, storage, maximum number of nodes);
- free up unused resources in the project;
- ask an administrator to increase the project's quotas (project settings → **Quotas**).

:::note Kubernetes
For a Kubernetes cluster, the quota is calculated on the **maximum number** of nodes of each group, including autoscaling.
:::

### "Project quotas are unavailable right now"

The console cannot read the project's quotas and blocks creation as a precaution. Reload the page; if the message persists, contact support.

### Resource stuck in "Creating"

**Symptom:** a resource stays in **Creating** status well beyond the usual time (a few minutes).

**Solutions:**
- reload the detail page;
- if the status does not change, or switches to **Error** / **Failed**, contact support, specifying the project and the resource name.

---

## 3. Kubernetes

### The kubeconfig download fails

**Symptom:** the **Kubeconfig** button shows **Download failed**.

**Solution:** the cluster is probably not ready yet. Wait until it reaches **Ready** status, then try again.

### `kubectl` cannot reach the cluster

```bash
# Check which file is used
echo $KUBECONFIG
kubectl config view --minify

# Test the connection
kubectl cluster-info
```

**Solutions:**
- check that `KUBECONFIG` points to the `kubeconfig-<cluster-name>.yaml` file downloaded from the console;
- if the cluster was recreated, download its kubeconfig again.

### Pods in error in your cluster

The following commands run **in your Kubernetes cluster**, with its kubeconfig:

```bash
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
```

| State | Common cause | Lead |
|------|-----------------|-------|
| `CrashLoopBackOff` | Application error, insufficient memory | Read the logs of the previous container; increase the memory limits |
| `Pending` | Not enough resources on the nodes | Increase the node group maximum in the console or choose a larger instance type |
| `ImagePullBackOff` | Image not found or private registry | Check the image name and the registry credentials |
| `OOMKilled` | Memory limit reached | Increase the container's `resources.limits.memory` |

See: [Kubernetes - Troubleshooting](../services/kubernetes/troubleshooting.md)

---

## 4. Virtual machines

### Cannot connect over SSH

**Solutions:**
- check that the VM is in **Running** status in **VM Instances**;
- check that a public IP is assigned and that port 22 is allowed in the VM's network configuration;
- check that you are using the private key matching the public key provided at creation.

See: [Virtual machines - Troubleshooting](../services/compute/troubleshooting.md)

---

## 5. Databases and messaging

### Connection refused from outside

**Solutions:**
- check that **External access** is enabled on the cluster (**Edit**);
- use the address shown in the **Host** field of the detail page. Until it is assigned, external connections are not possible;
- check the user and password shown in the console.

### Password rejected

Check that you are using the password of the relevant user, shown on the cluster's detail page. For Redis and RabbitMQ, if you have rotated a password, update your applications.

See: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Storage

### Cannot delete a bucket

A bucket that still contains objects, or that is still in use, cannot be deleted. Empty it with your S3 client, then try again.

### S3 access denied (`AccessDenied`)

Check that the access key used belongs to a user of the bucket, with the appropriate permissions (read-only or read/write).

See: [Buckets - Troubleshooting](../services/storage/buckets/troubleshooting.md), [Disks - Troubleshooting](../services/storage/disks/troubleshooting.md)

---

## Contact support

If the problem persists: profile menu → **Contact support** (the technical context of the page is attached), or **support@hidora.io**. Specify the organization, the project and the name of the resources concerned.
