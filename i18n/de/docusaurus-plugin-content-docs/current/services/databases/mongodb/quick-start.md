---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# MongoDB in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten **MongoDB**-Clusters über die [Hikube-Konsole](https://console.hikube.cloud) bis zur ersten Verbindung mit `mongosh`.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Einen **MongoDB**-Cluster (Replica Set), bereitgestellt in Ihrem Hikube-Projekt
- Einen Benutzer mit Rechten auf einer Anwendungsdatenbank
- Eine funktionierende Verbindung mit `mongosh`

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** mit ausreichenden Quotas (CPU, Arbeitsspeicher, Speicher)
- Die Shell **`mongosh`** auf Ihrem Rechner, falls Sie eine Verbindung aus dem Internet testen möchten

---

## Schritt 1: Cluster erstellen

1. Melden Sie sich bei der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **DB & Messaging** → **MongoDB**. Die Seite **MongoDB Clusters** wird angezeigt.
3. Klicken Sie auf **Create a cluster**. Der Assistent **Create a MongoDB cluster** öffnet sich.

---

## Schritt 2: Konfigurieren und bestätigen

Der Assistent umfasst fünf Schritte: **General**, **Configuration**, **Users**, **Summary** und **Finish**.

### General

Geben Sie den **Cluster Name** ein, zum Beispiel `demo-mongo` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben, endet mit einem Buchstaben oder einer Ziffer).

### Configuration

| Feld | Empfohlener Wert für diese Anleitung | Hinweis |
|-------|----------------------------------|----------|
| **MongoDB Version** | `8.0` | Angebotene Versionen: 6.0, 7.0, 8.0 |
| **Preset** | `s1.small — 1 CPU / 2Gi` | Kein Preset ist vorausgewählt; nach der Erstellung nicht änderbar |
| **Disk size (GB)** | `10` | Speicherkapazität pro Knoten |
| **Number of replicas** | `3 (Max High Availability)` | `1` für einen einfachen Test; nach der Erstellung nicht änderbar |
| **External access** | Aktiviert | Erforderlich, um sich von Ihrem Rechner aus zu verbinden |
| **Sharding (Distributed Topology)** | Deaktiviert | Siehe [Sharding konfigurieren](./how-to/configure-sharding.md) |

Das Banner oben im Assistenten zeigt die **Estimated Cost** und die Auswirkung auf die Quotas des Projekts an.

:::note
Aktivieren Sie den **External access** nur, wenn Sie ihn benötigen: Er macht die Datenbank im öffentlichen Internet erreichbar.
:::

### Users

Fügen Sie mindestens einen Benutzer hinzu:

1. **Username**: zum Beispiel `app-user` (Kleinbuchstaben, Ziffern und Bindestriche).
2. **Database**: die Anwendungsdatenbank, auf die sich die Rolle des Benutzers bezieht, zum Beispiel `myapp` (Kleinbuchstaben, Ziffern und Bindestriche). Sie wird angelegt, falls sie noch nicht existiert. Die Systemdatenbanken `admin`, `local` und `config` werden abgelehnt.
3. **Role**: **Administrator** für diese Anleitung, oder **Read-only**.
4. Klicken Sie auf **Add**.

### Summary

Prüfen Sie die Übersicht (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**) und klicken Sie dann auf **Create cluster**.

---

## Schritt 3: Status prüfen

Der Schritt **Finish** bestätigt die Erstellung („Creation complete!“). Klicken Sie auf **Finish**, um die Seite des Clusters zu öffnen.

| Status | Bedeutung |
|--------|---------------|
| **Creating** | Der Cluster wird bereitgestellt |
| **Ready** | Der Cluster ist betriebsbereit |
| **Error** | Die Plattform konnte die Erstellung oder die letzte Änderung des Clusters nicht anwenden |

**Erwartetes Ergebnis:** Nach einigen Minuten wechselt der Status auf **Ready**. Die Seite zeigt die **MongoDB Version**, die **Replicas**, die **Allocated Size** und das **Preset** sowie die Karte **Network and Connection** (**Host**, **External Access**, **Sharding**). Bei einem Replica Set mit externem Zugriff tritt an die Stelle des Felds **Host** die Liste **Replica set rs0 members**: eine Adresse pro Mitglied, jeweils mit einer Kopierschaltfläche.

---

## Schritt 4: Zugangsdaten abrufen und Zugriff auf eine Datenbank gewähren

### Zugangsdaten

Der Schritt **Finish** des Assistenten zeigt unter **User Credentials** das **Password** jedes Benutzers sowie, wenn der externe Zugriff aktiviert ist, einen **Internal Connection String**: `mongodb://app-user:<password>@<host>` bei einem Cluster mit Sharding, `mongodb://app-user:<password>@<member>:27017/?directConnection=true&authSource=admin` bei einem Replica Set.

:::warning
Kopieren Sie diese Passwörter sofort: Sie werden nicht erneut angezeigt. Bei Verlust generieren Sie im Abschnitt **Users** ein neues (**Actions** → **Change Password**).
:::

### Zugriff auf die Anwendungsdatenbank

Der Benutzer verfügt über die gewählte Rolle auf der im Schritt **Users** angegebenen Datenbank: Im Abschnitt **Users** der Cluster-Seite zeigt die Spalte **Databases** `myapp (Administrator)` an. Um ihm Zugriff auf weitere Datenbanken zu geben, öffnen Sie das Menü **Actions** des Benutzers und wählen Sie **Manage Access** (siehe [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md)).

---

## Schritt 5: Verbindung und Tests

Bei einem Replica Set verbinden Sie sich direkt mit einem Mitglied: Kopieren Sie eine der unter **Replica set rs0 members** aufgeführten Adressen oder den **External connection string** der Karte **Network and Connection**.

```bash
mongosh "mongodb://<member>:27017/myapp?directConnection=true&authSource=admin" --username app-user
```

Bei einem Cluster mit Sharding verwenden Sie die Adresse aus dem Feld **Host**: `mongosh "mongodb://<host>:27017/myapp?authSource=admin" --username app-user`.

Die Verbindung ist nicht verschlüsselt (kein TLS): Fügen Sie `--tls` nicht hinzu.

Geben Sie das Passwort ein und prüfen Sie anschließend die Verbindung:

```javascript
db.runCommand({ ping: 1 })
db.test.insertOne({ message: "Bonjour Hikube" })
db.test.find()
```

**Erwartetes Ergebnis:**

```console
{ ok: 1 }
[ { _id: ObjectId('...'), message: 'Bonjour Hikube' } ]
```

:::note
Das erreichte Mitglied kann ein Secondary sein, das keine Schreibvorgänge annimmt: `insertOne` antwortet dann mit `not primary`. Prüfen Sie dies mit `db.hello().isWritablePrimary` und verbinden Sie sich zum Schreiben mit einem anderen Mitglied der Liste. Ein Secondary bedient Lesevorgänge mit `readPreference=secondaryPreferred`.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Das Feld Host zeigt „Not defined“ an

Der **External access** ist deaktiviert, oder die öffentliche Adresse ist noch nicht zugewiesen. Aktivieren Sie ihn bei Bedarf über **Edit** und warten Sie einige Augenblicke.

Bei einem Replica Set mit externem Zugriff erhält jedes Mitglied eine eigene öffentliche Adresse: Die Karte **Network and Connection** listet sie unter **Replica set rs0 members** auf, sobald sie zugewiesen sind. Verbinden Sie sich mit einer davon mit `directConnection=true`, ohne den Parameter `replicaSet`: Die Mitglieder melden sich unter clusterinternen Namen, die von außen nicht aufgelöst werden.

### `Authentication failed`

Prüfen Sie den Benutzernamen, das Passwort und die Authentifizierungsdatenbank (`authSource=admin` oder `--authenticationDatabase admin`). Wenn das Passwort verloren gegangen ist, führen Sie im Abschnitt **Users** eine Rotation durch.

### `not authorized on myapp`

Der Benutzer hat keinen Zugriff auf die Datenbank `myapp`. Fügen Sie ihn über **Manage Access** hinzu.

### Der Cluster wechselt in den Status Error

Die Plattform konnte die Erstellung oder die letzte Änderung des Clusters nicht anwenden. [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts und des Clusters an.

---

## Schritt 7: Bereinigung

1. Öffnen Sie die Seite des Clusters (**DB & Messaging** → **MongoDB** → Name des Clusters).
2. Klicken Sie auf **Delete cluster**.
3. Geben Sie den genauen Namen des Clusters in das Feld **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning
Diese Aktion löscht den MongoDB-Cluster und alle zugehörigen Daten. Sie ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben über die Konsole Folgendes erstellt:

- Einen replizierten **MongoDB**-Cluster in Ihrem Projekt
- Einen Benutzer und seine Rechte auf einer Anwendungsdatenbank
- Einen externen Zugriff und eine `mongosh`-Verbindung

<NavigationFooter
  nextSteps={[
    {label: "Benutzer und Datenbanken verwalten", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
