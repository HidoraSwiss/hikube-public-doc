---
sidebar_position: 3
title: "Eine PostgreSQL-Datenbank sichern und wiederherstellen"
sidebar_label: Schnellstart
description: "Erstellen Sie in der Hikube-Konsole ein Backup-Ziel, planen Sie das Backup einer PostgreSQL-Datenbank, starten Sie eines auf Abruf und stellen Sie dann das Archiv wieder her."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Eine PostgreSQL-Datenbank sichern und wiederherstellen

Diese Anleitung erstellt in der [Hikube-Konsole](https://console.hikube.cloud) ein Backup-Ziel, plant das tägliche Backup einer PostgreSQL-Datenbank, startet eines auf Abruf und stellt anschließend das erhaltene Archiv wieder her. Das Vorgehen ist für eine MariaDB-Datenbank, eine VM oder eine Disk dasselbe.

---

## Voraussetzungen

- Ein Hikube-Projekt mit:
  - einem **S3-Bucket** (siehe [Einen Bucket erstellen](../storage/buckets/quick-start.md));
  - einer **PostgreSQL-Datenbank**, zum Beispiel `orders-db` (siehe [PostgreSQL-Schnellstart](../databases/postgresql/quick-start.md)).

---

## Schritt 1: Die Erstellung des Ziels öffnen

1. Öffnen Sie im Seitenmenü **Infrastructure** > **Backups**.
2. Öffnen Sie die Registerkarte **Destinations** und klicken Sie dann auf **Create a destination**.

Die Seite **New destination** öffnet sich.

---

## Schritt 2: Konfigurieren und bestätigen

1. **Name**: `quotidien` (Kleinbuchstaben, Ziffern und Bindestriche, höchstens 40 Zeichen).
2. **Bucket**: Wählen Sie den Bucket des Projekts.
3. **Credentials**: Belassen Sie **Create a dedicated user** und geben Sie einen **User name** ein, zum Beispiel `backup`. Seine Zugangsdaten dienen nur den Backups.
4. **Retention (days)**: Behalten Sie `30` bei.
5. Klicken Sie auf **Create**.

Die Konsole zeigt **Destination created** an: „quotidien“ wird eingerichtet.

---

## Schritt 3: Den Zustand prüfen

In der Registerkarte **Destinations** wechselt der Zustand von `quotidien` innerhalb weniger Augenblicke von **Provisioning** zu **Ready**.

**Erwartetes Ergebnis:** Ziel **Ready**, mit dem Bucket, dem Benutzer und einer Aufbewahrung von 30 Tagen.

---

## Schritt 4: Ein Backup planen und starten

1. Öffnen Sie **PostgreSQL**, klicken Sie auf `orders-db` und dann auf die Registerkarte **Backups**.
2. Klicken Sie in **Schedule** auf **Schedule**. Das Fenster **Schedule a backup** öffnet sich:
   - **Plan name**: `orders-db-quotidien`;
   - **Destination**: `quotidien`;
   - Registerkarte **Preset**, **Frequency**: **Daily**, **Hour** `02`, **Minute** `00` (lokale Zeit).
3. Klicken Sie auf **Schedule**. Die Karte **Schedule** zeigt die Uhrzeit und die nächste Ausführung (**Next**) an.
4. Klicken Sie in **On-demand backup** auf **Back up now**. Die Konsole zeigt **Backup started to “quotidien”** an.

Das Backup erscheint in **Run status** und dann in der Archivliste der Datenbank.

**Erwartetes Ergebnis:** Nach einigen Minuten wechselt das Archiv zu **Ready**.

:::note Uhrzeit in UTC
Die in der Voreinstellung gewählte Uhrzeit wird in UTC umgerechnet. Sie verschiebt sich daher bei der nächsten Zeitumstellung in lokaler Zeit um eine Stunde. Siehe [Konzepte](./concepts.md#uhrzeiten-und-zeitzone).
:::

---

## Schritt 5: Wiederherstellen und prüfen

Fügen Sie zunächst einen Testeintrag hinzu, um anschließend sein Fehlen nach der Wiederherstellung festzustellen:

```sql
CREATE TABLE apres_sauvegarde (id int);
```

Stellen Sie dann das Archiv auf der ursprünglichen Datenbank wieder her:

1. Klicken Sie in der Registerkarte **Backups** von `orders-db` in der Zeile des Archivs auf **Restore**.
2. **Restore target**: **In place**.
3. **Restore up to**: Belassen Sie den Stand des ausgewählten Backups.
4. Geben Sie zur Bestätigung `orders-db` ein und klicken Sie dann auf die Wiederherstellungsschaltfläche (**Restore the state of the backup of…**).

:::warning
Eine Wiederherstellung an Ort und Stelle **überschreibt** den aktuellen Inhalt der Datenbank. Um zu testen, ohne Ihre Daten anzutasten, erstellen Sie eine zweite, leere PostgreSQL-Datenbank derselben Version und wählen Sie **Another application**.
:::

Die Wiederherstellung erscheint in **Restores** und wechselt dann zu **Succeeded**. Verbinden Sie sich erneut mit der Datenbank:

```sql
SELECT to_regclass('apres_sauvegarde');
```

**Erwartetes Ergebnis:** `NULL`: Die nach dem Backup erstellte Tabelle existiert nicht mehr.

---

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Maßnahme |
|----------|--------|
| **No bucket in this project** | Erstellen Sie einen Bucket unter **S3 Buckets** und kehren Sie dann zur Erstellung des Ziels zurück. |
| Das Ziel bleibt im Zustand **Error** | Der Bucket oder sein Benutzer ist nicht mehr lesbar: siehe [Fehlerbehebung](./troubleshooting.md#das-ziel-ist-im-fehlerzustand). |
| **No destination ready in this project.** im Planungsfenster | Warten Sie, bis das Ziel **Ready** ist. |
| Das Archiv ist **Failed** | Lesen Sie die Meldung der Ausführung unter **Backups** > **Activity** und siehe dann [Fehlerbehebung](./troubleshooting.md#ein-backup-schlägt-fehl). |
| Die Wiederherstellung wird abgelehnt | Siehe [Fehlerbehebung](./troubleshooting.md#eine-wiederherstellung-wird-abgelehnt). |

---

## Schritt 7: Aufräumen

1. Klicken Sie in der Registerkarte **Backups** von `orders-db`, Karte **Schedule**, auf **Delete** und bestätigen Sie. Die Archive bleiben erhalten.
2. Löschen Sie die Testarchive mit **Delete** in jeder Zeile. Bei PostgreSQL verschwindet nur der Eintrag: Die Daten bleiben im Bucket, den Sie unter **S3 Buckets** leeren können.
3. Öffnen Sie unter **Backups** > **Destinations** das Menü von `quotidien` und wählen Sie **Delete**. Die Löschung wird abgelehnt, solange ein Zeitplan, ein Backup oder eine Wiederherstellung das Ziel verwendet.

---

## Nächste Schritte

- [Backups planen](./how-to/schedule-backups.md)
- [Eine Datenbank zu einem bestimmten Zeitpunkt wiederherstellen](./how-to/restore-point-in-time.md)
- [Eine VM oder eine Disk wiederherstellen](./how-to/restore-vm-or-disk.md)

<NavigationFooter
  nextSteps={[
    {label: "Praktische Anleitungen", href: "../how-to/create-destination"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
