---
sidebar_position: 2
title: Schnellstart
---

# Kafka in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie Schritt für Schritt bei der Bereitstellung Ihres ersten **Kafka-Clusters** auf Hikube, vom YAML-Manifest bis zu den ersten Messaging-Tests.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen **Kafka-Cluster**, der auf Hikube bereitgestellt und betriebsbereit ist
- **3 Kafka-Broker** und **3 ZooKeeper-Knoten** für Hochverfügbarkeit
- Ein **Topic**, das bereit ist, Nachrichten zu empfangen
- Einen **persistenten Speicher** für Ihre Kafka- und ZooKeeper-Daten

---

## Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen **Namespace**, der Ihren Kafka-Cluster beherbergen soll
- **kafkacat** (oder `kcat`) auf Ihrem Arbeitsplatz installiert (optional, für Tests)

---

## Schritt 1: Kafka-Manifest erstellen

Erstellen Sie eine Datei `kafka.yaml` mit folgender Konfiguration:

```yaml title="kafka.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: Kafka
metadata:
  name: example
spec:
  external: false
  kafka:
    replicas: 3
    resourcesPreset: small
    size: 10Gi
    storageClass: replicated
  zookeeper:
    replicas: 3
    resourcesPreset: small
    size: 5Gi
    storageClass: replicated
  topics:
    - name: my-topic
      partitions: 3
      replicas: 3
      config:
        retention.ms: "604800000"
        cleanup.policy: "delete"
```

:::tip
Kafka verfügt auf Hikube standardmäßig über keine Authentifizierung. Für den Produktionseinsatz wird empfohlen, den Cluster nicht nach außen freizugeben (`external: false`). Weitere Informationen finden Sie in der [API-Referenz](./api-reference.md).
:::

---

## Schritt 2: Kafka-Cluster bereitstellen

Wenden Sie das Manifest an und überprüfen Sie, ob die Bereitstellung startet:

```bash
# Manifest anwenden
kubectl apply -f kafka.yaml
```

Überprüfen Sie den Status des Clusters (kann 2-3 Minuten dauern):

```bash
kubectl get kafka
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.13.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass alle Pods im Status `Running` sind:

```bash
kubectl get pods | grep kafka
```

**Erwartetes Ergebnis:**

```console
kafka-example-kafka-0        1/1     Running   0   2m
kafka-example-kafka-1        1/1     Running   0   2m
kafka-example-kafka-2        1/1     Running   0   2m
kafka-example-zookeeper-0    1/1     Running   0   2m
kafka-example-zookeeper-1    1/1     Running   0   2m
kafka-example-zookeeper-2    1/1     Running   0   2m
```

Mit `kafka.replicas: 3` und `zookeeper.replicas: 3` erhalten Sie **6 Pods**:

| Präfix | Rolle | Anzahl |
|--------|-------|--------|
| `kafka-example-kafka-*` | **Kafka-Broker** (Empfang, Speicherung und Verteilung von Nachrichten) | 3 |
| `kafka-example-zookeeper-*` | **ZooKeeper** (Cluster-Koordination und Leader-Wahl) | 3 |

---

## Schritt 4: Zugangsdaten abrufen

Kafka auf Hikube verfügt standardmäßig über keine Authentifizierung. Die Verbindungen erfolgen direkt über den Bootstrap-Service:

```bash
kubectl get svc | grep kafka
```

**Erwartetes Ergebnis:**

```console
kafka-example-kafka-bootstrap    ClusterIP      10.96.xx.xx    <none>        9092/TCP    2m
kafka-example-kafka-brokers      ClusterIP      None           <none>        9092/TCP    2m
kafka-example-zookeeper-client   ClusterIP      10.96.xx.xx    <none>        2181/TCP    2m
```

:::note
Der Service `kafka-example-kafka-bootstrap` ist der Haupteinstiegspunkt für Kafka-Clients.
:::

---

## Schritt 5: Verbindung und Tests

### Port-Forward des Kafka-Services

```bash
kubectl port-forward svc/kafka-example-kafka-bootstrap 9092:9092 &
```

### Nachricht veröffentlichen und konsumieren

```bash
# Eine Nachricht an das Topic senden
echo "Hello Hikube!" | kafkacat -b localhost:9092 -t my-topic -P

# Die Nachricht konsumieren
kafkacat -b localhost:9092 -t my-topic -C -o beginning -e
```

**Erwartetes Ergebnis:**

```console
Hello Hikube!
```

:::note
Falls Sie `kafkacat` nicht installiert haben, können Sie es mit `apt install kafkacat` (Debian/Ubuntu) oder `brew install kcat` (macOS) installieren.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Brokers prüfen
kubectl logs kafka-example-kafka-0

# Events des Pods prüfen
kubectl describe pod kafka-example-kafka-0
```

**Häufige Ursachen:** Unzureichender Arbeitsspeicher (`kafka.resources.memory` zu niedrig), Speichervolume voll.

### Kafka nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep kafka

# Bootstrap-Service prüfen
kubectl describe svc kafka-example-kafka-bootstrap
```

**Häufige Ursachen:** Port-Forward nicht aktiv, falscher Port in der Verbindungszeichenfolge, Service nicht bereit.

### ZooKeeper-Fehler

```bash
# ZooKeeper-Logs prüfen
kubectl logs kafka-example-zookeeper-0

# Status der ZooKeeper-Pods prüfen
kubectl get pods | grep zookeeper
```

**Häufige Ursachen:** Das ZooKeeper-Quorum erfordert eine ungerade Anzahl von Replikaten (mindestens 3 empfohlen), unzureichender Speicherplatz.

### Allgemeine Diagnosebefehle

```bash
# Aktuelle Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des Kafka-Clusters
kubectl describe kafka example
```

---

## Schritt 7: Bereinigung

Um die Testressourcen zu löschen:

```bash
kubectl delete -f kafka.yaml
```

:::warning
Diese Aktion löscht den Kafka-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben bereitgestellt:

- Einen Kafka-Cluster mit **3 Brokern**, verteilt auf verschiedene Knoten
- **3 ZooKeeper-Knoten** für die Cluster-Koordination
- Ein **Topic** konfiguriert mit 3 Partitionen und 3 Replikaten
- Persistenten Speicher für die Datenhaltbarkeit

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller Kafka-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle von Kafka auf Hikube
