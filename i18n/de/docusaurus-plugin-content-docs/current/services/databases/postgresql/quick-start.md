---
sidebar_position: 2
title: Schnellstart
---

# PostgreSQL in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Bereitstellung Ihrer ersten **PostgreSQL**-Datenbank auf Hikube, von der Installation bis zur ersten Verbindung.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Eine **PostgreSQL**-Datenbank auf Hikube bereitgestellt
- Einen replizierten Cluster mit einem **Primary** und **Replikas** für Hochverfügbarkeit
- Einen Benutzer und ein Passwort für die Verbindung
- Einen persistenten Speicher zur Aufbewahrung Ihrer Daten

---

## Voraussetzungen

Stellen Sie vor dem Start sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen verfügbaren **Namespace** für Ihre Datenbank
- (Optional) Einen **S3-kompatiblen** Bucket, wenn Sie automatische Sicherungen über CloudNativePG aktivieren möchten

---

## Schritt 1: PostgreSQL-Manifest erstellen

### **Manifest-Datei vorbereiten**

Erstellen Sie eine Datei `postgresql.yaml` wie folgt:

```yaml title="postgresql.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Postgres
metadata:
  name: example
spec:
  # configuration backup
  backup:
    enabled: false
    destinationPath: s3://bucket/path/to/folder/
    endpointURL: http://minio-gateway-service:9000
    retentionPolicy: 30d
    s3AccessKey: <your-access-key>
    s3SecretKey: <your-secret-key>
    schedule: 0 2 * * * *
  bootstrap:
    enabled: false
    oldName: ""
    recoveryTime: ""
  # creation databases
  databases:
    airflow:
      extensions:
      - hstore
      roles: # assign roles to the database
        admin:
        - airflow
    myapp:
      roles:
        admin:
        - user1
        - debezium
        readonly:
        - user2
  external: true # create service LoadBalancer if true (with public IP)
  # define parameters about postgresql
  postgresql:
    parameters:
      max_connections: 200
  quorum:
    maxSyncReplicas: 0
    minSyncReplicas: 0
  replicas: 3 # total number of postgresql instance
  resources:
    cpu: 3000m
    memory: 3Gi
  resourcesPreset: micro
  size: 10Gi
  storageClass: ""
  # create users
  users:
    airflow:
      password: qwerty123
    debezium:
      replication: true
    user1:
      password: strongpassword
    user2:
      password: hackme
```

### **PostgreSQL-YAML bereitstellen**

```bash
# YAML anwenden
kubectl apply -f postgresql.yaml
```

---

## Schritt 2: Überprüfung der Bereitstellung

Überprüfen Sie den Status Ihres PostgreSQL-Clusters (kann 1-2 Minuten dauern):

```bash
kubectl get postgreses
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    1m36s   0.18.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass die Anwendungs-Pods den Status `Running` haben:

```bash
kubectl get po -o wide | grep postgres
```

**Erwartetes Ergebnis:**

```console
postgres-example-1                                1/1     Running     0             23m   10.244.117.142   gld-csxhk-006   <none>           <none>
postgres-example-2                                1/1     Running     0             19m   10.244.117.168   luc-csxhk-005   <none>           <none>
postgres-example-3                                1/1     Running     0             18m   10.244.117.182   plo-csxhk-004   <none>           <none>
```

Mit `replicas: 3` erhalten Sie **3 PostgreSQL-Instanzen**, die für Hochverfügbarkeit auf verschiedene Rechenzentren verteilt sind.

Überprüfen Sie, dass jede Instanz ein Persistent Volume (PVC) hat:

```bash
kubectl get pvc | grep postgres
```

**Erwartetes Ergebnis:**

```console
postgres-example-1                         Bound     pvc-36fbac70-f976-4ef5-ae64-29b06817b18a   10Gi       RWO            local          <unset>                 9m43s
postgres-example-2                         Bound     pvc-f042a765-0ffd-46e5-a1f2-c703fe59b56c   10Gi       RWO            local          <unset>                 8m38s
postgres-example-3                         Bound     pvc-1dcbab1f-18c1-4eae-9b12-931c8c2f9a74   10Gi       RWO            local          <unset>                 4m28s
```

---

## Schritt 4: Anmeldedaten abrufen

Die Passwörter sind in einem Kubernetes-Secret gespeichert:

```bash
kubectl get secret postgres-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
airflow: qwerty123
debezium: tJ7H4RLTEYckNY7C
user1: strongpassword
user2: hackme
```

---

## Schritt 5: Verbindung und Tests

### Externer Zugriff (wenn `external: true`)

Überprüfen Sie die verfügbaren Services:

```bash
kubectl get svc | grep postgre
```

```console
postgres-example-external-write      LoadBalancer   10.96.171.243   91.223.132.64   5432/TCP                     10m
postgres-example-r                   ClusterIP      10.96.18.28     <none>          5432/TCP                     10m
postgres-example-ro                  ClusterIP      10.96.238.251   <none>          5432/TCP                     10m
postgres-example-rw                  ClusterIP      10.96.59.254    <none>          5432/TCP                     10m
```

### Zugriff über Port-Forward (wenn `external: false`)

```bash
kubectl port-forward svc/postgres-example-rw 5432:5432
```

:::note
Es wird empfohlen, die Datenbank nicht extern freizugeben, wenn dies nicht erforderlich ist.
:::

### Verbindungstest mit psql

```bash
psql -h 91.223.132.64 -U user1 myapp
```

```console
psql (17.4, server 17.2 (Debian 17.2-1.pgdg110+1))
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, compression: off, ALPN: postgresql)
Type "help" for help.

myapp=> \du
                                 List of roles
     Role name     |                         Attributes
-------------------+------------------------------------------------------------
 airflow           |
 airflow_admin     | No inheritance, Cannot login
 airflow_readonly  | No inheritance, Cannot login
 app               |
 debezium          | Replication
 myapp_admin       | No inheritance, Cannot login
 myapp_readonly    | No inheritance, Cannot login
 postgres          | Superuser, Create role, Create DB, Replication, Bypass RLS
 streaming_replica | Replication
 user1             |
 user2             |

myapp=>
```

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Pods prüfen
kubectl logs postgres-example-1

# Events des Pods prüfen
kubectl describe pod postgres-example-1
```

**Häufige Ursachen:** Unzureichender Speicher (`resources.memory` zu niedrig), Speichervolumen voll, Konfigurationsfehler in `postgresql.parameters`.

### PostgreSQL nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep postgres

# Prüfen, ob der LoadBalancer eine externe IP hat
kubectl describe svc postgres-example-external-write
```

**Häufige Ursachen:** `external: false` im Manifest, LoadBalancer wartet auf IP-Zuweisung, falscher Service-Name in der Verbindungszeichenkette.

### Replikation fehlgeschlagen

```bash
# Status des CloudNativePG-Clusters prüfen
kubectl describe postgres example

# Logs des Primary prüfen
kubectl logs postgres-example-1 -c postgres
```

**Häufige Ursachen:** Unzureichender Speicher auf einem Replika, Netzwerkproblem zwischen den Knoten, falsch konfigurierte `quorum`-Parameter.

### Allgemeine Diagnosebefehle

```bash
# Letzte Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des PostgreSQL-Clusters
kubectl describe postgres example
```

---

## 📋 Zusammenfassung

Sie haben bereitgestellt:

- Eine **PostgreSQL**-Datenbank auf Ihrem Hikube-Tenant
- Einen replizierten Cluster mit einem **Primary** und **Standbys** für Hochverfügbarkeit
- Konfigurierte Benutzer und Rollen mit Passwörtern, die in Kubernetes-Secrets gespeichert sind
- Einen persistenten Speicher (PVC), der an jede PostgreSQL-Instanz angebunden ist
- Einen sicheren Zugriff über `psql` (interner Service oder LoadBalancer)
- Die Möglichkeit, automatische **S3-Sicherungen** zu aktivieren

---

## Bereinigung

Um die Testressourcen zu entfernen:

```bash
kubectl delete -f postgresql.yaml
```

:::warning
Diese Aktion löscht den PostgreSQL-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller PostgreSQL-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle für PostgreSQL auf Hikube
