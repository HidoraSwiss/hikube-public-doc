---
sidebar_position: 2
title: FAQ
---

# Frequently asked questions

Find here the answers to the most common questions about using Hikube. Each service also has its own FAQ.

---

## 1. How do I access Hikube?

Sign in to the console: [https://console.hikube.cloud](https://console.hikube.cloud), with the credentials provided by Hidora. If you do not have an account yet, contact **sales@hidora.io**.

See: [Quick start](../getting-started/quick-start.md)

---

## 2. What is the difference between an organization and a project?

The **organization** represents your company; it is created by Hidora. **Projects** are the isolated spaces you create within the organization to group your resources, each with its own quotas. In older versions of the documentation, a project was called a **tenant**.

See: [Key concepts](../getting-started/concepts.md)

---

## 3. How do I retrieve the kubeconfig of my Kubernetes cluster?

Open **Infrastructure** → **Kubernetes**, click your cluster, then **Kubeconfig**. The console downloads the `kubeconfig-<cluster-name>.yaml` file.

```bash
export KUBECONFIG=~/.kube/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

See: [Kubernetes - Quick start](../services/kubernetes/quick-start.md)

---

## 4. Do I still need a kubeconfig to manage my Hikube resources?

No. VMs, disks, buckets, networks, Kubernetes clusters and databases are created and managed from the console. The project kubeconfig is no longer issued by default; it remains available on request from support for legacy uses such as [Terraform](../tools/terraform.md).

The kubeconfig of a **Kubernetes cluster** (question 3), on the other hand, remains the normal way to access that cluster.

---

## 5. Where do I find my database credentials?

On the detail page of the database cluster in the console (**DB & Messaging** → service → cluster). The users, their passwords and the connection host are shown there.

See: [PostgreSQL](../services/databases/postgresql/quick-start.md), [MariaDB](../services/databases/mariadb/quick-start.md), [MongoDB](../services/databases/mongodb/quick-start.md), [Redis](../services/databases/redis/quick-start.md), [RabbitMQ](../services/messaging/rabbitmq/quick-start.md)

---

## 6. How do I expose a database to the Internet?

Enable the **External access** option when creating the cluster or in **Edit**. A public IP is then assigned and shown in the **Host** field of the detail page.

:::warning
Only expose a database if necessary, and use strong passwords.
:::

---

## 7. How do I choose the size of my resources?

The creation wizards offer predefined sizes:

- **VMs and Kubernetes nodes**: instance types from the `s1`, `u1` and `m1` series (from 1 to 64 vCPU). See [Kubernetes concepts](../services/kubernetes/concepts.md) and [Virtual machine concepts](../services/compute/concepts.md).
- **Databases**: presets from `nano` to `2xlarge`. See the Concepts page of each service.

Each wizard shows the impact on the project quota and the estimated cost before creation.

---

## 8. How do I increase a project's quotas?

Project or organization administrators change the quotas in the project settings. A quota cannot be lowered below current consumption. If your organization's capacity is insufficient, contact support.

See: [Key concepts - Quotas](../getting-started/concepts.md#quotas)

---

## 9. How do I scale my resources?

- **Kubernetes cluster**: change the minimum and maximum bounds of the node groups in **Edit**. Nodes adjust automatically to the load between these bounds. See [Manage node groups](../services/kubernetes/how-to/manage-node-groups.md).
- **Databases**: depending on the service, the preset and the storage can be changed in **Edit**. See the "scaling" guide of each service.

---

## 10. How does database high availability work?

With several replicas, each managed service automatically fails over to a healthy replica if the primary instance fails. The number of replicas is chosen at creation.

See: [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md), [Redis - Concepts](../services/databases/redis/concepts.md)

---

## 11. Are database backups available in the console?

Not yet. Backup configuration and restores are currently handled by support. See for example [PostgreSQL - Backups](../services/databases/postgresql/how-to/configure-backups.md).

---

## 12. How do I contact support?

From the console, open the profile menu and click **Contact support**: the technical context of the page is attached to your request. You can also write to **support@hidora.io**.
