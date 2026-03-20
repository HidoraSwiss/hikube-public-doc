---
title: "Sicherung wiederherstellen"
---

# Sicherung wiederherstellen

Diese Anleitung erklärt, wie Sie eine MySQL-Datenbank aus einer Restic-Sicherung wiederherstellen, die in einem S3-kompatiblen Bucket gespeichert ist. Die Wiederherstellung erfolgt über die **Restic**-CLI von Ihrem Arbeitsplatz aus.

## Voraussetzungen

- **Restic CLI** auf Ihrem lokalen Rechner installiert
- Die bei der Konfiguration der Sicherungen verwendeten **S3-Anmeldedaten** (Access Key, Secret Key)
- Das zur Verschlüsselung der Sicherungen verwendete **Restic-Passwort**
- Der **Name des S3-Buckets** und der Repository-Pfad
- Ein **mysql**-Client zum Importieren der wiederhergestellten Daten

## Schritte

### 1. Restic CLI installieren

Installieren Sie Restic je nach Betriebssystem:

```bash
# macOS (Homebrew)
brew install restic

# Debian / Ubuntu
sudo apt install restic

# Von den offiziellen Binärdateien
# https://github.com/restic/restic/releases
```

### 2. Restic-Umgebungsvariablen konfigurieren

Exportieren Sie die notwendigen Variablen, damit Restic auf das Sicherungs-Repository zugreifen kann:

```bash
export AWS_ACCESS_KEY_ID="HIKUBE123ACCESSKEY"
export AWS_SECRET_ACCESS_KEY="HIKUBE456SECRETKEY"
export RESTIC_PASSWORD="SuperStrongResticPassword!"
export RESTIC_REPOSITORY="s3:s3.hikube.cloud/mysql-backups/example"
```

:::warning
Der Repository-Pfad (`RESTIC_REPOSITORY`) entspricht dem im MySQL-Manifest konfigurierten `s3Bucket`, gefolgt vom **Instanznamen**. Zum Beispiel lautet für eine Instanz namens `example` mit `s3Bucket: s3.hikube.cloud/mysql-backups` das Repository `s3:s3.hikube.cloud/mysql-backups/example`.
:::

### 3. Verfügbare Snapshots auflisten

Zeigen Sie alle im Repository gespeicherten Sicherungen an:

```bash
restic snapshots
```

**Erwartetes Ergebnis:**

```console
repository abc12345 opened successfully
ID        Time                 Host        Tags        Paths
---------------------------------------------------------------
a1b2c3d4  2025-01-15 02:00:05  mysql-example            /backup
e5f6g7h8  2025-01-16 02:00:03  mysql-example            /backup
i9j0k1l2  2025-01-17 02:00:04  mysql-example            /backup
---------------------------------------------------------------
3 snapshots
```

:::tip
Sie können Snapshots nach Datum filtern mit `restic snapshots --latest 5`, um nur die 5 neuesten anzuzeigen.
:::

### 4. Snapshot wiederherstellen

Stellen Sie den letzten Snapshot (oder einen bestimmten Snapshot) in ein lokales Verzeichnis wieder her:

```bash
# Letzten Snapshot wiederherstellen
restic restore latest --target /tmp/mysql-restore

# Oder einen bestimmten Snapshot nach ID wiederherstellen
restic restore a1b2c3d4 --target /tmp/mysql-restore
```

Der wiederhergestellte Inhalt ist unter `/tmp/mysql-restore/backup/` verfügbar.

### 5. Daten in MySQL importieren

Nachdem die Sicherungsdateien extrahiert wurden, importieren Sie sie in Ihre MySQL-Instanz:

```bash
# Wiederhergestellte Dump-Dateien identifizieren
ls /tmp/mysql-restore/backup/

# Dump in die Zieldatenbank importieren
mysql -h <host-mysql> -P 3306 -u <benutzer> -p <datenbank> < /tmp/mysql-restore/backup/dump.sql
```

:::note
Die MySQL-Hostadresse hängt von Ihrer Konfiguration ab:
- **Interner Zugriff** (Port-Forward): `127.0.0.1` nach `kubectl port-forward svc/mysql-example 3306:3306`
- **Externer Zugriff** (LoadBalancer): Die externe IP des Services `mysql-example-primary`
:::

### 6. Temporäre Dateien bereinigen

Nach Abschluss und Überprüfung der Wiederherstellung löschen Sie die temporären Dateien:

```bash
rm -rf /tmp/mysql-restore
```

## Überprüfung

Verbinden Sie sich mit der MySQL-Instanz und überprüfen Sie, ob die Daten korrekt wiederhergestellt wurden:

```bash
mysql -h <host-mysql> -P 3306 -u <benutzer> -p <datenbank>
```

```sql
-- Vorhandene Tabellen überprüfen
SHOW TABLES;

-- Zeilenanzahl in einer Tabelle überprüfen
SELECT COUNT(*) FROM <tabellenname>;
```

:::warning Wiederherstellung regelmäßig testen
Es wird dringend empfohlen, das Wiederherstellungsverfahren regelmäßig zu testen, idealerweise in einer Entwicklungsumgebung. Eine Sicherung, die nie getestet wurde, garantiert keine erfolgreiche Wiederherstellung.
:::

## Weiterführende Informationen

- [API-Referenz](../api-reference.md): Vollständige Konfiguration der Backup-Parameter
- [Automatische Sicherungen konfigurieren](./configure-backups.md): Restic + S3-Sicherungen einrichten
