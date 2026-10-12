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

### Resource stuck in "Creating" or in "Error" status

**Symptom:** a resource stays in **Creating** status well beyond the usual time (a few minutes), or changes to **Error** status.

A project, a VPC or a managed application (Kubernetes cluster, database…) changes to **Error** status when the platform could not apply its last change. The resource may keep running with its previous configuration. A project in error carries an **Error** badge in the project selector.

**Solutions:**
- reload the detail page;
- if the status does not change, or switches to **Error** / **Failed**, contact support, specifying the project and the resource name.

---

## 3. Kubernetes

### Creating the first cluster waits on "Preparing the Kubernetes environment"

**Symptom:** after **Create cluster**, the wizard shows "Preparing the project's Kubernetes environment; creation will resume automatically."

**Solution:** for the first cluster of a project, the platform first prepares the project's Kubernetes environment, which takes a few minutes. Wait: the console retries the creation on its own, without losing your configuration (the **Cancel** button stops the wait). If a message asks you to contact support, do not try again and contact it.

### The kubeconfig download fails

**Symptom:** after a click on **Kubeconfig**, the console shows **Error**: "Could not download the kubeconfig file."

**Solution:** the cluster is probably not ready yet. Wait until it reaches **Ready** status, then try again.

### The Kubeconfig button is disabled

**Symptom:** the **Kubeconfig** button is grayed out, with the note "Reserved for project administrators.", or the console shows "The kubeconfig grants administrator access to the cluster: it is reserved for project administrators."

**Solution:** the kubeconfig grants administrator access to the cluster; downloading it is reserved for project administrators. Contact a project administrator.

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
- check that you are using the private key matching the public key provided at creation;
- connect with the user shown in the **SSH Connection** block of the VM's detail page (for example `debian` for Debian, `opc` for Oracle Linux). If the console indicates that the default user is not available, use the account configured in your image.

See: [Virtual machines - Troubleshooting](../services/compute/troubleshooting.md)

---

## 5. Databases and messaging

### Connection refused from outside

**Solutions:**
- check that **External access** is enabled on the cluster (**Edit**);
- use the address shown in the **Host** field of the detail page. Until it is assigned, external connections are not possible. For a MongoDB replica set, the detail page lists the address of each member: connect to a member with `directConnection=true`;
- check the user and password shown in the console.

### Password rejected

Check that you are using the password of the relevant user, shown on the cluster's detail page. For Redis and RabbitMQ, if you have rotated a password, update your applications.

### Changing a cluster is refused

The version of a database cannot be downgraded, and its disk size cannot be reduced. For PostgreSQL, MariaDB, MongoDB and RabbitMQ, the console only offers the current version and higher versions, and shows for example "The disk size cannot be reduced: 20 GB minimum." Changing the version or the preset restarts the cluster instances: plan it outside peak hours.

See: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Storage

### Delete a bucket without losing data

Deleting a bucket without WORM is permanent and removes all its objects, even if it is not empty. First copy the data you want to keep with your S3 client (for example `aws s3 sync`). If the deletion fails, try again, then contact support.

A locked bucket (WORM) is removed from the console, but its objects are not deleted: each object stays locked for 365 days after it is written (COMPLIANCE mode).

### S3 access denied (`AccessDenied`)

Check that the access key used belongs to a user of the bucket, with the appropriate permissions (read-only or read/write).

Also check the bucket name configured in your S3 client: use the real S3 name (`bucket-…`), shown in the **Bucket name** field of the bucket page, not the name entered at creation.

### Cannot reduce the size of a disk

A disk's size can be increased, never reduced, including when editing a VM. To get a smaller disk, create a new disk and copy your data to it.

See: [Buckets - Troubleshooting](../services/storage/buckets/troubleshooting.md), [Disks - Troubleshooting](../services/storage/disks/troubleshooting.md)

---

## Contact support

If the problem persists: profile menu → **Contact support** (the technical context of the page is attached), or **support@hidora.io**. Specify the organization, the project and the name of the resources concerned.
