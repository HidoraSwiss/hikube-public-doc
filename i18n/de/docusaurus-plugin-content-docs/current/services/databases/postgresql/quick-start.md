---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# PostgreSQL in 5 Minuten bereitstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres ersten **PostgreSQL**-Clusters in der [Hikube-Konsole](https://console.hikube.cloud) bis zur ersten Verbindung mit `psql`.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- Einen **PostgreSQL**-Cluster, der in Ihrem Hikube-Projekt bereitgestellt ist
- Eine Anwendungsdatenbank und einen Benutzer, um sich damit zu verbinden
- Ein von der Plattform generiertes Passwort
- Eine funktionierende Verbindung mit `psql`

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** mit ausreichenden Quotas (CPU, Arbeitsspeicher, Speicher)
- Den Client **`psql`** auf Ihrem Rechner, falls Sie eine Verbindung aus dem Internet testen möchten

---

## Schritt 1: Den Cluster erstellen

1. Melden Sie sich in der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **DB & Messaging** → **PostgreSQL**. Die Seite **PostgreSQL Clusters** wird angezeigt.
3. Klicken Sie auf **Create a cluster**. Der Assistent **Create a PostgreSQL cluster** öffnet sich.

---

## Schritt 2: Konfigurieren und bestätigen

Der Assistent umfasst sechs Schritte: **General**, **Configuration**, **Databases**, **Users**, **Summary** und **Finish**. Mit **Next** und **Previous** wechseln Sie zwischen ihnen.

### General

Geben Sie den **Cluster Name** ein (standardmäßig wird ein zufälliger Name vorgeschlagen), zum Beispiel `demo-pg`. Er muss 3 bis 16 Zeichen lang sein (Kleinbuchstaben, Ziffern und Bindestriche), mit einem Buchstaben beginnen und mit einem Buchstaben oder einer Ziffer enden.

### Configuration

| Feld | Empfohlener Wert für diese Anleitung | Hinweis |
|-------|----------------------------------|----------|
| **PostgreSQL Version** | `18` | Angebotene Versionen: 15, 16, 17, 18 |
| **Instance preset** | `Small (1 CPU, 512Mi)` | Kapazität, die jedem Knoten zugewiesen wird |
| **Disk size (GB)** | `10` | Speicherkapazität pro Knoten |
| **Number of replicas** | `1 (Standalone)` | `2` oder `3` für Hochverfügbarkeit |
| **External access** | Aktiviert | Erforderlich, um sich von Ihrem Rechner aus zu verbinden |

Das Banner oben im Assistenten zeigt die **Estimated cost** und die Auswirkung auf die Quotas des Projekts an.

:::warning
Die **Number of replicas** kann nach der Erstellung nicht mehr geändert werden. Wählen Sie für die Produktion direkt **2 (High Availability)** oder **3 (Max High Availability)**.
:::

:::note
Aktivieren Sie den **External access** nur, wenn Sie ihn benötigen: Er macht die Datenbank im öffentlichen Internet verfügbar.
:::

### Databases

Geben Sie einen **Database name** ein, zum Beispiel `myapp`, und klicken Sie dann auf **Add**. Wenn Sie keine Datenbank hinzufügen, wird nur die Standarddatenbank **`postgres`** erstellt.

### Users

Fügen Sie mindestens einen Benutzer hinzu:

1. **Username**: zum Beispiel `app_user` (nur Kleinbuchstaben, Ziffern und Unterstriche, kein Bindestrich).
2. **Database name**: Wählen Sie `myapp` aus.
3. **Rights**: **Administrator (Admin)** oder **Read-only**.
4. Klicken Sie auf **Add**.

### Summary

Prüfen Sie die Zusammenfassung (**Version**, **Instance preset**, **Data volume**, **Replicas**, **External exposure**, **Databases to create**, **Users to create**, **Estimated cost**) und klicken Sie dann auf **Create cluster**.

---

## Schritt 3: Status prüfen

Der Schritt **Finish** bestätigt die Erstellung („Creation complete!“). Klicken Sie auf **Finish**, um die Seite des Clusters zu öffnen.

Der Status des Clusters wird neben seinem Namen angezeigt, sowohl auf der Seite des Clusters als auch in der Liste **PostgreSQL Clusters**:

| Status | Bedeutung |
|--------|---------------|
| **Creating** / **Provisioning** | Der Cluster wird bereitgestellt |
| **Ready** / **Running** | Der Cluster ist betriebsbereit |
| **Error** / **Failed** | Die Bereitstellung ist fehlgeschlagen |

**Erwartetes Ergebnis:** Nach einigen Minuten wechselt der Status zu **Ready**. Die Seite des Clusters zeigt die **PostgreSQL Version**, die **Replicas**, die **Allocated Size** und den **External Access** (**Enabled**) an.

---

## Schritt 4: Zugangsdaten abrufen

Die Passwörter werden **nur ein einziges Mal** angezeigt, im Schritt **Finish** des Assistenten, im Abschnitt **User Credentials**:

- **Password** jedes erstellten Benutzers;
- **Internal Connection String**: die Adresse des Clusters, wenn der externe Zugriff aktiviert ist.

:::warning
Kopieren Sie diese Passwörter in einen Passwort-Manager, bevor Sie den Bildschirm verlassen: Sie werden nicht mehr angezeigt. Bei Verlust generieren Sie in der Registerkarte **Users** ein neues (**Actions** → **Change Password**).
:::

Die Adresse des Clusters bleibt auf der Seite des Clusters einsehbar, in der Karte **Connection and Databases**, Feld **Host**.

---

## Schritt 5: Verbindung und Tests

Verbinden Sie sich mit `psql` über die Adresse aus dem Feld **Host**:

```bash
psql "host=<host> port=5432 dbname=myapp user=app_user sslmode=require"
```

Geben Sie das Passwort ein, wenn Sie dazu aufgefordert werden, und prüfen Sie dann die Verbindung:

```sql
SELECT version();
CREATE TABLE test (id serial PRIMARY KEY, message text);
INSERT INTO test (message) VALUES ('Bonjour Hikube');
SELECT * FROM test;
```

**Erwartetes Ergebnis:**

```console
 id |    message
----+----------------
  1 | Bonjour Hikube
(1 row)
```

---

## Schritt 6: Schnelle Fehlerbehebung

### Das Feld Host zeigt „Not defined“ an

Der **External Access** ist deaktiviert, oder die öffentliche IP-Adresse ist noch nicht zugewiesen. Prüfen Sie die Karte **External Access** auf der Seite des Clusters; aktivieren Sie ihn bei Bedarf über **Edit** und warten Sie einen Moment.

### Die Schaltfläche Next bleibt inaktiv

- Im Schritt **Configuration**: Der Cluster überschreitet die Quotas des Projekts. Verringern Sie das Preset, die Disk-Größe oder die Anzahl der Replicas.
- Im Schritt **Users**: Fügen Sie mindestens einen Benutzer hinzu.

### Authentifizierung abgelehnt

Prüfen Sie den Benutzernamen, die Zieldatenbank und das Passwort. Wenn das Passwort verloren gegangen ist, führen Sie in der Registerkarte **Users** eine Rotation durch. Siehe [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md).

### Der Cluster bleibt im Status Error

[Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie dabei den Namen des Projekts und des Clusters an.

---

## Schritt 7: Bereinigung

1. Öffnen Sie die Seite des Clusters (**DB & Messaging** → **PostgreSQL** → Name des Clusters).
2. Klicken Sie auf **Delete cluster**.
3. Geben Sie den exakten Namen des Clusters in das Feld **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning
Diese Aktion löscht den PostgreSQL-Cluster und alle zugehörigen Daten. Sie ist **unwiderruflich**.
:::

---

## Zusammenfassung

Sie haben in der Konsole Folgendes erstellt:

- Einen **PostgreSQL**-Cluster in Ihrem Projekt
- Eine Datenbank und einen Benutzer mit seinen Rechten
- Einen externen Zugriff und eine `psql`-Verbindung

<NavigationFooter
  nextSteps={[
    {label: "Benutzer und Datenbanken verwalten", href: "../how-to/manage-users-databases"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
