---
sidebar_position: 2
title: Schnellstart
---

# Ihren ersten S3 Bucket erstellen

Diese Anleitung begleitet Sie Schritt für Schritt bei der Erstellung Ihres **ersten Hikube S3 Buckets** in **5 Minuten**.
Am Ende dieses Tutorials verfügen Sie über einen einsatzbereiten Bucket mit gültigen S3-Zugangsdaten und einer funktionierenden Konnektivität.

---

## 🎯 Ziel

Am Ende dieser Anleitung haben Sie:

- Einen **funktionierenden S3 Bucket** in Ihrem Tenant
- Ein automatisch generiertes **S3-Zugangs-Secret**
- Die Möglichkeit, sich mit Standard-Tools (`aws-cli`, `mc` usw.) zu verbinden

---

## 🧰 Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Die **erforderlichen Rechte** auf Ihrem Tenant zur Erstellung von Ressourcen
- Ein S3-Tool Ihrer Wahl installiert (z.B. `aws-cli` oder `mc`)

---

## 🚀 Schritt 1: Bucket erstellen (1 Minute)

### **Manifest-Datei vorbereiten**

Erstellen Sie eine Datei `bucket.yaml`:

```yaml title="bucket.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Bucket
metadata:
  name: example-bucket
```

> 📌 Der in `metadata.name` angegebene Name identifiziert die Kubernetes-Ressource.
> Der tatsächliche S3-Bucket-Name wird automatisch generiert.

---

### **Bucket bereitstellen**

```bash
# Bucket erstellen
kubectl apply -f bucket.yaml

# Erstellung überprüfen
kubectl get bucket example-bucket -w
```

**Erwartetes Ergebnis:**

```bash
NAME             READY   AGE
example-bucket   True    15s
```

---

## 🔐 Schritt 2: Zugangsdaten abrufen (2 Minuten)

Die Bucket-Erstellung generiert ein `Secret` mit einem `BucketInfo`-Schlüssel (JSON).

```bash
# JSON abrufen und in einer Variable speichern
INFO="$(kubectl get secret bucket-example-bucket -o jsonpath='{.data.BucketInfo}' | base64 -d)"

# Nützliche Variablen exportieren
export S3_ENDPOINT="$(echo "$INFO" | jq -r '.spec.secretS3.endpoint')"
export S3_ACCESS_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessKeyID')"
export S3_SECRET_KEY="$(echo "$INFO" | jq -r '.spec.secretS3.accessSecretKey')"
export BUCKET_NAME="$(echo "$INFO" | jq -r '.spec.bucketName')"
```

> `BUCKET_NAME` ist der **tatsächliche Name** Ihres Buckets auf S3-Seite. Verwenden Sie ihn in den folgenden Befehlen.

---

## 🌐 Schritt 3: S3-Verbindung testen (2 Minuten)

:::warning S3-Root-Zugriff
Mit diesen Zugangsdaten haben Sie **keine** Berechtigung, alle Buckets des Endpunkts aufzulisten.
Befehle vom Typ `ls` **müssen auf Ihren Bucket abzielen**:
`… ls s3://$BUCKET_NAME/ …` oder `… ls <alias>/$BUCKET_NAME/ …`
:::

### Option A — `aws-cli`

```bash
# Temporäres Profil konfigurieren
aws configure --profile hikube
# Access Key ID:    $S3_ACCESS_KEY
# Secret Access Key: $S3_SECRET_KEY
# Default region name: (leer lassen)
# Default output format: json

# Inhalt **Ihres Buckets** auflisten (leer direkt nach Erstellung)
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Testdatei senden
echo "hello hikube" > /tmp/hello.txt
aws s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt" --endpoint-url "$S3_ENDPOINT" --profile hikube

# Überprüfen
aws s3 ls "s3://$BUCKET_NAME/" --endpoint-url "$S3_ENDPOINT" --profile hikube
```

### Option B — `mc` (S3-Client)

```bash
# Alias für den Endpunkt definieren
mc alias set hikube "$S3_ENDPOINT" "$S3_ACCESS_KEY" "$S3_SECRET_KEY"

# ⚠️ NICHT machen: `mc ls hikube`  -> AccessDenied
# ✅ Direkt auf Ihren Bucket abzielen:
mc ls "hikube/$BUCKET_NAME/"

# Testdatei senden
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"

# Überprüfen
mc ls "hikube/$BUCKET_NAME/"
```

---

## 🧹 Bereinigung (optional)

```bash
# Bucket löschen (löscht auch seinen Inhalt)
kubectl delete buckets example-bucket
```

:::warning Unwiderrufliche Löschung
Das Löschen des Buckets löscht **endgültig** alle enthaltenen Daten.
Überprüfen Sie Ihre Sicherungen, bevor Sie fortfahren.
:::

---

## 🚀 Nächste Schritte

**📚 API-Referenz** → [Vollständige Spezifikation](./api-reference.md)
**📖 Architektur** → [Übersicht](./overview.md)

---

## 💡 Wichtig zu beachten

- Die bereitgestellten Zugangsdaten ermöglichen **ausschließlich** den Zugriff auf Ihren Bucket
- Zielen Sie immer auf `s3://$BUCKET_NAME/` (oder `alias/$BUCKET_NAME/`) in Ihren Befehlen ab
- Der S3-Endpunkt ist mit Standard-Tools und -SDKs kompatibel
- Strikte Isolation nach Tenant und dedizierte Zugangsdaten
