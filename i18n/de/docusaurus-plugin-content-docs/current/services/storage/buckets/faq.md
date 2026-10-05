---
sidebar_position: 6
title: FAQ
---

# FAQ — S3-Buckets

### Wie lautet der S3-Endpunkt von Hikube?

Der Endpunkt wird auf der Seite jedes Buckets in der Karte **Access & Configuration**, Feld **Endpoint**, angezeigt (zum Beispiel `prod.s3.hikube.cloud`). Er wird außerdem zusammen mit den Schlüsseln bei der Erstellung eines Benutzers angegeben.

Stellen Sie ihm in Ihren S3-Clients `https://` voran.

---

### Warum unterscheidet sich der S3-Name des Buckets von dem Namen, den ich gewählt habe?

Der in der Konsole gewählte Name identifiziert den Bucket in Ihrem Projekt. Der **tatsächliche S3-Name** wird von der Plattform generiert, um seine Eindeutigkeit auf dem Endpunkt zu gewährleisten. Verwenden Sie in Ihren Befehlen und SDKs immer den **Bucket name**, der unter **Access & Configuration** angezeigt wird.

---

### Welche Tools sind kompatibel?

Alle mit der S3-API kompatiblen Tools:

| Tool | Konfiguration |
|-------|--------------|
| **aws-cli** | `aws --endpoint-url https://<endpoint> s3 ls s3://<bucket>/` |
| **mc** (MinIO Client) | `mc alias set hikube https://<endpoint> <access-key> <secret-key>` |
| **rclone** | Remote vom Typ `s3` mit dem Hikube-Endpunkt |
| **s3cmd** | `host_base` und `host_bucket` auf den Hikube-Endpunkt |
| **Velero** | Kubernetes-Backup nach Hikube S3 |
| **Restic** | Datei-Backup nach Hikube S3 |

Jede mit AWS S3 kompatible Bibliothek (boto3, aws-sdk-js usw.) funktioniert ebenfalls.

---

### Wie funktionieren die Anmeldedaten?

Die Anmeldedaten sind an **S3-Benutzer** des Buckets gebunden. Jeder Benutzer erhält bei seiner Erstellung eine **Access Key ID** und einen **Secret Access Key** sowie den S3-Namen des Buckets und den Endpunkt. Ein Bucket kann mehrere Benutzer haben, jeweils mit **Read-only** oder **Read / Write**.

Siehe [Benutzer und Zugriffsschlüssel verwalten](./how-to/configure-access.md).

---

### Ich habe den geheimen Schlüssel eines Benutzers verloren. Was tun?

Der geheime Schlüssel wird nur ein einziges Mal angezeigt und kann nicht wiederhergestellt werden. Erstellen Sie einen neuen Benutzer (Schaltfläche **Add User**), aktualisieren Sie Ihre Anwendungen und löschen Sie dann den alten Benutzer.

---

### Kann man mehrere Buckets haben?

Ja. Erstellen Sie mit **Create a bucket** so viele Buckets wie nötig. Jeder Bucket hat seinen eigenen S3-Namen und seine eigenen Benutzer; die Schlüssel eines Buckets gewähren keinen Zugriff auf die anderen.

---

### Kann man mit einem S3-Client alle seine Buckets auflisten?

Nein. Die Schlüssel eines Benutzers sind auf seinen Bucket beschränkt: `aws s3 ls` ohne Bucket-Namen gibt `AccessDenied` zurück. Die Liste Ihrer Buckets ist in der Konsole auf der Seite **Object Storage Buckets** sichtbar.

---

### Wozu dient die Sperre (WORM)?

Die Option **Enable Object Lock (WORM)** verhindert das Löschen oder Ändern der Objekte während 365 Tagen. Die Plattform wendet diese Aufbewahrung standardmäßig im Modus `COMPLIANCE` an: Niemand kann ein Objekt löschen oder seine Aufbewahrung vor Ablauf verkürzen. Diese Standarddauer ist in der Konsole nicht einstellbar; wenden Sie sich bei einem anderen Bedarf an den Support. Die Option dient der regulatorischen Archivierung oder dem Schutz von Backups vor versehentlichem oder böswilligem Löschen. Sie wird bei der Erstellung des Buckets gewählt.

---

### Kann die Verschlüsselung nachträglich aktiviert werden?

Nein. **Enable encryption at rest (LUKS)** wird bei der Erstellung gewählt und kann danach nicht geändert werden. Um bestehende Daten zu verschlüsseln, erstellen Sie einen neuen verschlüsselten Bucket und kopieren Sie die Objekte dorthin (zum Beispiel mit `rclone sync` oder `mc mirror`).

---

### Wie dauerhaft sind die Daten?

Die Daten werden über drei Rechenzentren repliziert (Genf, Gland, Luzern). Diese Architektur erhält die Verfügbarkeit und Dauerhaftigkeit der Daten, selbst bei einem vollständigen Ausfall eines Rechenzentrums.

---

### Wie wird ein Bucket abgerechnet?

Der Erstellungsassistent zeigt **Estimated Cost** pro GB und Monat (sowie pro Stunde) an. Der Tarif eines verschlüsselten Buckets unterscheidet sich von dem eines Standard-Buckets.
