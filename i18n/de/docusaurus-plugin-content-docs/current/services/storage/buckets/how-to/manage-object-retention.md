---
title: "Aufbewahrung der Objekte eines gesperrten Buckets verwalten"
description: "Prüfen Sie die Sperre eines WORM-Buckets, verlängern Sie die Aufbewahrung eines Objekts und setzen Sie einen Legal Hold mit den Standardbefehlen von S3 Object Lock."
---

# Aufbewahrung der Objekte eines gesperrten Buckets verwalten

Ein mit **Enable Object Lock (WORM)** erstellter Bucket sperrt jedes Objekt nach dem Schreiben 365 Tage lang im Modus `COMPLIANCE`. Diese Anleitung zeigt, wie Sie diese Sperre prüfen und ein Objekt mit den Standardbefehlen von S3 Object Lock länger aufbewahren: eigene Aufbewahrung pro Objekt, Verlängerung, gesetzliche Aufbewahrungssperre (*Legal Hold*).

Diese Vorgänge erfolgen mit einem S3-Client. Konsole und API von Hikube zeigen nur die Standardaufbewahrung des Buckets.

## Voraussetzungen

- Ein **gesperrter Bucket (WORM)** im Status **Ready**: Die Sperre wird bei der Erstellung gewählt (siehe [Schnellstart](../quick-start.md)) und kann nachträglich nicht aktiviert werden
- Ein **S3-Benutzer** mit **Read / Write** auf diesem Bucket (siehe [Benutzer und Zugriffsschlüssel verwalten](./configure-access.md))
- Installierte [AWS CLI](https://aws.amazon.com/cli/) sowie die Variablen `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` und `BUCKET_NAME`, exportiert wie in [Schritt 4 des Schnellstarts](../quick-start.md#schritt-4-die-anmeldedaten-abrufen)

:::warning Eine Sperre lässt sich nicht aufheben
Eine Aufbewahrung im Modus `COMPLIANCE` kann weder verkürzt noch entfernt werden. Das Objekt kann vor Ablauf weder gelöscht noch der Bucket geleert werden. Prüfen Sie das Datum, bevor Sie einen Befehl ausführen.
:::

## Die zwei Mechanismen verstehen

| Mechanismus | Dauer | Gesetzt durch | Aufhebung |
|-------------|-------|---------------|-----------|
| **Aufbewahrung** (*Retention*) | Bis zu einem Datum (`RetainUntilDate`) | Den Bucket beim Schreiben jedes Objekts (365 Tage) oder Sie, Objekt für Objekt | Automatisch bei Ablauf; kann nur verlängert werden |
| **Legal Hold** | Ohne Ablauf | Sie, Objekt für Objekt | Wenn Sie ihn entfernen (`Status=OFF`) |

Beide wirken zusammen: Ein Objekt kann erst gelöscht werden, wenn seine Aufbewahrung abgelaufen **und** sein Legal Hold entfernt ist.

## Schritte

### 1. Die Sperre des Buckets prüfen

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-lock-configuration \
  --bucket "$BUCKET_NAME"
```

**Erwartetes Ergebnis:**

```json
{
    "ObjectLockConfiguration": {
        "ObjectLockEnabled": "Enabled",
        "Rule": {
            "DefaultRetention": {
                "Mode": "COMPLIANCE",
                "Days": 365
            }
        }
    }
}
```

`DefaultRetention` ist die Aufbewahrung, die für jedes ohne eigene Aufbewahrung geschriebene Objekt gilt.

### 2. Ein Objekt mit eigener Aufbewahrung hochladen

Um ein Objekt länger als 365 Tage aufzubewahren (etwa ein regulatorisches Archiv über zehn Jahre), geben Sie ihm beim Hochladen ein Ablaufdatum. Wählen Sie ein Datum **nach** dem Standardablauf (365 Tage nach dem Hochladen): Die eigene Aufbewahrung eines Objekts dient dazu, es länger aufzubewahren.

```bash
# Ablaufdatum: ISO 8601, in UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf --body ./report-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 3. Die Aufbewahrung eines Objekts lesen

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf
```

**Erwartetes Ergebnis:**

```json
{
    "Retention": {
        "Mode": "COMPLIANCE",
        "RetainUntilDate": "2036-12-31T00:00:00+00:00"
    }
}
```

### 4. Die Aufbewahrung eines Objekts verlängern

Eine Aufbewahrung kann nur **verlängert** werden: Das neue Datum muss nach dem aktuellen Ablauf liegen, sonst wird die Anfrage abgelehnt.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 5. Einen Legal Hold setzen oder entfernen

Ein Legal Hold verhindert das Löschen eines Objekts ohne Ablaufdatum, zum Beispiel während eines Rechtsstreits oder einer Prüfung:

```bash
# Legal Hold setzen
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=ON

# Legal Hold prüfen
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf

# Legal Hold entfernen
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/report-2026.pdf \
  --legal-hold Status=OFF
```

Das Entfernen des Legal Hold hebt die Aufbewahrung nicht auf: Das Objekt bleibt bis zu deren Ablauf geschützt.

## Modus `GOVERNANCE`

Der Modus `GOVERNANCE` wird akzeptiert, aber die Benutzer eines Buckets dürfen eine Aufbewahrung nicht umgehen: `--bypass-governance-retention` liefert `AccessDenied`. Ein Objekt in `GOVERNANCE` ist daher bis zum Ablauf praktisch ebenso unveränderlich wie in `COMPLIANCE`. Verwenden Sie `COMPLIANCE`, das ausdrückt, was angewendet wird.

## Fehlerbehebung

| Symptom | Wahrscheinliche Ursache | Maßnahme |
|---------|-------------------------|----------|
| `get-object-lock-configuration` schlägt fehl | Bucket ohne Sperre erstellt | Die Sperre lässt sich nur bei der Erstellung aktivieren: Erstellen Sie einen gesperrten Bucket und kopieren Sie die Objekte hinein |
| `AccessDenied` bei `put-object-retention` oder `put-object-legal-hold` | Benutzer mit **Read-only** | Verwenden Sie einen Benutzer mit **Read / Write** |
| Verlängerung abgelehnt | Neues Datum vor dem aktuellen Ablauf | Wählen Sie ein Datum nach dem aktuellen Ablauf (Schritt 3) |
| Datum beim Hochladen abgelehnt | Datum in der Vergangenheit oder falsches Format | Datum in der Zukunft, im Format ISO 8601 in UTC (`2036-12-31T00:00:00Z`) |
| `AccessDenied` beim Löschen eines Objekts | Aufbewahrung läuft noch oder Legal Hold gesetzt | Lesen Sie die Aufbewahrung (Schritt 3) und den Legal Hold (Schritt 5) des Objekts |

## Weiterführende Informationen

- [Konzepte der S3-Buckets](../concepts.md): Sperre und Löschen eines gesperrten Buckets
- [FAQ zu S3-Buckets](../faq.md#wozu-dient-die-sperre-worm)
