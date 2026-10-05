---
title: "Benutzer verwalten"
---

# NATS-Benutzer verwalten

:::info Verfügbarkeit
NATS ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht im Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung erklärt, wie Sie die Benutzer eines NATS-Clusters auf Hikube organisieren und deren Zugriff über das CLI `nats` überprüfen.

Die Benutzer (Name und Passwort) sind Teil der Instanzkonfiguration. Ihre Erstellung, Löschung oder die Erneuerung ihres Passworts beantragen Sie beim Support. Diese Option wird in der Konsole nicht angeboten; wenden Sie sich an den Support.

## Voraussetzungen

- Ein auf Hikube bereitgestellter **NATS**-Cluster und seine URL (`<nats-url>`)
- Das CLI **nats** lokal installiert

## Schritte

### 1. Die benötigten Konten festlegen

Legen Sie für eine granulare Zugriffskontrolle getrennte Benutzer pro Verwendungszweck an, zum Beispiel:

| Benutzer | Verwendung |
|-------------|-------|
| `admin` | Administration (Erstellung von Streams, Serverberichte) |
| `appuser` | Anwendungskonto, eines pro Dienst |
| `monitoring` | Überwachung |

### 2. Die Erstellung der Benutzer beantragen

Senden Sie die Liste der Benutzer an den [Support](mailto:support@hidora.io) und geben Sie dabei das Projekt und den Namen der Instanz an. Der Support übermittelt Ihnen die Passwörter; bewahren Sie sie in einem Passwort-Manager auf.

### 3. Die Verbindung mit dem CLI nats testen

Speichern Sie einen Kontext pro Benutzer und testen Sie anschließend das Veröffentlichen:

```bash
nats context save hikube-admin --server <nats-url> --user admin --password <admin-password>
nats --context hikube-admin pub test "Hello from admin"
```

**Erwartetes Ergebnis:**

```console
Published 16 bytes to "test"
```

**Test mit einem falschen Passwort:**

```bash
nats pub test "This should fail" --server <nats-url> --user admin --password wrongpassword
```

**Erwartetes Ergebnis:**

```console
nats: error: Authorization Violation
```

:::warning
Wenn der externe Zugriff auf der Instanz aktiviert ist, ist der NATS-Cluster aus dem Internet erreichbar. Stellen Sie sicher, dass alle Benutzer über starke Passwörter verfügen.
:::

### 4. Aktive Verbindungen prüfen

Sehen Sie sich mit einem Konto mit ausreichenden Rechten die aktiven Verbindungen an:

```bash
nats --context hikube-admin server report connections
```

:::note
Die Berichte `nats server …` erfordern Zugriff auf das Systemkonto des NATS-Servers. Wird der Befehl abgelehnt, erfragen Sie den Status der Verbindungen beim Support.
:::

## Überprüfung

Die Konfiguration ist korrekt, wenn:

- sich jeder Benutzer mit seinem Passwort verbinden kann
- ein falsches Passwort abgelehnt wird (`Authorization Violation`)

## Weiterführende Informationen

- **[Konzepte](../concepts.md)**: Benutzerverwaltung und JetStream
- **[JetStream konfigurieren](./configure-jetstream.md)**: Persistenz von Nachrichten und Streaming aktivieren
