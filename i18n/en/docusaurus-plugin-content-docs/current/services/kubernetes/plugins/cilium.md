---
sidebar_position: 1
title: Cilium
---

# Cilium

**Cilium** is the **CNI (Container Network Interface)** of Hikube Kubernetes clusters. It manages pod networking, security and observability using **eBPF**, and enforces `NetworkPolicy` objects.

## In the console

Cilium is part of the **Advanced Configuration** of the **Addons** step: it is always present in the cluster and cannot be disabled. You can only override its configuration.

1. At creation (**Addons** step) or from **Edit** > **Extensions & Addons**, expand the **Cilium** block in the **Advanced Configuration** section.
2. Enter your values in **Helm Configuration (YAML) — optional**.
3. Confirm with **Next** then **Create cluster** (creation) or **Save** (modification).

:::warning
On an existing cluster, the console does not save a first override entered from **Edit**: the **Save** button confirms the update, but the value is ignored. Define the override when creating the cluster, or [contact support](mailto:support@hidora.io). An override defined at creation remains editable from **Edit**.
:::

On the cluster detail page, the **CNI** line of the **Network** section shows **Custom** when a Cilium configuration is applied.

## Override the configuration

The YAML value is passed to the Cilium Helm chart, under the `cilium` key. For example, to enable Hubble:

```yaml title="cilium-override.yaml"
cilium:
  hubble:
    enabled: true
```

The available options are described in the [Cilium Helm reference](https://docs.cilium.io/en/stable/helm-reference/).

:::warning
The cluster network depends on Cilium. An incorrect override can cut communication between pods or with the control plane: only change options whose effect you fully understand.
:::

## Usage in the cluster

```bash
# Cilium pods (one per node)
kubectl get pods -A -l k8s-app=cilium

# Cilium agent status
CILIUM_NS=$(kubectl get ds -A -l k8s-app=cilium -o jsonpath='{.items[0].metadata.namespace}')
kubectl exec -n "$CILIUM_NS" -it ds/cilium -- cilium status
```

See [How to configure networking](../how-to/configure-networking.md) for `NetworkPolicy` objects and Hubble.

## Best practices

- Enable **Hubble** to get network visibility and flow tracking.
- Use `NetworkPolicy` objects to restrict traffic between your applications.
- Test any override on a staging cluster before production.
