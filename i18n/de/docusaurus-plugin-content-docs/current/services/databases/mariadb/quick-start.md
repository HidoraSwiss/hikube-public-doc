---
sidebar_position: 2
title: Schnellstart
---

# MySQL in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Bereitstellung Ihrer ersten **MySQL**-Datenbank auf Hikube, von der Installation bis zur ersten Verbindung.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Eine betriebsbereite **MySQL**-Datenbank auf Hikube
- Einen replizierten Cluster mit einem **Primary** und **Replikas** für Hochverfügbarkeit
- **Benutzer und Passwörter** für den Zugriff auf Ihre Anwendungen
- Einen **persistenten Speicher** für jede Instanz zur Gewährleistung der Datenhaltbarkeit
- (Optional) Die Möglichkeit, **automatische Sicherungen** auf S3-kompatiblen Speicher zu aktivieren

---

## Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen verfügbaren **Namespace** für Ihre Datenbank
- (Optional) Einen **S3-kompatiblen** Bucket, wenn Sie automatische Sicherungen über MariaDB-Operator aktivieren möchten

---

## Schritt 1: MySQL-Manifest erstellen

### **Manifest-Datei vorbereiten**

Erstellen Sie eine Datei `mysql.yaml` wie folgt:

```yaml title="mysql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: MySQL
metadata:
  name: example
spec:
  backup:
    cleanupStrategy: --keep-last=3 --keep-daily=3 --keep-within-weekly=1m
    enabled: false
    resticPassword: <password>
    s3AccessKey: <your-access-key>
    s3Bucket: s3.example.org/mysql-backups
    s3Region: us-east-1
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * *
  databases:
    myapp1:
      roles:
        admin:
        - user1
        readonly:
        - user2
  external: true
  replicas: 3
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: nano
  size: 10Gi
  storageClass: ""
  users:
    user1:
      maxUserConnections: 1000
      password: hackme
    user2:
      maxUserConnections: 1000
      password: hackme
```

### **MySQL-YAML bereitstellen**

```bash
# YAML anwenden
kubectl apply -f mysql.yaml
```

---

## Schritt 2: Überprüfung der Bereitstellung

Überprüfen Sie den Status Ihres MySQL-Clusters (kann 1-2 Minuten dauern):

```bash
kubectl get mysql
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    1m16s   0.10.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass die Anwendungs-Pods den Status `Running` haben:

```bash
kubectl get po -o wide | grep mysql
```

**Erwartetes Ergebnis:**

```console
mysql-example-0                                   1/1     Running     0             24m   10.244.123.64    gld-csxhk-006   <none>           <none>
mysql-example-1                                   1/1     Running     0             24m   10.244.123.65    luc-csxhk-005   <none>           <none>
mysql-example-2                                   1/1     Running     0             24m   10.244.123.66    plo-csxhk-001   <none>           <none>
mysql-example-metrics-747cf456c9-6vnq9            1/1     Running     0             23m   10.244.123.73    plo-csxhk-004   <none>           <none>
```

Mit `replicas: 3` erhalten Sie **3 MySQL-Instanzen** (1 Primary + 2 Replikas) auf verschiedenen Rechenzentren verteilt, plus einen Metriken-Pod.

Überprüfen Sie, dass jede Instanz ein Persistent Volume (PVC) hat:

```bash
kubectl get pvc | grep mysql
```

**Erwartetes Ergebnis:**

```console
storage-mysql-example-0                    Bound     pvc-3622a61d-7432-4a36-9812-953e30f85fbe   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-1                    Bound     pvc-b9933029-c9c6-40c2-a67d-69dcb224a9bb   10Gi       RWO            local          <unset>                 24m
storage-mysql-example-2                    Bound     pvc-597da2f3-1604-416c-a480-2dae7aae75e1   10Gi       RWO            local          <unset>                 24m
```

---

## Schritt 4: Anmeldedaten abrufen

Die Passwörter sind in einem Kubernetes-Secret gespeichert:

```bash
kubectl get secret mysql-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
root: cr42msoxKhnEajfo
user1: hackme
user2: hackme
```

---

## Schritt 5: Verbindung und Tests

### Externer Zugriff (wenn `external: true`)

Überprüfen Sie die verfügbaren Services:

```bash
kubectl get svc | grep mysql
```

```console
mysql-example                        ClusterIP      10.96.149.25    <none>          3306/TCP                     27m
mysql-example-internal               ClusterIP      None            <none>          3306/TCP                     27m
mysql-example-metrics                ClusterIP      10.96.101.154   <none>          9104/TCP                     26m
mysql-example-primary                LoadBalancer   10.96.161.170   91.223.132.64   3306:32537/TCP               27m
mysql-example-secondary              ClusterIP      10.96.105.28    <none>          3306/TCP                     27m
```

### Zugriff über Port-Forward (wenn `external: false`)

```bash
kubectl port-forward svc/mysql-example 3306:3306
```

:::note
Es wird empfohlen, die Datenbank nicht extern freizugeben, wenn dies nicht erforderlich ist.
:::

### Verbindungstest mit mysql

```bash
mysql -h 91.223.132.64 -u user1 -p myapp1
```

```console
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 1214
Server version: 11.0.2-MariaDB-1:11.0.2+maria~ubu2204-log mariadb.org binary distribution

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| myapp1             |
+--------------------+
2 rows in set (0.00 sec)

mysql>
```

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Pods prüfen
kubectl logs mysql-example-0

# Events des Pods prüfen
kubectl describe pod mysql-example-0
```

**Häufige Ursachen:** Unzureichender Speicher (`resources.memory` zu niedrig), Speichervolumen voll, MariaDB-Konfigurationsfehler.

### MySQL nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep mysql

# Prüfen, ob der LoadBalancer eine externe IP hat
kubectl describe svc mysql-example-primary
```

**Häufige Ursachen:** `external: false` im Manifest, LoadBalancer wartet auf IP-Zuweisung, falscher Port oder Hostname in der Verbindungszeichenkette.

### Replikation fehlgeschlagen

```bash
# Status des MariaDB-Clusters prüfen
kubectl get mariadb

# Details der MariaDB-Ressource prüfen
kubectl describe mariadb mysql-example
```

**Häufige Ursachen:** Binlog vor der Synchronisation eines Replikas gelöscht, unzureichender Festplattenplatz, Netzwerkproblem zwischen den Knoten.

### Allgemeine Diagnosebefehle

```bash
# Letzte Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des MySQL-Clusters
kubectl describe mysql example
```

---

## 📋 Zusammenfassung

Sie haben bereitgestellt:

- Eine **MySQL**-Datenbank auf Ihrem Hikube-Tenant
- Einen replizierten Cluster mit einem **Primary** und **Replikas** für Servicekontinuität
- Automatisch erstellte Benutzer mit Anmeldedaten in Kubernetes-Secrets
- Einen dedizierten persistenten Speicher (PVC) für jeden MySQL-Pod zur Gewährleistung der Datenhaltbarkeit
- Einen sicheren Zugriff über den `mysql`-Client (Port-Forward oder LoadBalancer)
- Die Möglichkeit, **S3-Sicherungen** zu konfigurieren und bei Bedarf wiederherzustellen

---

## Bereinigung

Um die Testressourcen zu entfernen:

```bash
kubectl delete -f mysql.yaml
```

:::warning
Diese Aktion löscht den MySQL-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller MySQL-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle für MySQL auf Hikube
