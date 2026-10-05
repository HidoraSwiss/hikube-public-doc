---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# MariaDB in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten **MariaDB**-Clusters in der [Hikube-Konsole](https://console.hikube.cloud) bis zur ersten Verbindung mit dem Client `mysql` (oder `mariadb`).

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Einen **MariaDB**-Cluster, der in Ihrem Hikube-Projekt bereitgestellt ist
- Einen Benutzer mit Rechten auf einer Anwendungsdatenbank
- Eine funktionierende Verbindung mit einem MySQL-Client

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** mit ausreichenden Quotas (CPU, Arbeitsspeicher, Speicher)
- Den Client **`mysql`** oder **`mariadb`** auf Ihrem Rechner, falls Sie eine Verbindung aus dem Internet testen möchten

---

## Schritt 1: Den Cluster erstellen

1. Melden Sie sich in der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **DB & Messaging** → **MariaDB**. Die Seite **MariaDB Clusters** wird angezeigt.
3. Klicken Sie auf **Create a cluster**. Der Assistent **Create a MariaDB cluster** öffnet sich.

---

## Schritt 2: Konfigurieren und bestätigen

Der Assistent umfasst fünf Schritte: **General**, **Configuration**, **Users**, **Summary** und **Finish**.

### General

Geben Sie den **Cluster Name** ein, zum Beispiel `demo-mariadb` (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben, endet mit einem Buchstaben oder einer Ziffer).

### Configuration

| Feld | Empfohlener Wert für diese Anleitung | Hinweis |
|-------|----------------------------------|----------|
| **MariaDB Version** | `11.8` | Angebotene Versionen: 10.6, 10.11, 11.4, 11.8 |
| **Preset** | `Small (1 CPU, 512Mi)` | Nach der Erstellung nicht änderbar |
| **Disk size (GB)** | `10` | Speicherkapazität pro Knoten |
| **Number of replicas** | `1 (Standalone)` | `3` oder `5` für Hochverfügbarkeit; nach der Erstellung nicht änderbar |
| **External access** | Aktiviert | Erforderlich, um sich von Ihrem Rechner aus zu verbinden |

Das Banner oben im Assistenten zeigt die **Estimated cost** und die Auswirkung auf die Quotas des Projekts an.

:::note
Aktivieren Sie den **External access** nur, wenn Sie ihn benötigen: Er macht die Datenbank im öffentlichen Internet verfügbar.
:::

### Users

Fügen Sie mindestens einen Benutzer hinzu:

1. **Username**: zum Beispiel `app-user` (Kleinbuchstaben, Ziffern und Bindestriche).
2. **Role**: **Administrator** oder **Read-only**.
3. Klicken Sie auf **Add**.

### Summary

Prüfen Sie die Zusammenfassung (**Version**, **Preset**, **Data volume**, **Replicas**, **External exposure**, **Estimated cost**, **Users to create**) und klicken Sie dann auf **Create cluster**.

---

## Schritt 3: Status prüfen

Der Schritt **Finish** bestätigt die Erstellung („Creation complete!“). Klicken Sie auf **Finish**, um die Seite des Clusters zu öffnen.

| Status | Bedeutung |
|--------|---------------|
| **Creating** / **Provisioning** | Der Cluster wird bereitgestellt |
| **Ready** / **Running** | Der Cluster ist betriebsbereit |
| **Error** / **Failed** | Die Bereitstellung ist fehlgeschlagen |

**Erwartetes Ergebnis:** Nach einigen Minuten wechselt der Status zu **Ready**. Die Seite zeigt die **MariaDB Version**, die **Replicas**, die **Allocated Size** und das **Preset** an.

---

## Schritt 4: Zugangsdaten abrufen und Zugriff auf eine Datenbank gewähren

### Zugangsdaten

Der Schritt **Finish** des Assistenten zeigt unter **User Credentials** das **Password** jedes Benutzers und, wenn der externe Zugriff aktiviert ist, den **Internal Connection String** (`<host>:3306`) an.

:::warning
Kopieren Sie diese Passwörter sofort: Sie werden nicht mehr angezeigt. Bei Verlust generieren Sie im Abschnitt **Users** ein neues (**Actions** → **Change Password**).
:::

Die Adresse bleibt in der Karte **Connection and network** auf der Seite des Clusters einsehbar, Feld **Host**.

### Zugriff auf eine Anwendungsdatenbank

Die im Assistenten gewählte Rolle gilt für die Systemdatenbank `mysql`. So erstellen Sie eine Anwendungsdatenbank und gewähren Zugriff darauf:

1. Öffnen Sie im Abschnitt **Users** das Menü **Actions** von `app-user` und wählen Sie **Manage Access**.
2. Klicken Sie unter **Specific Access (Databases)** auf **Add**.
3. Geben Sie den **Database name** ein, zum Beispiel `myapp` (Kleinbuchstaben, Ziffern und Bindestriche), und wählen Sie unter **Rights** **Administrator (Admin)**.
4. Klicken Sie auf **Save**. Die Datenbank `myapp` wird erstellt, falls sie nicht existiert.

---

## Schritt 5: Verbindung und Tests

```bash
mysql -h <host> -P 3306 -u app-user -p myapp
```

Geben Sie das Passwort ein und prüfen Sie dann die Verbindung:

```sql
SELECT VERSION();
CREATE TABLE test (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(100));
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Erwartetes Ergebnis:**

```console
+----+----------------+
| id | message        |
+----+----------------+
|  1 | Bonjour Hikube |
+----+----------------+
```

:::tip
Der Client `mariadb` akzeptiert dieselben Optionen: `mariadb -h <host> -P 3306 -u app-user -p myapp`.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

### Das Feld Host zeigt „Not defined“ an

Der **External Access** ist deaktiviert, oder die öffentliche IP-Adresse ist noch nicht zugewiesen. Aktivieren Sie ihn bei Bedarf über **Edit** und warten Sie einen Moment.

### `Access denied for user`

Falsches Passwort, oder der Benutzer hat keinen Zugriff auf die angegebene Datenbank. Prüfen Sie die Spalte **Databases** der Benutzerliste und fügen Sie den Zugriff über **Manage Access** hinzu.

### Die Schaltfläche Next bleibt inaktiv

- Im Schritt **Configuration**: Der Cluster überschreitet die Quotas des Projekts.
- Im Schritt **Users**: Fügen Sie mindestens einen Benutzer hinzu.

### Der Cluster bleibt im Status Error

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie dabei den Namen des Projekts und des Clusters an.

---

## Schritt 7: Bereinigung

1. Öffnen Sie die Seite des Clusters (**DB & Messaging** → **MariaDB** → Name des Clusters).
2. Klicken Sie auf **Delete cluster**.
3. Geben Sie den exakten Namen des Clusters in das Feld **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning
Diese Aktion löscht den MariaDB-Cluster und alle zugehörigen Daten. Sie ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben in der Konsole Folgendes erstellt:

- Einen **MariaDB**-Cluster in Ihrem Projekt
- Einen Benutzer und eine Anwendungsdatenbank
- Einen externen Zugriff und eine Verbindung mit dem Client `mysql`

<NavigationFooter
  nextSteps={[
    {label: "Benutzer und Datenbanken verwalten", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
