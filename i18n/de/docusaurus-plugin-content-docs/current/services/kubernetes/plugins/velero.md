---
sidebar_position: 9
title: Velero
---

# Velero

Das Addon **Velero** installiert das Werkzeug für **Backup und Wiederherstellung** von Kubernetes-Ressourcen und persistenten Volumes. Es sichert die Resilienz des Clusters bei Datenverlust oder bei einer Migration zwischen Umgebungen.

## In der Konsole

1. Wählen Sie bei der Erstellung im Schritt **Addons** **Velero** aus (standardmäßig deaktiviert).
2. Auf einem bestehenden Cluster: **Edit** > **Extensions & Addons**, **Velero** aktivieren, dann **Save**.

Die Detailseite des Clusters zeigt **Velero** im Abschnitt **Extensions** an, wenn es aktiv ist.

Velero wird im Cluster mit dem bereits installierten AWS-Plugin (`velero-plugin-for-aws`, für S3-Speicher) installiert. Standardmäßig ist kein Backup-Speicherort konfiguriert.

## Den Backup-Speicher konfigurieren

Velero benötigt für seine Backups einen Objektspeicher-Speicherort, zum Beispiel einen [Hikube-S3-Bucket](../../storage/buckets/overview.md). Dieser Speicherort wird im Feld **Helm Configuration (YAML) — optional** deklariert, das erscheint, sobald das Addon ausgewählt ist. Der Wert wird unter dem Schlüssel `velero` an das Helm-Chart von Velero übergeben.

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

Die verfügbaren Optionen sind im [Helm-Chart von Velero](https://github.com/vmware-tanzu/helm-charts/tree/main/charts/velero) beschrieben.

:::warning
Die im Override eingegebenen Zugriffsschlüssel werden in der Konfiguration des Clusters gespeichert. Verwenden Sie einen eigenen Bucket-Benutzer für Velero, der auf den Backup-Bucket beschränkt ist.
:::

## Nutzung im Cluster

```bash
# Backup-Speicherorte und ihr Zustand
kubectl get backupstoragelocations -A

# Backups und Wiederherstellungen
kubectl get backups -A
kubectl get restores -A
```

Mit der CLI `velero` (auf die kubeconfig des Clusters konfiguriert). Geben Sie ihr zuerst den Namespace an, in dem das Addon installiert ist:

```bash
velero client config set namespace=$(kubectl get deploy -A -l app.kubernetes.io/name=velero -o jsonpath='{.items[0].metadata.namespace}')

velero backup create my-backup --include-namespaces production
velero backup describe my-backup
velero restore create --from-backup my-backup
```

## Best Practices

- Planen Sie wiederkehrende Backups (`schedules`) mit einer passenden Aufbewahrungsdauer (`ttl`).
- Testen Sie regelmäßig eine vollständige Wiederherstellung auf einem Testcluster.
- Speichern Sie die Backups in einem Bucket, der von Ihren Anwendungsdaten getrennt ist.
