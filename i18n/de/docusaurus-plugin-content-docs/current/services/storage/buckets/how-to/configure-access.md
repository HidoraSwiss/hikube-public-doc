---
title: "Benutzer und Zugriffsschlüssel verwalten"
---

# Benutzer und Zugriffsschlüssel verwalten

Jeder Hikube-Bucket kann mehrere **S3-Benutzer** haben, jeder mit seinem eigenen Schlüsselpaar und seinem Recht (**Read-only** oder **Read / Write**). Diese Anleitung erklärt, wie Sie diese Benutzer in der [Hikube-Konsole](https://console.hikube.cloud) verwalten und die gängigen S3-Clients konfigurieren (AWS CLI, MinIO Client, rclone).

## Voraussetzungen

- Ein in Ihrem Projekt erstellter **Bucket** (siehe [Schnellstart](../quick-start.md)) im Status **Ready**
- Ein oder mehrere installierte S3-Clients: **AWS CLI**, **mc** (MinIO Client) oder **rclone**

## Das Zugriffsmodell verstehen

- Ein Bucket kann **mehrere Benutzer** haben; jeder hat seine eigene **Access Key ID** und seinen **Secret Access Key**.
- Die Schlüssel eines Benutzers gewähren **nur Zugriff auf diesen Bucket**.
- Der **tatsächliche S3-Name** des Buckets und der **Endpunkt** sind allen seinen Benutzern gemeinsam; sie werden in der Karte **Access & Configuration** auf der Seite des Buckets angezeigt.
- Der **geheime Schlüssel wird nur einmal angezeigt**, bei der Erstellung des Benutzers.

## Einen Benutzer erstellen

1. Öffnen Sie **Infrastructure** → **S3 Buckets** und klicken Sie dann auf den Bucket.
2. Klicken Sie in der Karte **Users & Access** auf **Add User**.
3. Im Fenster **New User**:
   - Geben Sie den **Username** ein (3 bis 16 Zeichen: Kleinbuchstaben, Ziffern und Bindestriche; muss mit einem Buchstaben beginnen);
   - Haken Sie **Read-only access** an, wenn der Benutzer die Objekte nur lesen soll.
4. Klicken Sie auf **Create User**.

Das Fenster **Generated Credentials** zeigt **S3 Bucket**, **S3 Endpoint**, **Access Key ID** und **Secret Access Key** an.

:::warning
Kopieren Sie diese Werte, bevor Sie auf **I have saved these keys** klicken: Der geheime Schlüssel kann danach nicht wiederhergestellt werden.
:::

## Das Recht eines Benutzers ändern

1. Öffnen Sie in der Karte **Users & Access** das Aktionsmenü des Benutzers.
2. Wählen Sie **Edit access**.
3. Setzen oder entfernen Sie den Haken bei **Read-only access** und klicken Sie dann auf **Save changes**.

Die Spalte **Access** der Tabelle zeigt dann **Read-only** oder **Read / Write** an. Die Schlüssel des Benutzers ändern sich nicht.

## Schlüssel erneuern

Die Konsole bietet keine Rotation der Schlüssel eines bestehenden Benutzers an. Um Schlüssel zu erneuern (Verlust des geheimen Schlüssels, Verdacht auf ein Leck):

1. Erstellen Sie einen **neuen Benutzer** mit demselben Recht und rufen Sie seine Schlüssel ab.
2. Aktualisieren Sie Ihre Anwendungen mit den neuen Schlüsseln.
3. Löschen Sie den alten Benutzer: Aktionsmenü → **Delete**, dann bestätigen.

## Die S3-Clients konfigurieren

Ersetzen Sie in den folgenden Beispielen:

- `<endpoint>` durch den **Endpoint**, mit vorangestelltem `https://` (zum Beispiel `https://prod.s3.hikube.cloud`);
- `<bucket>` durch den S3-**Bucket name**, der unter **Access & Configuration** angezeigt wird;
- `<access-key>` und `<secret-key>` durch die Schlüssel des Benutzers.

### AWS CLI

Konfigurieren Sie ein eigenes Profil:

```bash
aws configure --profile hikube
```

```text
AWS Access Key ID: <access-key>
AWS Secret Access Key: <secret-key>
Default region name: (leer lassen)
Default output format: json
```

Verwenden Sie das Profil mit dem Hikube-Endpunkt:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
```

### MinIO Client (mc)

```bash
mc alias set hikube <endpoint> <access-key> <secret-key>

# Auflisten, hochladen und herunterladen
mc ls hikube/<bucket>/
mc cp fichier.txt hikube/<bucket>/
mc cp hikube/<bucket>/fichier.txt ./
```

### rclone

Fügen Sie in `~/.config/rclone/rclone.conf` ein Remote hinzu:

```ini title="rclone.conf"
[hikube]
type = s3
provider = Minio
endpoint = <endpoint>
access_key_id = <access-key>
secret_access_key = <secret-key>
acl = private
```

```bash
# Die Objekte auflisten
rclone ls hikube:<bucket>

# Ein lokales Verzeichnis synchronisieren
rclone sync ./mon-dossier hikube:<bucket>/mon-dossier
```

## Bewährte Sicherheitspraktiken

:::warning
Speichern Sie Ihre S3-Schlüssel niemals im Klartext in Ihren Git-Repositories oder Container-Images. Verwenden Sie einen Secret-Manager, Umgebungsvariablen oder, in einem Kubernetes-Cluster, ein Secret (siehe [Eine Anwendung verbinden](./connect-from-app.md)).
:::

- **Ein Benutzer pro Anwendung**: Sie können den Zugriff einer Anwendung widerrufen, ohne die anderen zu beeinträchtigen.
- **Standardmäßig Nur-Lesen** für Anwendungen, die nur lesen.
- **Löschen Sie nicht verwendete Benutzer.**

## Überprüfung

Listen Sie mit jedem konfigurierten Client den Bucket auf:

```bash
aws s3 ls s3://<bucket>/ --endpoint-url <endpoint> --profile hikube
mc ls hikube/<bucket>/
rclone ls hikube:<bucket>
```

Gibt der Befehl eine leere Liste (leerer Bucket) oder die Liste der Objekte ohne Fehler zurück, ist die Konfiguration korrekt. Mit einem Benutzer mit **Read-only** muss ein Hochladen mit `AccessDenied` fehlschlagen.

## Weiterführende Informationen

- [Einen Bucket aus einer Anwendung verbinden](./connect-from-app.md)
- [Konzepte](../concepts.md)
