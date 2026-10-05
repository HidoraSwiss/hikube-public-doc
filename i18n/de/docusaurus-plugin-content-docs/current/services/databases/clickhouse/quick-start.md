---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Erste Schritte mit ClickHouse

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Diese Anleitung beschreibt, welche Informationen Sie für die Anfrage einer **ClickHouse**-Instanz vorbereiten müssen, und anschließend den Einstieg mit `clickhouse-client`, sobald die Instanz bereitgestellt ist.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Eine vollständige Bereitstellungsanfrage mit der für Ihren Bedarf passenden Topologie
- Eine funktionierende Verbindung mit `clickhouse-client`
- Eine erste Analysetabelle

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** mit ausreichenden Quotas
- Den Client **`clickhouse-client`**, auf Ihrem Rechner installiert

---

## Schritt 1: Topologie festlegen

Wählen Sie die Anzahl der **Shards** und **Replicas** entsprechend Ihrer Nutzung (siehe [Übersicht](./overview.md)):

| Nutzung | Shards | Replicas pro Shard |
|-------|--------|--------------------|
| POC, Entwicklung | 1 | 1 |
| Produktion, moderates Volumen | 1 | 2 |
| Produktion, große Volumen | 2 oder mehr | 2 |

Eine replizierte Konfiguration stützt sich für die Koordination auf **ClickHouse Keeper** (3 Instanzen empfohlen).

---

## Schritt 2: Instanz anfragen

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie Folgendes an:

| Information | Beispiel |
|-------------|---------|
| Projekt | `analytics` |
| Name der Instanz | `events-ch` |
| Shards / Replicas pro Shard | `1` / `2` |
| Preset pro Replica | `large` (2 CPU, 2Gi) |
| Speichergröße pro Replica | `50 GB` |
| Benutzer und Rechte | `app` (Vollzugriff), `analyst` (nur Lesen) |
| Zugriff aus dem Internet | Ja / Nein |
| Backups | Ja / Nein, mit der gewünschten Aufbewahrungsdauer |

---

## Schritt 3: Bereitstellung prüfen

Der Support bestätigt Ihnen die Bereitstellung der Instanz sowie die Verbindungsinformationen: Adresse, Ports und Zugangsdaten.

---

## Schritt 4: Zugangsdaten abrufen

Bewahren Sie die übermittelten Passwörter in einem Passwort-Manager auf. Um ein Passwort zu ändern, wenden Sie sich an den Support.

---

## Schritt 5: Verbindung und Tests

ClickHouse stellt das native Protokoll (standardmäßig Port `9000`) und die HTTP-Schnittstelle (standardmäßig Port `8123`) bereit.

```bash
clickhouse-client \
  --host <host> \
  --port 9000 \
  --user app \
  --password \
  --query "SHOW DATABASES;"
```

**Erwartetes Ergebnis:**

```console
INFORMATION_SCHEMA
default
information_schema
system
```

Erstellen Sie anschließend eine erste Tabelle:

```sql
CREATE TABLE default.events
(
    ts DateTime,
    user_id UInt64,
    action String
)
ENGINE = MergeTree
ORDER BY (ts, user_id);

INSERT INTO default.events VALUES (now(), 1, 'login');
SELECT action, count() FROM default.events GROUP BY action;
```

---

## Schritt 6: Schnelle Fehlerbehebung

### Verbindung nicht möglich

Prüfen Sie Adresse und Port: `9000` für das native Protokoll (`clickhouse-client`), `8123` für HTTP. Wenn die Instanz nicht im Internet erreichbar ist, verbinden Sie sich von einer Ressource im selben Projekt aus.

### Authentifizierung abgelehnt

Prüfen Sie den übermittelten Benutzer und das Passwort. Um ein Passwort zurückzusetzen, wenden Sie sich an den Support.

### Langsame Abfragen

Prüfen Sie, ob das `ORDER BY` Ihrer Tabellen zu Ihren häufigsten Filtern passt. Siehe [Fehlerbehebung](./troubleshooting.md).

---

## Schritt 7: Bereinigung

Um eine ClickHouse-Instanz zu löschen, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt und den Namen der Instanz an.

:::warning
Das Löschen einer Instanz entfernt alle zugehörigen Daten. Es ist **unwiderruflich**.
:::

---

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
