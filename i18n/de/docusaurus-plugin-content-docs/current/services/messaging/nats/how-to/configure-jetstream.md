---
title: "JetStream konfigurieren"
---

# JetStream konfigurieren

Diese Anleitung erklärt, wie Sie das **JetStream**-Modul auf einem auf Hikube bereitgestellten NATS-Cluster aktivieren und konfigurieren. JetStream bietet Nachrichtenpersistenz, Streaming und das Request/Reply-Pattern mit Zustellgarantien.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **NATS**-Cluster (oder ein Manifest zur Bereitstellung)
- (Optional) das **nats** CLI lokal installiert zum Testen

## Schritte

### 1. JetStream aktivieren

JetStream ist standardmäßig aktiviert (`jetstream.enabled: true`). Wenn Sie es deaktiviert haben oder es explizit konfigurieren möchten, fügen Sie den Abschnitt `jetstream` zum Manifest hinzu:

```yaml title="nats-jetstream.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small
  external: false

  jetstream:
    enabled: true
    size: 20Gi

  users:
    admin:
      password: SecureAdminPassword
```

**JetStream-Parameter:**

| Parameter | Typ | Beschreibung | Standard |
|-----------|-----|--------------|----------|
| `jetstream.enabled` | `bool` | Aktiviert oder deaktiviert JetStream | `true` |
| `jetstream.size` | `quantity` | Größe des persistenten Volumes für JetStream-Daten | `10Gi` |

:::tip
Verwenden Sie mindestens 3 Replikate in der Produktion, um vom Raft-Konsens von JetStream zu profitieren. Dies gewährleistet Hochverfügbarkeit und Haltbarkeit der Streams bei Ausfall eines Knotens.
:::

### 2. JetStream-Speicher konfigurieren

Die Dimensionierung des JetStream-Volumes hängt von Ihrem Anwendungsfall ab:

- **Ephemere Nachrichten** (kurze TTL, wenige Stunden): `10Gi` bis `20Gi`
- **Langfristige Aufbewahrung** (Tage, Wochen): `50Gi` bis `100Gi`
- **Große Streams** (Ereignisse, Logs): `100Gi` und mehr

```yaml title="nats-jetstream-storage.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword
```

:::warning
Die Reduzierung von `jetstream.size` auf einem bestehenden Cluster kann zu Datenverlust führen. Planen Sie bei der anfänglichen Dimensionierung immer einen ausreichenden Puffer ein.
:::

### 3. Erweiterte Konfiguration über config.merge

Das Feld `config.merge` ermöglicht die Anpassung von Low-Level-NATS-Parametern:

```yaml title="nats-config-advanced.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: medium
  storageClass: replicated

  jetstream:
    enabled: true
    size: 50Gi

  users:
    admin:
      password: SecureAdminPassword

  config:
    merge:
      max_payload: 8MB
      write_deadline: 2s
      debug: false
      trace: false
```

**Gängige Konfigurationsoptionen:**

| Parameter | Beschreibung | Standard |
|-----------|--------------|----------|
| `max_payload` | Maximale Größe einer Nachricht | `1MB` |
| `write_deadline` | Maximale Verzögerung für das Schreiben einer Antwort an den Client | `2s` |
| `debug` | Aktiviert Debug-Logs | `false` |
| `trace` | Aktiviert Nachrichten-Tracing (sehr ausführlich) | `false` |

:::note
Aktivieren Sie `debug` und `trace` nur für temporäre Fehlerbehebung. Diese Optionen erzeugen ein erhebliches Log-Volumen und können die Performance beeinträchtigen.
:::

### 4. Anwenden und überprüfen

Wenden Sie das Manifest an:

```bash
kubectl apply -f nats-config-advanced.yaml
```

Überwachen Sie das Rolling Update der Pods:

```bash
kubectl get po -w | grep my-nats
```

Warten Sie, bis alle Pods im Status `Running` sind:

```bash
kubectl get po | grep my-nats
```

**Erwartetes Ergebnis:**

```console
my-nats-0   1/1     Running   0   2m
my-nats-1   1/1     Running   0   4m
my-nats-2   1/1     Running   0   6m
```

### 5. JetStream testen

Öffnen Sie einen Port-Forward zum NATS-Service:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Erstellen Sie einen Stream mit dem `nats` CLI:

```bash
nats stream create EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --subjects "events.>" \
  --retention limits \
  --max-msgs -1 \
  --max-bytes -1 \
  --max-age 72h \
  --replicas 3
```

**Erwartetes Ergebnis:**

```console
Stream EVENTS was created

Information:

  Subjects: events.>
  Replicas: 3
  Storage:  File
  Retention: Limits
  ...
```

Veröffentlichen Sie eine Nachricht:

```bash
nats pub events.test "Hello JetStream" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

Konsumieren Sie die Nachricht:

```bash
nats sub "events.>" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222 \
  --count 1
```

**Erwartetes Ergebnis:**

```console
[#1] Received on "events.test"
Hello JetStream
```

Überprüfen Sie den Stream-Status:

```bash
nats stream info EVENTS \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Überprüfung

Die Konfiguration ist erfolgreich, wenn:

- Alle NATS-Pods im Status `Running` sind
- Ein Stream mit der gewünschten Anzahl von Replikaten erstellt werden kann
- Veröffentlichte Nachrichten persistiert und konsumiert werden können
- Die Stream-Info die richtige Anzahl von Replikaten und die konfigurierte Aufbewahrungsrichtlinie anzeigt

## Weiterführende Informationen

- **[NATS API-Referenz](../api-reference.md)**: Vollständige Dokumentation der Parameter `jetstream`, `config` und `config.merge`
- **[NATS-Benutzer verwalten](./manage-users.md)**: Zugangskonten zum Cluster erstellen und verwalten
