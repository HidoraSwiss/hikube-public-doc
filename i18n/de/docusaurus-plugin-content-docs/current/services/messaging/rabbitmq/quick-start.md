---
sidebar_position: 2
title: Schnellstart
---

# RabbitMQ in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie Schritt für Schritt bei der Bereitstellung Ihres ersten **RabbitMQ-Clusters** auf Hikube, vom YAML-Manifest bis zu den ersten Messaging-Tests.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen **RabbitMQ-Cluster**, der auf Hikube bereitgestellt und betriebsbereit ist
- **3 RabbitMQ-Knoten** repliziert für Hochverfügbarkeit
- Einen **Vhost** und einen **Admin-Benutzer** konfiguriert
- Einen **persistenten Speicher** für die RabbitMQ-Daten
- Zugang zur **Management-Oberfläche** (Management UI)

---

## Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen **Namespace**, der Ihren RabbitMQ-Cluster beherbergen soll
- **Python** mit dem Modul `pika` installiert (optional, für Tests)

---

## Schritt 1: RabbitMQ-Manifest erstellen

Erstellen Sie eine Datei `rabbitmq.yaml` mit folgender Konfiguration:

```yaml title="rabbitmq.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: RabbitMQ
metadata:
  name: example
spec:
  replicas: 3
  resourcesPreset: small
  size: 10Gi
  storageClass: replicated
  users:
    admin:
      password: "strongpassword"
  vhosts:
    default:
      roles:
        admin: ["admin"]
```

:::tip
Mit 3 Replikaten verwendet RabbitMQ die **Quorum Queues**, um die Nachrichtenhaltbarkeit zu gewährleisten. Weitere Informationen finden Sie in der [API-Referenz](./api-reference.md).
:::

---

## Schritt 2: RabbitMQ-Cluster bereitstellen

Wenden Sie das Manifest an und überprüfen Sie, ob die Bereitstellung startet:

```bash
# Manifest anwenden
kubectl apply -f rabbitmq.yaml
```

Überprüfen Sie den Status des Clusters (kann 2-3 Minuten dauern):

```bash
kubectl get rabbitmq
```

**Erwartetes Ergebnis:**

```console
NAME      READY   AGE     VERSION
example   True    2m      0.10.0
```

---

## Schritt 3: Überprüfung der Pods

Überprüfen Sie, dass alle Pods im Status `Running` sind:

```bash
kubectl get pods | grep rabbitmq
```

**Erwartetes Ergebnis:**

```console
rabbitmq-example-rabbitmq-server-0    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-1    1/1     Running   0   2m
rabbitmq-example-rabbitmq-server-2    1/1     Running   0   2m
```

Mit `replicas: 3` erhalten Sie **3 RabbitMQ-Knoten**, die einen Hochverfügbarkeits-Cluster bilden.

| Präfix | Rolle | Anzahl |
|--------|-------|--------|
| `rabbitmq-example-rabbitmq-server-*` | **RabbitMQ Server** (Nachrichten-Broker + Management UI) | 3 |

---

## Schritt 4: Zugangsdaten abrufen

Die Passwörter sind in Kubernetes Secrets gespeichert:

```bash
# Zugangsdaten des im Manifest definierten Benutzers
kubectl get secret rabbitmq-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
admin: strongpassword
```

Ein Standardbenutzer wird auch automatisch vom Operator erstellt:

```bash
# Zugangsdaten des Standardbenutzers
kubectl get secret rabbitmq-example-rabbitmq-default-user -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

---

## Schritt 5: Verbindung und Tests

### Zugang zur Management-Oberfläche (Management UI)

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 15672:15672 &
```

Greifen Sie über Ihren Browser auf die Oberfläche zu: http://localhost:15672

Melden Sie sich mit den in Schritt 4 abgerufenen Standardbenutzer-Zugangsdaten an.

### Messaging-Test mit Python

```bash
kubectl port-forward svc/rabbitmq-example-rabbitmq 5672:5672 &
```

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('admin', 'strongpassword')
parameters = pika.ConnectionParameters(
    host='localhost',
    port=5672,
    virtual_host='default',
    credentials=credentials
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Erstellen einer Queue
channel.queue_declare(queue='test')

# Senden einer Nachricht
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Nachricht erfolgreich gesendet")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Erwartetes Ergebnis:**

```console
Nachricht erfolgreich gesendet
```

:::note
Falls Sie `pika` nicht installiert haben, installieren Sie es mit `pip install pika`.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Pods prüfen
kubectl logs rabbitmq-example-rabbitmq-server-0

# Events des Pods prüfen
kubectl describe pod rabbitmq-example-rabbitmq-server-0
```

**Häufige Ursachen:** Unzureichender Arbeitsspeicher (`resources.memory` zu niedrig), Speichervolume voll, DNS-Auflösungsfehler zwischen den Knoten.

### RabbitMQ nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep rabbitmq

# RabbitMQ-Service prüfen
kubectl describe svc rabbitmq-example-rabbitmq
```

**Häufige Ursachen:** Port-Forward nicht aktiv, falscher Port (5672 für AMQP, 15672 für Management UI), falsche Zugangsdaten.

### Cluster nicht gebildet

```bash
# Status des RabbitMQ-Clusters prüfen
kubectl exec rabbitmq-example-rabbitmq-server-0 -- rabbitmqctl cluster_status

# Logs der Clusterbildung prüfen
kubectl logs rabbitmq-example-rabbitmq-server-0 | grep -i cluster
```

**Häufige Ursachen:** DNS-Auflösungsproblem zwischen den Knoten, nicht synchronisiertes Erlang-Cookie, unzureichende Ressourcen für den Clusterbildungsprozess.

### Allgemeine Diagnosebefehle

```bash
# Aktuelle Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des RabbitMQ-Clusters
kubectl describe rabbitmq example
```

---

## Schritt 7: Bereinigung

Um die Testressourcen zu löschen:

```bash
kubectl delete -f rabbitmq.yaml
```

:::warning
Diese Aktion löscht den RabbitMQ-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben bereitgestellt:

- Einen RabbitMQ-Cluster mit **3 Knoten** in Hochverfügbarkeit
- Einen **Admin-Benutzer** und einen Standard-**Vhost** konfiguriert
- Eine **Management-Oberfläche** (Management UI) lokal zugänglich
- Persistenten Speicher für die Datenhaltbarkeit

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller RabbitMQ-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle von RabbitMQ auf Hikube
