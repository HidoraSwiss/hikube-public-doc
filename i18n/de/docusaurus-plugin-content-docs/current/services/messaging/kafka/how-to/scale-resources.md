---
title: "Cluster skalieren"
---

# Kafka-Cluster skalieren

Diese Anleitung erklärt, wie Sie die Ressourcen eines Kafka-Clusters auf Hikube anpassen: Anzahl der Broker, CPU-/Speicherressourcen, Speicherplatz sowie die zugehörige ZooKeeper-Konfiguration.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **Kafka**-Cluster

## Verfügbare Presets

Hikube bietet vordefinierte Ressourcen-Presets, die auf Kafka-Broker und ZooKeeper-Knoten anwendbar sind:

| Preset | CPU | Speicher |
|--------|-----|----------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::warning
Wenn das Feld `resources` (explizite CPU/Speicher) definiert ist, wird der Wert von `resourcesPreset` **vollständig ignoriert**. Stellen Sie sicher, dass Sie das Feld `resources` leeren, wenn Sie ein Preset verwenden möchten.
:::

## Schritte

### 1. Aktuelle Ressourcen überprüfen

Überprüfen Sie die aktuelle Cluster-Konfiguration:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

**Beispielergebnis:**

```console
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
```

### 2. Kafka-Broker skalieren

Sie können die Anzahl der Broker, die Ressourcen und den Speicher unabhängig voneinander anpassen.

**Option A: Broker-Preset ändern**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    resources: {}
'
```

**Option B: Explizite Ressourcen definieren**

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
'
```

Sie können auch das vollständige Manifest ändern:

```yaml title="kafka-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resources:
      cpu: 4000m
      memory: 8Gi
    size: 50Gi
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
  topics: []
```

```bash
kubectl apply -f kafka-scaled.yaml
```

:::warning
Die Reduzierung der Broker-Anzahl auf einem bestehenden Cluster kann zu Datenverlust führen, wenn die Partitionen nicht zuvor umverteilt werden. Erhöhen Sie die Broker-Anzahl immer, anstatt sie zu reduzieren.
:::

### 3. ZooKeeper skalieren

ZooKeeper verwendet einen Quorum-Mechanismus: Die Anzahl der Replikate muss **ungerade** sein (1, 3, 5), um die Leader-Wahl zu gewährleisten.

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  zookeeper:
    replicas: 3
    resourcesPreset: medium
    resources: {}
'
```

Oder mit expliziten Ressourcen:

```yaml title="kafka-zookeeper-scaled.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: my-kafka
spec:
  kafka:
    replicas: 5
    resourcesPreset: large
    size: 50Gi
  zookeeper:
    replicas: 3
    resources:
      cpu: 1000m
      memory: 1Gi
    size: 10Gi
  topics: []
```

```bash
kubectl apply -f kafka-zookeeper-scaled.yaml
```

:::tip
In der Produktion reichen 3 ZooKeeper-Replikate in den meisten Fällen aus. 5 Replikate werden nur für sehr große Cluster (10+ Broker) empfohlen.
:::

### 4. Speicher bei Bedarf erhöhen

Wenn den Brokern der Speicherplatz ausgeht, erhöhen Sie die Größe des persistenten Volumes:

```bash
kubectl patch kafka my-kafka --type='merge' -p='
spec:
  kafka:
    size: 100Gi
'
```

:::warning
Die Anzahl der Replikate eines Topics darf die Anzahl der Broker nicht überschreiten. Nach einem Scale-Up der Broker können Sie den Replikationsfaktor Ihrer bestehenden Topics erhöhen.
:::

### 5. Anwenden und überprüfen

Falls Sie die Änderungen noch nicht angewendet haben:

```bash
kubectl apply -f kafka-scaled.yaml
```

Überwachen Sie das Rolling Update der Pods:

```bash
kubectl get po -w | grep my-kafka
```

**Erwartetes Ergebnis (während des Rolling Updates):**

```console
my-kafka-kafka-0       1/1     Running       0   45m
my-kafka-kafka-1       1/1     Running       0   44m
my-kafka-kafka-2       1/1     Terminating   0   43m
my-kafka-kafka-2       0/1     Pending       0   0s
my-kafka-kafka-2       1/1     Running       0   30s
```

Warten Sie, bis alle Pods im Status `Running` sind:

```bash
kubectl get po | grep my-kafka
```

```console
my-kafka-kafka-0       1/1     Running   0   10m
my-kafka-kafka-1       1/1     Running   0   8m
my-kafka-kafka-2       1/1     Running   0   6m
my-kafka-kafka-3       1/1     Running   0   4m
my-kafka-kafka-4       1/1     Running   0   2m
my-kafka-zookeeper-0   1/1     Running   0   10m
my-kafka-zookeeper-1   1/1     Running   0   8m
my-kafka-zookeeper-2   1/1     Running   0   6m
```

## Überprüfung

Bestätigen Sie, dass die neuen Ressourcen angewendet wurden:

```bash
kubectl get kafka my-kafka -o yaml | grep -A 8 -E "kafka:|zookeeper:"
```

Überprüfen Sie, ob der Cluster funktionsfähig ist, indem Sie die Topics auflisten:

```bash
kubectl run kafka-debug --rm -it --image=bitnami/kafka:latest --restart=Never -- \
  kafka-topics.sh --bootstrap-server my-kafka-kafka-bootstrap:9092 --list
```

## Weiterführende Informationen

- **[Kafka API-Referenz](../api-reference.md)**: Vollständige Dokumentation der Parameter `kafka`, `zookeeper` und der Preset-Tabelle
- **[Topics erstellen und verwalten](./manage-topics.md)**: Topics nach der Skalierung konfigurieren
