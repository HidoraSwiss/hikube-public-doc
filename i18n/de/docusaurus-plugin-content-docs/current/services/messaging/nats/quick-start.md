---
sidebar_position: 2
title: Schnellstart
---

# NATS in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie Schritt für Schritt bei der Bereitstellung Ihres ersten **NATS-Clusters** auf Hikube, vom YAML-Manifest bis zu den ersten Messaging-Tests.

---

## Ziele

Am Ende dieser Anleitung haben Sie:

- Einen **NATS-Cluster**, der auf Hikube bereitgestellt und betriebsbereit ist
- Eine **Hochverfügbarkeits**-Konfiguration mit mehreren Replikaten
- **JetStream** aktiviert für die persistente Nachrichtenspeicherung
- Einen **Benutzer**, der für die Verbindung zu Ihrem Cluster konfiguriert ist

---

## Voraussetzungen

Stellen Sie vor Beginn sicher, dass Sie Folgendes haben:

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- **Administratorrechte** auf Ihrem Tenant
- Einen **Namespace**, der Ihren NATS-Cluster beherbergen soll
- Das **NATS CLI** (`nats`) auf Ihrem Arbeitsplatz installiert (optional, für Tests)

---

## Schritt 1: NATS-Manifest erstellen

Erstellen Sie eine Datei `nats.yaml` mit folgender Konfiguration:

```yaml title="nats.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: example
spec:
  external: false

  replicas: 3
  resourcesPreset: small
  storageClass: replicated

  jetstream:
    enabled: true
    size: 10Gi

  users:
    user1:
      password: mypassword

  config:
    merge:
      max_payload: 16MB
      write_deadline: 2s
      debug: false
      trace: false
```

:::tip
Wenn `resources` definiert ist, wird der Wert von `resourcesPreset` ignoriert. Weitere Informationen finden Sie in der [API-Referenz](./api-reference.md).
:::

---

## Schritt 2: NATS-Cluster bereitstellen

Wenden Sie das Manifest an und überprüfen Sie, ob die Bereitstellung startet:

```bash
# Manifest anwenden
kubectl apply -f nats.yaml
```

Überprüfen Sie den Status des Clusters (kann 1-2 Minuten dauern):

```bash
kubectl get nats
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
kubectl get pods | grep nats
```

**Erwartetes Ergebnis:**

```console
nats-example-0    1/1     Running   0   2m
nats-example-1    1/1     Running   0   2m
nats-example-2    1/1     Running   0   2m
```

Mit `replicas: 3` erhalten Sie **3 NATS-Pods**, die einen Hochverfügbarkeits-Cluster mit Raft-Konsens für JetStream bilden.

| Präfix | Rolle | Anzahl |
|--------|-------|--------|
| `nats-example-*` | **NATS Server** (Messaging + JetStream) | 3 |

---

## Schritt 4: Zugangsdaten abrufen

Die Passwörter der NATS-Benutzer sind in einem Kubernetes Secret gespeichert:

```bash
kubectl get secret nats-example-credentials -o json | jq -r '.data | to_entries[] | "\(.key): \(.value|@base64d)"'
```

**Erwartetes Ergebnis:**

```console
user1: mypassword
```

---

## Schritt 5: Verbindung und Tests

### Port-Forward des NATS-Services

```bash
kubectl port-forward svc/nats-example 4222:4222 &
```

### Test von Veröffentlichung und Konsum

```bash
# Einen JetStream-Stream erstellen
nats -s nats://user1:mypassword@localhost:4222 stream add EVENTS \
  --subjects "events.*" --storage file --replicas 3 --retention limits \
  --max-msgs -1 --max-bytes -1 --max-age 24h --discard old

# Eine Nachricht veröffentlichen
nats -s nats://user1:mypassword@localhost:4222 pub events.test "Hello Hikube!"

# Die Nachricht konsumieren
nats -s nats://user1:mypassword@localhost:4222 stream view EVENTS
```

**Erwartetes Ergebnis:**

```console
[1] Subject: events.test Received: 2025-01-15T10:30:00Z
  Hello Hikube!
```

:::note
Falls Sie das NATS CLI nicht installiert haben, können Sie es von [nats-io/natscli](https://github.com/nats-io/natscli) installieren.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Pods im CrashLoopBackOff

```bash
# Logs des fehlerhaften Pods prüfen
kubectl logs nats-example-0

# Events des Pods prüfen
kubectl describe pod nats-example-0
```

**Häufige Ursachen:** Unzureichender Arbeitsspeicher (`resources.memory` zu niedrig), JetStream-Volume voll (`jetstream.size` zu niedrig).

### NATS nicht erreichbar

```bash
# Prüfen, ob die Services existieren
kubectl get svc | grep nats

# NATS-Service prüfen
kubectl describe svc nats-example
```

**Häufige Ursachen:** Port-Forward nicht aktiv, falscher Port (4222 für Clients), falsche Zugangsdaten.

### JetStream nicht funktionsfähig

```bash
# JetStream-Status in den Logs prüfen
kubectl logs nats-example-0 | grep -i jetstream

# JetStream-Bericht prüfen
nats -s nats://user1:mypassword@localhost:4222 server report jetstream
```

**Häufige Ursachen:** `jetstream.enabled: false` im Manifest, unzureichender JetStream-Speicherplatz, unzureichende Anzahl von Replikaten für den angeforderten Replikationsfaktor.

### Allgemeine Diagnosebefehle

```bash
# Aktuelle Events im Namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Detaillierter Status des NATS-Clusters
kubectl describe nats example
```

---

## Schritt 7: Bereinigung

Um die Testressourcen zu löschen:

```bash
kubectl delete -f nats.yaml
```

:::warning
Diese Aktion löscht den NATS-Cluster und alle zugehörigen Daten. Dieser Vorgang ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben bereitgestellt:

- Einen NATS-Cluster mit **3 Replikaten** in Hochverfügbarkeit
- **JetStream** aktiviert für die Nachrichtenpersistenz
- Einen **authentifizierten Benutzer** für die Verbindung zum Cluster
- Persistenten Speicher für die Datenhaltbarkeit

---

## Nächste Schritte

- **[API-Referenz](./api-reference.md)**: Vollständige Konfiguration aller NATS-Optionen
- **[Übersicht](./overview.md)**: Detaillierte Architektur und Anwendungsfälle von NATS auf Hikube
