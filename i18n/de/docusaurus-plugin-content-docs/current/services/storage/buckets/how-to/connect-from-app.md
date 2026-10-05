---
title: "Einen Bucket aus einer Anwendung verbinden"
---

# Einen Bucket aus einer Anwendung verbinden

Diese Anleitung erklärt, wie Sie die Anmeldedaten eines Hikube-S3-Benutzers aus einer Anwendung heraus verwenden: Umgebungsvariablen, Python-SDK (boto3) und Einbindung in einen Pod Ihres Kubernetes-Clusters.

## Voraussetzungen

- Ein **Bucket** und ein **S3-Benutzer**, in der [Hikube-Konsole](https://console.hikube.cloud) erstellt, mit seinen Schlüsseln (siehe [Benutzer und Zugriffsschlüssel verwalten](./configure-access.md))
- Je nach Fall: **AWS CLI**, **Python mit boto3** (`pip install boto3`) oder ein **Kubernetes-Cluster** und sein Kubeconfig

## Schritte

### 1. Die Verbindungsinformationen zusammentragen

| Information | Wo Sie sie finden |
|-------------|---------------|
| Endpunkt | Seite des Buckets, Karte **Access & Configuration**, Feld **Endpoint** |
| Name des S3-Buckets | Gleiche Karte, Feld **Bucket name** |
| Access Key ID / Secret Access Key | Bei der Erstellung des Benutzers angezeigt |

:::note
Der Name des S3-Buckets wird von der Plattform generiert und unterscheidet sich vom in der Konsole gewählten Namen. Verwenden Sie in Ihrer Anwendung immer den S3-Namen.
:::

### 2. Die Anmeldedaten als Umgebungsvariablen bereitstellen

Die meisten SDKs und S3-Tools lesen die Standardvariablen:

```bash
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export S3_ENDPOINT="https://<endpoint>"
export BUCKET_NAME="<bucket>"
```

Testen Sie mit AWS CLI:

```bash
# Eine Datei hochladen, auflisten und herunterladen
aws s3 cp fichier.txt "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
aws s3 cp "s3://$BUCKET_NAME/fichier.txt" ./fichier-download.txt --endpoint-url "$S3_ENDPOINT"
```

### 3. Den Bucket mit Python (boto3) verwenden

```python title="s3_example.py"
import os

import boto3

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["S3_ENDPOINT"],
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)
bucket_name = os.environ["BUCKET_NAME"]

# Upload einer Datei
s3.upload_file("local-file.txt", bucket_name, "remote-file.txt")
print("Upload abgeschlossen")

# Download einer Datei
s3.download_file(bucket_name, "remote-file.txt", "downloaded.txt")
print("Download abgeschlossen")

# Die Objekte auflisten
response = s3.list_objects_v2(Bucket=bucket_name)
for obj in response.get("Contents", []):
    print(f"  {obj['Key']} ({obj['Size']} Bytes)")
```

```bash
python s3_example.py
```

### 4. Den Bucket aus einem Kubernetes-Cluster verwenden

Läuft Ihre Anwendung in einem [Hikube-Kubernetes-Cluster](../../../kubernetes/overview.md), speichern Sie die Anmeldedaten in einem Secret **Ihres Clusters** (mit dem auf der Seite des Clusters heruntergeladenen Kubeconfig):

```bash
kubectl create secret generic s3-credentials \
  --from-literal=AWS_ACCESS_KEY_ID="<access-key>" \
  --from-literal=AWS_SECRET_ACCESS_KEY="<secret-key>" \
  --from-literal=S3_ENDPOINT="https://<endpoint>" \
  --from-literal=BUCKET_NAME="<bucket>"
```

Binden Sie sie in Ihre Anwendung ein:

```yaml title="app-with-bucket.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: app
          image: my-app:latest
          envFrom:
            - secretRef:
                name: s3-credentials
```

```bash
kubectl apply -f app-with-bucket.yaml
```

:::tip
Versionieren Sie die Schlüssel nicht in Ihren Manifesten. Erstellen Sie das Secret separat (oder über Ihr Secret-Management-Tool) und referenzieren Sie es nur über seinen Namen.
:::

## Überprüfung

1. Laden Sie eine Testdatei hoch und prüfen Sie, ob sie vorhanden ist:

```bash
echo "test" > /tmp/test-hikube.txt
aws s3 cp /tmp/test-hikube.txt "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT"
```

**Erwartetes Ergebnis:**

```console
2026-01-15 10:30:00          5 test.txt
```

2. Löschen Sie die Testdatei:

```bash
aws s3 rm "s3://$BUCKET_NAME/test.txt" --endpoint-url "$S3_ENDPOINT"
```

## Weiterführende Informationen

- [Benutzer und Zugriffsschlüssel verwalten](./configure-access.md)
- [Fehlerbehebung](../troubleshooting.md)
