---

sidebar_position: 9
title: Velero
-------------

# 🧩 Details of the `addons.velero` Field

The `addons.velero` field defines the configuration of the **Velero** add-on, used for **backup and restoration** of Kubernetes resources and persistent volumes.
Velero ensures cluster resiliency in case of data loss or migration between environments.

```yaml
addons:
  velero:
    enabled: true
    valuesOverride:
      velero:
        configuration:
          backupStorageLocation:
            name: default
            provider: aws
            bucket: velero-backups
            config:
              region: eu-west-3
        schedules:
          daily:
            schedule: "0 2 * * *"
            template:
              ttl: 240h
```

---

## `velero` (Object) — **Required**

### Description

The `velero` field contains the main configuration of the cluster’s backup and restoration system.
It allows enabling Velero and defining its deployment parameters.

### Example

```yaml
velero:
  enabled: true
  valuesOverride:
    velero:
      configuration:
        backupStorageLocation:
          provider: aws
```

---

## `enabled` (boolean) — **Required**

### Description

Indicates whether **Velero** is enabled (`true`) or disabled (`false`).
When enabled, Velero deploys its components (server, controllers, and CRDs) to manage backups and restores.

### Example

```yaml
enabled: true
```

---

## `valuesOverride` (Object) — **Required**

### Description

The `valuesOverride` field allows **overriding the default values** of the Velero deployment.
It is used to configure storage parameters, automated schedules, cloud providers, and security or resource options.

### Example

```yaml
valuesOverride:
  velero:
    configuration:
      backupStorageLocation:
        provider: aws
        bucket: velero-backups
        config:
          region: eu-west-3
    schedules:
      daily:
        schedule: "0 2 * * *"
        template:
          ttl: 240h
```

---

## 💡 Best Practices

* Enable `enabled: true` to ensure regular backups of critical cluster resources.
* Use `valuesOverride` to adapt the configuration to your cloud provider or storage backend (AWS, GCP, Azure, MinIO, etc.).
* Configure automatic **schedules** for recurring backups.
* Regularly verify backup integrity and test restore procedures.
* Restrict access to storage credentials to secure backup data.

---
