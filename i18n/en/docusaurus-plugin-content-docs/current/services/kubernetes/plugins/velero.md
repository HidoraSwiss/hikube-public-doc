---
sidebar_position: 9
title: Velero
---

# Velero

The **Velero** addon installs the **backup and restore** tool for Kubernetes resources and persistent volumes. It ensures the cluster's resilience in case of data loss or migration between environments.

## In the console

1. At creation, **Addons** step, check **Velero** (disabled by default).
2. On an existing cluster: **Edit** > **Extensions & Addons**, check **Velero**, then **Save**.

The cluster detail page shows **Velero** in the **Extensions** section when it is active.

Velero is installed in the cluster with the AWS plugin (`velero-plugin-for-aws`, for S3 storage) already installed. No backup location is configured by default.

## Configure backup storage

Velero needs an object storage location for its backups, for example a [Hikube S3 bucket](../../storage/buckets/overview.md). This location is declared in the **Helm Configuration (YAML) — optional** field, which appears once the addon is checked. The value is passed to the Velero Helm chart, under the `velero` key.

```yaml title="velero-override.yaml"
velero:
  configuration:
    backupStorageLocation:
      - name: default
        provider: aws
        bucket: velero-backups
        config:
          region: us-east-1
          s3ForcePathStyle: "true"
          s3Url: https://<s3-endpoint>
  credentials:
    secretContents:
      cloud: |
        [default]
        aws_access_key_id=<access-key>
        aws_secret_access_key=<secret-key>
  schedules:
    daily:
      schedule: "0 2 * * *"
      template:
        ttl: 240h
```

The available options are described in the [Velero Helm chart](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero).

:::warning
The access keys entered in the override are stored in the cluster configuration. Use a bucket user dedicated to Velero, limited to the backup bucket.
:::

## Usage in the cluster

```bash
# Backup locations and their state
kubectl get backupstoragelocations -A

# Backups and restores
kubectl get backups -A
kubectl get restores -A
```

With the `velero` CLI (configured on the cluster kubeconfig). First tell it the namespace where the addon is installed:

```bash
velero client config set namespace=$(kubectl get deploy -A -l app.kubernetes.io/name=velero -o jsonpath='{.items[0].metadata.namespace}')

velero backup create my-backup --include-namespaces production
velero backup describe my-backup
velero restore create --from-backup my-backup
```

## Best practices

- Schedule recurring backups (`schedules`) with an appropriate retention period (`ttl`).
- Regularly test a full restore on a staging cluster.
- Store backups in a bucket separate from your application data.
