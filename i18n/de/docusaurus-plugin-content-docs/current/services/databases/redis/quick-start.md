---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Redis in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten **Redis**-Clusters über die [Hikube-Konsole](https://console.hikube.cloud) bis zu den ersten Tests mit `redis-cli`.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Einen **Redis**-Cluster, bereitgestellt in Ihrem Hikube-Projekt
- Ein von der Plattform generiertes Zugangspasswort
- Eine funktionierende Verbindung mit `redis-cli`

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** mit ausreichenden Quotas (CPU, Arbeitsspeicher, Speicher)
- Den Client **`redis-cli`** auf Ihrem Rechner, falls Sie eine Verbindung aus dem Internet testen möchten

---

## Schritt 1: Cluster erstellen

1. Melden Sie sich bei der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **DB & Messaging** → **Redis**. Die Seite **Redis Clusters** wird angezeigt.
3. Klicken Sie auf **Create a cluster**. Der Assistent **Create a Redis cluster** öffnet sich.

---

## Schritt 2: Konfigurieren und bestätigen

Der Assistent umfasst vier Schritte: **General**, **Configuration**, **Summary** und **Done**.

### General

Geben Sie den **Cluster Name** ein, zum Beispiel `demo-cache` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben, endet mit einem Buchstaben oder einer Ziffer). Klicken Sie auf **Next**.

### Configuration

| Feld | Empfohlener Wert für diese Anleitung | Hinweis |
|-------|----------------------------------|----------|
| **Version** | `8 (Latest)` | Angebotene Versionen: 8 und 7 |
| **Preset** | `Small (1 CPU, 512Mi)` | Jedem Knoten zugewiesene Kapazität |
| **Volume size (GB)** | `10` | Jedem Knoten zugewiesener Speicher |
| **Number of replicas** | `3` | 1 bis 8; mindestens 2 für das automatische Failover |
| **Public network** | Aktiviert | Erforderlich, um sich von Ihrem Rechner aus zu verbinden |
| **Enable authentication** | Aktiviert | Standardmäßig aktiv; beibehalten |

Das Banner oben im Assistenten zeigt die **Estimated Cost** und die Auswirkung auf die Quotas des Projekts an. Klicken Sie auf **Next**.

:::warning
Die **Number of replicas** kann nach der Erstellung nicht mehr geändert werden.
:::

### Summary

Prüfen Sie die Übersicht (**Name**, **Version**, **Preset**, **Replicas**, **Storage size**, **Network**: **Public** oder **Private**) und klicken Sie dann auf **Create**.

---

## Schritt 3: Status prüfen

Der Schritt **Done** zeigt „Cluster successfully created“ an. Klicken Sie auf **Finish**, um zur Liste **Redis Clusters** zurückzukehren, und öffnen Sie dann den Cluster.

| Status | Bedeutung |
|--------|---------------|
| **Creating** | Der Cluster wird bereitgestellt |
| **Ready** / **Running** | Der Cluster ist betriebsbereit |
| **Error** / **Failed** | Die Bereitstellung ist fehlgeschlagen |

**Erwartetes Ergebnis:** Nach einigen Minuten zeigt der Abschnitt **Connection** der Cluster-Seite den **Status** **Ready** und den **Host** des Clusters an.

---

## Schritt 4: Zugangsdaten abrufen

Ist die Authentifizierung aktiviert, zeigt der Schritt **Done** des Assistenten unter **User Credentials** Folgendes an:

- den Benutzer **`default`**;
- sein **Password**;
- den **Internal Connection String**: die Adresse des Clusters, wenn das öffentliche Netzwerk aktiviert ist.

:::warning
Kopieren Sie das Passwort sofort: Es wird nicht erneut angezeigt. Bei Verlust generieren Sie im Abschnitt **Security** der Cluster-Seite ein neues (**Rotate password**). Siehe [Passwort erneuern](./how-to/rotate-password.md).
:::

Die Adresse bleibt auf der Cluster-Seite einsehbar, Abschnitt **Connection**, Feld **Host** (Kopier-Schaltfläche rechts).

---

## Schritt 5: Verbindung und Tests

```bash
export REDIS_HOST=<host>
export REDISCLI_AUTH='<password>'

# PING-Test
redis-cli -h "$REDIS_HOST" -p 6379 ping
# PONG

# Einen Schlüssel anlegen
redis-cli -h "$REDIS_HOST" -p 6379 SET hello "hikube"
# OK

# Den Schlüssel lesen
redis-cli -h "$REDIS_HOST" -p 6379 GET hello
# "hikube"
```

:::tip
Die Variable `REDISCLI_AUTH` verhindert, dass das Passwort im Shell-Verlauf erscheint, anders als die Option `-a`.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Der Host zeigt „Waiting for allocation...“ an

Das öffentliche Netzwerk ist deaktiviert, oder die öffentliche IP-Adresse ist noch nicht zugewiesen. Aktivieren Sie bei Bedarf **External access** über **Edit** und warten Sie einige Augenblicke.

### `NOAUTH Authentication required` oder `WRONGPASS`

Das Passwort fehlt oder ist falsch. Prüfen Sie die Variable `REDISCLI_AUTH` oder generieren Sie im Abschnitt **Security** ein neues Passwort.

### Die Schaltfläche Next bleibt inaktiv

Die Konfiguration überschreitet die Quotas des Projekts. Verringern Sie das Preset, die Volume-Größe oder die Anzahl der Replicas.

### Der Cluster bleibt im Status Error

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts und des Clusters an.

---

## Schritt 7: Bereinigung

1. Öffnen Sie die Seite des Clusters (**DB & Messaging** → **Redis** → Name des Clusters).
2. Klicken Sie auf **Delete**.
3. Geben Sie den genauen Namen des Clusters in das Feld **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning
Diese Aktion löscht den Redis-Cluster und alle zugehörigen Daten. Sie ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben über die Konsole Folgendes erstellt:

- Einen replizierten **Redis**-Cluster, überwacht von Sentinel
- Ein Zugangspasswort
- Eine `redis-cli`-Verbindung über das öffentliche Netzwerk

<NavigationFooter
  nextSteps={[
    {label: "Hochverfügbarkeit", href: "../how-to/configure-ha"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
