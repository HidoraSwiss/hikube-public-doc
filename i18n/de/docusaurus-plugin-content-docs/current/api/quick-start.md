---
sidebar_position: 3
title: Schnellstart
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {ApiEnv} from '@site/src/components/HikubeApi';

# Erste Aufrufe der öffentlichen API

Diese Anleitung begleitet Sie vom Erhalt eines API-Schlüssels bis zur Erstellung einer ersten Ressource, eines S3-Buckets, mit `curl`.

:::warning Vorschauversion
Die öffentliche API ist eine Vorschauversion (`v1alpha1`): Pfade und Felder können sich noch ändern.
:::

---

## Ziele

Am Ende dieser Anleitung verfügen Sie über:

- einen **API-Schlüssel** und die **Kennung Ihres Projekts**
- eine **Shell-Umgebung**, die für alle Beispiele der Dokumentation bereit ist
- einen erfolgreichen **ersten Leseaufruf**
- einen über die API erstellten **S3-Bucket** mit einem Benutzer und seinen Zugriffsschlüsseln

---

## Voraussetzungen

- Ein **Hikube-Konto** und ein **Projekt** (siehe [Hikube-Schnellstart](../../getting-started/quick-start))
- **Administrator** des Projekts oder seiner Organisation sein oder einen Administrator einbeziehen, um den Schlüssel zu erhalten
- `curl` und [`jq`](https://jqlang.org/) auf Ihrem Rechner

---

## Schritt 1: Einen Schlüssel und die Kennung des Projekts erhalten {#project-id}

Ein Administrator des Projekts oder der Organisation erstellt den Schlüssel in der Konsole: Einstellungen des Projekts, Karte **API keys**, **Create a key** (siehe [Einen Schlüssel erhalten](./authentication.md#obtenir)).

Erstellen Sie für diese Anleitung einen Schlüssel der Stufe **Admin** (`admin`): Er muss einen Bucket erstellen und löschen können. Eine Gültigkeit von 7 Tagen genügt für einen Test.

Die Konsole zeigt an:

- den **Schlüssel** in der Form `sk_hk_<keyId>_<secret>`. Er wird nur einmal angezeigt: Speichern Sie ihn sofort in Ihrem Secret-Manager;
- einen Beispielaufruf, der die **Kennung des Projekts** (`projectId`) nach `/projects/` enthält: eine UUID wie `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`.

:::note Kennung des Projekts
Entnehmen Sie die Kennung des Projekts dem Beispielaufruf. Verwechseln Sie sie weder mit dem Namen des Projekts noch mit der **Organization ID**, die unter **My Account** angezeigt wird.
:::

---

## Schritt 2: Die Umgebung vorbereiten {#environnement}

Alle `curl`-Beispiele der Dokumentation lesen die Basis-URL, den Schlüssel und die Kennung des Projekts aus drei Variablen. Definieren Sie sie in Ihrer Shell:

<ApiEnv />

Ersetzen Sie `sk_hk_<keyId>_<secret>` und `<project_id>` durch Ihre Werte. Damit der Schlüssel nicht im Verlauf der Shell bleibt, lesen Sie ihn aus Ihrem Secret-Manager, statt ihn im Klartext einzugeben.

---

## Schritt 3: Einen ersten Leseaufruf ausführen

Beginnen Sie mit einem Katalog, der von keinem Projekt abhängt: der Liste der Instanztypen.

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/instance-types" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

Listen Sie dann die Buckets Ihres Projekts auf, was den Schlüssel **und** die Kennung des Projekts prüft:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

**Erwartetes Ergebnis:**

```json
{
  "totalCount": "0",
  "buckets": []
}
```

64-Bit-Ganzzahlfelder wie `totalCount` werden als Zeichenkette zurückgegeben. Eine Antwort `403` mit dem Code `10002` bedeutet, dass der Schlüssel ungültig, abgelaufen oder widerrufen ist oder nicht zu diesem Projekt gehört.

---

## Schritt 4: Einen Bucket erstellen

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "demoapi", "locking": false, "encrypted": false}'
```

- `name`: höchstens 16 Zeichen, Kleinbuchstaben und Ziffern;
- `locking`: Objektsperre (WORM), nach der Erstellung nicht änderbar;
- `encrypted`: Verschlüsselung im Ruhezustand, nach der Erstellung nicht änderbar.

Die Antwort beschreibt den Bucket, mit seiner `id` und einem `status` auf `provisioning`. Die Erstellung ist asynchron: Fahren Sie mit dem nächsten Schritt fort.

---

## Schritt 5: Den Zustand prüfen und die Zugangsdaten abrufen

Fragen Sie den Bucket ab, bis sein Status `ready` ist:

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, bucketName, endpoint}'
```

**Erwartetes Ergebnis:** `status` ist `ready`; `bucketName` ist der S3-Name des Buckets und `endpoint` die URL des S3-Endpunkts.

Erstellen Sie anschließend einen Benutzer des Buckets mit Lese- und Schreibzugriff:

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "app", "config": {"readonly": false}}'
```

Die Antwort enthält `bucketName`, `endpoint` und `secrets.accessKeyId` / `secrets.accessSecretKey`.

:::warning S3-Schlüssel werden nur einmal angezeigt
Die S3-Schlüssel werden nur bei der Erstellung des Benutzers zurückgegeben. Speichern Sie sie sofort in Ihrem Secret-Manager. Bei Verlust erzeugen Sie neue mit `POST .../users/app/rotate-credentials`.
:::

Testen Sie den Zugriff mit einem S3-Client, zum Beispiel der AWS CLI (siehe [Buckets — Schnellstart](../../services/storage/buckets/quick-start)).

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Wahrscheinliche Ursache | Maßnahme |
|----------|----------------|--------|
| `403`, Code `10002` | Schlüssel ungültig, abgelaufen oder widerrufen, falsche `PROJECT_ID` oder unzureichender Scope (`read` für eine Erstellung) | Prüfen Sie die Variablen; die Erstellung erfordert einen `admin`-Schlüssel |
| `400`, Validierungscode | Ungültiges Feld (Name zu lang, unzulässiges Zeichen…) | Lesen Sie `message`, das das betroffene Feld nennt |
| `409` | Eine Ressource mit diesem Namen existiert bereits im Projekt | Wählen Sie einen anderen Namen |
| `503`, Code `10004` | Prüfung des Schlüssels vorübergehend nicht möglich | Versuchen Sie es nach einigen Sekunden erneut: Der Schlüssel ist nicht die Ursache |
| `curl: (6) Could not resolve host` | `HIKUBE_API` leer oder fehlerhaft | Führen Sie Schritt 2 erneut aus |

Siehe auch [Fehler](./errors.md).

---

## Schritt 7: Aufräumen

Löschen Sie den Benutzer und dann den Bucket:

```bash
curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users/app" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Jede erfolgreiche Löschung gibt `200` und ein leeres Objekt `{}` zurück.

:::warning Unwiderrufliches Löschen
Das Löschen eines Buckets ist endgültig. Ein Bucket, der noch Objekte enthält, kann nicht gelöscht werden: Leeren Sie ihn zuerst mit Ihrem S3-Client.
:::

Wenn der Schlüssel nur für diesen Test diente, lassen Sie ihn widerrufen (siehe [Einen Schlüssel widerrufen](./authentication.md#révoquer-une-clé)).

<NavigationFooter
  nextSteps={[
    {label: "Authentifizierung und bewährte Praktiken", href: "../authentication"},
    {label: "API-Referenz", href: "../reference/hikube-api"},
  ]}
  seeAlso={[
    {label: "Fehler", href: "../errors"},
    {label: "FAQ zur API", href: "../faq"},
  ]}
/>
