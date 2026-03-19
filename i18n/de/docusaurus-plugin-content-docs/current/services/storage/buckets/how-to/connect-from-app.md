---
title: "Bucket von einer Anwendung aus verbinden"
---

# Bucket von einer Anwendung aus verbinden

Wenn Sie einen Bucket auf Hikube erstellen, wird automatisch ein Kubernetes Secret mit den S3-Zugangsdaten generiert. Diese Anleitung erklärt, wie Sie diese Zugangsdaten abrufen und von AWS CLI, Python (boto3) oder jeder S3-kompatiblen Anwendung aus verwenden.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube erstellter **Bucket** (oder ein Manifest zur Bereitstellung)
- **jq** lokal installiert (für die Extraktion der Zugangsdaten)
- **AWS CLI** oder **Python mit boto3** installiert (je nach Anwendungsfall)

## Schritte

### 1. Bucket erstellen

Wenn Sie noch keinen Bucket haben, erstellen Sie einen:

```yaml title="my-bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: app-data
```

Wenden Sie das Manifest an:

```bash
kubectl apply -f my-bucket.yaml
```

Überprüfen Sie, ob der Bucket und sein Secret erstellt wurden:

```bash
kubectl get bucket app-data
kubectl get secret bucket-app-data
```

**Erwartetes Ergebnis:**

```
NAME       AGE
app-data   10s

NAME                 TYPE     DATA   AGE
bucket-app-data      Opaque   1      10s
```

### 2. S3-Zugangsdaten abrufen

Das Secret `bucket-app-data` enthält einen `BucketInfo`-Schlüssel im JSON-Format mit allen Verbindungsinformationen. Extrahieren Sie sie:

```bash
kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

**Erwartetes Ergebnis:**

```json
{
  "spec": {
    "bucketName": "bucket-1df67984-321d-492d-bb06-2f4527bb0f5b",
    "secretS3": {
      "endpoint": "https://prod.s3.hikube.cloud",
      "accessKeyID": "UYL5FFZ0GWTQ4LCN4AI0",
      "accessSecretKey": "L1ZJy67a2PKdOmKqjeuTWQd/4HjJVMJdxnEX4ewq"
    }
  }
}
```

:::note
Der `bucketName` ist eine automatisch generierte interne Kennung. Er unterscheidet sich vom Namen, den Sie in `metadata.name` angegeben haben. Verwenden Sie immer `bucketName` für S3-Operationen.
:::

### 3. Bucket mit AWS CLI verwenden

Exportieren Sie die Zugangsdaten als Umgebungsvariablen:

```bash
export AWS_ACCESS_KEY_ID=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID')
export AWS_SECRET_ACCESS_KEY=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey')
export BUCKET_NAME=$(kubectl get secret bucket-app-data -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName')
```

Testen Sie die Verbindung:

```bash
# Objekte im Bucket auflisten
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud

# Datei hochladen
aws s3 cp datei.txt s3://$BUCKET_NAME/ --endpoint-url https://prod.s3.hikube.cloud

# Datei herunterladen
aws s3 cp s3://$BUCKET_NAME/datei.txt ./datei-download.txt --endpoint-url https://prod.s3.hikube.cloud
```

### 4. Bucket mit Python (boto3) verwenden

Hier ist ein vollständiges Beispiel mit der `boto3`-Bibliothek:

```python title="s3_example.py"
import boto3
import json
import subprocess

# Option 1: Zugangsdaten aus dem Kubernetes Secret lesen
result = subprocess.run(
    ["kubectl", "get", "secret", "bucket-app-data",
     "-o", "jsonpath={.data.BucketInfo}"],
    capture_output=True, text=True
)
import base64
bucket_info = json.loads(base64.b64decode(result.stdout))

endpoint = bucket_info["spec"]["secretS3"]["endpoint"]
access_key = bucket_info["spec"]["secretS3"]["accessKeyID"]
secret_key = bucket_info["spec"]["secretS3"]["accessSecretKey"]
bucket_name = bucket_info["spec"]["bucketName"]

# Option 2: Umgebungsvariablen verwenden (empfohlen in der Produktion)
# import os
# endpoint = "https://prod.s3.hikube.cloud"
# access_key = os.environ["AWS_ACCESS_KEY_ID"]
# secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]
# bucket_name = os.environ["BUCKET_NAME"]

# S3-Client erstellen
s3 = boto3.client(
    "s3",
    endpoint_url=endpoint,
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
)

# Datei hochladen
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload abgeschlossen")

# Datei herunterladen
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download abgeschlossen")

# Objekte auflisten
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} Bytes)")
```

:::tip
In der Produktion bevorzugen Sie Umgebungsvariablen oder als Volumes gemountete Kubernetes Secrets, anstatt `kubectl` aus Ihrem Anwendungscode aufzurufen.
:::

## Überprüfung

Bestätigen Sie, dass die Verbindung korrekt funktioniert:

1. **Bucket überprüfen**:

```bash
kubectl get bucket app-data
```

2. **Upload/Download testen**:

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

**Erwartetes Ergebnis:**

```
2024-01-15 10:30:00          5 test.txt
```

3. **Testdatei bereinigen**:

```bash
aws s3 rm s3://$BUCKET_NAME/test.txt --endpoint-url https://prod.s3.hikube.cloud
```

## Weiterführende Informationen

- [Bucket API-Referenz](../api-reference.md)
- [S3-Zugang konfigurieren](./configure-access.md)
