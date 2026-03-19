---
title: "ClickHouse-Sharding konfigurieren"
---

# ClickHouse-Sharding konfigurieren

Diese Anleitung erklärt, wie Sie Sharding (horizontale Partitionierung) auf ClickHouse konfigurieren, um Daten auf mehrere Shards zu verteilen und Hochverfügbarkeit mit Replikas zu gewährleisten. Die Cluster-Koordination wird durch **ClickHouse Keeper** sichergestellt.

## Voraussetzungen

- Eine ClickHouse-Instanz auf Hikube bereitgestellt (siehe [Schnellstart](../quick-start.md))
- `kubectl` konfiguriert für die Interaktion mit der Hikube-API
- Kenntnis der Sharding- und Replikationskonzepte (siehe [Konzepte](../concepts.md))

## Schritte

### 1. Shards vs. Replikas verstehen

Bevor Sie Sharding konfigurieren, ist es wichtig, diese beiden Konzepte zu unterscheiden:

- **Shards**: Verteilen die Daten horizontal. Jeder Shard enthält einen Teil der Daten. Mehr Shards = mehr Speicher- und Verarbeitungskapazität parallel.
- **Replikas**: Duplizieren die Daten innerhalb jedes Shards für Redundanz. Mehr Replikas = mehr Verfügbarkeit bei Ausfällen.

Zum Beispiel erhalten Sie mit `shards: 2` und `replicas: 2` insgesamt 4 ClickHouse-Pods (2 Shards x 2 Replikas pro Shard).

:::note
Sharding ist nützlich, wenn das Datenvolumen die Kapazität eines einzelnen Knotens übersteigt, oder wenn Sie Abfragen auf mehreren Servern parallelisieren möchten.
:::

### 2. Sharding konfigurieren

Erstellen Sie ein Manifest mit mehreren Shards und Replikas:

```yaml title="clickhouse-sharded.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: micro
    size: 2Gi
```

Diese Konfiguration erstellt:
- **2 Shards** zur Datenverteilung
- **2 Replikas pro Shard** für Redundanz (4 ClickHouse-Pods insgesamt)
- **3 Keeper-Replikas** für die Cluster-Koordination

### 3. ClickHouse Keeper konfigurieren

ClickHouse Keeper gewährleistet die Cluster-Koordination: Leader-Wahl, Datenreplikation und Shard-Statusverfolgung. Er muss für Shard-Konfigurationen unbedingt aktiviert sein.

```yaml title="clickhouse-keeper-config.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: ClickHouse
metadata:
  name: my-clickhouse-sharded
spec:
  shards: 2
  replicas: 2
  resourcesPreset: large
  size: 50Gi
  storageClass: replicated
  clickhouseKeeper:
    enabled: true
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

:::tip
Stellen Sie den Keeper immer in ungerader Anzahl bereit (3 oder 5 Replikas), um das Quorum zu gewährleisten. Mit 3 Replikas toleriert der Cluster den Verlust eines Keeper-Knotens. Mit 5 toleriert er zwei.
:::

:::warning
Das Ändern der Shard-Anzahl auf einem bestehenden Cluster kann eine komplexe Datenumverteilung verursachen. Planen Sie die Shard-Anzahl möglichst bereits bei der ersten Bereitstellung.
:::

### 4. Anwenden und überprüfen

Wenden Sie die Konfiguration an:

```bash
kubectl apply -f clickhouse-sharded.yaml
```

Warten Sie, bis alle Pods bereit sind:

```bash
# Bereitstellung in Echtzeit beobachten
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded -w
```

**Erwartetes Ergebnis:**

```console
NAME                          READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-0-0     1/1     Running   0          4m
my-clickhouse-sharded-0-1     1/1     Running   0          4m
my-clickhouse-sharded-1-0     1/1     Running   0          3m
my-clickhouse-sharded-1-1     1/1     Running   0          3m
```

Überprüfen Sie auch die Keeper-Pods:

```bash
kubectl get pods -l app.kubernetes.io/instance=my-clickhouse-sharded,app.kubernetes.io/component=keeper
```

**Erwartetes Ergebnis:**

```console
NAME                                  READY   STATUS    RESTARTS   AGE
my-clickhouse-sharded-keeper-0        1/1     Running   0          4m
my-clickhouse-sharded-keeper-1        1/1     Running   0          4m
my-clickhouse-sharded-keeper-2        1/1     Running   0          4m
```

## Überprüfung

Verbinden Sie sich mit ClickHouse und überprüfen Sie die Cluster-Topologie:

```bash
# Mit dem ersten ClickHouse-Pod verbinden
kubectl exec -it my-clickhouse-sharded-0-0 -- clickhouse-client
```

Führen Sie dann folgende Abfrage aus, um Shards und Replikas aufzulisten:

```sql
SELECT cluster, shard_num, replica_num, host_name
FROM system.clusters
WHERE cluster = 'default'
ORDER BY shard_num, replica_num;
```

## Weiterführende Informationen

- [API-Referenz](../api-reference.md) -- Parameter `shards`, `replicas` und `clickhouseKeeper`
- [ClickHouse vertikal skalieren](./scale-resources.md) -- CPU- und Speicherressourcen anpassen
- [Benutzer und Profile verwalten](./manage-users.md) -- Benutzerzugriffsverwaltung
