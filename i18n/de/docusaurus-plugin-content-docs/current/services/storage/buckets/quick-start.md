---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ihren ersten S3-Bucket erstellen

Diese Anleitung begleitet Sie bei der Erstellung Ihres **ersten S3-Buckets** in der [Hikube-Konsole](https://console.hikube.cloud) bis zum ersten Hochladen einer Datei.

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- einen betriebsbereiten **S3-Bucket** in Ihrem Projekt
- einen **S3-Benutzer** mit seinem Zugriffsschlüsselpaar
- eine erste Datei, hochgeladen mit `aws` oder `mc`

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe [Hikube-Schnellstart](../../../getting-started/quick-start.md))
- Einen auf Ihrem Rechner installierten S3-Client: [AWS CLI](https://aws.amazon.com/cli/) oder [MinIO Client (`mc`)](https://min.io/docs/minio/linux/reference/minio-mc.html)

---

## Schritt 1: Den Erstellungsassistenten öffnen

1. Melden Sie sich bei der [Hikube-Konsole](https://console.hikube.cloud) an und wählen Sie Ihr Projekt aus.
2. Öffnen Sie im Seitenmenü **Infrastructure** → **S3 Buckets**. Die Seite **Object Storage Buckets** wird angezeigt.
3. Klicken Sie auf **Create a bucket**.

---

## Schritt 2: Den Bucket konfigurieren und erstellen

Der Assistent umfasst drei Schritte.

### General

1. Geben Sie den **Bucket name** ein (standardmäßig wird ein Name vorgeschlagen). Regeln: Kleinbuchstaben, Ziffern und Bindestriche; beginnt mit einem Buchstaben und endet mit einem Buchstaben oder einer Ziffer; höchstens 16 Zeichen. Beispiel: `demo-assets`.
2. Lassen Sie für diese Anleitung folgende Optionen deaktiviert:
   - **Enable Object Lock (WORM)**: verhindert das Löschen oder Ändern der Objekte während 365 Tagen (von der Plattform festgelegte Aufbewahrungsdauer);
   - **Enable encryption at rest (LUKS)**: verschlüsselt die gespeicherten Daten; kann nach der Erstellung nicht geändert werden.
3. Klicken Sie auf **Next**.

### Users

1. Geben Sie den **Username** ein (zum Beispiel `app-user`).
2. Lassen Sie **Read only** auf **No**, um Lese- und Schreibzugriff zu erhalten.
3. Klicken Sie auf **Add** und dann auf **Next**.

Mindestens ein Benutzer ist erforderlich, um fortzufahren.

### Summary

Die **Summary** zeigt den Namen, das Projekt, die Anzahl der zu erstellenden Benutzer, den Zustand der Sperre und der Verschlüsselung sowie die **Estimated Cost** pro GB an. Klicken Sie auf **Create bucket**.

Während der Erstellung zeigt die Schaltfläche **Creating...** und dann **Provisioning bucket…** an: Die Konsole wartet, bis der Bucket bereit ist, bevor sie die Benutzer erstellt.

---

## Schritt 3: Den Zustand des Buckets prüfen

Der Abschlussbildschirm zeigt **Bucket successfully created** an. Nachdem Sie die Anmeldedaten abgerufen haben (Schritt 4), klicken Sie auf **Finish**: Die Konsole öffnet die Seite des Buckets.

Auf dieser Seite:

- zeigt das Status-Badge **Ready** an, sobald der Bucket betriebsbereit ist (**Creating** während der Bereitstellung);
- erinnern die Badges **WORM** und **LUKS** an den Zustand der Sperre und der Verschlüsselung;
- zeigt die Karte **Access & Configuration** den S3-**Bucket name** und den **Endpoint** an;
- listet die Karte **Users & Access** die Benutzer und ihr Recht auf (**Read-only** oder **Read / Write**).

:::note
Ist der Bucket nicht rechtzeitig bereit, zeigt die Konsole „Bucket provisioning“ an und erstellt die Benutzer nicht. Warten Sie, bis der Bucket auf **Ready** wechselt, und erstellen Sie sie dann auf seiner Seite mit **Add User** (siehe [Benutzer und Zugriffsschlüssel verwalten](./how-to/configure-access.md)).
:::

---

## Schritt 4: Die Anmeldedaten abrufen

Der Abschlussbildschirm des Assistenten zeigt für jeden erstellten Benutzer an:

| Feld | Verwendung |
|-------|-------|
| **S3 Bucket Name** | Tatsächlicher Name des Buckets, der in Ihren Befehlen und SDKs zu verwenden ist |
| **Access Key** | Access Key ID |
| **Secret Key** | Secret Access Key |
| **API Endpoint (S3)** | S3-Endpunkt, zum Beispiel `prod.s3.hikube.cloud` |

:::warning Geheimer Schlüssel wird nur einmal angezeigt
Kopieren Sie diese Werte, bevor Sie auf **Finish** klicken, und bewahren Sie den geheimen Schlüssel in einem Passwortmanager auf. Er wird nicht erneut angezeigt. Bei Verlust erstellen Sie einen neuen Benutzer.
:::

:::note S3 Bucket Name
Der **S3 Bucket Name** wird von der Plattform generiert und unterscheidet sich vom im Assistenten eingegebenen Namen. Verwenden Sie in Ihren Clients immer den S3-Namen. Er bleibt auf der Seite des Buckets einsehbar.
:::

Exportieren Sie die Werte in Ihrem Terminal:

```bash
export S3_ENDPOINT="https://<endpoint>"
export AWS_ACCESS_KEY_ID="<access-key>"
export AWS_SECRET_ACCESS_KEY="<secret-key>"
export BUCKET_NAME="<s3-bucket-name>"
```

Wird der Endpunkt ohne Präfix angezeigt (zum Beispiel `prod.s3.hikube.cloud`), stellen Sie `https://` voran: Die Clients `aws` und `mc` erwarten eine vollständige URL.

---

## Schritt 5: Verbindung und Tests

:::warning Zielen Sie auf Ihren Bucket
Die Schlüssel eines Benutzers berechtigen nicht dazu, alle Buckets des Endpunkts aufzulisten. Die Befehle müssen **immer auf Ihren Bucket zielen**: `s3://$BUCKET_NAME/` oder `hikube/$BUCKET_NAME/`.
:::

### Option A: AWS CLI

```bash
# Eine Testdatei hochladen
echo "hello hikube" > /tmp/hello.txt
aws --endpoint-url "$S3_ENDPOINT" s3 cp /tmp/hello.txt "s3://$BUCKET_NAME/hello.txt"

# Den Inhalt des Buckets auflisten
aws --endpoint-url "$S3_ENDPOINT" s3 ls "s3://$BUCKET_NAME/"
```

### Option B: MinIO Client (`mc`)

```bash
# Einen Alias für den Endpunkt festlegen
mc alias set hikube "$S3_ENDPOINT" "$AWS_ACCESS_KEY_ID" "$AWS_SECRET_ACCESS_KEY"

# Eine Testdatei hochladen und dann den Bucket auflisten
mc cp /tmp/hello.txt "hikube/$BUCKET_NAME/hello.txt"
mc ls "hikube/$BUCKET_NAME/"
```

**Erwartetes Ergebnis:** Die Datei `hello.txt` erscheint in der Liste.

:::tip
Die Karte **Access & Configuration** auf der Seite des Buckets bietet diese Befehle, bereits mit dem Endpunkt und dem Namen des Buckets ausgefüllt, im Bereich **Connection example** an.
:::

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Wahrscheinliche Ursache | Maßnahme |
|----------|----------------|--------|
| `AccessDenied` bei `aws s3 ls` ohne Bucket | Auflisten des gesamten Endpunkts | Zielen Sie auf `s3://$BUCKET_NAME/` |
| `NoSuchBucket` | Im Assistenten eingegebener Name statt des S3-Namens verwendet | Verwenden Sie den **Bucket name**, der unter **Access & Configuration** angezeigt wird |
| `AccessDenied` beim Schreiben | Benutzer mit **Read-only** | Ändern Sie sein Recht mit **Edit access** |
| `SignatureDoesNotMatch` / `InvalidAccessKeyId` | Falsche oder unvollständige Schlüssel | Kopieren Sie die Schlüssel erneut; ist der geheime Schlüssel verloren, erstellen Sie einen neuen Benutzer |
| Verbindungsfehler | Endpunkt ohne `https://` | Stellen Sie dem Endpunkt `https://` voran |

Siehe auch die [vollständige Fehlerbehebung](./troubleshooting.md).

---

## Schritt 7: Aufräumen

1. Löschen Sie die Testdatei:
   ```bash
   aws --endpoint-url "$S3_ENDPOINT" s3 rm "s3://$BUCKET_NAME/hello.txt"
   ```
2. Klicken Sie auf der Seite des Buckets auf **Delete** (oder öffnen Sie in der Liste das Aktionsmenü des Buckets und wählen Sie **Delete**).
3. Geben Sie den genauen Namen des Buckets in **Resource name to confirm** ein und klicken Sie dann auf **Permanently delete**.

:::warning Unwiderrufliches Löschen
Das Löschen eines Buckets ist endgültig. Antwortet die Konsole mit „The bucket is not empty or is still in use.“, leeren Sie den Bucket und versuchen Sie es erneut.
:::

<NavigationFooter
  nextSteps={[
    {label: "Benutzer und Zugriffsschlüssel verwalten", href: "../how-to/configure-access"},
    {label: "Eine Anwendung verbinden", href: "../how-to/connect-from-app"},
  ]}
/>
