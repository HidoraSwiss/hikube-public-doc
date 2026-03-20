---
sidebar_position: 6
title: FAQ
---

# FAQ — S3 Buckets

### Was ist der S3-Endpunkt von Hikube?

Der öffentliche S3-Endpunkt von Hikube ist:

```
https://prod.s3.hikube.cloud
```

Dieser Endpunkt ist mit der Standard-AWS-S3-API kompatibel. Sie können ihn mit jedem S3-kompatiblen Tool oder SDK verwenden.

---

### Welche Tools sind kompatibel?

Alle mit der S3-API kompatiblen Tools funktionieren mit den Hikube-Buckets:

| Tool | Konfiguration |
|------|---------------|
| **aws-cli** | `aws --endpoint-url https://prod.s3.hikube.cloud s3 ls` |
| **mc** (MinIO Client) | `mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY` |
| **rclone** | Ein Remote vom Typ `s3` mit dem Hikube-Endpunkt konfigurieren |
| **s3cmd** | `host_base` und `host_bucket` auf den Hikube-Endpunkt konfigurieren |
| **Velero** | Kubernetes-Backup nach S3 Hikube |
| **Restic** | Datei-Backup nach S3 Hikube |

Jede AWS-S3-kompatible Bibliothek (boto3, aws-sdk-js usw.) funktioniert ebenfalls.

---

### Wie funktionieren die Zugangsdaten?

Wenn ein Bucket erstellt wird, generiert Hikube automatisch ein Kubernetes Secret namens `bucket-<name>`. Dieses Secret enthält einen `BucketInfo`-Schlüssel im JSON-Format mit allen Zugangsinformationen:

```bash
kubectl get tenantsecret bucket-<name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Das JSON enthält:

| Feld | Beschreibung |
|------|--------------|
| `spec.bucketName` | Tatsächlicher Bucket-Name im S3-Backend |
| `spec.secretS3.endpoint` | S3-Endpunkt (`https://prod.s3.hikube.cloud`) |
| `spec.secretS3.accessKeyID` | S3-Zugriffsschlüssel |
| `spec.secretS3.accessSecretKey` | S3-Geheimschlüssel |

:::warning
Verwenden Sie `spec.bucketName` (nicht `metadata.name`) als Bucket-Namen beim S3-Zugriff. Der tatsächliche Name wird automatisch generiert und unterscheidet sich vom Kubernetes-Namen.
:::

---

### Kann man mehrere Buckets haben?

Ja, Sie können so viele Buckets erstellen, wie Sie benötigen. Jede `Bucket`-Ressource stellt einen unabhängigen Bucket mit eigenen Zugangsdaten bereit:

```yaml title="bucket-logs.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-logs
```

```yaml title="bucket-backups.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: db-backups
```

Jeder Bucket generiert sein eigenes Secret (`bucket-app-logs`, `bucket-db-backups`) mit separaten Zugangsdaten.

---

### Wie hoch ist die Datenhaltbarkeit?

Die in den Hikube-Buckets gespeicherten Daten profitieren von einer **dreifachen Replikation** auf drei Rechenzentren:

- Genf
- Gland
- Luzern

Diese Architektur gewährleistet Hochverfügbarkeit und Datenhaltbarkeit, selbst bei vollständigem Ausfall eines Rechenzentrums.

---

### Besteht die Konfiguration wirklich nur aus metadata.name?

Ja, das `Bucket`-Objekt ist absichtlich minimal gehalten. Kein `spec`-Feld ist erforderlich:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: mein-bucket
```

Das ist alles, was Sie benötigen, um einen funktionsfähigen S3-Bucket bereitzustellen. Der Endpunkt, die Zugangsdaten und der tatsächliche Bucket-Name werden automatisch generiert und im zugehörigen Secret bereitgestellt.
