---
sidebar_position: 3
title: API-Referenz
---

# API-Referenz - S3 Buckets

Diese Referenz beschreibt die `Bucket`-API von Hikube, die zur Bereitstellung von S3-kompatiblen [MinIO](https://min.io/)-Buckets in Ihrem Kubernetes-Tenant verwendet wird.
Die S3-Buckets ermöglichen die dauerhafte, hochverfügbare und mit Standard-S3-Tools kompatible Speicherung und Bereitstellung von Daten (Dateien, Objekte, Backups, Logs usw.).

---

## Bucket

### **Übersicht**

Die `Bucket`-API ermöglicht die Erstellung von S3-Buckets direkt aus Kubernetes.

```yaml
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 Die Erstellung eines `Bucket`-Objekts in Ihrem Tenant führt automatisch zur Erstellung des entsprechenden Buckets im S3-Backend.

---

### **Vollständige Spezifikation**

Das `Bucket`-Objekt hat **keine konfigurierbaren `spec`-Felder**.
Der einzige erforderliche Teil ist die **Metadaten `metadata.name`**, die den in der Benutzeroberfläche erstellten Bucket-Namen definiert.

| **Parameter** | **Typ** | **Beschreibung** | **Erforderlich** |
| ------------- | ------- | ---------------- | ---------------- |
| `metadata.name` | string | Eindeutiger Bucket-Name (als S3-Name verwendet) | ✅ |

---

### **Minimales Beispiel**

```yaml title="zitadel-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: backup-prod
```

---

## 🔐 S3-Zugangs-Secret

Wenn ein Bucket erstellt wird, generiert Hikube automatisch ein zugehöriges Kubernetes Secret.
Dieses Secret wird nach folgendem Muster benannt:

```txt
bucket-<bucket-name>
```

Zum Beispiel:

```bash
kubectl get secret
```

```bash
NAME                  TYPE     DATA   AGE
bucket-backup-prod    Opaque   1      10s
```

Der Inhalt dieses Secrets wird in einem **einzigen Schlüssel `BucketInfo`** im JSON-Format gespeichert:

```json
{
  "metadata": {
    "name": "bc-254505e2-1f26-4f47-bf75-42faae918531",
    "creationTimestamp": null
  },
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "authenticationType": "KEY",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "region": "",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    },
    "secretAzure": null,
    "protocols": ["s3"]
  }
}
```

---

### **Wichtige Felder**

| **Feld** | **Beschreibung** |
| -------- | ---------------- |
| `spec.bucketName` | Tatsächlicher interner Bucket-Name im S3-Backend |
| `spec.secretS3.endpoint` | HTTPS-Endpunkt des Hikube S3-Dienstes |
| `spec.secretS3.accessKeyID` | Generierter S3-Zugriffsschlüssel für diesen Bucket |
| `spec.secretS3.accessSecretKey` | Zugehöriger S3-Geheimschlüssel |
| `spec.protocols` | Unterstützte Protokolle (derzeit `["s3"]`) |

---

### **Extraktion der Zugangsdaten**

Sie können die Informationen mit `kubectl` und `jq` abrufen:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Oder um nur den Schlüssel und das Secret zu extrahieren:

```bash
kubectl get secret bucket-bckprd -o jsonpath='{.data.BucketInfo}' \
  | base64 -d \
  | jq -r '.spec.secretS3.accessKeyID, .spec.secretS3.accessSecretKey'
```

---

## 🌐 S3-Endpunkt

Der öffentliche Endpunkt für den Zugriff auf Ihre Buckets ist:

```url
https://prod.s3.hikube.cloud
```

Sie können ihn verwenden mit:

* `aws-cli` (durch Konfiguration eines Profils mit `--endpoint-url`)
* `mc` (MinIO Client)
* `rclone`, `s3cmd`, Velero oder jeder AWS-S3-kompatiblen Bibliothek.

---

## ⚠️ Best Practices

### **Sicherheit**

* Speichern Sie Ihre S3-Schlüssel niemals im Klartext in Ihren Manifesten oder Git-Repositories.
* Verwenden Sie immer Kubernetes Secrets und sichere Mounts.
* Beschränken Sie die Berechtigungen auf das Notwendigste (1 Bucket = 1 Schlüsselpaar idealerweise).

### **Namensgebung**

* Verwenden Sie aussagekräftige Namen, um die Buckets leicht zu identifizieren.
* Beachten Sie, dass der tatsächliche Name in S3 (`bucketName`) automatisch generiert wird und vom Kubernetes-Namen abweichen kann.

### **Verwendung**

* Konfigurieren Sie Ihre S3-Tools so, dass sie auf `https://prod.s3.hikube.cloud` zeigen.
* Verwenden Sie den im zugehörigen Secret bereitgestellten `accessKeyID` und `accessSecretKey`.

---

:::tip Gut zu wissen
Jeder über die Hikube-API erstellte Bucket wird auf einer **dreifach replizierten** Infrastruktur gespeichert und profitiert von der nativen Hochverfügbarkeit des S3-Clusters.
:::
