---
title: Tenant
---

A **Tenant** is the main security unit on the platform. It can be compared to kernel namespaces in Linux. Tenants can be created recursively and follow specific rules for management and inheritance.

---

## Configuration Example

Here is a YAML configuration example for a tenant with its own services and enabled network isolation:

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Tenant
metadata:
  name: tenant-u1
spec:
  host: "u1.example.org"
  etcd: true
  monitoring: true
  ingress: true
  seaweedfs: true
  isolated: true
```

Using the kubeconfig provided by Hikube and this example yaml, saved as a `manifest.yaml` file, you can easily test the application deployment using the following command:

```sh
kubectl apply -f manifest.yaml
```

---

## Tenant Details

### Management Rules

1. Higher-level tenants can access lower-level tenants.
2. Higher-level tenants can view and manage applications for all their children.

### Domain Inheritance

Each tenant has its own domain. By default, it inherits the domain of its parent with a prefix based on its name.

**Example**:

- If the parent has the domain `example.org`, then a tenant named `tenant-foo` will get the domain `foo.example.org` by default.
- Kubernetes clusters created in this namespace will get subdomains like `kubernetes-cluster.foo.example.org`.

Tree structure:

```scss
tenant-root (example.org)
└── tenant-foo (foo.example.org)
    └── kubernetes-cluster1 (kubernetes-cluster1.foo.example.org)
```

### Service Sharing

A lower-level tenant can access its parent's cluster services (if it doesn't deploy its own services).

**Example**:

- Let's create `tenant-u1` with a set of services: `etcd`, `ingress`, `monitoring`.
- Let's create a lower-level tenant `tenant-u2` in the namespace of `tenant-u1`.
- If `tenant-u2` doesn't have its own services like `etcd`, `ingress` or `monitoring`, applications will use those of `tenant-u1`.

Tree structure:

```scss
tenant-u1
├── etcd
├── ingress
├── monitoring
└── tenant-u2
    ├── kubernetes-cluster1
    └── postgres-db1
```

In this example:

- Kubernetes data for `tenant-u2` will be stored in `tenant-u1`'s `etcd`.
- Access will be through the common `ingress` of `tenant-u1`.
- Metrics will be collected in `tenant-u1`'s monitoring system.

---

## Configurable Parameters

### **General Parameters**

| **Name**    | **Description**                                                                    | **Default Value** |
|--------------|--------------------------------------------------------------------------------------|------------------------|
| `host`       | Hostname used to access tenant services (based on parent domain).                   | `""`                  |
| `etcd`       | Deploys an Etcd cluster specific to the tenant.                                    | `false`               |
| `monitoring` | Deploys a monitoring stack specific to the tenant.                                  | `false`               |
| `ingress`    | Deploys an Ingress controller specific to the tenant.                               | `false`               |
| `seaweedfs`  | Deploys a SeaweedFS instance specific to the tenant.                                | `false`               |
| `isolated`   | Applies network policies to isolate the tenant's namespace.                         | `false`               |

---
