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
| **Preset** | `Small (1 CPU, 512Mi)` | Nach der Erstellung nicht änderbar |
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
2. **Role**: **Administrator** oder **Read-only**.
3. Klicken Sie auf **Add**.

### Summary

Prüfen Sie die Übersicht (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Sharding**, **Users to create**, **Estimated cost**) und klicken Sie dann auf **Create cluster**.

---

## Schritt 3: Status prüfen

Der Schritt **Finish** bestätigt die Erstellung („Creation complete!“). Klicken Sie auf **Finish**, um die Seite des Clusters zu öffnen.

| Status | Bedeutung |
|--------|---------------|
| **Creating** | Der Cluster wird bereitgestellt |
| **Ready** / **Running** | Der Cluster ist betriebsbereit |
| **Error** / **Failed** | Die Bereitstellung ist fehlgeschlagen |

**Erwartetes Ergebnis:** Nach einigen Minuten wechselt der Status auf **Ready**. Die Seite zeigt die **MongoDB Version**, die **Replicas**, die **Allocated Size** und das **Preset** sowie die Karte **Network and Connection** (**Host**, **External Access**, **Sharding**).

---

## Schritt 4: Zugangsdaten abrufen und Zugriff auf eine Datenbank gewähren

### Zugangsdaten

Der Schritt **Finish** des Assistenten zeigt unter **User Credentials** das **Password** jedes Benutzers sowie, wenn der externe Zugriff aktiviert ist, einen **Internal Connection String** der Form `mongodb://app-user:<password>@<host>`.

:::warning
Kopieren Sie diese Passwörter sofort: Sie werden nicht erneut angezeigt. Bei Verlust generieren Sie im Abschnitt **Users** ein neues (**Actions** → **Change Password**).
:::

### Zugriff auf eine Anwendungsdatenbank

Die im Assistenten gewählte Rolle gilt für die Datenbank `admin`. So gewähren Sie Zugriff auf eine Anwendungsdatenbank:

1. Öffnen Sie im Abschnitt **Users** das Menü **Actions** von `app-user` und wählen Sie **Manage Access**.
2. Klicken Sie unter **Specific Access (Databases)** auf **Add**.
3. Geben Sie den **Database name** ein, zum Beispiel `myapp` (Kleinbuchstaben, Ziffern und Bindestriche), und wählen Sie als **Rights** **Administrator (Admin)**.
4. Klicken Sie auf **Save**.

---

## Schritt 5: Verbindung und Tests

```bash
mongosh "mongodb://<host>:27017/myapp" --username app-user --authenticationDatabase admin
```

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

---

## Schritt 6: Schnelle Fehlerbehebung

### Das Feld Host zeigt „Not defined“ an

Der **External access** ist deaktiviert, oder die öffentliche Adresse ist noch nicht zugewiesen. Aktivieren Sie ihn bei Bedarf über **Edit** und warten Sie einige Augenblicke.

### `Authentication failed`

Prüfen Sie den Benutzernamen, das Passwort und die Authentifizierungsdatenbank (`--authenticationDatabase admin`). Wenn das Passwort verloren gegangen ist, führen Sie im Abschnitt **Users** eine Rotation durch.

### `not authorized on myapp`

Der Benutzer hat keinen Zugriff auf die Datenbank `myapp`. Fügen Sie ihn über **Manage Access** hinzu.

### Der Cluster bleibt im Status Error

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Projekts und des Clusters an.

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
