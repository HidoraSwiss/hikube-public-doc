---

sidebar_position: 8
title: FluxCD
-------------

<!--Lien vers valuesoverride-->

# 🧩 Details of the `addons.fluxcd` Field

The `addons.fluxcd` field defines the configuration of the **FluxCD** add-on, used for **GitOps management** of the Kubernetes cluster.
FluxCD automatically synchronizes the cluster state with Git repositories, ensuring that the configuration declared in code is always applied.

```yaml
addons:
  fluxcd:
    enabled: true
    valuesOverride:
      fluxcd:
        installCRDs: true
        resources:
          limits:
            cpu: 500m
            memory: 512Mi
          requests:
            cpu: 200m
            memory: 256Mi
```

---

## `fluxcd` (Object) — **Required**

### Description

The `fluxcd` field contains the main configuration of the cluster’s GitOps manager.
It allows enabling the deployment of FluxCD and adjusting its configuration via Helm.

### Example

```yaml
fluxcd:
  enabled: true
  valuesOverride:
    fluxcd:
      installCRDs: true
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether **FluxCD** is enabled (`true`) or disabled (`false`) in the cluster.
When enabled, FluxCD deploys its controllers and begins GitOps synchronization.

### Example

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the default Helm values** used for deploying FluxCD.
It is commonly used to configure resources, CRDs, or advanced options such as synchronization frequency, Git sources, and automatic update strategies.

### Examples

#### Basic configuration

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    resources:
      limits:
        cpu: 500m
        memory: 512Mi
      requests:
        cpu: 200m
        memory: 256Mi
```

#### Configuration with a FluxCD GitRepository

```yaml
valuesOverride:
  fluxcd:
    installCRDs: true
    # Git repository configuration
    gitRepository:
      url: "https://github.com/company/k8s-manifests"
      branch: "main"
      path: "./clusters/production"
```

---

## 💡 Best Practices

* Enable `enabled: true` to benefit from continuous GitOps-based deployment.
* Use `valuesOverride` to customize resources and adjust synchronization frequency as needed.
* Secure Git access using **Kubernetes Secrets** or **personal access tokens**.
* Verify compatibility between FluxCD and Kubernetes versions before each upgrade.

---
