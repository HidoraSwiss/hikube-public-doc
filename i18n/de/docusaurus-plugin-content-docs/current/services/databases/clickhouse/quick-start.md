---
sidebar_position: 2
title: Schnellstart
---

# ClickHouse in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Bereitstellung Ihrer ersten **ClickHouse**-Datenbank auf Hikube in **wenigen Minuten**!

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Eine **ClickHouse**-Datenbank auf Hikube bereitgestellt
- Eine Anfangskonfiguration mit **Shards** und **Replikas** entsprechend Ihren Bedürfnissen
- Einen Benutzer und ein Passwort für die Verbindung
- Einen persistenten Speicher zur Aufbewahrung Ihrer Daten

---

## Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen verfügbaren **Namespace** für Ihre Datenbank
- (Optional) Einen **S3-kompatiblen** Bucket, wenn Sie automatische Sicherungen aktivieren möchten

---

## Schritt 1: ClickHouse-Manifest erstellen

### **Manifest-Datei vorbereiten**

Erstellen Sie eine Datei `clickhouse.yaml` wie folgt:

```yaml title="clickhouse.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: example
spec:
#   backup:
#     cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
#     enabled: false
#     resticPassword: <password>
#     s3AccessKey: <your-access-key>
#     s3Bucket: s3.example.org/clickhouse-backups
#     s3Region: us-east-1
#     s3SecretKey: <your-secret-key>
#     schedule: 0 2 * * *
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 1Gi
  logStorageSize: 2Gi
  logTTL: 15
  replicas: 2
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: small
  shards: 1
  size: 10Gi
  storageClass: ""
  users:
    user1:
      password: strongpassword
    user2:
      readonly: true
      password: hackme
```

### **ClickHouse-YAML bereitstellen**

```bash
# YAML anwenden
kubectl apply -f clickhouse.yaml
```

---

## Schritt 2: Überprüfung der Bereitstellung

Überprüfen Sie den Status Ihres ClickHouse-Clusters (kann 1-2 Minuten dauern):

```bash
kubectl get clickhouse
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    2m48s   0.13.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass die Anwendungs-Pods den Status `Running` haben:

```bash
kubectl get po | grep clickhouse
```

**Erwartetes Ergebnis:**

```console
chi-clickhouse-example-clickhouse-0-0-0           1/1     Running     0             3m43s
chi-clickhouse-example-clickhouse-0-1-0           1/1     Running     0             2m28s
chk-clickhouse-example-keeper-cluster1-0-0-0      1/1     Running     0             3m17s
chk-clickhouse-example-keeper-cluster1-0-1-0      1/1     Running     0             2m50s
chk-clickhouse-example-keeper-cluster1-0-2-0      1/1     Running     0             2m28s
```

Mit `replicas: 2` und `shards: 1` erhalten Sie **2 ClickHouse-Pods** (Replicas des Shards) und **3 ClickHouse-Keeper-Pods** für die Cluster-Koordination.

---

## Schritt 4: Anmeldedaten abrufen

Die Passwörter sind in einem Kubernetes-Secret gespeichert:

```bash
kubectl get secret clickhouse-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
backup: vIdZUNiaLKaVbIvl
user1: strongpassword
user2: hackme
```

---

## Schritt 5: Verbindung und Tests

### Port-Forward des ClickHouse-Services

```bash
kubectl port-forward svc/chendpoint-clickhouse-example 9000:9000
```

### Verbindungstest mit clickhouse-client

Verbinden Sie sich in einem anderen Terminal und überprüfen Sie die ClickHouse-Version:

```bash
clickhouse-client \
  --host 127.0.0.1 \
  --port 9000 \
  --user user1 \
  --password 'strongpassword' \
  --query "SHOW DATABASES;"
```

**Erwartetes Ergebnis:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften ClickHouse-Pods prüfen
kubectl logs chi-clickhouse-example-clickhouse-0-0-0

# Events des Pods prüfen
kubectl describe pod chi-clickhouse-example-clickhouse-0-0-0
```

**Häufige Ursachen:** Unzureichender Speicher (`resources.memory` zu niedrig), Speichervolumen voll, Fehler in der Shard- oder Replika-Konfiguration.

### ClickHouse nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep clickhouse

# Endpoint-Service prüfen
kubectl describe svc chendpoint-clickhouse-example
```

**Häufige Ursachen:** Port-Forward nicht aktiv, falscher Port (9000 für natives Protokoll, 8123 für HTTP), Service nicht bereit.

### ClickHouse Keeper nicht funktionsfähig

```bash
# Keeper-Logs prüfen
kubectl logs chk-clickhouse-example-keeper-cluster1-0-0-0

# Status der Keeper-Pods prüfen
kubectl get pods | grep keeper
```

**Häufige Ursachen:** Das Keeper-Quorum erfordert eine ungerade Anzahl von Replikas (mindestens 3 empfohlen), unzureichender Keeper-Festplattenplatz (`clickhouseKeeper.size` zu niedrig).

### Allgemeine Diagnosebefehle

```bash
# Letzte Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des ClickHouse-Clusters
kubectl describe clickhouse example
```

---

## 📋 Zusammenfassung

Sie haben bereitgestellt:

- Eine **ClickHouse**-Datenbank auf Ihrem Hikube-Tenant
- Eine Anfangskonfiguration mit **Shards** und **Replikas**
- Eine **ClickHouse Keeper**-Komponente für die Cluster-Koordination
- Einen persistenten Speicher für Ihre Daten und Logs
- Benutzer mit generierten Passwörtern, gespeichert in einem Kubernetes-Secret
- Einen Zugriff auf Ihre Datenbank über `clickhouse-client`
- Die Möglichkeit, automatische **S3-Sicherungen** zu konfigurieren

---

## Bereinigung

Um die Testressourcen zu entfernen:

```bash
kubectl delete -f clickhouse.yaml
```

:::warning
Diese Aktion löscht den ClickHouse-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller ClickHouse-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle für ClickHouse auf Hikube
