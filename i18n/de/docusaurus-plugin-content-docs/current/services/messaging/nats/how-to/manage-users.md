---
title: "Benutzer verwalten"
---

# NATS-Benutzer verwalten

Diese Anleitung erklärt, wie Sie Benutzer eines NATS-Clusters auf Hikube deklarativ über Kubernetes-Manifeste erstellen und verwalten.

## Voraussetzungen

- **kubectl** konfiguriert mit Ihrer Hikube-Kubeconfig
- Ein auf Hikube bereitgestellter **NATS**-Cluster (oder ein Manifest zur Bereitstellung)
- (Optional) das **nats** CLI lokal installiert zum Testen der Verbindungen

## Schritte

### 1. Benutzer hinzufügen

Die Benutzer werden im Abschnitt `users` des Manifests deklariert. Jeder Benutzer wird durch einen Namen identifiziert und hat ein Passwort.

```yaml title="nats-users.yaml"
apiVersion: apps.cozystack.io/v1alpha1
kind: NATS
metadata:
  name: my-nats
spec:
  replicas: 3
  resourcesPreset: small

  jetstream:
    enabled: true
    size: 10Gi

  users:
    admin:
      password: SecureAdminPassword
    appuser:
      password: AppUserPassword456
    monitoring:
      password: MonitoringPassword789
```

**Benutzerparameter:**

| Parameter | Typ | Beschreibung |
|-----------|-----|--------------|
| `users[name].password` | `string` | Dem Benutzer zugeordnetes Passwort |

:::tip
Erstellen Sie separate Benutzer pro Anwendung für eine granulare Zugriffskontrolle. Verwenden Sie ein **Admin**-Konto für die Administration, **Anwendungskonten** pro Dienst und ein dediziertes **Monitoring**-Konto für die Überwachung.
:::

### 2. Änderungen anwenden

```bash
kubectl apply -f nats-users.yaml
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

### 3. Verbindung mit dem nats CLI testen

Öffnen Sie einen Port-Forward zum NATS-Service:

```bash
kubectl port-forward svc/my-nats 4222:4222
```

Testen Sie die Verbindung mit jedem Benutzer:

**Verbindung mit dem Benutzer admin:**

```bash
nats pub test "Hello from admin" \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Erwartetes Ergebnis:**

```console
Published 16 bytes to "test"
```

**Verbindung mit dem Benutzer appuser:**

```bash
nats pub app.events "Hello from appuser" \
  --server nats://appuser:AppUserPassword456@127.0.0.1:4222
```

**Erwartetes Ergebnis:**

```console
Published 18 bytes to "app.events"
```

**Test mit falschem Passwort:**

```bash
nats pub test "This should fail" \
  --server nats://admin:wrongpassword@127.0.0.1:4222
```

**Erwartetes Ergebnis:**

```console
nats: error: Authorization Violation
```

:::warning
Wenn `external: true` aktiviert ist, ist der NATS-Cluster von außerhalb des Kubernetes-Clusters erreichbar. Stellen Sie sicher, dass alle Benutzer über starke Passwörter verfügen.
:::

### 4. Aktive Verbindungen überprüfen

Sie können die aktiven Verbindungen auf dem NATS-Cluster überprüfen:

```bash
nats server report connections \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

**Erwartetes Ergebnis:**

```console
╭──────────────────────────────────────────────────────────╮
│                   Connection Report                       │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Server   │ Conns    │ In Msgs  │ Out Msgs │ In Bytes     │
├──────────┼──────────┼──────────┼──────────┼──────────────┤
│ my-nats-0│ 2        │ 5        │ 3        │ 128B         │
│ my-nats-1│ 1        │ 2        │ 1        │ 64B          │
│ my-nats-2│ 0        │ 0        │ 0        │ 0B           │
╰──────────┴──────────┴──────────┴──────────┴──────────────╯
```

Um die Verbindungsdetails pro Benutzer anzuzeigen:

```bash
nats server report connz \
  --server nats://admin:SecureAdminPassword@127.0.0.1:4222
```

## Überprüfung

Die Konfiguration ist erfolgreich, wenn:

- Alle NATS-Pods nach dem Update im Status `Running` sind
- Jeder Benutzer sich mit seinem Passwort verbinden kann
- Ein falsches Passwort abgelehnt wird (`Authorization Violation`)
- Aktive Verbindungen im Serverbericht sichtbar sind

## Weiterführende Informationen

- **[NATS API-Referenz](../api-reference.md)**: Vollständige Dokumentation der `users`-Parameter
- **[JetStream konfigurieren](./configure-jetstream.md)**: Nachrichtenpersistenz und Streaming aktivieren
