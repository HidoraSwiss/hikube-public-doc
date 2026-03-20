---
title: "S3-Zugang konfigurieren"
---

# S3-Zugang konfigurieren

Jeder auf Hikube erstellte Bucket generiert automatisch ein eindeutiges S3-Zugriffsschlüsselpaar. Diese Anleitung erklärt, wie Sie diese Zugangsdaten abrufen, verschiedene S3-Clients (AWS CLI, MinIO Client, rclone) konfigurieren und die Schlüssel sicher in Ihre Kubernetes-Pods injizieren.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube erstellter **Bucket**
- **jq** lokal installiert
- Ein oder mehrere S3-Clients installiert: **AWS CLI**, **mc** (MinIO Client) oder **rclone**

## Schritte

### 1. Zugriffsmodell verstehen

Auf Hikube verfügt jeder Bucket über sein eigenes Zugriffsschlüsselpaar:

- **1 Bucket = 1 Schlüsselpaar** (accessKeyID + accessSecretKey)
- Die Schlüssel werden bei der Bucket-Erstellung automatisch generiert
- Die Zugangsdaten werden in einem Kubernetes Secret namens `bucket-<bucket-name>` gespeichert
- Der S3-Endpunkt ist für alle Buckets gleich: `https://prod.s3.hikube.cloud`

:::tip
Jeder Bucket profitiert von einem **dreifach replizierten** Hochverfügbarkeitsspeicher. Ihre Daten werden automatisch verteilt, um die Haltbarkeit zu gewährleisten.
:::

### 2. Zugangsdaten abrufen

Extrahieren Sie die Verbindungsinformationen aus dem Kubernetes Secret:

```bash
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq
```

Um die Werte einzeln zu extrahieren:

```bash
# S3-Endpunkt
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.endpoint'

# Access Key
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessKeyID'

# Secret Key
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.secretS3.accessSecretKey'

# Tatsaechlicher Bucket-Name
kubectl get secret bucket-<bucket-name> -o jsonpath='{.data.BucketInfo}' | base64 -d | jq -r '.spec.bucketName'
```

:::note
Der vom Secret zurückgegebene `bucketName` ist eine interne Kennung (z.B. `bucket-1df67984-321d-492d-bb06-2f4527bb0f5b`). Er unterscheidet sich vom `metadata.name` Ihres Manifests. Verwenden Sie immer diesen Wert für S3-Operationen.
:::

### 3. S3-Clients konfigurieren

#### AWS CLI

Konfigurieren Sie ein dediziertes Profil für Hikube:

```bash
aws configure --profile hikube
```

Geben Sie die folgenden Werte ein:

```
AWS Access Key ID: <accessKeyID>
AWS Secret Access Key: <accessSecretKey>
Default region name: (leer lassen)
Default output format: json
```

Verwenden Sie das Profil mit dem Hikube-Endpunkt:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud --profile hikube
```

#### MinIO Client (mc)

Erstellen Sie einen Alias für den Hikube-Endpunkt:

```bash
mc alias set hikube https://prod.s3.hikube.cloud ACCESS_KEY SECRET_KEY
```

Testen Sie die Verbindung:

```bash
# Objekte auflisten
mc ls hikube/$BUCKET_NAME

# Datei hochladen
mc cp datei.txt hikube/$BUCKET_NAME/

# Datei herunterladen
mc cp hikube/$BUCKET_NAME/datei.txt ./
```

#### rclone

Fügen Sie eine rclone-Konfiguration für Hikube hinzu. Erstellen oder bearbeiten Sie die Datei `~/.config/rclone/rclone.conf`:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = https://prod.s3.hikube.cloud
access_key_id = ACCESS_KEY
secret_access_key = SECRET_KEY
acl = private
```

Testen Sie die Verbindung:

```bash
# Objekte auflisten
rclone ls hikube:$BUCKET_NAME

# Lokales Verzeichnis synchronisieren
rclone sync ./mein-ordner hikube:$BUCKET_NAME/mein-ordner

# Datei kopieren
rclone copy datei.txt hikube:$BUCKET_NAME/
```

### 4. Bucket in einem Kubernetes-Pod verwenden

Um die S3-Zugangsdaten in einen Pod zu injizieren, verwenden Sie einen `initContainer`, der das Secret liest und die Werte als Umgebungsvariablen bereitstellt, oder mounten Sie das Secret direkt:

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
      initContainers:
      - name: extract-s3-creds
        image: bitnami/kubectl:latest
        command:
        - sh
        - -c
        - |
          SECRET=$(cat /secrets/BucketInfo)
          echo "export AWS_ACCESS_KEY_ID=$(echo $SECRET | jq -r '.spec.secretS3.accessKeyID')" > /env/s3.env
          echo "export AWS_SECRET_ACCESS_KEY=$(echo $SECRET | jq -r '.spec.secretS3.accessSecretKey')" >> /env/s3.env
          echo "export S3_ENDPOINT=$(echo $SECRET | jq -r '.spec.secretS3.endpoint')" >> /env/s3.env
          echo "export BUCKET_NAME=$(echo $SECRET | jq -r '.spec.bucketName')" >> /env/s3.env
        volumeMounts:
        - name: bucket-secret
          mountPath: /secrets
        - name: env-vars
          mountPath: /env
      containers:
      - name: app
        image: my-app:latest
        command:
        - sh
        - -c
        - |
          source /env/s3.env
          exec my-app-binary
        volumeMounts:
        - name: env-vars
          mountPath: /env
      volumes:
      - name: bucket-secret
        secret:
          secretName: bucket-app-data
      - name: env-vars
        emptyDir: {}
```

:::tip
Für einen einfacheren Ansatz können Sie auch das vollständige Secret mounten und das JSON beim Start direkt in Ihrer Anwendung lesen.
:::

### 5. Best Practices für Sicherheit

:::warning
Speichern Sie Ihre S3-Schlüssel niemals im Klartext in Ihren Manifesten oder Git-Repositories. Verwenden Sie immer Kubernetes Secrets zur Verwaltung der Zugangsdaten.
:::

Empfehlungen:

- **Verwenden Sie Kubernetes Secrets**: Die Zugangsdaten sind bereits in einem automatisch generierten Secret gespeichert. Referenzieren Sie es, anstatt die Schlüssel im Klartext zu kopieren.
- **Committen Sie niemals Schlüssel**: Fügen Sie Dateien mit Zugangsdaten zu Ihrer `.gitignore` hinzu.
- **Beschränken Sie den Zugriff auf Secrets**: Konfigurieren Sie Kubernetes RBAC, um die Namespaces und Benutzer einzuschränken, die Bucket-Secrets lesen können.
- **Schlüsselrotation**: Bei Verdacht auf Kompromittierung löschen Sie den Bucket und erstellen Sie ihn neu, um neue Schlüssel zu erhalten.

## Überprüfung

Bestätigen Sie, dass Ihre Konfiguration mit jedem Client funktioniert:

1. **AWS CLI**:

```bash
aws s3 ls s3://$BUCKET_NAME --endpoint-url https://prod.s3.hikube.cloud
```

2. **MinIO Client**:

```bash
mc ls hikube/$BUCKET_NAME
```

3. **rclone**:

```bash
rclone ls hikube:$BUCKET_NAME
```

Wenn der Befehl eine leere Liste (leerer Bucket) oder die Liste der vorhandenen Objekte ohne Fehler zurückgibt, ist die Konfiguration korrekt.

## Weiterführende Informationen

- [Bucket API-Referenz](../api-reference.md)
- [Bucket von einer Anwendung aus verbinden](./connect-from-app.md)
