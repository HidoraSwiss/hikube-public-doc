---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — S3-Buckets

### AccessDenied beim Zugriff auf den Bucket

**Ursache**: Die verwendeten Schlüssel sind falsch, der verwendete Bucket-Name ist nicht der tatsächliche S3-Name, oder der Benutzer hat nur Lesezugriff und versucht zu schreiben.

**Lösung**:

1. Öffnen Sie die Seite des Buckets und notieren Sie den **Bucket name** in der Karte **Access & Configuration**. Verwenden Sie diesen Namen und nicht den im Assistenten eingegebenen:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<s3-bucket-name>/
   ```
2. Prüfen Sie in der Karte **Users & Access** das Recht des Benutzers (**Read-only** oder **Read / Write**); ändern Sie es bei Bedarf mit **Edit access**.
3. Prüfen Sie, ob Access Key ID und Secret Access Key in Ihrem Tool korrekt konfiguriert sind. Ist der geheime Schlüssel verloren, erstellen Sie einen neuen Benutzer.

---

### ListBucket schlägt auf der Wurzel fehl

**Ursache**: Die Schlüssel eines Benutzers sind auf seinen Bucket beschränkt. Es ist nicht möglich, alle Buckets des Endpunkts aufzulisten.

**Lösung**:

1. Zielen Sie in Ihren Befehlen immer auf den Bucket:
   ```bash
   aws --endpoint-url https://<endpoint> s3 ls s3://<s3-bucket-name>/
   mc ls hikube/<s3-bucket-name>/
   ```
2. Um alle Ihre Buckets zu sehen, verwenden Sie die Seite **Object Storage Buckets** der Konsole.

---

### Anmeldedaten nicht auffindbar

**Ursache**: Der geheime Schlüssel wird nur bei der Erstellung des Benutzers angezeigt, oder es wurde kein Benutzer erstellt (zum Beispiel, wenn der Bucket am Ende des Assistenten nicht bereit war).

**Lösung**:

1. Öffnen Sie die Seite des Buckets und prüfen Sie die Karte **Users & Access**.
2. Klicken Sie auf **Add User**, um einen Benutzer zu erstellen und neue Schlüssel zu erhalten.
3. Endpunkt und S3-Name bleiben jederzeit unter **Access & Configuration** einsehbar.

---

### „No S3 connection information available currently.“

**Ursache**: Der Bucket wird noch bereitgestellt.

**Lösung**: Warten Sie, bis der Status des Buckets auf **Ready** wechselt, und laden Sie die Seite dann neu. Bleibt der Status auf **Creating** oder wechselt er auf **Error**, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Buckets und seine Kennung an.

---

### Erstellung fehlgeschlagen: „A bucket with this name already exists.“

**Ursache**: Ein Bucket des Projekts trägt bereits diesen Namen.

**Lösung**: Kehren Sie zum Schritt **General** des Assistenten zurück und wählen Sie einen anderen **Bucket name**.

---

### Objekte sind nach dem Löschen eines Buckets verschwunden

**Ursache**: Das Löschen eines Buckets wird nicht blockiert, wenn er Objekte enthält; sie werden mit ihm gelöscht und lassen sich nicht wiederherstellen.

**Lösung**: Kopieren Sie vor dem Löschen eines Buckets die zu behaltenden Objekte, zum Beispiel auf Ihren Rechner:

```bash
aws --endpoint-url https://<endpoint> s3 sync s3://<s3-bucket-name>/ ./bucket-backup/
```

### Das Löschen des Buckets schlägt fehl

**Lösung**: Versuchen Sie das Löschen in der Konsole erneut. Besteht der Fehler weiterhin, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Buckets an.

---

### Langsamer Upload oder Timeout

**Ursache**: Netzwerkproblem, große Datei ohne Multipart-Upload gesendet.

**Lösung**:

1. Prüfen Sie Ihre Verbindung zum Endpunkt:
   ```bash
   curl -s -o /dev/null -w "%{time_total}\n" https://<endpoint>
   ```
2. Verwenden Sie für große Dateien einen Client, der Multipart-Upload unterstützt: `aws s3 cp` und `mc cp` tun dies ab einer bestimmten Größe automatisch.
3. Erhöhen Sie bei Bedarf die Parallelität auf Client-Seite (zum Beispiel `aws configure set default.s3.max_concurrent_requests 20`).

---

### Bucket nicht gefunden (`NoSuchBucket`)

**Ursache**: Der verwendete Name ist der in der Konsole gewählte Name und nicht der tatsächliche S3-Name.

**Lösung**: Notieren Sie den **Bucket name** in der Karte **Access & Configuration** der Seite des Buckets und verwenden Sie ihn in Ihren Befehlen.

:::warning
Verwechseln Sie nicht den Namen des Buckets in der Konsole und seinen S3-Namen. Nur Letzterer funktioniert mit den S3-Clients.
:::
