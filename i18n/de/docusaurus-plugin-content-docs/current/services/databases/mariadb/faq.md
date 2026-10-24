---
sidebar_position: 6
title: "FAQ — MariaDB"
sidebar_label: FAQ
description: "Antworten auf häufige Fragen zu MariaDB auf Hikube: MySQL-Kompatibilität, Versionswahl, Replikation, Datenbank anlegen, Benutzerzugriff, verlorenes Passwort."
---

# FAQ — MariaDB

### Sind meine MySQL-Anwendungen kompatibel?

Ja. **MariaDB** ist ein Open-Source-Fork von MySQL, der mit dem MySQL-Protokoll und der MySQL-Syntax kompatibel ist. Die Clients `mysql`, `mysqldump` und die MySQL-Konnektoren (JDBC, PDO, `mysql2` usw.) funktionieren ohne Änderungen. Dieser Service wurde in dieser Dokumentation früher unter dem Namen „MySQL“ vorgestellt.

### Welche Version sollte ich wählen?

Der Assistent bietet die Versionen **10.6**, **10.11**, **11.4** und **11.8** an. Wählen Sie für ein neues Projekt die neueste Version oder für eine Migration die Version, die Ihrer aktuellen Umgebung am nächsten kommt. Die Version kann nach der Erstellung über **Edit** aktualisiert werden; ein Downgrade ist nicht möglich.

### Welche Presets sind verfügbar?

Das **Preset** legt CPU und Arbeitsspeicher jedes Knotens fest. Die Presets entsprechen den Größen der [virtuellen Maschinen](../../compute/overview.md) der Serien `u1`, `s1` und `m1`: Ein Preset hat dieselben Ressourcen wie die gleichnamige VM. Maßgeblich ist die im Assistenten angezeigte Liste:

| **Preset** | **CPU** | **Arbeitsspeicher** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

:::warning
Das Preset kann nach der Erstellung nicht geändert werden. Dimensionieren Sie es entsprechend, oder wenden Sie sich an den Support, um es zu ändern.
:::

### Wie funktioniert die Replikation?

Der Primary schreibt seine Änderungen in das Binary Log, das die Replicas nachspielen. Bei einem Ausfall des Primary befördert die Plattform automatisch eine Replica. Wählen Sie bei der Erstellung **3 (Max High Availability)** oder **5 (Ultra High Availability)** Replicas, um davon zu profitieren: Diese Anzahl ist danach nicht mehr änderbar.

### Wo finde ich die Verbindungsadresse?

In der Karte **Connection and network** auf der Seite des Clusters. Der Bereich **Internal** zeigt immer den internen Host an, der von den VMs und Kubernetes-Clustern des Projekts aus erreichbar ist; der Bereich **External** zeigt die öffentliche Adresse an, wenn der **External Access** aktiviert ist, andernfalls **Disabled**. Der Port ist `3306`.

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

Ja, über die Registerkarte **Backups** der Cluster-Seite: Zeitplan, Backup auf Abruf und Wiederherstellung. Siehe [Backups konfigurieren](./how-to/configure-backups.md) und den [Backup-Service](../../backups/overview.md).
