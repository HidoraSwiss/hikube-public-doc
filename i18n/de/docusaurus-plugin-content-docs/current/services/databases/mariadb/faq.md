---
sidebar_position: 6
title: FAQ
---

# FAQ — MariaDB

### Sind meine MySQL-Anwendungen kompatibel?

Ja. **MariaDB** ist ein Open-Source-Fork von MySQL, der mit dem MySQL-Protokoll und der MySQL-Syntax kompatibel ist. Die Clients `mysql`, `mysqldump` und die MySQL-Konnektoren (JDBC, PDO, `mysql2` usw.) funktionieren ohne Änderungen. Dieser Service wurde in dieser Dokumentation früher unter dem Namen „MySQL“ vorgestellt.

### Welche Version sollte ich wählen?

Der Assistent bietet die Versionen **10.6**, **10.11**, **11.4** und **11.8** an. Wählen Sie für ein neues Projekt die neueste Version oder für eine Migration die Version, die Ihrer aktuellen Umgebung am nächsten kommt. Die Version kann nach der Erstellung über **Edit** aktualisiert werden; ein Downgrade ist nicht möglich.

### Welche Presets sind verfügbar?

Das **Preset** legt CPU und Arbeitsspeicher jedes Knotens fest. Maßgeblich ist die im Assistenten angezeigte Liste; zur Orientierung:

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

:::warning
Das Preset kann nach der Erstellung nicht geändert werden. Dimensionieren Sie es entsprechend, oder wenden Sie sich an den Support, um es zu ändern.
:::

### Wie funktioniert die Replikation?

Der Primary schreibt seine Änderungen in das Binary Log, das die Replicas nachspielen. Bei einem Ausfall des Primary befördert die Plattform automatisch eine Replica. Wählen Sie bei der Erstellung **3 (Max High Availability)** oder **5 (Ultra High Availability)** Replicas, um davon zu profitieren: Diese Anzahl ist danach nicht mehr änderbar.

### Wo finde ich die Verbindungsadresse?

In der Karte **Connection and network** auf der Seite des Clusters, Feld **Host**, wenn der **External Access** aktiviert ist. Der Port ist `3306`. Ohne externen Zugriff zeigt das Feld **Not defined** an: Der Cluster bleibt von den VMs und Kubernetes-Clustern des Projekts über eine interne Adresse erreichbar, die die Konsole nicht anzeigt; [wenden Sie sich an den Support](mailto:support@hidora.io), um sie zu erhalten.

### Wie erstelle ich eine Datenbank?

Gewähren Sie einem Benutzer Zugriff auf den Namen der Datenbank (**Manage Access** → **Specific Access (Databases)** → **Add**), oder geben Sie sie im Schritt **Users** des Erstellungsassistenten des Clusters als **Database** eines Benutzers an. Die Datenbank wird erstellt, falls sie nicht existiert. Namen von Systemdatenbanken (`mysql`, `information_schema`, `performance_schema`, `sys`) werden abgelehnt. Siehe [Benutzer und Datenbanken verwalten](./how-to/manage-users-databases.md).

### Warum hat der im Assistenten angelegte Benutzer keinen Zugriff auf meine Datenbank?

Die im Assistenten gewählte **Role** gilt für die für diesen Benutzer angegebene **Database**, und nur für diese. Gewähren Sie den Zugriff auf Ihre weiteren Datenbanken über **Manage Access**.

Vor der Konsole v1.3.0 angelegte Benutzer haben ihre Rolle auf der Systemdatenbank `mysql` erhalten. Entfernen Sie in **Manage Access** die als Fehler angezeigte Zeile `mysql` und fügen Sie ihre Anwendungsdatenbank hinzu.

### Ich habe das Passwort eines Benutzers verloren. Wie kann ich es wiederherstellen?

Es kann nicht erneut gelesen werden. Generieren Sie ein neues: **Actions** → **Change Password** → **Perform rotation**. Das alte Passwort wird sofort widerrufen.

### Kann ich die Anzahl der Verbindungen pro Benutzer begrenzen oder die Serverparameter ändern?

Diese Einstellungen werden in der Konsole nicht angeboten; wenden Sie sich an den Support.

### Sind Backups verfügbar?

Die Konfiguration von Backups und die Wiederherstellung werden in der Konsole nicht angeboten; wenden Sie sich an den Support. Siehe [Backups konfigurieren](./how-to/configure-backups.md).
