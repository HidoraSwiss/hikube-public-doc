---
sidebar_position: 3
title: Quick start
---

# Hikube quick start

This guide takes you from your first sign-in to your first Kubernetes cluster, entirely from the [Hikube console](https://console.hikube.cloud). Allow about ten minutes.

---

## Prerequisites

- **A Hikube account.** If you do not have one yet, contact our team at **sales@hidora.io**.
- **A recent web browser.**
- **kubectl**, only for the final step that queries your Kubernetes cluster. See [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).

---

## Step 1: Sign in to the console

1. Open [https://console.hikube.cloud](https://console.hikube.cloud).
2. Sign in with the credentials provided by Hidora.
3. You land on your **organization**. Its name is shown in the profile menu, under **Current Organization**.

:::note No organization?
If the console shows **No organization**, your account is not yet linked to an organization. Refresh the page if you have just been given one; otherwise, [contact support](mailto:support@hidora.io).
:::

---

## Step 2: Create a project

A **project** is an isolated space that groups your resources (VMs, clusters, databases…) and carries its own quotas.

1. Open the project selector and click **Create a project**. On your first sign-in, the **Welcome to Hikube** wizard opens directly.
2. **General** step: enter the **Project Name**. It must start with a letter and contain only lowercase letters and digits, no hyphens, between 3 and 16 characters (example: `demo01`).
3. **Quotas** step (optional): set the project's **CPU** (vCPU), **Memory** (GB) and **Storage** (GB) limits.
4. **Summary** step: review the summary, then click **Create project**.

The dashboard shows **Setting up your project…** while the project is being prepared, then opens automatically.

---

## Step 3: Create a Kubernetes cluster

1. In the side menu, open **Infrastructure** → **Kubernetes**, then click **Create cluster**.
2. **General** step: choose a **Cluster name**, a **Kubernetes Version** and the **Control Plane Instance Size**. Leave **API Endpoint (Host)** empty: the platform generates it for you.
3. **Nodes** step: configure at least one node group (instance type, number of nodes, ephemeral storage).
4. **Addons** step: enable the add-ons you need (for example cert-manager or ingress-nginx).
5. **Summary** step: check the summary and the estimated cost, then start the creation.

Each field is described in detail in the [Kubernetes quick start](../services/kubernetes/quick-start.md).

---

## Step 4: Track the deployment

The **Kubernetes Clusters** list shows the cluster status:

- **Creating** / **Provisioning**: the control plane and the nodes are being provisioned;
- **Ready** / **Running**: the cluster is operational.

Reaching **Ready** usually takes a few minutes.

---

## Step 5: Retrieve the cluster kubeconfig

1. Click the cluster to open its **Cluster Details** page.
2. Click **Kubeconfig**. The console downloads a `kubeconfig-<cluster-name>.yaml` file.

:::warning Sensitive file
This file grants administrator access to your cluster. Do not commit it to version control, and store it in a protected location (for example `~/.kube/`).
:::

---

## Step 6: Query the cluster

```bash
export KUBECONFIG=~/.kube/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

**Expected result:**

```console
NAME                       STATUS   ROLES    AGE   VERSION
<cluster-name>-<group>-xxxxx   Ready    <none>   3m    v1.xx.x
```

Worker nodes may take a few more minutes to appear after the cluster reaches **Ready**.

---

## Summary

You have:

- created an isolated **project**, with its quotas;
- deployed a **managed Kubernetes cluster** from the console;
- retrieved its kubeconfig and verified access with `kubectl`.

## Need help?

- **[FAQ](../resources/faq.md)**: answers to common questions
- **[Troubleshooting](../resources/troubleshooting.md)**: solutions to frequent problems
- **Support**: **Contact support** button in the console's profile menu, or **support@hidora.io**

**Recommended next step:** [Key concepts](./concepts.md)
